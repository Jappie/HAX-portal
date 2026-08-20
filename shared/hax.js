// Shared HAX utilities

import { renderLayout } from './layout.js'

// Global Render Helper (Full Page vs HTMX Partial Switch)
const renderSmart = function(c, viewHtml) {
  const isHx = c.req.header('HX-Request-Type') == 'partial'
  if (isHx) {
    return c.html(viewHtml)
  }
  return c.html(renderLayout({ content: viewHtml }))
}

// Make available globally and as export
globalThis.renderSmart = renderSmart
export { renderSmart }
