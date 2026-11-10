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


/* ==========================================
   MONTY MORGAN PORTFOLIO
   Water Ripple + Whitish Blue Cursor Glow
   ========================================== */

(() => {
  "use strict";

  // Prevent the animation from loading twice
  if (document.getElementById("water-ripple-canvas")) return;

  // Respect reduced-motion accessibility preferences
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  function initializeWaterRipple() {

    // Skip devices without a mouse or precise pointer
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const canvas = document.createElement("canvas");
    canvas.id = "water-ripple-canvas";

    // Keep canvas above the website without blocking clicks
    Object.assign(canvas.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100vw",
      height: "100vh",
      pointerEvents: "none",
      zIndex: "99999",
      display: "block"
    });

    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;

    const mouse = { x: 0, y: 0 };
    const glow = { x: 0, y: 0 };

    let active = false;
    let ripples = [];
    let lastRippleTime = 0;

    function resizeCanvas() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    function createRipple(x, y, strong = false) {
      ripples.push({
        x: x,
        y: y,
        start: performance.now(),
        strong: strong
      });

      // Prevent too many ripples from building up
      if (ripples.length > 25) {
        ripples.shift();
      }
    }

    document.addEventListener("pointermove", (event) => {
      if (event.pointerType === "touch") return;

      mouse.x = event.clientX;
      mouse.y = event.clientY;

      if (!active) {
        glow.x = mouse.x;
        glow.y = mouse.y;
      }

      active = true;

      const now = performance.now();

      if (now - lastRippleTime > 65) {
        createRipple(mouse.x, mouse.y);
        lastRippleTime = now;
      }
    });

    document.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "touch") return;

      createRipple(event.clientX, event.clientY, true);
    });

    document.addEventListener("pointerleave", (event) => {
      if (!event.relatedTarget) {
        active = false;
      }
    });

    window.addEventListener("blur", () => {
      active = false;
    });

    function animate(now) {
      ctx.clearRect(0, 0, width, height);

      // Soft whitish-blue light following the cursor
      if (active) {
        glow.x += (mouse.x - glow.x) * 0.15;
        glow.y += (mouse.y - glow.y) * 0.15;

        const gradient = ctx.createRadialGradient(
          glow.x, glow.y, 0,
          glow.x, glow.y, 115
        );

        gradient.addColorStop(
          0,
          "rgba(235, 250, 255, 0.50)"
        );

        gradient.addColorStop(
          0.25,
          "rgba(145, 215, 255, 0.25)"
        );

        gradient.addColorStop(
          0.60,
          "rgba(95, 175, 255, 0.10)"
        );

        gradient.addColorStop(
          1,
          "rgba(95, 175, 255, 0)"
        );

        ctx.fillStyle = gradient;

        ctx.fillRect(
          glow.x - 115,
          glow.y - 115,
          230,
          230
        );
      }

      // Remove expired ripples
      ripples = ripples.filter((ripple) => {
        return now - ripple.start < 1100;
      });

      // Draw expanding water rings
      ripples.forEach((ripple) => {

        const progress = (now - ripple.start) / 1100;

        const maxRadius = ripple.strong ? 135 : 85;
        const radius = 5 + progress * maxRadius;

        const opacity =
          (1 - progress) *
          (ripple.strong ? 0.75 : 0.48);

        ctx.beginPath();

        ctx.arc(
          ripple.x,
          ripple.y,
          radius,
          0,
          Math.PI * 2
        );

        ctx.strokeStyle =
          `rgba(185, 230, 255, ${opacity})`;

        ctx.lineWidth = ripple.strong ? 2 : 1.3;

        ctx.stroke();

        // Secondary water ripple
        if (progress > 0.18) {

          const secondProgress =
            (progress - 0.18) / 0.82;

          ctx.beginPath();

          ctx.arc(
            ripple.x,
            ripple.y,
            5 + secondProgress * (maxRadius * 0.8),
            0,
            Math.PI * 2
          );

          ctx.strokeStyle =
            `rgba(225, 245, 255, ${
              (1 - secondProgress) * 0.28
            })`;

          ctx.lineWidth = 1;

          ctx.stroke();
        }
      });

      requestAnimationFrame(animate);
    }

    // Start animation
    requestAnimationFrame(animate);

    console.log("Monty Morgan water ripple animation loaded");
  }

  // Run after the page has loaded
  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeWaterRipple,
      { once: true }
    );
  } else {
    initializeWaterRipple();
  }

})();
