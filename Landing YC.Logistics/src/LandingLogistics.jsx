import { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { ChevronRight, Calculator, Plane, Ship, Train, Zap, Brain, MessageCircle, User, Truck, Globe, CheckCircle2, X, Languages, Play } from 'lucide-react'
import { estimatePrice, saveQuote } from './utils/logisticsPricing'
import { supabase } from './utils/supabase'

const EASE = [0.16, 1, 0.3, 1]
const BASE = import.meta.env.BASE_URL

/* ─── Brand palette (from logo) ─── */
const C = {
  bg: '#FFFFFF', surface: '#F8FAFC',
  text: '#0F172A', text2: '#475569', text3: '#94A3B8',
  border: '#E2E8F0', borderHv: '#CBD5E1',
  blue: '#1E40AF', blueDeep: '#1E3A8A', blueLight: '#3B82F6',
  gold: '#D4A017', goldLight: '#F4C430',
  red: '#DC2626', green: '#16A34A', amber: '#D97706',
}

/* ─── Translations ─── */
const STRINGS = {
  es: {
    nav: { services: 'Servicios', process: 'Proceso', quote: 'Cotizar', cta: 'Cotizar envío', ctaShort: 'Cotizar' },
    hero: {
      badge: 'YC Logistics Araminda · Shenzhen',
      title: 'De China al mundo, con control real y precio transparente.',
      sub: 'Consultoría y transporte internacional desde Shenzhen. Cotización con IA, almacén propio, DDP integral. Sin costes ocultos, sin estimaciones irreales.',
      cta1: 'Cotizar mi envío', cta2: 'Ver servicios',
    },
    vslCaption: 'Conoce YC Logistics en 2 min',
    features: [
      { label: 'Cotización con IA',     detail: '80–90% de precisión' },
      { label: 'DDP Global',            detail: 'USA · EU · Canadá' },
      { label: 'Almacén en Shenzhen',   detail: 'Recepción y verificación' },
      { label: 'Mercancía asegurada',   detail: 'Sin costes ocultos' },
    ],
    calc: {
      eyebrow: 'Cotización IA', title: 'Tu precio en 30 segundos',
      sub: 'Datos reales del almacén en Shenzhen. 80–90% de precisión. Sin compromiso.',
      step1: 'Paso 1 — Datos de contacto', step2: 'Paso 2 — Producto y destino', step3: 'Paso 3 — Carga y dimensiones',
      name: 'Nombre', namePh: 'Tu nombre', whatsapp: 'WhatsApp', whatsappPh: '34600123456 (sin +, todo junto)', email: 'Email (opcional)', emailPh: 'email@...',
      category: 'Categoría', destination: 'Destino', method: 'Método de envío',
      cartons: 'Cartones', weight: 'Peso/cartón (kg)', length: 'Largo (cm)', width: 'Ancho (cm)', height: 'Alto (cm)',
      next: 'Continuar', back: 'Atrás', calc: 'Calcular precio', estimating: 'Estimando con IA...',
      select: 'Seleccionar...',
      result: { label: 'Precio estimado', billable: 'Peso facturable', confLow: 'Estimación base', confMed: 'Buena precisión', confHigh: 'Alta precisión', confMod: 'Precisión moderada', similar: 'envíos similares', talk: 'Hablar con un agente', opening: 'Abriendo WhatsApp...', newQuote: 'Nueva cotización' },
    },
    about: {
      eyebrow: 'Quiénes somos', title1: 'Logística desde China,', title2: 'con control real.',
      sub: 'Alianza estratégica internacional con sede operativa en Shenzhen. Combinamos e-commerce, logística internacional, infraestructura propia y red global de transporte para reducir tus costes y darte soporte real.',
      pillars: [
        { title: 'Precio competitivo', desc: 'Sin inflar costes. Sin gastos ocultos.' },
        { title: 'Seguridad real',     desc: 'Mercancía asegurada y trazabilidad completa.' },
        { title: 'Soporte directo',    desc: 'Personas reales. Español, inglés y chino.' },
        { title: 'Control total',      desc: 'Recepción, verificación y reporte en almacén.' },
      ],
    },
    team: {
      eyebrow: 'Equipo', title: 'Personas reales detrás de cada envío.',
      sub: '25 años de experiencia combinada en e-commerce y logística internacional.',
      people: [
        { name: 'Emiliano', role: 'E-commerce & Ventas', bio: 'Más de 13 años en e-commerce, generando millones en ventas. Conocimiento profundo del negocio digital y de las necesidades reales del importador.' },
        { name: 'Rudy', role: 'Founder & General Manager · Shenzhen', bio: 'Fundadora de YC Logistics. 20 años en exportación, 12 años en fabricación de productos y 8 años en transporte internacional. Lidera operaciones, equipos y coordinación desde China.' },
      ],
    },
    services: {
      eyebrow: 'Servicios', title: 'Una solución integral.',
      sub: 'Transporte, DDP y cotización con IA — todo bajo el mismo techo.',
      list: [
        { title: 'Transporte internacional', desc: 'Envíos desde China a USA, Europa, Canadá y más. Amazon FBA, e-commerce, muebles, vehículos y carga comercial.', tag: 'Aéreo · Marítimo · Tren · Express' },
        { title: 'DDP — Delivered Duty Paid', desc: 'Nos encargamos del transporte, las aduanas, los impuestos y la entrega final. Tú recibes la mercancía, nada más.', tag: 'Aduanas · Impuestos · Entrega' },
        { title: 'Cotización con IA', desc: 'Sistema propio que calcula costes con 80-90% de precisión usando datos reales y conecta con un agente al instante.', tag: 'IA · Datos reales · Agente humano' },
      ],
    },
    process: {
      eyebrow: 'Proceso', title: 'Cómo funciona', sub: 'De la cotización a la entrega — sin fricción',
      step: 'PASO',
      steps: [
        { title: 'Cotizas con IA', desc: 'Introduces producto, peso, destino y método. La IA estima en segundos.' },
        { title: 'Hablas con un agente', desc: 'Confirmamos el precio exacto, resolvemos dudas y cerramos el envío.' },
        { title: 'Recibes en tu puerta', desc: 'Almacén, transporte, aduanas e impuestos. DDP completo con tracking.' },
      ],
    },
    quality: {
      eyebrow: 'Calidad', title: 'Control real, en nuestro almacén.',
      sub: 'Cada envío pasa por verificación física antes de salir de Shenzhen.',
      items: [
        { title: 'Recepción',    desc: 'Llegada y registro en almacén.' },
        { title: 'Pesaje real',  desc: 'Básculas reales, no estimaciones.' },
        { title: 'Volumen',      desc: 'Medición exacta de cada bulto.' },
        { title: 'Verificación', desc: 'Inspección del producto.' },
        { title: 'Reporte',      desc: 'Informe detallado al cliente.' },
      ],
    },
    ops: {
      eyebrow: 'Sobre el terreno',
      title: 'Operaciones reales en Shenzhen.',
      sub: 'Carga, control y verificación en nuestro almacén — fotos reales, no stock.',
      cap1: 'Carga de contenedor — almacén Shenzhen',
      cap2: 'Verificación de bultos antes de salida',
    },
    diff: {
      eyebrow: 'Diferencia', title: 'Lo que no encontrarás aquí.',
      sub: 'Transparencia y control real, no estimaciones irreales.',
      othersLabel: 'Otros', usLabel: 'YC Logistics Araminda',
      others: [
        'Precios inflados sin justificación',
        'Costes ocultos al final del proceso',
        'Estimaciones irreales que no se cumplen',
        'Soporte por bots o intermediarios',
      ],
      us: [
        'Precios competitivos y transparentes',
        'Sin costes ocultos — todo incluido en DDP',
        'Estimaciones reales con 80–90% precisión',
        'Soporte directo en ES · EN · 中文',
      ],
    },
    cta: { title: '¿Listo para enviar desde China?', sub: 'Cotización sin compromiso. Sin costes ocultos. Soporte real desde Shenzhen.', primary: 'Calcular envío', secondary: 'Hablar con un agente' },
    footer: { location: 'Shenzhen, China · Logística internacional & DDP' },
    waMsg: { hello: 'Hola! Quiero enviar:', product: 'Producto', cartons: 'cartón(es)', dimensions: 'Dimensiones', destination: 'Destino', method: 'Método', estimate: 'Estimación', name: 'Nombre', email: 'Email' },
    methodTimes: { express: '5-7 días', air: '8-15 días', sea: '25-40 días', train: '18-25 días' },
    methodNames: { express: 'Express', air: 'Aéreo', sea: 'Marítimo', train: 'Tren' },
    categories: ['Electrónica','Textil / Ropa','Cosméticos','Alimentación','Muebles / Hogar','Vehículos / Motos','Maquinaria','Juguetes','Deportes','Otros'],
    destinations: ['España','Alemania','Francia','Italia','UK','Portugal','USA','México','Colombia','Amazon FBA EU','Amazon FBA US','Otro'],
  },
  en: {
    nav: { services: 'Services', process: 'Process', quote: 'Quote', cta: 'Get quote', ctaShort: 'Quote' },
    hero: {
      badge: 'YC Logistics Araminda · Shenzhen',
      title: 'From China to the world, with real control and transparent pricing.',
      sub: 'International consulting and freight from Shenzhen. AI-powered quoting, in-house warehouse, full DDP. No hidden fees, no fantasy estimates.',
      cta1: 'Get a quote', cta2: 'See services',
    },
    vslCaption: 'Meet YC Logistics in 2 min',
    features: [
      { label: 'AI Quoting',           detail: '80–90% accuracy' },
      { label: 'Global DDP',           detail: 'USA · EU · Canada' },
      { label: 'Shenzhen warehouse',   detail: 'Receiving & verification' },
      { label: 'Insured cargo',        detail: 'No hidden fees' },
    ],
    calc: {
      eyebrow: 'AI Quote', title: 'Your price in 30 seconds',
      sub: 'Real data from our Shenzhen warehouse. 80–90% accuracy. No commitment.',
      step1: 'Step 1 — Contact info', step2: 'Step 2 — Product & destination', step3: 'Step 3 — Cargo & dimensions',
      name: 'Name', namePh: 'Your name', whatsapp: 'WhatsApp', whatsappPh: '15551234567 (no +, all together)', email: 'Email (optional)', emailPh: 'email@...',
      category: 'Category', destination: 'Destination', method: 'Shipping method',
      cartons: 'Cartons', weight: 'Weight/carton (kg)', length: 'Length (cm)', width: 'Width (cm)', height: 'Height (cm)',
      next: 'Continue', back: 'Back', calc: 'Calculate price', estimating: 'Estimating with AI...',
      select: 'Select...',
      result: { label: 'Estimated price', billable: 'Billable weight', confLow: 'Base estimate', confMed: 'Good accuracy', confHigh: 'High accuracy', confMod: 'Moderate accuracy', similar: 'similar shipments', talk: 'Talk to an agent', opening: 'Opening WhatsApp...', newQuote: 'New quote' },
    },
    about: {
      eyebrow: 'Who we are', title1: 'Logistics from China,', title2: 'with real control.',
      sub: 'International strategic alliance based in Shenzhen. We combine e-commerce, international logistics, in-house infrastructure and a global transport network to lower your costs and give you real support.',
      pillars: [
        { title: 'Competitive pricing', desc: 'No inflated costs. No hidden fees.' },
        { title: 'Real security',       desc: 'Insured cargo and full traceability.' },
        { title: 'Direct support',      desc: 'Real people. Spanish, English & Chinese.' },
        { title: 'Total control',       desc: 'Receiving, verification and warehouse report.' },
      ],
    },
    team: {
      eyebrow: 'Team', title: 'Real people behind every shipment.',
      sub: '25 years of combined experience in e-commerce and international logistics.',
      people: [
        { name: 'Emiliano', role: 'E-commerce & Sales', bio: 'Over 13 years in e-commerce, generating millions in sales. Deep understanding of digital business and the real needs of importers.' },
        { name: 'Rudy', role: 'Founder & General Manager · Shenzhen', bio: 'Founder of YC Logistics. 20 years in export, 12 years in product manufacturing and 8 years in international transportation. Leads operations, teams and coordination from China.' },
      ],
    },
    services: {
      eyebrow: 'Services', title: 'An end-to-end solution.',
      sub: 'Freight, DDP and AI quoting — all under one roof.',
      list: [
        { title: 'International freight', desc: 'Shipments from China to USA, Europe, Canada and beyond. Amazon FBA, e-commerce, furniture, vehicles and commercial cargo.', tag: 'Air · Sea · Train · Express' },
        { title: 'DDP — Delivered Duty Paid', desc: 'We handle freight, customs, duties and final delivery. You just receive the cargo.', tag: 'Customs · Duties · Delivery' },
        { title: 'AI Quoting', desc: 'In-house system that calculates costs with 80-90% accuracy using real data and connects you with an agent instantly.', tag: 'AI · Real data · Human agent' },
      ],
    },
    process: {
      eyebrow: 'Process', title: 'How it works', sub: 'From quote to delivery — frictionless',
      step: 'STEP',
      steps: [
        { title: 'Quote with AI', desc: 'Enter product, weight, destination and method. AI estimates in seconds.' },
        { title: 'Talk to an agent', desc: 'We confirm the exact price, answer questions and close the shipment.' },
        { title: 'Receive at your door', desc: 'Warehouse, freight, customs and duties. Full DDP with tracking.' },
      ],
    },
    quality: {
      eyebrow: 'Quality', title: 'Real control in our warehouse.',
      sub: 'Every shipment goes through physical verification before leaving Shenzhen.',
      items: [
        { title: 'Receiving',    desc: 'Arrival and registration in warehouse.' },
        { title: 'Real weighing', desc: 'Real scales, not estimates.' },
        { title: 'Volume',       desc: 'Exact measurement of each package.' },
        { title: 'Verification', desc: 'Product inspection.' },
        { title: 'Report',       desc: 'Detailed report to the client.' },
      ],
    },
    ops: {
      eyebrow: 'On the ground',
      title: 'Real operations in Shenzhen.',
      sub: 'Loading, control and verification in our warehouse — real photos, not stock.',
      cap1: 'Container loading — Shenzhen warehouse',
      cap2: 'Package verification before departure',
    },
    diff: {
      eyebrow: 'Difference', title: 'What you won’t find here.',
      sub: 'Transparency and real control, not fantasy estimates.',
      othersLabel: 'Others', usLabel: 'YC Logistics Araminda',
      others: [
        'Inflated prices without justification',
        'Hidden fees at the end of the process',
        'Fantasy estimates that don’t match reality',
        'Support via bots or middlemen',
      ],
      us: [
        'Competitive and transparent pricing',
        'No hidden fees — all included in DDP',
        'Real estimates with 80–90% accuracy',
        'Direct support in ES · EN · 中文',
      ],
    },
    cta: { title: 'Ready to ship from China?', sub: 'No-commitment quote. No hidden fees. Real support from Shenzhen.', primary: 'Calculate shipment', secondary: 'Talk to an agent' },
    footer: { location: 'Shenzhen, China · International logistics & DDP' },
    waMsg: { hello: 'Hi! I want to ship:', product: 'Product', cartons: 'carton(s)', dimensions: 'Dimensions', destination: 'Destination', method: 'Method', estimate: 'Estimate', name: 'Name', email: 'Email' },
    methodTimes: { express: '5-7 days', air: '8-15 days', sea: '25-40 days', train: '18-25 days' },
    methodNames: { express: 'Express', air: 'Air', sea: 'Sea', train: 'Train' },
    categories: ['Electronics','Textile / Clothing','Cosmetics','Food','Furniture / Home','Vehicles / Bikes','Machinery','Toys','Sports','Other'],
    destinations: ['Spain','Germany','France','Italy','UK','Portugal','USA','Mexico','Colombia','Amazon FBA EU','Amazon FBA US','Other'],
  },
  zh: {
    nav: { services: '服务', process: '流程', quote: '报价', cta: '立即报价', ctaShort: '报价' },
    hero: {
      badge: 'YC Logistics Araminda · 深圳',
      title: '从中国到世界，真实管控、价格透明。',
      sub: '深圳总部国际物流与咨询。AI 智能报价、自有仓库、全 DDP 服务。无隐藏费用，无虚假估价。',
      cta1: '获取报价', cta2: '查看服务',
    },
    vslCaption: '2 分钟了解 YC Logistics',
    features: [
      { label: 'AI 智能报价',     detail: '80–90% 准确度' },
      { label: '全球 DDP',         detail: '美国 · 欧盟 · 加拿大' },
      { label: '深圳仓库',         detail: '收货与验货' },
      { label: '货物保险',         detail: '无隐藏费用' },
    ],
    calc: {
      eyebrow: 'AI 报价', title: '30 秒获取价格',
      sub: '深圳仓库真实数据。80–90% 准确度。无需承诺。',
      step1: '步骤 1 — 联系信息', step2: '步骤 2 — 产品与目的地', step3: '步骤 3 — 货物与尺寸',
      name: '姓名', namePh: '您的姓名', whatsapp: 'WhatsApp', whatsappPh: '8613800138000 (无 +)', email: '邮箱（可选）', emailPh: 'email@...',
      category: '类别', destination: '目的地', method: '运输方式',
      cartons: '箱数', weight: '每箱重量（公斤）', length: '长（厘米）', width: '宽（厘米）', height: '高（厘米）',
      next: '继续', back: '返回', calc: '计算价格', estimating: 'AI 估算中...',
      select: '请选择...',
      result: { label: '估算价格', billable: '计费重量', confLow: '基础估算', confMed: '良好准确度', confHigh: '高准确度', confMod: '中等准确度', similar: '相似货运', talk: '联系客服', opening: '正在打开 WhatsApp...', newQuote: '新报价' },
    },
    about: {
      eyebrow: '关于我们', title1: '来自中国的物流，', title2: '真实管控。',
      sub: '总部位于深圳的国际战略联盟。我们结合电商、国际物流、自有基础设施和全球运输网络，为您降低成本、提供真实支持。',
      pillars: [
        { title: '具竞争力的价格', desc: '不虚抬成本，无隐藏费用。' },
        { title: '真实安全',       desc: '货物保险，全程可追溯。' },
        { title: '直接支持',       desc: '真人服务。西班牙语、英语、中文。' },
        { title: '全程管控',       desc: '收货、验货、仓库报告。' },
      ],
    },
    team: {
      eyebrow: '团队', title: '每个货运背后都是真实的人。',
      sub: '电商与国际物流领域 25 年综合经验。',
      people: [
        { name: 'Emiliano', role: '电商与销售', bio: '13 年以上电商经验，创造数百万销售额。深刻了解数字业务和进口商的真实需求。' },
        { name: 'Rudy', role: '创始人兼总经理 · 深圳', bio: 'YC Logistics 创始人。20 年出口经验、12 年产品制造经验、8 年国际运输经验。在中国领导运营、团队和协调工作。' },
      ],
    },
    services: {
      eyebrow: '服务', title: '一站式解决方案。',
      sub: '运输、DDP 与 AI 报价 —— 一站搞定。',
      list: [
        { title: '国际运输', desc: '从中国发货至美国、欧洲、加拿大及其他地区。亚马逊 FBA、电商、家具、车辆和商业货物。', tag: '空运 · 海运 · 铁路 · 快递' },
        { title: 'DDP — 完税交货', desc: '我们处理运输、清关、税费和最终交付。您只需收货。', tag: '清关 · 税费 · 交付' },
        { title: 'AI 智能报价', desc: '自有系统使用真实数据计算成本，准确度 80-90%，并即时连接客服。', tag: 'AI · 真实数据 · 真人客服' },
      ],
    },
    process: {
      eyebrow: '流程', title: '运作方式', sub: '从报价到交付 —— 无缝衔接',
      step: '步骤',
      steps: [
        { title: 'AI 报价', desc: '输入产品、重量、目的地和方式。AI 几秒内估算。' },
        { title: '联系客服', desc: '确认精确价格，解答疑问，完成发货。' },
        { title: '送货上门', desc: '仓库、运输、清关和税费。完整 DDP 含跟踪。' },
      ],
    },
    quality: {
      eyebrow: '质量', title: '仓库内的真实管控。',
      sub: '每个货运在离开深圳前都会经过实物验证。',
      items: [
        { title: '收货',    desc: '到达并在仓库登记。' },
        { title: '实际称重', desc: '使用真实磅秤，非估算。' },
        { title: '体积',    desc: '每件货物精确测量。' },
        { title: '验货',    desc: '产品检查。' },
        { title: '报告',    desc: '向客户提供详细报告。' },
      ],
    },
    ops: {
      eyebrow: '现场',
      title: '深圳真实运营。',
      sub: '仓库内的装载、管控与验货 —— 真实照片，非素材库。',
      cap1: '集装箱装载 —— 深圳仓库',
      cap2: '出货前的货物验证',
    },
    diff: {
      eyebrow: '差异', title: '在这里您不会遇到的。',
      sub: '透明度和真实管控，而非虚假估价。',
      othersLabel: '其他公司', usLabel: 'YC Logistics Araminda',
      others: [
        '无依据的高价',
        '流程末尾的隐藏费用',
        '不符合实际的虚假估算',
        '机器人或中介支持',
      ],
      us: [
        '具竞争力且透明的价格',
        '无隐藏费用 —— DDP 包含一切',
        '真实估算，准确度 80–90%',
        '直接支持：西班牙语 · 英语 · 中文',
      ],
    },
    cta: { title: '准备从中国发货了吗？', sub: '免承诺报价。无隐藏费用。来自深圳的真实支持。', primary: '计算货运', secondary: '联系客服' },
    footer: { location: '中国深圳 · 国际物流与 DDP' },
    waMsg: { hello: '您好！我想发货：', product: '产品', cartons: '箱', dimensions: '尺寸', destination: '目的地', method: '方式', estimate: '估算', name: '姓名', email: '邮箱' },
    methodTimes: { express: '5-7 天', air: '8-15 天', sea: '25-40 天', train: '18-25 天' },
    methodNames: { express: '快递', air: '空运', sea: '海运', train: '铁路' },
    categories: ['电子产品','纺织/服装','化妆品','食品','家具/家居','车辆/摩托','机械','玩具','体育用品','其他'],
    destinations: ['西班牙','德国','法国','意大利','英国','葡萄牙','美国','墨西哥','哥伦比亚','亚马逊 FBA 欧盟','亚马逊 FBA 美国','其他'],
  },
}

const METHOD_KEYS = ['express', 'air', 'sea', 'train']
const METHOD_DIVISORS = { express: 5000, air: 6000, sea: 6000, train: 6000 }
const METHOD_ICONS = { express: Zap, air: Plane, sea: Ship, train: Train }
/* Internal stable values used in DB / pricing logic — not translated */
const CATEGORIES_VAL = ['Electrónica','Textil / Ropa','Cosméticos','Alimentación','Muebles / Hogar','Vehículos / Motos','Maquinaria','Juguetes','Deportes','Otros']
const DESTINATIONS_VAL = ['España','Alemania','Francia','Italia','UK','Portugal','USA','México','Colombia','Amazon FBA EU','Amazon FBA US','Otro']

function useIsMobile(bp = 768) {
  const [m, setM] = useState(() => typeof window !== 'undefined' && window.innerWidth <= bp)
  useEffect(() => {
    const onR = () => setM(window.innerWidth <= bp)
    window.addEventListener('resize', onR)
    return () => window.removeEventListener('resize', onR)
  }, [bp])
  return m
}

function useLang() {
  const [lang, setLang] = useState(() => {
    if (typeof window === 'undefined') return 'es'
    const saved = localStorage.getItem('yc_lang')
    if (saved && STRINGS[saved]) return saved
    const nav = navigator.language?.toLowerCase() || ''
    if (nav.startsWith('zh')) return 'zh'
    if (nav.startsWith('en')) return 'en'
    return 'es'
  })
  useEffect(() => { try { localStorage.setItem('yc_lang', lang) } catch {} }, [lang])
  useEffect(() => { document.documentElement.lang = lang === 'zh' ? 'zh-CN' : lang }, [lang])
  return [lang, setLang]
}

/* ─── Light background: soft brand-colored blobs + subtle grid ─── */
function LightBackground() {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', inset: 0, background: C.bg }} />
      <div style={{ position: 'absolute', inset: 0, opacity: 0.5,
        backgroundImage:
          'radial-gradient(ellipse 70% 50% at 15% 20%, rgba(212,160,23,0.10) 0%, transparent 60%),' +
          'radial-gradient(ellipse 60% 50% at 85% 15%, rgba(30,64,175,0.08) 0%, transparent 60%),' +
          'radial-gradient(ellipse 80% 50% at 80% 85%, rgba(212,160,23,0.07) 0%, transparent 60%),' +
          'radial-gradient(ellipse 50% 40% at 20% 90%, rgba(30,64,175,0.07) 0%, transparent 60%)' }} />
      <div style={{ position: 'absolute', inset: 0, opacity: 0.04,
        backgroundImage:
          'linear-gradient(rgba(30,64,175,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(30,64,175,0.6) 1px, transparent 1px)',
        backgroundSize: '80px 80px' }} />
      <div className="yc-blob" style={{ position: 'absolute', left: '20%', top: '15%', height: 500, width: 600, transform: 'translate(-50%,-50%)', borderRadius: '50%', filter: 'blur(140px)', willChange: 'transform', animation: 'ycBlobPulse 14s ease-in-out infinite', background: 'radial-gradient(circle, rgba(212,160,23,0.16) 0%, rgba(212,160,23,0.05) 40%, transparent 70%)' }} />
      <div className="yc-blob" style={{ position: 'absolute', bottom: '10%', right: '12%', height: 500, width: 500, borderRadius: '50%', filter: 'blur(140px)', willChange: 'transform', animation: 'ycBlobPulse 18s ease-in-out 4s infinite', background: 'radial-gradient(circle, rgba(30,64,175,0.16) 0%, rgba(30,64,175,0.05) 40%, transparent 70%)' }} />
      <div className="yc-blob" style={{ position: 'absolute', right: '25%', top: '40%', height: 380, width: 380, borderRadius: '50%', filter: 'blur(120px)', willChange: 'transform', animation: 'ycBlobPulse 22s ease-in-out 8s infinite', background: 'radial-gradient(circle, rgba(220,38,38,0.06) 0%, transparent 70%)' }} />
    </div>
  )
}

