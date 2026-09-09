import { Hono } from 'hono';
import { html, raw } from 'hono/html';
import { renderSmart } from '../../shared/hax.ts';
import portalRoutes from './routes.ts';
import { discoverApps } from './appDiscovery.ts';
import type { Context } from 'hono';

const app = new Hono();

// Discover and mount apps dynamically
const discoveredApps = await discoverApps();

// Store main apps for navigation
const mainApps = discoveredApps.map(appInfo => ({
  id: appInfo.name,
  label: appInfo.fullname,
  path: appInfo.mountPath
}));

// Make mainApps available globally for the layout
(globalThis as any).mainApps = mainApps;

for (const appInfo of discoveredApps) {
  try {
    // Dynamic import of the app module
    const appModule = await import(appInfo.modulePath) as { default: Hono };
    app.route(appInfo.mountPath, appModule.default);
    console.log(`Mounted app: ${appInfo.name} at ${appInfo.mountPath}`);
  } catch (err) {
    console.error(`Failed to load app ${appInfo.name}:`, err);
  }
}

// Mount portal routes
app.route('/', portalRoutes);

// 404 Handler - Unmatched routes
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
    <h2>404 - Page Not Found</h2>
    <p>The page "${c.req.path}" does not exist.</p>
  `;
  return renderSmart(c, content);
});

// Global Error Handler - All other errors
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
