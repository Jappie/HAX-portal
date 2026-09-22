// Shared HAX utilities

import { renderLayout } from './layout.ts';
import { raw } from 'hono/html';
import type { Context } from 'hono';

export interface NavState {
  currentPath: string;
  breadcrumbs: Array<{ label: string; path: string }>;
  subAside: { title: string; items: Array<{ label: string; path: string; active?: boolean }> };
  contextActions: Array<Record<string, unknown>>;
}

// Navigation state as JSON script tag. A <script> element is raw-text, so
// entities are not decoded there: hono/html escaping would break JSON.parse.
// Escape `<` as \u003c to prevent `</script>` injection.
export function navStateScript(meta: NavState) {
  const stateJson = JSON.stringify(meta).replace(/</g, '\\u003c');
  return raw(
    `<script type="application/json" id="nav-state">${stateJson}</script>`
  );
}

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
