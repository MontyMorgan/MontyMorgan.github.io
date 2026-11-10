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


/* Water ripple and soft blue cursor glow */
(() => {
  if (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    window.matchMedia("(pointer: coarse)").matches
  ) return;

  const canvas = document.createElement("canvas");
  canvas.id = "water-ripple-canvas";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let width, height, dpr;
  let ripples = [];
  let lastRipple = 0;
  let active = false;

  const mouse = { x: 0, y: 0 };
  const glow = { x: 0, y: 0 };

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  resize();
  window.addEventListener("resize", resize);

  function addRipple(x, y, strong = false) {
    ripples.push({
      x,
      y,
      start: performance.now(),
      strong
    });

    if (ripples.length > 24) ripples.shift();
  }

  document.addEventListener("pointermove", (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;

    if (!active) {
      glow.x = mouse.x;
      glow.y = mouse.y;
    }

    active = true;

    const now = performance.now();

    if (now - lastRipple > 85) {
      addRipple(mouse.x, mouse.y);
      lastRipple = now;
    }
  });

  document.addEventListener("pointerdown", (event) => {
    addRipple(event.clientX, event.clientY, true);
  });

  document.addEventListener("pointerout", (event) => {
    if (!event.relatedTarget) active = false;
  });

  window.addEventListener("blur", () => {
    active = false;
  });

  function animate(now) {
    ctx.clearRect(0, 0, width, height);

    if (active) {
      glow.x += (mouse.x - glow.x) * 0.17;
      glow.y += (mouse.y - glow.y) * 0.17;

      // Soft whitish-blue cursor light
      const light = ctx.createRadialGradient(
        glow.x, glow.y, 0,
        glow.x, glow.y, 110
      );

      light.addColorStop(0, "rgba(225, 247, 255, 0.38)");
      light.addColorStop(0.25, "rgba(147, 211, 255, 0.18)");
      light.addColorStop(1, "rgba(147, 211, 255, 0)");

      ctx.fillStyle = light;
      ctx.fillRect(glow.x - 110, glow.y - 110, 220, 220);
    }

    ripples = ripples.filter(r => now - r.start < 950);

    ripples.forEach(ripple => {
      const progress = (now - ripple.start) / 950;
      const radius = 5 + progress * (ripple.strong ? 125 : 75);
      const opacity = (1 - progress) * (ripple.strong ? 0.7 : 0.36);

      ctx.beginPath();
      ctx.arc(ripple.x, ripple.y, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(180, 225, 255, ${opacity})`;
      ctx.lineWidth = ripple.strong ? 1.8 : 1.2;
      ctx.stroke();

      // Second, softer water wave
      if (progress > 0.18) {
        const secondProgress = (progress - 0.18) / 0.82;
        ctx.beginPath();
        ctx.arc(
          ripple.x,
          ripple.y,
          5 + secondProgress * (ripple.strong ? 95 : 55),
          0,
          Math.PI * 2
        );
        ctx.strokeStyle =
          `rgba(205, 240, 255, ${(1 - secondProgress) * 0.22})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });

    requestAnimationFrame(animate);
  }
