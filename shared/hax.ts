// Shared HAX utilities

import { renderLayout } from './layout.ts';
import type { Context } from 'hono';

// Global Render Helper (Full Page vs Alpine AJAX Partial Switch)
export const renderSmart = function(c: Context, viewHtml: unknown) {
  const isAjax = c.req.header('X-Alpine-Request') === 'true';
  
  if (isAjax) {
    return c.html(viewHtml as string);
  }
  
  // For full page, wrap in layout
  return c.html(renderLayout({ content: viewHtml as string }));
};

// Make available globally
globalThis.renderSmart = renderSmart;
