import { Hono } from 'hono';
import { renderSmart } from '../../shared/hax.ts';
import { html } from 'hono/html';
import { portalViews } from './views.ts';
import { db } from '../../db/database.ts';
import { appPermissions } from '../../db/schema.ts';
import { handleLogin, handleLogout } from '../../shared/auth.ts';
import type { Context } from 'hono';

const routes = new Hono();

// Authentication routes
routes.get('/login', handleLogin);
routes.post('/login', handleLogin);
routes.get('/logout', handleLogout);
routes.post('/logout', handleLogout);

// Portal Home Route
routes.get('/portal', (c: Context) => {
  const meta = {
    currentPath: '/portal',
    breadcrumbs: [{ label: 'Portal', path: '/portal' }],
    subAside: { title: '', items: [] },
    contextActions: []
  };

  const content = portalViews.home({ meta });
  return renderSmart(c, content);
});

// Architecture Mermaid Diagram (Client-side render)
routes.get('/portal/architecture', (c: Context) => {
  const meta = {
    currentPath: '/portal/architecture',
    breadcrumbs: [
      { label: 'Portal', path: '/portal' },
      { label: 'Architecture', path: '/portal/architecture' }
    ],
    subAside: { title: '', items: [] },
    contextActions: []
  };

  const content = portalViews.architecture({ meta });
  return renderSmart(c, content);
});

// Mermaid ER diagram endpoint
routes.get('/portal/architecture.mermaid', async (c: Context) => {
  const records = await db.select().from(appPermissions).all();
  
  let mermaidText = 'erDiagram\n';
  mermaidText += '    Customers {\n';
  
  // Aggregate permissions per attribute
  const attrMap: Record<string, string[]> = {};
  records.filter(r => r.resource === 'customers').forEach(r => {
    if (!attrMap[r.attribute]) attrMap[r.attribute] = [];
    attrMap[r.attribute].push(`${r.role}:${r.actions}`);
  });

  for (const [attr, roles] of Object.entries(attrMap)) {
    mermaidText += `        string ${attr} "${roles.join(' | ')}"\n`;
  }
  
  mermaidText += '    }\n';

  // The diagram root itself carries the id alpine-ajax swaps in, so no
  // wrapper is needed: the element requested via X-Alpine-Target is present.
  const diagram = html`<div id="mermaid-target" class="mermaid" style="display: flex; justify-content: center; overflow-x: auto;">${mermaidText}</div>`;
  return c.html(diagram);
});

// Auth status endpoint
routes.get('/api/auth/status', async (c: Context) => {
  try {
    const user = c.get('user');
    return c.json({
      user,
      session: user ? { authenticated: true } : null
    });
  } catch {
    return c.json({ user: null, session: null });
  }
});

// Menu endpoint
routes.get('/api/menu', (c: Context) => {
  // We'd map this dynamically from the global apps array
  // The global app list is stored in globalThis.mainApps
  const mainApps = (globalThis as { mainApps?: Record<string, unknown>[] }).mainApps || [];
  
  // Also we want to inject static things like Architecture
  const finalMenu = [
    ...mainApps,
    { id: 'architecture', label: 'App Architecture', path: '/portal/architecture', isFavorite: true }
  ];

  return c.json(finalMenu);
});

// Fallback Redirect naar Portal
routes.get('/', (c: Context) => c.redirect('/portal'));

export default routes;
