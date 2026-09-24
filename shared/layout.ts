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
    
    <!-- Alpine AJAX & Alpine.js -->
    <script src="/assets/js/alpine-ajax.patched.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@alpinejs/persist@3.x.x/dist/cdn.min.js"></script>
    <script src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
    
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

          load() {
            const script = document.getElementById('nav-state');
            if (script) {
              try {
                const state = JSON.parse(script.textContent || '{}');
                if (state.currentPath) this.currentPath = state.currentPath;
                if (state.breadcrumbs) this.breadcrumbs = state.breadcrumbs;
                if (state.subAside) this.subAside = state.subAside;
                if (state.contextActions) this.contextActions = state.contextActions;
              } catch (e) {
                console.error('Failed to parse nav-state', e);
              }
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

        // Load navigation state on initial load and after AJAX requests
        document.addEventListener('DOMContentLoaded', () => {
          Alpine.store('navigation').load();
        });
        window.addEventListener('ajax:after', () => {
          Alpine.store('navigation').load();
        });
      });
    </script>
    <script src="/assets/js/ThemeMenu.assets.js"></script>
  </head>
  <body 
    x-data="{ accountOpen: false, drawerOpen: false }"
    x-init="$store.os.init(); $store.navigation.loadMenu(); $store.auth.init()"
    x-bind:class="($store.os.darkMode ? 'ui-dark' : 'ui-light') + ' ui-palette'"
    x-bind:style="$store.os.getStyles()"
  >
    <header>
      <button class="app-drawer-toggle" x-on:click="drawerOpen = !drawerOpen" aria-label="Open menu">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
      </button>
      <h1>Enterprise Portal</h1>
      <div class="auth-status" style="margin-left: auto; position: relative;" x-on:click.outside="accountOpen = false">
        <button class="account-btn" x-on:click="accountOpen = !accountOpen" aria-label="Account menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </button>
        <div class="account-menu" x-bind:class="{ 'open': accountOpen }" x-show="accountOpen">
          <div class="account-section">
            <span x-show="$store.auth?.user" style="color: var(--text-muted);">
              Signed in as: <strong x-text="$store.auth?.user?.username || $store.auth?.user?.email"></strong>
              (<span x-text="$store.auth?.user?.roleId"></span>)
            </span>
            <a href="/login" class="ui-btn ui-btn-sm account-link" x-show="!$store.auth?.user">Sign In</a>
            <a href="/Auth" class="ui-btn ui-btn-sm account-link" x-show="$store.auth?.user?.roleId === 'admin'">Admin</a>
            <a href="/logout" class="ui-btn ui-btn-sm ui-btn-secondary account-link" x-show="$store.auth?.user">Sign Out</a>
          </div>
          ${ThemeMenu()}
        </div>
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

    <!-- Portrait: apps drawer + backdrop -->
    <div class="app-drawer-backdrop" x-show="drawerOpen" x-on:click="drawerOpen = false" x-transition.opacity></div>
    <nav class="app-drawer" x-bind:class="{ 'open': drawerOpen }" x-data>
      <template x-for="app in $store.navigation.mainApps" x-key="app.id">
        <button 
          @click="$ajax(app.path, { target: 'main-content', method: 'GET' }); drawerOpen = false"
          x-bind:class="{ 'active': $store.navigation.currentPath.startsWith(app.path) }"
          x-text="app.label"
        ></button>
      </template>
    </nav>

    <!-- Portrait: submenu footer -->
    <footer class="mobile-footer">
      ${SubAside()}
    </footer>

    <!-- Live Architecture Visualizer via Mermaid.js -->
    <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
    <script>
      mermaid.initialize({ startOnLoad: false, theme: 'neutral' });
      
      function renderMermaidInElement(element) {
        // The swapped element may itself be a mermaid block, or contain them
        const blocks = element.matches('.mermaid')
          ? [element]
          : Array.from(element.querySelectorAll('.mermaid'));
        if (blocks.length > 0) {
          mermaid.run({ nodes: blocks }).catch(e => console.log('Mermaid render error:', e));
        }
      }
      
      // Render the elements alpine-ajax actually swapped into the document
      window.addEventListener('ajax:after', function(evt) {
        const rendered = evt.detail?.render;
        if (Array.isArray(rendered) && rendered.length > 0) {
          rendered.forEach(el => {
            if (el && el.isConnected) renderMermaidInElement(el);
          });
        }
      });
    </script>
  </body>
  </html>
  `;
}
