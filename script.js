const toggle = document.querySelector('#menu-toggle');
const links = document.querySelector('#nav-links');
if (toggle && links) {
  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
  });
  links.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    links.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation');
  }));
}
document.querySelector('#year').textContent = new Date().getFullYear();

// Match the fixed watermark to the section underneath the viewport center.
(() => {
  const watermark = document.querySelector('.fixed-watermark');
  if (!watermark) return;
  const darkSections = '.hero, .ticker, .section-dark, .section-work, .contact-section, .service-hero, .service-deliverables, .service-cta, .site-header, .footer';
  let scheduled = false;
  function updateWatermark() {
    scheduled = false;
    const element = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2);
    const isDark = Boolean(element && element.closest(darkSections));
    watermark.classList.toggle('on-dark', isDark);
    watermark.classList.toggle('on-light', !isDark);
  }
  function scheduleUpdate() {
    if (!scheduled) {
      scheduled = true;
      window.requestAnimationFrame(updateWatermark);
    }
  }
  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);
  window.addEventListener('load', scheduleUpdate);
  updateWatermark();
})();
