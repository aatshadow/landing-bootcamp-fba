// src/utils/logisticsPricing.js

import { supabase } from './supabase'

// Hardcoded fallback rates per kg by method (conservative/high)
const BASE_RATES = {
  express: { min: 6, max: 12 },
  air:     { min: 3.5, max: 7 },
  sea:     { min: 0.8, max: 2.5 },
  train:   { min: 1.5, max: 4 },
}

// Category surcharges (multiplier) - some categories cost more
const CATEGORY_SURCHARGE = {
  'Electrónica': 1.15,
  'Cosméticos': 1.2,
  'Alimentación': 1.25,
  'Maquinaria': 1.1,
  'Vehículos / Motos': 1.15,
  default: 1.0,
}

// Destination adjustments (some routes are more expensive)
const DESTINATION_FACTOR = {
  'España': 1.0,
  'Alemania': 1.0,
  'Francia': 1.0,
  'Italia': 1.0,
  'UK': 1.1,
  'Portugal': 1.0,
  'USA': 1.15,
  'México': 1.2,
  'Colombia': 1.25,
  'Amazon FBA EU': 1.05,
  'Amazon FBA US': 1.2,
  default: 1.1,
}

let _statsCache = null
let _statsCacheTime = 0
const CACHE_TTL = 5 * 60 * 1000  // 5 min cache

async function fetchPricingStats() {
  const now = Date.now()
  if (_statsCache && (now - _statsCacheTime) < CACHE_TTL) return _statsCache

  const { data } = await supabase
    .from('logistics_pricing_stats')
    .select('*')

  _statsCache = data || []
  _statsCacheTime = now
  return _statsCache
}

// Find the best matching historical stats for a given shipment
function findMatchingStats(stats, { shippingMethod, destination, category }) {
  // Try exact match first (method + destination + category)
  let match = stats.find(s =>
    s.shipping_method === shippingMethod &&
    s.destination_country === destination &&
    s.product_category === category &&
    s.sample_count >= 3
  )
  if (match) return { ...match, confidence: 'high' }

  // Try method + destination (any category)
  match = stats.find(s =>
    s.shipping_method === shippingMethod &&
    s.destination_country === destination &&
    !s.product_category &&
    s.sample_count >= 3
  )
  if (match) return { ...match, confidence: 'medium' }

  // Try just method (aggregate)
  const methodMatches = stats.filter(s => s.shipping_method === shippingMethod && s.sample_count >= 2)
  if (methodMatches.length > 0) {
    const totalSamples = methodMatches.reduce((sum, m) => sum + m.sample_count, 0)
    const weightedAvg = methodMatches.reduce((sum, m) => sum + m.avg_rate_per_kg * m.sample_count, 0) / totalSamples
    const weightedP75 = methodMatches.reduce((sum, m) => sum + m.p75_rate * m.sample_count, 0) / totalSamples
    return {
      avg_rate_per_kg: weightedAvg,
      p75_rate: weightedP75,
      median_rate: methodMatches.reduce((sum, m) => sum + m.median_rate * m.sample_count, 0) / totalSamples,
      sample_count: totalSamples,
      confidence: 'low',
    }
  }

  return null  // No historical data at all
}

/**
 * Main estimation function.
 * Returns { priceMin, priceMax, confidence, method, dataPoints, billableWeight }
 *
 * @param {Object} params
 * @param {number} params.weightKg - Weight per carton in kg
 * @param {number} params.lengthCm - Length in cm
 * @param {number} params.widthCm - Width in cm
 * @param {number} params.heightCm - Height in cm
 * @param {number} params.cartons - Number of cartons
 * @param {string} params.shippingMethod - express|air|sea|train
 * @param {string} params.destination - Destination country/label
 * @param {string} params.category - Product category
 */
export async function estimatePrice({ weightKg, lengthCm, widthCm, heightCm, cartons = 1, shippingMethod = 'sea', destination = '', category = '' }) {
  const divisor = shippingMethod === 'express' ? 5000 : 6000
  const volWeight = (lengthCm * widthCm * heightCm) / divisor
  const billableWeight = Math.max(weightKg, volWeight) * cartons

  const stats = await fetchPricingStats()
  const match = findMatchingStats(stats, { shippingMethod, destination, category })

  let rateMin, rateMax, confidence, dataPoints

  if (match && match.sample_count >= 3) {
    // Use historical data - bias HIGH (use p75 for max, median for min)
    // The "largo que corto" principle: pad the estimate upward
    const catFactor = CATEGORY_SURCHARGE[category] || CATEGORY_SURCHARGE.default
    const destFactor = DESTINATION_FACTOR[destination] || DESTINATION_FACTOR.default

    rateMin = match.median_rate * catFactor * destFactor
    rateMax = match.p75_rate * 1.15 * catFactor * destFactor  // 15% padding on high end
    confidence = match.confidence
    dataPoints = match.sample_count

    // Ensure min < max and both are reasonable
    if (rateMin >= rateMax) rateMax = rateMin * 1.3
  } else {
    // Fallback to hardcoded rates with surcharges
    const base = BASE_RATES[shippingMethod] || BASE_RATES.sea
    const catFactor = CATEGORY_SURCHARGE[category] || CATEGORY_SURCHARGE.default
    const destFactor = DESTINATION_FACTOR[destination] || DESTINATION_FACTOR.default

    rateMin = base.min * catFactor * destFactor
    rateMax = base.max * catFactor * destFactor
    confidence = 'fallback'
    dataPoints = match?.sample_count || 0
  }

  const priceMin = Math.round(billableWeight * rateMin)
  const priceMax = Math.round(billableWeight * rateMax)

  return {
    priceMin,
    priceMax,
    billableWeight: Math.round(billableWeight * 100) / 100,
    volWeight: Math.round(volWeight * 100) / 100,
    confidence,
    dataPoints,
    rateMin: Math.round(rateMin * 100) / 100,
    rateMax: Math.round(rateMax * 100) / 100,
  }
}

/**
 * Save a quote to logistics_quotes for tracking conversion
 */
export async function saveQuote({ clientId, params, result, contact }) {
  const { data } = await supabase.from('logistics_quotes').insert({
    client_id: clientId || null,
    product_type: params.category,
    weight_kg: params.weightKg,
    dimensions_l: params.lengthCm,
    dimensions_w: params.widthCm,
    dimensions_h: params.heightCm,
    volumetric_weight: result.volWeight,
    billable_weight: result.billableWeight,
    destination: params.destination,
    shipping_method: params.shippingMethod,
    estimated_price_min: result.priceMin,
    estimated_price_max: result.priceMax,
    contact_name: contact?.name || null,
    contact_email: contact?.email || null,
    contact_phone: contact?.phone || null,
  }).select().single()
  return data
}

/**
 * Invalidate the stats cache (call after a new order's final_price is set)
 */
export function invalidatePricingCache() {
  _statsCache = null
  _statsCacheTime = 0
}
