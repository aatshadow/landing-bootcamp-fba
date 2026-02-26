document.addEventListener('DOMContentLoaded', () => {
  initNavbarScroll();
  initSmoothScroll();
  initScrollAnimations();
});

function initNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
      navbar.style.padding = '10px 0';
      navbar.style.background = 'rgba(10, 10, 10, 0.95)';
    } else {
      navbar.style.padding = '16px 0';
      navbar.style.background = 'rgba(10, 10, 10, 0.8)';
    }
  });
}

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#' || href.startsWith('#WHATSAPP')) return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        const navbar = document.querySelector('.navbar');
        const offset = navbar ? navbar.offsetHeight : 0;
        window.scrollTo({
          top: target.getBoundingClientRect().top + window.scrollY - offset,
          behavior: 'smooth'
        });
      }
    });
  });
}

function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  // Fade in sections
  document.querySelectorAll('.team-photo-card, .section-title, .joaquin-section, .cta-break, .cta-final-content, .roadmap-card').forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
  });
}
