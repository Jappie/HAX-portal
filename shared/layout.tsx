// @ts-nocheck
import type { Context } from 'hono';

interface LayoutProps {
  title?: string;
  children?: any;
}

// Main Layout Component
export function Layout({ title = 'Enterprise Portal', children }: LayoutProps) {
  return (
    <html lang="nl">
      <head>
        <meta charSet="UTF-8" />
        <title>{title}</title>
        {/* HTMX v4 & Alpine.js */}
        <script src="https://cdn.jsdelivr.net/npm/htmx.org@4.x.x/dist/htmx.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/htmx.org@4.x.x/dist/ext/hx-alpine-compat.js"></script>
        <script src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
        
        {/* EÉN Centrale Navigation Store in Alpine */}
        <script dangerouslySetInnerHTML={{
          __html: `
            document.addEventListener('alpine:init', () => {
              Alpine.store('navigation', {
                currentPath: '',
                mainApps: (typeof mainApps !== 'undefined' ? mainApps : []),
                subAside: { title: '', items: [] },
                breadcrumbs: [],
                contextActions: [],

                setState(meta) {
                  if (meta.currentPath) this.currentPath = meta.currentPath;
                  if (meta.breadcrumbs) this.breadcrumbs = meta.breadcrumbs;
                  if (meta.subAside) this.subAside = meta.subAside;
                  if (meta.contextActions) this.contextActions = meta.contextActions;
                  
                  setTimeout(() => {
                    htmx.process(document.querySelector('.breadcrumbs'));
                    htmx.process(document.querySelector('.sub-aside'));
                    htmx.process(document.querySelector('.main-aside'));
                  }, 0);
                }
              });
            });
          `
        }} />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/opui-css/dist/opui.css" />
        <style>{`
          body { font-family: system-ui, sans-serif; margin: 0; background: #f4f5f7; color: #333; }
          header { background: #1e293b; color: #fff; padding: 1rem 1.5rem; display: flex; justify-content: space-between; align-items: center; }
          
          .breadcrumbs { padding: 0.75rem 1.5rem; background: #e2e8f0; font-size: 0.875rem; border-bottom: 1px solid #cbd5e1; }
          .breadcrumbs button { background: none; border: none; color: #2563eb; cursor: pointer; padding: 0; font: inherit; }
          .breadcrumbs button:hover { text-decoration: underline; }
          .breadcrumbs span.separator { margin: 0 0.5rem; color: #64748b; }

          .layout-container { display: flex; min-height: calc(100vh - 120px); }
          
          .main-aside { width: 180px; background: #0f172a; color: white; padding: 1rem 0; }
          .main-aside button { display: block; width: 100%; padding: 0.75rem 1.25rem; text-align: left; background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 0.95rem; }
          .main-aside button.active, .main-aside button:hover { background: #1e293b; color: #fff; border-left: 4px solid #38bdf8; }

          .sub-aside { width: 220px; background: #ffffff; border-right: 1px solid #e2e8f0; padding: 1.25rem 1rem; }
          .sub-aside h3 { font-size: 0.875rem; text-transform: uppercase; color: #64748b; margin-top: 0; margin-bottom: 1rem; letter-spacing: 0.05em; }
          .sub-aside ul { list-style: none; padding: 0; margin: 0; }
          .sub-aside button { display: block; width: 100%; padding: 0.5rem 0.75rem; text-align: left; background: none; border: none; color: #334155; cursor: pointer; border-radius: 4px; margin-bottom: 0.25rem; }
          .sub-aside button.active { background: #eff6ff; color: #2563eb; font-weight: 600; }
          .sub-aside button:hover:not(.active) { background: #f8fafc; }

          main { flex: 1; padding: 2rem; background: #fff; }
          .content-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; pb: 1rem; margin-bottom: 1.5rem; }
          
          .actions { display: flex; gap: 0.5rem; }
          .btn { padding: 0.5rem 1rem; border-radius: 6px; font-size: 0.875rem; cursor: pointer; border: 1px solid transparent; font-weight: 500; }
          .btn-primary { background: #2563eb; color: white; }
          .btn-secondary { background: #f1f5f9; color: #475569; border-color: #cbd5e1; }
          .btn-danger { background: #ef4444; color: white; }
        `}</style>
      </head>
      <body hx-ext="alpine-compat">
        <header>
          <h1>Enterprise Portal</h1>
        </header>

        {/* DYNAMISCHE BREADCRUMBS (Alpine Driven) */}
        <nav className="breadcrumbs" x-data>
          <template x-for="(item, index) in $store.navigation.breadcrumbs" x-key="item.path">
            <span>
              <template x-if="index > 0"><span className="separator">/</span></template>
              <button 
                hx-get={item.path} 
                hx-target="#main-content" 
                hx-swap="innerHTML" 
                hx-push-url={item.path.includes('/edit') ? 'false' : item.path}
                x-text="item.label"
              />
            </span>
          </template>
        </nav>

        <div className="layout-container">
          {/* 1. MAIN ASIDE: APPS */}
          <aside className="main-aside" x-data>
            <template x-for="app in $store.navigation.mainApps" x-key="app.id">
              <button 
                hx-get={app.path} 
                hx-target="#main-content" 
                hx-swap="innerHTML" 
                hx-push-url={app.path.includes('/edit') ? 'false' : app.path}
                x-bindx-bind:class="{ 'active': $store.navigation.currentPath.startsWith(app.path) }"
                x-text="app.label"
              />
            </template>
          </aside>

          {/* 2. SUB ASIDE: GELAAGDE APP STRUCTUUR */}
          <aside className="sub-aside" x-data x-show="$store.navigation.subAside.items.length > 0">
            <h3 x-text="$store.navigation.subAside.title">Submenu</h3>
            <ul>
              <template x-for="item in $store.navigation.subAside.items" x-key="item.path">
                <li>
                  <button 
                    hx-get={item.path} 
                    hx-target="#main-content" 
                    hx-swap="innerHTML" 
                    hx-push-url={item.path.includes('/edit') ? 'false' : item.path}
                    x-bindx-bind:class="{ 'active': item.active }"
                    x-text="item.label"
                  />
                </li>
              </template>
            </ul>
          </aside>

          {/* 3. MAIN CONTENT & CONTEXTUAL CRUD ACTIONS */}
          <main>
            <article id="main-content">
              {children}
            </article>
          </main>
        </div>
      </body>
    </html>
  );
}

// Helper for renderSmart
export function renderLayout({ title = 'Enterprise Portal', content = '' }: { title?: string; content: any }) {
  return <Layout title={title}>{content}</Layout>;
}
