// Auth App - User, Role, and ABAC Management
// This app provides authentication routes and admin screens

import { Hono } from 'hono';
import { html } from 'hono/html';
import { renderSmart } from '../../shared/hax.ts';
import { sessionMiddleware } from '../../shared/auth.ts';
import authRoutes from './routes.ts';
import type { Context } from 'hono';

const app = new Hono();

// Apply session middleware to all auth routes
app.use('*', sessionMiddleware);

// Mount auth routes (login, logout, etc.)
app.route('/', authRoutes);

// 404 Handler
app.notFound((c: Context) => {
  const meta = {
    currentPath: c.req.path,
    breadcrumbs: [],
    subAside: { title: '', items: [] },
    contextActions: []
  };
  const stateJson = JSON.stringify(meta);
  const navState = html`<script type="application/json" id="nav-state">${stateJson}</script>`;
  const content = html`${navState}
    <h2>404 - Auth Page Not Found</h2>
    <p>The auth page "${c.req.path}" does not exist.</p>
  `;
  return renderSmart(c, content);
});

// Global Error Handler
app.onError((err: Error, c: Context) => {
  const meta = {
    currentPath: c.req.path,
    breadcrumbs: [],
    subAside: { title: '', items: [] },
    contextActions: []
  };
  const stateJson = JSON.stringify(meta);
  const navState = html`<script type="application/json" id="nav-state">${stateJson}</script>`;
  const content = html`${navState}
    <h2>Error</h2>
    <p>${err.message}</p>
  `;
  return renderSmart(c, content);
});

export default app;
