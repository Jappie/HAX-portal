// Shared HAX utilities

import { renderLayout } from './layout.ts';
import { raw } from 'hono/html';
import type { Context } from 'hono';

export interface NavState {
  currentPath: string;
  breadcrumbs: Array<{ label: string; path: string }>;
  subAside: { title: string; items: Array<{ label: string; path: string; active?: boolean }> };
  contextActions: object[];
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
    // alpine-ajax announces every requested target in the X-Alpine-Target
    // header as a space-separated list; tokens may be "local:response"
    // alias pairs and the response must contain an element for each
    // response-side id, or the library removes that target element from the
    // document (ajax:missing). _top, _none and _self resolve to the document
    // itself and need no wrapper.
    const ids = (c.req.header('X-Alpine-Target') || 'main-content')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((token) => token.split(':')[1] || token)
      .filter((id) => !id.startsWith('_'));
    const targetIds = [...new Set(ids.length ? ids : ['main-content'])];
    const content = (viewHtml as string).toString();
    return c.html(raw(targetIds.map((id) => `<div id="${id}">${content}</div>`).join('')));
  }
  
  // For full page, wrap in layout
  return c.html(renderLayout({ content: viewHtml as string }));
};

// Make available globally
globalThis.renderSmart = renderSmart;
