import { Hono } from 'hono';
import { html } from 'hono/html';
import { serveStatic } from '@hono/node-server/serve-static';
import { renderSmart, navStateScript } from '../../shared/hax.ts';
import customerRoutes from './routes.ts';
import { authorizeAbac } from '../../shared/abacEngine.ts';
import { sessionMiddleware, requireAuth, handleLogin, handleLogout } from '../../shared/auth.ts';
import type { Context } from 'hono';

const app = new Hono();

// Serve static assets from /assets directory
app.use('/assets/*', serveStatic({ root: './' }));

// Login/logout so the standalone server can authenticate
// (requireAuth redirects unauthenticated requests to /login)
app.get('/login', handleLogin);
app.post('/login', handleLogin);
app.get('/logout', handleLogout);
app.post('/logout', handleLogout);

// Apply session middleware
app.use('*', sessionMiddleware);

// Require authentication for all customer routes
app.use('/*', requireAuth);

// Apply ABAC middleware for the customers resource globally to all customer routes
app.use('/*', authorizeAbac('customers'));

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
  const navState = navStateScript(meta);
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
  const navState = navStateScript(meta);
  const content = html`${navState}
    <h2>Error</h2>
    <p>${err.message}</p>
  `;
  return renderSmart(c, content);
});

export default app;
