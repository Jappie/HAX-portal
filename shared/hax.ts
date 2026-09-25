// Shared HAX utilities

import { renderLayout } from './layout.ts';
import { html, raw } from 'hono/html';
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

// The response-side ids alpine-ajax expects in an AJAX response, parsed from
// the X-Alpine-Target header: a space-separated list whose tokens may be
// "local:response" alias pairs. _top, _none and _self resolve to the
// document itself and need no wrapper.
export function requestedTargetIds(c: Context): string[] {
  const ids = (c.req.header('X-Alpine-Target') || 'main-content')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => token.split(':')[1] || token)
    .filter((id) => !id.startsWith('_'));
  return [...new Set(ids.length ? ids : ['main-content'])];
}

// Wrap an AJAX partial in a wrapper element per requested target: when the
// response lacks an element with a requested id, alpine-ajax removes that
// target element from the document (ajax:missing). hono/html natively
// unpacks the array of wrapper parts and passes the view markup through
// unescaped.
export function wrapAjaxPartial(c: Context, viewHtml: unknown) {
  return html`${requestedTargetIds(c).map((id) => html`<div id="${id}">${viewHtml}</div>`)}`;
}

// Global Render Helper (Full Page vs Alpine AJAX Partial Switch)
export const renderSmart = function(c: Context, viewHtml: unknown) {
  const isAjax = c.req.header('X-Alpine-Request') === 'true';
  
  if (isAjax) {
    return c.html(wrapAjaxPartial(c, viewHtml));
  }
  
  // For full page, wrap in layout
  return c.html(renderLayout({ content: viewHtml as string }));
};

// Make available globally
globalThis.renderSmart = renderSmart;
