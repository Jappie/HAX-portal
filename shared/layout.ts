import { html } from 'hono/html'
import { Breadcrumbs } from './components/Breadcrumbs.ts'
import { MainAside } from './components/MainAside.ts'
import { SubAside } from './components/SubAside.ts'

export function renderLayout({ title = 'Enterprise Portal', content = '' }) {
  return html`
  <!DOCTYPE html>
  <html lang="nl">
  <head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <!-- HTMX v4 & Alpine.js -->
    <script src="https://cdn.jsdelivr.net/npm/htmx.org@4.0.0-beta6/dist/htmx.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/htmx.org@4.0.0-beta6/dist/ext/hx-alpine-compat.js"></script>
    <script src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
    
    <!-- EÉN Centrale Navigation Store in Alpine -->
    <script>
      document.addEventListener('alpine:init', () => {
        Alpine.store('navigation', {
          currentPath: '',
          mainApps: [
            { id: 'customers', label: 'Customers', path: '/Customers' },
            { id: 'suppliers', label: 'Suppliers', path: '/Suppliers' },
            { id: 'hr', label: 'HR', path: '/HR' }
          ],
          subAside: { title: '', items: [] },
          breadcrumbs: [],
          contextActions: [],

          // Helper om de volledige state in 1x bij te werken vanuit een route-partial
          setState(meta) {
            if (meta.currentPath) this.currentPath = meta.currentPath;
            if (meta.breadcrumbs) this.breadcrumbs = meta.breadcrumbs;
            if (meta.subAside) this.subAside = meta.subAside;
            if (meta.contextActions) this.contextActions = meta.contextActions;
            // Process HTMX elements added by Alpine re-rendering
            if (typeof htmx !== 'undefined') {
              htmx.process(document.querySelector('.breadcrumbs'));
              htmx.process(document.querySelector('.sub-aside'));
              htmx.process(document.querySelector('.main-aside'));
              htmx.process(document.querySelector('.actions'));
            }
          }
        });
      });
    </script>
    <style>
      body { font-family: system-ui, sans-serif; margin: 0; background: #f4f5f7; color: #333; }
      header { background: #1e293b; color: #fff; padding: 1rem 1.5rem; display: flex; justify-content: space-between; align-items: center; }
      
      /* Breadcrumbs Styling */
      .breadcrumbs { padding: 0.75rem 1.5rem; background: #e2e8f0; font-size: 0.875rem; border-bottom: 1px solid #cbd5e1; }
      .breadcrumbs button { background: none; border: none; color: #2563eb; cursor: pointer; padding: 0; font: inherit; }
      .breadcrumbs button:hover { text-decoration: underline; }
      .breadcrumbs span.separator { margin: 0 0.5rem; color: #64748b; }

      /* Layout Grid */
      .layout-container { display: flex; min-height: calc(100vh - 120px); }
      
      /* Main Apps Aside */
      .main-aside { width: 180px; background: #0f172a; color: white; padding: 1rem 0; }
      .main-aside button { display: block; width: 100%; padding: 0.75rem 1.25rem; text-align: left; background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 0.95rem; }
      .main-aside button.active, .main-aside button:hover { background: #1e293b; color: #fff; border-left: 4px solid #38bdf8; }

      /* Sub Aside (Gelaagde App-specifieke Context) */
      .sub-aside { width: 220px; background: #ffffff; border-right: 1px solid #e2e8f0; padding: 1.25rem 1rem; }
      .sub-aside h3 { font-size: 0.875rem; text-transform: uppercase; color: #64748b; margin-top: 0; margin-bottom: 1rem; letter-spacing: 0.05em; }
      .sub-aside ul { list-style: none; padding: 0; margin: 0; }
      .sub-aside button { display: block; width: 100%; padding: 0.5rem 0.75rem; text-align: left; background: none; border: none; color: #334155; cursor: pointer; border-radius: 4px; margin-bottom: 0.25rem; }
      .sub-aside button.active { background: #eff6ff; color: #2563eb; font-weight: 600; }
      .sub-aside button:hover:not(.active) { background: #f8fafc; }

      /* Main Article Content */
      main { flex: 1; padding: 2rem; background: #fff; }
      .content-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; pb: 1rem; margin-bottom: 1.5rem; }
      
      /* Context Actions / CRUD Buttons */
      .actions { display: flex; gap: 0.5rem; }
      .btn { padding: 0.5rem 1rem; border-radius: 6px; font-size: 0.875rem; cursor: pointer; border: 1px solid transparent; font-weight: 500; }
      .btn-primary { background: #2563eb; color: white; }
      .btn-secondary { background: #f1f5f9; color: #475569; border-color: #cbd5e1; }
      .btn-danger { background: #ef4444; color: white; }
    </style>
  </head>
  <body hx-ext="alpine-compat">
    <header>
      <h1>Enterprise Portal</h1>
    </header>

    <!-- DYNAMISCHE BREADCRUMBS (Alpine Driven) -->
    ${Breadcrumbs()}

    <div class="layout-container">
      <!-- 1. MAIN ASIDE: APPS -->
      ${MainAside()}

      <!-- 2. SUB ASIDE: GELAAGDE APP STRUCTUUR -->
      ${SubAside()}

      <!-- 3. MAIN CONTENT & CONTEXTUAL CRUD ACTIONS -->
      <main>
        <article id="main-content">
          ${content}
        </article>
      </main>
    </div>
  </body>
  </html>
  `
}
