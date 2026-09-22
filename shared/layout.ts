import { html } from 'hono/html'
import { Breadcrumbs } from './components/Breadcrumbs.ts'
import { MainAside } from './components/MainAside.ts'
import { SubAside } from './components/SubAside.ts'
import { ThemeMenu } from './components/ThemeMenu.ts'

export function renderLayout({ title = 'Enterprise Portal', content = '' }) {
  // UNIQUE_TEST_STRING_12345
  return html`
  <!DOCTYPE html>
  <html lang="nl">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    
    <!-- Eruda for mobile debugging -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/eruda/3.4.3/eruda.min.js"></script>
    <script>eruda.init();</script>
    
    <!-- OPUI CSS Foundation -->
    <link rel="stylesheet" href="/assets/css/opui.css"/>
    <link rel="stylesheet" href="/assets/css/open-props.min.css"/>
    <link rel="stylesheet" href="/assets/css/os-fonts.css"/>
    <link rel="stylesheet" href="/assets/css/opui-overrides.css"/>
    <link rel="stylesheet" href="/assets/css/ThemeMenu.css"/>
    <link rel="stylesheet" href="/assets/css/layout.css"/>
    <link rel="stylesheet" href="/assets/css/style.css"/>
    
    <!-- HTMX v4 & Alpine.js -->
      <script src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js"></script>
      <script defer src="https://cdn.jsdelivr.net/npm/htmx.org@4.x.x/dist/htmx.min.js"></script>
      <script defer src="https://cdn.jsdelivr.net/npm/htmx.org@4.x.x/dist/ext/hx-alpine-compat.js"></script>
    
    <!-- Navigation Store -->
    <script>
      document.addEventListener('alpine:init', () => {
        // Navigation Store
        Alpine.store('navigation', {
          currentPath: '',
          mainApps: window.mainApps || [],
          subAside: { title: '', items: [] },
          breadcrumbs: [],
          contextActions: [],

          async loadMenu() {
            try {
              const res = await fetch('/api/menu');
              if (res.ok) {
                this.mainApps = await res.json();
              }
            } catch (e) {
              console.error('Failed to load menu', e);
            }
          },

          setState(meta) {
            if (meta.currentPath) this.currentPath = meta.currentPath;
            if (meta.breadcrumbs) this.breadcrumbs = meta.breadcrumbs;
            if (meta.subAside) this.subAside = meta.subAside;
            if (meta.contextActions) this.contextActions = meta.contextActions;
            if (typeof htmx !== 'undefined') {
              setTimeout(() => {
                ['.breadcrumbs', '.sub-aside', '.main-aside', '.actions'].forEach(selector => {
                  const el = document.querySelector(selector);
                  if (el) htmx.process(el);
                });
              }, 0);
            }
          }
        });

        // Auth Store
        Alpine.store('auth', {
          user: null,
          session: null,

          async init() {
            try {
              const res = await fetch('/api/auth/status');
              if (res.ok) {
                const data = await res.json();
                this.user = data.user || null;
                this.session = data.session || null;
              }
            } catch (e) {
              console.error('Failed to load auth status', e);
            }
          },

          setUser(user) {
            this.user = user;
          },

          clearUser() {
            this.user = null;
            this.session = null;
          }
        });
      });
    </script>
    <script src="/assets/js/ThemeMenu.assets.js"></script>
  </head>
  <body 
    x-data 
    x-init="$store.os.init(); $store.navigation.loadMenu(); $store.auth.init(); setTimeout(() => $store.navigation.setState($store.navigation), 100);"
    x-bind:class="($store.os.darkMode ? 'ui-dark' : 'ui-light') + ' ui-palette'"
    x-bind:style="$store.os.getStyles()"
    hx-ext="alpine-compat"
  >
    <header>
      <h1>Enterprise Portal</h1>
      <div class="auth-status" style="margin-left: auto; display: flex; gap: var(--size-4); align-items: center;" x-show="$store.navigation.currentPath !== '/login'">
        <span x-show="$store.auth?.user" style="color: var(--text-muted);">
          Signed in as: <strong x-text="$store.auth?.user?.username || $store.auth?.user?.email"></strong>
          (<span x-text="$store.auth?.user?.roleId"></span>)
        </span>
        <a href="/login" class="ui-btn ui-btn-sm" x-show="!$store.auth?.user" style="margin-left: var(--size-2);">Sign In</a>
        <a href="/logout" class="ui-btn ui-btn-sm ui-btn-secondary" x-show="$store.auth?.user">Sign Out</a>
        <a href="/Auth" class="ui-btn ui-btn-sm" x-show="$store.auth?.user?.roleId === 'admin'">Admin</a>
      </div>
    </header>

    ${Breadcrumbs()}

    <div class="layout-container">
      ${MainAside()}
      ${SubAside()}
      <main>
        <article id="main-content">
          ${content}
        </article>
      </main>
    </div>

    ${ThemeMenu()}
    
    <button class="theme-toggle-btn" x-on:click="$store.os.menuOpen = !$store.os.menuOpen" aria-label="Theme Settings"><span>⚙️</span></button>

    <nav class="mobile-nav" x-data>
      <div class="nav-buttons">
        <template x-for="app in $store.navigation.mainApps" x-key="app.id">
          <button x-bind:hx-get="app.path" hx-target="#main-content" hx-swap="innerHTML" x-bind:hx-push-url="app.path" x-bind:class="{ 'active': $store.navigation.currentPath.startsWith(app.path) }" x-text="app.label"></button>
        </template>
      </div>
    </nav>

    <!-- Live Architecture Visualizer via Mermaid.js -->
    <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
    <script>
      mermaid.initialize({ startOnLoad: false, theme: 'neutral' });
      
      document.body.addEventListener('htmx:afterSwap', function(evt) {
        if (evt.detail.target.id === 'mermaid-target') {
          // If the swap was specifically for the Mermaid target, render it
          mermaid.run({ nodes: [evt.detail.target] });
        } else {
          // For full page loads or other swaps that might include mermaid blocks
          const blocks = evt.detail.target.querySelectorAll('.mermaid');
          if (blocks.length > 0) {
            mermaid.run({ nodes: blocks });
          }
        }
      });
      
      // Initial run
      setTimeout(() => {
        const blocks = document.querySelectorAll('.mermaid');
        if (blocks.length > 0 && blocks[0].textContent.trim().length > 0) {
          mermaid.run({ nodes: blocks }).catch(e => console.log('Mermaid init skip:', e));
        }
      }, 500);
    </script>
  </body>
  </html>
  `;
}
