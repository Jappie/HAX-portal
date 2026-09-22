import { html, raw } from 'hono/html';

interface BreadcrumbItem {
  label: string;
  path: string;
}

interface SubAsideItem {
  label: string;
  path: string;
  active?: boolean;
}

interface SubAside {
  title: string;
  items: SubAsideItem[];
}

interface ContextAction {
  label: string;
  path?: string;
  class: string;
  action?: string;
}

interface NavigationMeta {
  currentPath: string;
  breadcrumbs: BreadcrumbItem[];
  subAside: SubAside;
  contextActions: ContextAction[];
}

interface ViewProps {
  meta: NavigationMeta;
}

// Helper to generate navigation state script
function getNavStateScript(meta: NavigationMeta) {
  // Use JSON.stringify to create a valid JSON string
  const stateJson = JSON.stringify({
    currentPath: meta.currentPath,
    breadcrumbs: meta.breadcrumbs,
    subAside: meta.subAside,
    contextActions: meta.contextActions
  });
  
  // Use raw() to prevent HTML escaping of the data attribute
  return raw(`<div 
    x-init="$store.navigation.setState(JSON.parse($el.dataset.state))"
    data-state='${stateJson}'
    style="display: none;"
  ></div>`, []);
}

export const portalViews = {
  home: ({ meta }: ViewProps) => {
    const navState = getNavStateScript(meta);
    return html`${navState}
      <div class="ui-card ui-outlined ui-elevated ui-tonal" style="max-width: 600px; margin: 0 auto;">
        <div class="ui-content" style="text-align: center; padding: var(--size-8);">
          <h2 style="margin-top: 0;">Welcome to the Multi-App Portal</h2>
          <p style="margin-top: var(--size-4); color: var(--text-muted);">
            Select a main application from the black bar on the left side (e.g., <strong>Customers</strong>).
          </p>
        </div>
      </div>`;
  },
  
  architecture: ({ meta }: ViewProps) => {
    const navState = getNavStateScript(meta);
    return html`${navState}
      <div class="content-header">
        <h2>App Architecture (Live ER Diagram)</h2>
      </div>
      <div class="ui-card ui-outlined ui-elevated ui-tonal" style="padding: var(--size-4);">
        <p>This diagram is generated dynamically from the active ABAC configuration in the database and rendered fully client-side via Mermaid.js.</p>
        
        <div id="diagram-container" 
             hx-get="/portal/architecture.mermaid" 
             hx-trigger="load" 
             hx-target="#mermaid-target"
             style="margin-top: var(--size-4); background: var(--surface-1); padding: var(--size-4); border-radius: var(--radius-2);">
          
          <div id="mermaid-target" class="mermaid" style="display: flex; justify-content: center; overflow-x: auto;">
            <!-- Mermaid String streams here -->
            Loading live architecture...
          </div>
        </div>
      </div>`;
  }
};