function YCStyles() {
  return (
    <style>{`
      @keyframes ycBlobPulse { 0%,100% { transform: scale(1); opacity: 0.7; } 50% { transform: scale(1.2); opacity: 1; } }
      @keyframes ycPing { 75%,100% { transform: scale(2); opacity: 0; } }
      .yc-ping::before { content:''; position:absolute; inset:0; border-radius:50%; background:${C.blue}; opacity:0.6; animation: ycPing 1.5s cubic-bezier(0,0,0.2,1) infinite; }
      .yc-input { width:100%; padding:12px 14px; background:#FFFFFF; border:1px solid ${C.border}; border-radius:12px; color:${C.text}; font-size:14px; outline:none; transition:border-color .25s, box-shadow .25s; font-family:inherit; }
      .yc-input:hover { border-color: ${C.borderHv}; }
      .yc-input:focus { border-color: ${C.blue}; box-shadow: 0 0 0 3px rgba(30,64,175,0.10); }
      .yc-input::placeholder { color: ${C.text3}; }
      .yc-select option { background:#FFFFFF; color:${C.text}; }
      .yc-lang-btn { background: transparent; border: none; cursor: pointer; padding: 4px 8px; font-size: 12px; font-weight: 600; letter-spacing: 0.06em; color: ${C.text3}; transition: color .2s; font-family: inherit; }
      .yc-lang-btn:hover { color: ${C.text2}; }
      .yc-lang-btn.active { color: ${C.blue}; }
    `}</style>
  )
}

