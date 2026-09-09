import { Hono } from 'hono';
import { html, raw } from 'hono/html';
import { renderSmart } from '../../shared/hax.ts';
import customerRoutes from './routes.ts';
import type { Context } from 'hono';

const app = new Hono();

// Mount customer routes
app.route('/', customerRoutes);

// 404 Handler - Unmatched customer routes
app.notFound((c: Context) => {
  const meta = {
    currentPath: c.req.path,
    breadcrumbs: [],
    subAside: { title: '', items: [] },
    contextActions: []
  };
  const stateJson = JSON.stringify(meta);
  const navState = raw(`<div 
    x-init="$store.navigation.setState(JSON.parse($el.dataset.state))"
    data-state='${stateJson}'
    style="display: none;"></div>`, []);
  const content = html`${navState}
    <h2>404 - Customer Page Not Found</h2>
    <p>The customer page "${c.req.path}" does not exist.</p>
  `;
  return renderSmart(c, content);
});

// Global Error Handler - All other errors in customers app
app.onError((err: Error, c: Context) => {
  const meta = {
    currentPath: c.req.path,
    breadcrumbs: [],
    subAside: { title: '', items: [] },
    contextActions: []
  };
  const stateJson = JSON.stringify(meta);
  const navState = raw(`<div 
    x-init="$store.navigation.setState(JSON.parse($el.dataset.state))"
    data-state='${stateJson}'
    style="display: none;"></div>`, []);
  const content = html`${navState}
    <h2>Error</h2>
    <p>${err.message}</p>
  `;
  return renderSmart(c, content);
});

export default app;
