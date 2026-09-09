// @ts-nocheck
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
      <h2>Welkom in de Multi-App Portal</h2>
      <p>Kies een hoofd-applicatie uit de zwarte balk aan de linkerzijde (bijv. <strong>Customers</strong>).</p>`;
  }
};
