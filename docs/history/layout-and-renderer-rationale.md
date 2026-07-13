# Layout and renderer rationale

Read this file only when changing the responsive layout breakpoint, mobile
tabs, or 3D renderer resizing. Current contracts live in the root Markdown
files.

## Responsive breakpoint

Mobile (single-column tabbed) versus desktop (editor beside 3D) is decided by
`@media(max-width:1024px), (max-height:600px)` in CSS and the matching
`matchMedia('(max-width:1024px), (max-height:600px)')` in `_isMTab()` / `isMob()`.
The comma is an **OR**: use single-column layout when the viewport is too narrow
(≤1024px) or too short (≤600px).

The width threshold rose from 700 to 1024 so portrait tablets would not get a
cramped 3D pane. The height clause arrived in v0.810 because desktop editor
chrome (keypad, toolbar, context panel, and status bar, around 480px) could
collapse the program textarea almost to zero on short wide viewports. This
affects phones/foldables in landscape and short browser windows. Below 600px,
the tabbed layout scrolls the editor panel as one and stays usable. Tall tablet
landscape screens and laptops retain the side-by-side layout.

Any new CSS or JS layout check must use the full condition or `_isMTab()`.
A width-only variant creates a broken hybrid layout. Android forces
single-column layout, so this desktop-collapse case is web-only.

## 3D renderer resizing

The canvas is CSS-sized (`#view3d canvas{width:100%;height:100%}`), while
`onResize()` uses `renderer.setSize(w,h,false)`. The `false` leaves display size
to CSS, but the drawing buffer and `camera.aspect` must still match the current
container size; otherwise the browser stretches a stale buffer and distorts the
model.

A window `resize` listener alone misses splitter-drag frames and container-only
resizes such as mobile-tab or orientation changes. `loop()` calls
`resizeToDisplay()` in `core/view2d.js` every frame. It is a cheap no-op until
the container changes, and returns `true` on a resync frame so the idle-render
throttle still paints it. Do not replace this per-frame check with a
resize-only listener.
