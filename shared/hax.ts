// Shared HAX utilities

import { renderLayout } from './layout.ts';
import type { Context } from 'hono';

// Global Render Helper (Full Page vs HTMX Partial Switch)
export const renderSmart = function(c: Context, viewHtml: unknown) {
  const isHx = c.req.header('HX-Request-Type') == 'partial';
  
  if (isHx) {
    return c.html(viewHtml);
  }
  
  // For full page, wrap in layout
  return c.html(renderLayout({ content: viewHtml }));
};

// Make available globally
globalThis.renderSmart = renderSmart;
