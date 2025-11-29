# Recolor Rollout Plan (Black/White/Gray + Bright Green)

- **Catalog touchpoints**: Inventory all color definitions and inline styles across popup, dashboard (main/domain), blocked page, content toasts, and shared assets; note any status/legend mappings.
- **Define palette tokens**: Create a minimal token set for black/white/gray surfaces, borders, and text plus a single bright-green accent; document shadow and border rules to achieve depth without extra hues.
- **Apply tokens to themes**: Replace existing palettes in CSS `:root` blocks and component styles; remove gradients/multicolor accents; ensure accessibility/contrast using the new monochrome + green scheme.
- **Standardize components**: Restyle buttons, tables, badges, toasts, cards, and legends with consistent fill/border/shadow states (default/hover/active/focus) using only the allowed colors.
- **Update visuals & copy refs**: Adjust legends/status badges/icons to the new colors; strip remaining blue/purple/orange references from CSS/HTML/JS; align any screenshots or asset references if present.
- **Verify & document**: Run lint/tests, do a quick visual sweep of popup, dashboard, domain view, blocked page, and toast; note the new palette rules and component recipe in project docs (e.g., tasks.md updates).