/* ─── Word-by-word reveal ─── */
function WordReveal({ text, baseDelay = 0, className, style }) {
  return (
    <span className={className} style={style}>
      {text.split(' ').map((w, i) => (
        <motion.span
          key={`${i}-${w}`}
          initial={{ opacity: 0, y: 25, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, delay: baseDelay + i * 0.12, ease: EASE }}
          style={{ display: 'inline-block', marginRight: '0.28em' }}
        >
          {w}
        </motion.span>
      ))}
    </span>
  )
}

function Reveal({ children, delay = 0, y = 20 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

/* ─── Header with logo + lang switcher ─── */
function Header({ mob, lang, setLang, t }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: EASE }}
      style={{
        position: 'sticky', top: 0, zIndex: 50,
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        background: 'rgba(255,255,255,0.78)',
        borderBottom: `1px solid ${C.border}`,
      }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: mob ? '12px 18px' : '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <a href="#top" style={{ display: 'inline-flex', alignItems: 'center' }}>
          <img src={`${BASE}logo.webp`} alt="YC Logistics Araminda" style={{ height: mob ? 56 : 72, width: 'auto', display: 'block' }} />
        </a>
        <nav style={{ display: mob ? 'none' : 'flex', gap: 28, alignItems: 'center' }}>
          <a href="#servicios" style={{ color: C.text2, fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>{t.nav.services}</a>
          <a href="#proceso" style={{ color: C.text2, fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>{t.nav.process}</a>
          <a href="#calculator" style={{ color: C.text2, fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>{t.nav.quote}</a>
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 2, padding: '4px 6px', border: `1px solid ${C.border}`, borderRadius: 999, background: 'rgba(255,255,255,0.6)' }}>
            {[
              { code: 'es', label: 'ES' },
              { code: 'en', label: 'EN' },
              { code: 'zh', label: '中文' },
            ].map(l => (
              <button key={l.code} className={`yc-lang-btn ${lang === l.code ? 'active' : ''}`} onClick={() => setLang(l.code)} aria-label={`Switch to ${l.label}`}>
                {l.label}
              </button>
            ))}
          </div>
          <motion.a href="#calculator" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 999, background: C.blue, color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
            <Calculator size={14} /> {mob ? t.nav.ctaShort : t.nav.cta}
          </motion.a>
        </div>
      </div>
    </motion.header>
  )
}

export default function LandingLogistics() {
  const [lang, setLang] = useLang()
  const t = STRINGS[lang]
  const mob = useIsMobile()

  const [vslPlay, setVslPlay] = useState(false)
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    category: '', weight: '', length: '', width: '', height: '',
    destination: '', method: 'sea', cartons: '1', name: '', phone: '', email: '',
  })
  const [result, setResult] = useState(null)
  const [estimating, setEstimating] = useState(false)
  const [sending, setSending] = useState(false)

  /* Index of currently selected category/destination so we can keep the stable VALUE
     even when language changes. The select option's <value> is the index. */
  const calculate = async () => {
    setEstimating(true)
    const divisor = METHOD_DIVISORS[form.method] || 6000

    try {
      const est = await estimatePrice({
        weightKg: Number(form.weight) || 0,
        lengthCm: Number(form.length) || 0,
        widthCm: Number(form.width) || 0,
        heightCm: Number(form.height) || 0,
        cartons: Number(form.cartons) || 1,
        shippingMethod: form.method,
        destination: form.destination,
        category: form.category,
      })
      setResult({
        volWeight: est.volWeight, billable: est.billableWeight,
        priceMin: est.priceMin, priceMax: est.priceMax,
        method: form.method, time: t.methodTimes[form.method],
        confidence: est.confidence, dataPoints: est.dataPoints,
      })
      setStep(3)
    } catch {
      const w = Number(form.weight) || 0
      const l = Number(form.length) || 0
      const wd = Number(form.width) || 0
      const h = Number(form.height) || 0
      const cartons = Number(form.cartons) || 1
      const volWeight = (l * wd * h) / divisor
      const billable = Math.max(w, volWeight) * cartons
      const rates = { express: [6, 12], air: [3.5, 7], sea: [0.8, 2.5], train: [1.5, 4] }
      const [rMin, rMax] = rates[form.method] || rates.sea
      setResult({
        volWeight: Math.round(volWeight * 100) / 100,
        billable: Math.round(billable * 100) / 100,
        priceMin: Math.round(billable * rMin),
        priceMax: Math.round(billable * rMax),
        method: form.method, time: t.methodTimes[form.method],
        confidence: 'fallback', dataPoints: 0,
      })
      setStep(3)
    }
    setEstimating(false)
  }

  const whatsappMsg = () => {
    if (!result) return ''
    const m = t.waMsg
    const msg = `${m.hello}\n` +
      `- ${m.product}: ${form.category}\n` +
      `- ${form.cartons} ${m.cartons}, ${form.weight}kg\n` +
      `- ${m.dimensions}: ${form.length}x${form.width}x${form.height} cm\n` +
      `- ${m.destination}: ${form.destination}\n` +
      `- ${m.method}: ${t.methodNames[result.method] || result.method}\n` +
      `- ${m.estimate}: €${result.priceMin} - €${result.priceMax}\n` +
      `${form.name ? `- ${m.name}: ${form.name}` : ''}\n` +
      `${form.email ? `- ${m.email}: ${form.email}` : ''}`
    return encodeURIComponent(msg.trim())
  }

  const handleContact = async () => {
    if (!result || !form.name || !form.phone) return
    setSending(true)
    const phoneDigits = String(form.phone).replace(/\D/g, '')
    try {
      const { data: clients } = await supabase.from('clients').select('id').eq('slug', 'yc-logistics').single()
      const clientId = clients?.id || null

      let pipelineId = null
      let stageKey = 'lead_nuevo'
      if (clientId) {
        const { data: pipeline } = await supabase
          .from('crm_pipelines')
          .select('id, stages')
          .eq('client_id', clientId)
          .eq('is_default', true)
          .maybeSingle()
        if (pipeline) {
          pipelineId = pipeline.id
          const firstStage = Array.isArray(pipeline.stages) ? pipeline.stages[0] : null
          if (firstStage?.key) stageKey = firstStage.key
        }
      }

      await Promise.all([
        saveQuote({
          clientId,
          params: {
            weightKg: Number(form.weight) || 0,
            lengthCm: Number(form.length) || 0,
            widthCm: Number(form.width) || 0,
            heightCm: Number(form.height) || 0,
            shippingMethod: form.method,
            destination: form.destination,
            category: form.category,
          },
          result,
          contact: { name: form.name, email: form.email, phone: phoneDigits },
        }),
        supabase.from('crm_contacts').insert({
          client_id: clientId,
          pipeline_id: pipelineId,
          stage_key: stageKey,
          name: form.name, email: form.email || null, phone: phoneDigits,
          status: 'lead', source: 'logistics_landing',
          tags: ['logistics', `lang:${lang}`],
          notes: `Cotización: €${result.priceMin}-€${result.priceMax} | ${form.category} | ${form.destination} | ${result.method} | ${result.billable}kg`,
          custom_fields: {
            product_description: form.category, product_category: form.category,
            shipping_method: form.method, destination_country: form.destination,
            weight_kg: form.weight, carton_count: form.cartons,
            dimensions_l: form.length, dimensions_w: form.width, dimensions_h: form.height,
            estimated_price_min: String(result.priceMin), estimated_price_max: String(result.priceMax),
            language: lang,
          },
        }),
      ])
    } catch (err) {
      console.error('[YC Logistics] Failed to save lead to Supabase:', err)
    }
    setSending(false)
    window.open(`https://wa.me/?text=${whatsappMsg()}`, '_blank')
  }

  const eyebrow = { display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.3em', color: C.blue, textTransform: 'uppercase', textAlign: 'center', marginBottom: 10 }

  const s = {
    page: { minHeight: '100vh', background: C.bg, color: C.text, fontFamily: "'Inter', system-ui, -apple-system, sans-serif", position: 'relative', overflow: 'hidden' },
    main: { position: 'relative', zIndex: 10, maxWidth: 1100, margin: '0 auto', padding: mob ? '32px 18px 80px' : '60px 28px 120px' },
    badge: { position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 10, padding: '9px 18px', borderRadius: 999, border: `1px solid ${C.border}`, background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', marginBottom: 22, boxShadow: '0 1px 0 rgba(15,23,42,0.02)' },
    badgeText: { fontSize: 11, fontWeight: 600, letterSpacing: '0.18em', color: C.text2, textTransform: 'uppercase' },
    h1: { fontSize: mob ? 36 : 64, fontWeight: 300, lineHeight: 1.06, letterSpacing: '-0.03em', color: C.text, margin: '0 auto 22px', maxWidth: 900 },
    sub: { fontSize: mob ? 15 : 18, color: C.text2, maxWidth: 640, margin: '0 auto 40px', lineHeight: 1.6 },
    card: { background: '#FFFFFF', borderRadius: 20, border: `1px solid ${C.border}`, padding: mob ? 22 : 36, boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 24px 60px -24px rgba(15,23,42,0.10)' },
    label: { display: 'block', color: C.text2, fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 },
    btnPrimary: { width: '100%', padding: '14px 26px', background: C.blue, border: 'none', borderRadius: 999, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all .25s', fontFamily: 'inherit' },
    btnGhost: { width: '100%', padding: '14px 26px', background: '#FFFFFF', border: `1px solid ${C.border}`, borderRadius: 999, color: C.text, fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all .25s', fontFamily: 'inherit' },
    methodCard: (active) => ({
      flex: 1, minWidth: mob ? 70 : 100, padding: mob ? '14px 8px' : '18px 12px', borderRadius: 14, cursor: 'pointer', textAlign: 'center',
      background: active ? 'rgba(30,64,175,0.06)' : '#FFFFFF',
      border: active ? `1px solid ${C.blue}` : `1px solid ${C.border}`,
      transition: 'all .25s ease',
      boxShadow: active ? '0 0 0 3px rgba(30,64,175,0.08)' : '0 1px 0 rgba(15,23,42,0.02)',
    }),
    sectionTitle: { fontSize: mob ? 28 : 44, fontWeight: 300, letterSpacing: '-0.02em', color: C.text, margin: '0 0 12px', textAlign: 'center' },
    sectionSub: { color: C.text2, fontSize: mob ? 13 : 15, textAlign: 'center', margin: '0 0 48px' },
  }

  const confLabel = (c) =>
    c === 'fallback' ? t.calc.result.confLow :
    c === 'high' ? t.calc.result.confHigh :
    c === 'medium' ? t.calc.result.confMed :
    t.calc.result.confMod

  return (
    <div style={s.page} id="top">
      <YCStyles />
      <LightBackground />
      <Header mob={mob} lang={lang} setLang={setLang} t={t} />

      <main style={s.main}>
        {/* ─── HERO ─── */}
        <section style={{ textAlign: 'center', padding: mob ? '32px 0 56px' : '64px 0 80px' }}>
          <motion.div
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: EASE }}
            style={s.badge}
          >
            <span style={{ position: 'relative', display: 'inline-flex', height: 8, width: 8 }}>
              <span className="yc-ping" style={{ position: 'absolute', inset: 0, borderRadius: '50%' }} />
              <span style={{ position: 'relative', height: 8, width: 8, borderRadius: '50%', background: C.blue }} />
            </span>
            <span style={s.badgeText}>{t.hero.badge}</span>
          </motion.div>

          <h1 key={`h1-${lang}`} style={s.h1}>
            <WordReveal text={t.hero.title} baseDelay={0.2} />
          </h1>

          <motion.p
            key={`sub-${lang}`}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.6, ease: EASE }}
            style={s.sub}
          >
            {t.hero.sub}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2.0, ease: EASE }}
            style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <motion.a href="#calculator"
              whileHover={{ scale: 1.03, boxShadow: '0 12px 32px -8px rgba(30,64,175,0.45)' }}
              whileTap={{ scale: 0.97 }}
              style={{ ...s.btnPrimary, width: 'auto', padding: '14px 32px', textDecoration: 'none' }}>
              <Calculator size={16} /> {t.hero.cta1}
            </motion.a>
            <motion.a href="#servicios"
              whileHover={{ scale: 1.03, borderColor: C.borderHv }}
              whileTap={{ scale: 0.97 }}
              style={{ ...s.btnGhost, width: 'auto', padding: '14px 32px', textDecoration: 'none' }}>
              {t.hero.cta2}
            </motion.a>
          </motion.div>
        </section>

        {/* ─── VSL ─── */}
        <Reveal delay={0.05}>
          <section style={{ marginTop: mob ? 8 : 24, marginBottom: mob ? 56 : 96, position: 'relative' }}>
            <div style={{ position: 'absolute', inset: '-8% -4%', background: 'radial-gradient(ellipse at center, rgba(212,160,23,0.18) 0%, rgba(30,64,175,0.10) 40%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', maxWidth: 960, margin: '0 auto', borderRadius: mob ? 16 : 22, overflow: 'hidden', border: `1px solid ${C.border}`, background: '#000', boxShadow: '0 30px 80px -20px rgba(15,23,42,0.18), 0 0 0 1px rgba(30,64,175,0.04) inset', aspectRatio: '16 / 9' }}>
              {!vslPlay ? (
                <motion.button
                  onClick={() => setVslPlay(true)}
                  whileHover={{ scale: 1.005 }}
                  whileTap={{ scale: 0.99 }}
                  aria-label="Play video"
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', padding: 0, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img
                    src={`${BASE}poster.webp`}
                    alt=""
                    fetchpriority="high"
                    decoding="async"
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.40) 100%)' }} />
                  <motion.div
                    initial={{ scale: 1 }}
                    whileHover={{ scale: 1.08 }}
                    transition={{ duration: 0.3, ease: EASE }}
                    style={{ position: 'relative', width: mob ? 72 : 96, height: mob ? 72 : 96, borderRadius: '50%', background: 'rgba(255,255,255,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 60px -10px rgba(30,64,175,0.45), 0 0 0 8px rgba(255,255,255,0.18)' }}>
                    <Play size={mob ? 28 : 36} color={C.blue} fill={C.blue} style={{ marginLeft: 4 }} />
                  </motion.div>
                </motion.button>
              ) : (
                <video
                  src={`${BASE}vsl.mp4`}
                  poster={`${BASE}poster.webp`}
                  controls
                  autoPlay
                  playsInline
                  preload="auto"
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block', background: '#000' }}
                />
              )}
            </div>
            <div style={{ textAlign: 'center', marginTop: 16, fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', color: C.blue, textTransform: 'uppercase' }}>
              {t.vslCaption}
            </div>
          </section>
        </Reveal>

        {/* ─── FEATURES (no icons, bigger text) ─── */}
        <Reveal delay={0.1}>
          <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr 1fr' : 'repeat(4, 1fr)', gap: mob ? 12 : 18, marginBottom: mob ? 56 : 88 }}>
            {t.features.map((f, i) => (
              <motion.div key={`feat-${lang}-${i}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -3, borderColor: C.borderHv, boxShadow: '0 16px 40px -16px rgba(15,23,42,0.16)' }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.7, delay: 0.1 + i * 0.1, ease: EASE }}
                style={{ background: '#FFFFFF', borderRadius: 16, border: `1px solid ${C.border}`, padding: mob ? 22 : 28, textAlign: 'center', boxShadow: '0 1px 2px rgba(15,23,42,0.04)', transition: 'all .3s' }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: i % 2 === 0 ? C.blue : C.gold, margin: '0 auto 14px' }} />
                <div style={{ color: C.text, fontSize: mob ? 16 : 19, fontWeight: 600, marginBottom: 6, letterSpacing: '-0.01em' }}>{f.label}</div>
                <div style={{ color: C.text2, fontSize: mob ? 12 : 13 }}>{f.detail}</div>
              </motion.div>
            ))}
          </div>
        </Reveal>

        {/* ─── CALCULATOR ─── */}
        <section id="calculator" style={{ scrollMarginTop: 80 }}>
          <Reveal delay={0.05}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <span style={eyebrow}>{t.calc.eyebrow}</span>
              <h2 style={{ ...s.sectionTitle, marginTop: 4, marginBottom: 6 }}>{t.calc.title}</h2>
              <p style={{ ...s.sectionSub, marginBottom: 0 }}>{t.calc.sub}</p>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <motion.div style={s.card}>
              <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 24 }}>
                {[0,1,2,3].map(i => (
                  <span key={i} style={{ height: 4, width: i === step ? 28 : 14, borderRadius: 2, background: i <= step ? C.blue : C.border, transition: 'all .35s ease' }} />
                ))}
              </div>

              {step === 0 && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }}>
                  <div style={{ fontSize: 12, color: C.blue, marginBottom: 18, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 999, background: 'rgba(30,64,175,0.06)', border: '1px solid rgba(30,64,175,0.20)', fontWeight: 600 }}>
                    <User size={12} /> {t.calc.step1}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : '1fr 1fr', gap: 14, marginBottom: 14 }}>
                    <div>
                      <label style={s.label}>{t.calc.name}</label>
                      <input className="yc-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder={t.calc.namePh} />
                    </div>
                    <div>
                      <label style={s.label}>{t.calc.whatsapp}</label>
                      <input className="yc-input" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder={t.calc.whatsappPh} />
                    </div>
                  </div>
                  <div style={{ marginBottom: 24 }}>
                    <label style={s.label}>{t.calc.email}</label>
                    <input className="yc-input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder={t.calc.emailPh} />
                  </div>
                  <motion.button onClick={() => setStep(1)} disabled={!form.name || !form.phone}
                    whileHover={(!form.name || !form.phone) ? {} : { scale: 1.02, boxShadow: '0 12px 32px -8px rgba(30,64,175,0.4)' }}
                    whileTap={{ scale: 0.98 }}
                    style={{ ...s.btnPrimary, opacity: (!form.name || !form.phone) ? 0.45 : 1, cursor: (!form.name || !form.phone) ? 'not-allowed' : 'pointer' }}>
                    {t.calc.next} <ChevronRight size={16} />
                  </motion.button>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }}>
                  <div style={{ fontSize: 12, color: C.blue, marginBottom: 18, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 999, background: 'rgba(30,64,175,0.06)', border: '1px solid rgba(30,64,175,0.20)', fontWeight: 600 }}>
                    <Globe size={12} /> {t.calc.step2}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : '1fr 1fr', gap: 14, marginBottom: 22 }}>
                    <div>
                      <label style={s.label}>{t.calc.category}</label>
                      <select className="yc-input yc-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                        <option value="">{t.calc.select}</option>
                        {CATEGORIES_VAL.map((val, i) => <option key={val} value={val}>{t.categories[i]}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={s.label}>{t.calc.destination}</label>
                      <select className="yc-input yc-select" value={form.destination} onChange={e => setForm(f => ({ ...f, destination: e.target.value }))}>
                        <option value="">{t.calc.select}</option>
                        {DESTINATIONS_VAL.map((val, i) => <option key={val} value={val}>{t.destinations[i]}</option>)}
                      </select>
                    </div>
                  </div>

                  <label style={{ ...s.label, marginBottom: 12 }}>{t.calc.method}</label>
                  <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 10, marginBottom: 24 }}>
                    {METHOD_KEYS.map(key => {
                      const Ico = METHOD_ICONS[key]
                      return (
                        <motion.div key={key} onClick={() => setForm(f => ({ ...f, method: key }))}
                          whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
                          style={s.methodCard(form.method === key)}>
                          <Ico size={20} color={form.method === key ? C.blue : C.text3} style={{ marginBottom: 6 }} />
                          <div style={{ color: C.text, fontSize: 12, fontWeight: 600 }}>{t.methodNames[key]}</div>
                          <div style={{ color: C.text2, fontSize: 10, marginTop: 2 }}>{t.methodTimes[key]}</div>
                        </motion.div>
                      )
                    })}
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <motion.button onClick={() => setStep(0)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ ...s.btnGhost, flex: 1 }}>{t.calc.back}</motion.button>
                    <motion.button onClick={() => setStep(2)} disabled={!form.category || !form.destination}
                      whileHover={(!form.category || !form.destination) ? {} : { scale: 1.02, boxShadow: '0 12px 32px -8px rgba(30,64,175,0.4)' }}
                      whileTap={{ scale: 0.98 }}
                      style={{ ...s.btnPrimary, flex: 2, opacity: (!form.category || !form.destination) ? 0.45 : 1, cursor: (!form.category || !form.destination) ? 'not-allowed' : 'pointer' }}>
                      {t.calc.next} <ChevronRight size={16} />
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }}>
                  <div style={{ fontSize: 12, color: C.blue, marginBottom: 18, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 999, background: 'rgba(30,64,175,0.06)', border: '1px solid rgba(30,64,175,0.20)', fontWeight: 600 }}>
                    <Truck size={12} /> {t.calc.step3}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 14, marginBottom: 14 }}>
                    <div>
                      <label style={s.label}>{t.calc.cartons}</label>
                      <input className="yc-input" type="number" value={form.cartons} onChange={e => setForm(f => ({ ...f, cartons: e.target.value }))} min="1" />
                    </div>
                    <div>
                      <label style={s.label}>{t.calc.weight}</label>
                      <input className="yc-input" type="number" value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
                    <div>
                      <label style={s.label}>{t.calc.length}</label>
                      <input className="yc-input" type="number" value={form.length} onChange={e => setForm(f => ({ ...f, length: e.target.value }))} />
                    </div>
                    <div>
                      <label style={s.label}>{t.calc.width}</label>
                      <input className="yc-input" type="number" value={form.width} onChange={e => setForm(f => ({ ...f, width: e.target.value }))} />
                    </div>
                    <div>
                      <label style={s.label}>{t.calc.height}</label>
                      <input className="yc-input" type="number" value={form.height} onChange={e => setForm(f => ({ ...f, height: e.target.value }))} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <motion.button onClick={() => setStep(1)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ ...s.btnGhost, flex: 1 }}>{t.calc.back}</motion.button>
                    <motion.button onClick={calculate} disabled={!form.weight || !form.length || !form.width || !form.height || estimating}
                      whileHover={(!form.weight || !form.length || estimating) ? {} : { scale: 1.02, boxShadow: '0 14px 40px -8px rgba(30,64,175,0.5)' }}
                      whileTap={{ scale: 0.98 }}
                      style={{ ...s.btnPrimary, flex: 2, opacity: (!form.weight || !form.length || estimating) ? 0.45 : 1, cursor: (!form.weight || !form.length || estimating) ? 'not-allowed' : 'pointer' }}>
                      {estimating ? <><Brain size={16} /> {t.calc.estimating}</> : <><Calculator size={16} /> {t.calc.calc}</>}
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {step === 3 && result && (
                <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, ease: EASE }}>
                  <div style={{ position: 'relative', borderRadius: 18, border: `1px solid rgba(30,64,175,0.20)`, background: 'linear-gradient(180deg, rgba(30,64,175,0.05) 0%, rgba(212,160,23,0.04) 100%)', padding: mob ? 24 : 36, textAlign: 'center', marginBottom: 22, overflow: 'hidden' }}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 0.45, scale: 1.2 }}
                      transition={{ duration: 1.6, ease: EASE }}
                      style={{ position: 'absolute', inset: -40, background: 'radial-gradient(circle at center, rgba(30,64,175,0.18) 0%, transparent 60%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
                    <div style={{ position: 'relative' }}>
                      <div style={{ fontSize: 11, color: C.text2, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 10, fontWeight: 600 }}>{t.calc.result.label}</div>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
                        style={{ fontSize: mob ? 40 : 60, fontWeight: 300, letterSpacing: '-0.03em', color: C.text, marginBottom: 6, lineHeight: 1 }}>
                        €{result.priceMin.toLocaleString()} <span style={{ color: C.text3 }}>—</span> €{result.priceMax.toLocaleString()}
                      </motion.div>
                      <div style={{ color: C.text2, fontSize: 13, marginBottom: 14 }}>
                        {t.methodNames[result.method]} · {result.time} · {t.calc.result.billable} {result.billable} kg
                      </div>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <span style={{ padding: '5px 12px', borderRadius: 999, background: result.confidence === 'fallback' ? 'rgba(217,119,6,0.10)' : 'rgba(22,163,74,0.10)', border: `1px solid ${result.confidence === 'fallback' ? 'rgba(217,119,6,0.30)' : 'rgba(22,163,74,0.30)'}`, color: result.confidence === 'fallback' ? C.amber : C.green, fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 5, fontWeight: 600 }}>
                          <Brain size={11} />
                          {confLabel(result.confidence)}
                          {result.dataPoints > 0 && ` · ${result.dataPoints} ${t.calc.result.similar}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <motion.button onClick={handleContact} disabled={sending}
                    whileHover={{ scale: 1.02, boxShadow: '0 14px 40px -8px rgba(37,211,102,0.45)' }} whileTap={{ scale: 0.98 }}
                    style={{ ...s.btnPrimary, background: '#25D366', marginBottom: 10, opacity: sending ? 0.6 : 1 }}>
                    {sending ? t.calc.result.opening : <><MessageCircle size={16} /> {t.calc.result.talk}</>}
                  </motion.button>
                  <motion.button onClick={() => { setStep(0); setResult(null) }} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} style={{ ...s.btnGhost, fontSize: 13 }}>
                    {t.calc.result.newQuote}
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          </Reveal>
        </section>

        {/* ─── ABOUT ─── */}
        <section style={{ marginTop: mob ? 80 : 140 }}>
          <Reveal>
            <span style={eyebrow}>{t.about.eyebrow}</span>
            <h2 style={s.sectionTitle}>{t.about.title1}<br/>{t.about.title2}</h2>
            <p style={{ ...s.sectionSub, maxWidth: 680, margin: '0 auto 48px' }}>{t.about.sub}</p>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr 1fr' : 'repeat(4, 1fr)', gap: mob ? 12 : 18 }}>
            {t.about.pillars.map((p, i) => (
              <motion.div key={`pillar-${lang}-${i}`}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.7, delay: 0.1 + i * 0.1, ease: EASE }}
                style={{ background: '#FFFFFF', borderRadius: 16, border: `1px solid ${C.border}`, padding: mob ? 18 : 24, boxShadow: '0 1px 2px rgba(15,23,42,0.04)' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: i % 2 === 0 ? C.blue : C.gold, marginBottom: 14 }} />
                <div style={{ color: C.text, fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{p.title}</div>
                <div style={{ color: C.text2, fontSize: 13, lineHeight: 1.55 }}>{p.desc}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ─── TEAM ─── */}
        <section style={{ marginTop: mob ? 80 : 140 }}>
          <Reveal>
            <span style={eyebrow}>{t.team.eyebrow}</span>
            <h2 style={s.sectionTitle}>{t.team.title}</h2>
            <p style={s.sectionSub}>{t.team.sub}</p>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : '1fr 1fr', gap: 18 }}>
            {t.team.people.map((p, i) => {
              const accent = i === 0 ? C.gold : C.blue
              return (
                <motion.div key={`team-${lang}-${i}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.8, delay: 0.15 + i * 0.15, ease: EASE }}
                  whileHover={{ y: -3, borderColor: C.borderHv, boxShadow: '0 24px 60px -24px rgba(15,23,42,0.16)' }}
                  style={{ ...s.card, transition: 'all .3s' }}>
                  <div style={{ width: 32, height: 3, borderRadius: 2, background: accent, marginBottom: 18 }} />
                  <div style={{ fontSize: mob ? 22 : 26, fontWeight: 600, color: C.text, letterSpacing: '-0.015em', marginBottom: 14 }}>{p.name}</div>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: C.text2 }}>{p.bio}</p>
                </motion.div>
              )
            })}
          </div>
        </section>

        {/* ─── SERVICES (no icons, bigger title) ─── */}
        <section id="servicios" style={{ marginTop: mob ? 80 : 140, scrollMarginTop: 80 }}>
          <Reveal>
            <span style={eyebrow}>{t.services.eyebrow}</span>
            <h2 style={s.sectionTitle}>{t.services.title}</h2>
            <p style={s.sectionSub}>{t.services.sub}</p>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : 'repeat(3, 1fr)', gap: mob ? 14 : 18 }}>
            {t.services.list.map((srv, i) => {
              const accent = i === 1 ? C.gold : C.blue
              return (
                <motion.div key={`srv-${lang}-${i}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.8, delay: 0.15 + i * 0.12, ease: EASE }}
                  whileHover={{ y: -4, borderColor: C.borderHv, boxShadow: '0 24px 60px -24px rgba(15,23,42,0.16)' }}
                  style={{ ...s.card, padding: mob ? 22 : 28, transition: 'all .3s' }}>
                  <div style={{ width: 32, height: 3, borderRadius: 2, background: accent, marginBottom: 18 }} />
                  <h3 style={{ margin: '0 0 12px', fontSize: mob ? 22 : 26, fontWeight: 600, color: C.text, letterSpacing: '-0.015em', lineHeight: 1.2 }}>{srv.title}</h3>
                  <p style={{ margin: '0 0 18px', fontSize: 14, lineHeight: 1.6, color: C.text2 }}>{srv.desc}</p>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: accent, textTransform: 'uppercase' }}>{srv.tag}</div>
                </motion.div>
              )
            })}
          </div>
        </section>

        {/* ─── PROCESS ─── */}
        <section id="proceso" style={{ marginTop: mob ? 80 : 140, scrollMarginTop: 80 }}>
          <Reveal>
            <span style={eyebrow}>{t.process.eyebrow}</span>
            <h2 style={s.sectionTitle}>{t.process.title}</h2>
            <p style={s.sectionSub}>{t.process.sub}</p>
          </Reveal>
          <div style={{ display: 'flex', flexDirection: mob ? 'column' : 'row', gap: mob ? 20 : 0, position: 'relative' }}>
            {t.process.steps.map((item, i, arr) => (
              <motion.div key={`proc-${lang}-${i}`}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.7, delay: 0.2 + i * 0.15, ease: EASE }}
                style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: mob ? 'row' : 'column', alignItems: mob ? 'flex-start' : 'center', gap: mob ? 16 : 0, padding: mob ? 0 : '12px 16px' }}>
                {!mob && i < arr.length - 1 && (
                  <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.6, delay: 0.5 + i * 0.15, ease: EASE }}
                    style={{ position: 'absolute', right: 0, top: 56, height: 1, width: '100%', transformOrigin: 'left', background: `linear-gradient(to right, ${C.borderHv}, ${C.border})` }} />
                )}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.3em', color: C.blue, marginBottom: mob ? 4 : 12 }}>{t.process.step} 0{i+1}</span>
                  <motion.div whileHover={{ scale: 1.1, borderColor: C.blue }} transition={{ duration: 0.3 }}
                    style={{ display: 'flex', height: 48, width: 48, alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: `1px solid ${C.border}`, background: '#FFFFFF', color: C.text, fontSize: 17, fontWeight: 600, marginBottom: mob ? 0 : 16, boxShadow: '0 4px 12px -4px rgba(15,23,42,0.10)' }}>
                    {i+1}
                  </motion.div>
                </div>
                <div style={{ flex: 1, textAlign: mob ? 'left' : 'center', paddingTop: mob ? 4 : 0 }}>
                  <h4 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 600, color: C.text }}>{item.title}</h4>
                  <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: C.text2 }}>{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ─── QUALITY ─── */}
        <section style={{ marginTop: mob ? 80 : 140 }}>
          <Reveal>
            <span style={eyebrow}>{t.quality.eyebrow}</span>
            <h2 style={s.sectionTitle}>{t.quality.title}</h2>
            <p style={s.sectionSub}>{t.quality.sub}</p>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : 'repeat(5, 1fr)', gap: mob ? 10 : 14 }}>
            {t.quality.items.map((q, i) => (
              <motion.div key={`q-${lang}-${i}`}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.7, delay: 0.1 + i * 0.08, ease: EASE }}
                style={{ background: '#FFFFFF', borderRadius: 14, border: `1px solid ${C.border}`, padding: mob ? 16 : 20, boxShadow: '0 1px 2px rgba(15,23,42,0.04)' }}>
                <CheckCircle2 size={18} color={C.blue} style={{ marginBottom: 10 }} />
                <div style={{ color: C.text, fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{q.title}</div>
                <div style={{ color: C.text2, fontSize: 12, lineHeight: 1.5 }}>{q.desc}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ─── OPERATIONS PHOTOS ─── */}
        <section style={{ marginTop: mob ? 80 : 140 }}>
          <Reveal>
            <span style={eyebrow}>{t.ops.eyebrow}</span>
            <h2 style={s.sectionTitle}>{t.ops.title}</h2>
            <p style={s.sectionSub}>{t.ops.sub}</p>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : '1fr 1fr', gap: mob ? 14 : 20 }}>
            {[
              { src: 'op-1.webp', cap: t.ops.cap1 },
              { src: 'op-2.webp', cap: t.ops.cap2 },
            ].map((p, i) => (
              <motion.figure key={p.src}
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.9, delay: 0.1 + i * 0.15, ease: EASE }}
                whileHover={{ y: -4 }}
                style={{ margin: 0, position: 'relative', borderRadius: 18, overflow: 'hidden', border: `1px solid ${C.border}`, background: '#FFFFFF', boxShadow: '0 24px 60px -24px rgba(15,23,42,0.18)', transition: 'transform .35s' }}>
                <div style={{ position: 'relative', width: '100%', aspectRatio: '4 / 5', overflow: 'hidden', background: C.surface }}>
                  <motion.img
                    src={`${BASE}${p.src}`}
                    alt={p.cap}
                    loading="lazy"
                    initial={{ scale: 1.06 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 1.6, ease: EASE }}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 55%, rgba(15,23,42,0.55) 100%)', pointerEvents: 'none' }} />
                </div>
                <figcaption style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: mob ? '14px 16px' : '18px 22px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: i === 0 ? C.gold : C.blue, boxShadow: `0 0 12px ${i === 0 ? 'rgba(212,160,23,0.6)' : 'rgba(30,64,175,0.6)'}` }} />
                  <span style={{ color: '#FFFFFF', fontSize: 13, fontWeight: 500, letterSpacing: '-0.005em', textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>{p.cap}</span>
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </section>

        {/* ─── DIFFERENTIATION ─── */}
        <section style={{ marginTop: mob ? 80 : 140 }}>
          <Reveal>
            <span style={eyebrow}>{t.diff.eyebrow}</span>
            <h2 style={s.sectionTitle}>{t.diff.title}</h2>
            <p style={s.sectionSub}>{t.diff.sub}</p>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : '1fr 1fr', gap: mob ? 14 : 18 }}>
            <Reveal delay={0.1}>
              <div style={{ ...s.card, padding: mob ? 22 : 28, borderColor: 'rgba(220,38,38,0.18)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', color: C.red, textTransform: 'uppercase', marginBottom: 16 }}>{t.diff.othersLabel}</div>
                {t.diff.others.map((tx) => (
                  <div key={tx} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
                    <X size={16} color={C.red} style={{ flexShrink: 0, marginTop: 2, opacity: 0.7 }} />
                    <span style={{ color: C.text2, fontSize: 14, lineHeight: 1.5 }}>{tx}</span>
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal delay={0.2}>
              <div style={{ ...s.card, padding: mob ? 22 : 28, borderColor: 'rgba(30,64,175,0.25)', background: 'linear-gradient(180deg, rgba(30,64,175,0.04) 0%, rgba(212,160,23,0.03) 100%)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', color: C.blue, textTransform: 'uppercase', marginBottom: 16 }}>{t.diff.usLabel}</div>
                {t.diff.us.map((tx) => (
                  <div key={tx} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
                    <CheckCircle2 size={16} color={C.blue} style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{ color: C.text, fontSize: 14, lineHeight: 1.5 }}>{tx}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ─── CTA ─── */}
        <Reveal>
          <section style={{ marginTop: mob ? 80 : 140, textAlign: 'center', padding: mob ? '40px 16px' : '64px 32px', borderRadius: 24, border: `1px solid ${C.border}`, background: 'linear-gradient(180deg, rgba(30,64,175,0.05) 0%, rgba(212,160,23,0.04) 100%)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: '-20%', background: 'radial-gradient(circle at center, rgba(30,64,175,0.14) 0%, rgba(212,160,23,0.08) 40%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative' }}>
              <h2 style={{ ...s.sectionTitle, fontSize: mob ? 26 : 40, marginBottom: 14 }}>{t.cta.title}</h2>
              <p style={{ ...s.sectionSub, marginBottom: 26 }}>{t.cta.sub}</p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <motion.a href="#calculator"
                  whileHover={{ scale: 1.03, boxShadow: '0 16px 50px -10px rgba(30,64,175,0.45)' }} whileTap={{ scale: 0.97 }}
                  style={{ ...s.btnPrimary, width: 'auto', padding: '14px 36px', textDecoration: 'none' }}>
                  <Calculator size={16} /> {t.cta.primary}
                </motion.a>
                <motion.a href="#calculator"
                  whileHover={{ scale: 1.03, borderColor: C.borderHv }} whileTap={{ scale: 0.97 }}
                  style={{ ...s.btnGhost, width: 'auto', padding: '14px 36px', textDecoration: 'none' }}>
                  <MessageCircle size={16} /> {t.cta.secondary}
                </motion.a>
              </div>
            </div>
          </section>
        </Reveal>

        {/* ─── FOOTER ─── */}
        <div style={{ marginTop: 80, paddingTop: 32, borderTop: `1px solid ${C.border}`, textAlign: 'center' }}>
          <img src={`${BASE}logo.webp`} alt="YC Logistics Araminda" style={{ height: 120, width: 'auto', display: 'inline-block', marginBottom: 12 }} />
          <div style={{ color: C.text2, fontSize: 12, marginBottom: 14 }}>{t.footer.location}</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: C.text3, fontSize: 11, letterSpacing: '0.06em' }}>
            <Languages size={12} /> ES · EN · 中文
          </div>
        </div>
      </main>
    </div>
  )
}
