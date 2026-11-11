# Monty Morgan — Monochrome Portfolio

A self-contained static `index.html` (CSS and JavaScript embedded) with three image assets in `assets/`.

## Publish on GitHub Pages

1. Back up your existing repository before replacing its content.
2. Upload `index.html` and the complete `assets/` folder to the root of your GitHub Pages repository (for the root URL, repository name should be `MontyMorgan.github.io`).
3. Settings → Pages → Deploy from branch → `main` → `/(root)`.
4. After deployment, hard-refresh to clear old cached CSS/JS.

No npm, build, or dependencies needed. The typefaces use Google Fonts, with fallback fonts if blocked. Everything else is local.

## Features

- Black/white/gray solid-color sections; transparent borderless header.
- NSOL BPO prominent; no former employer names.
- White signature monogram and animated center-page watermark. Center watermark gently pulses and changes contrast over light/dark sections.
- Monochrome edited portrait supplied as `assets/monty-portrait.png`.
- Silver water ripple on mouse movement and click. Skips touch-only devices and honors reduced-motion setting.
- Working section navigation and mobile navigation menu.
- FormSubmit contact form to `montymorgan.nsolbpo@gmail.com`; requires recipient email activation and testing. Do not assume messages arrive before testing.

## Editing

All markup, styles and scripts are within `index.html`. Search for `id="about"`, `id="services"`, `id="experience"`, `id="capabilities"`, `id="contact"` to find the section you want.

## Note on images

The portrait is an AI-edited monochrome design asset based on the supplied screenshot; check that it represents your appearance accurately before publishing. The monogram is traced from the supplied image and should only be used if you have permission from its rightsholder. The supplied NSOL BPO logo is presented with transparent background and monochrome CSS styling.
