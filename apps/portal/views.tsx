// @ts-nocheck
import type { Context } from 'hono';

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

// Helper component to set navigation state
function NavigationState({ meta }: { meta: NavigationMeta }) {
  return (
    <div 
      x-init={`$store.navigation.setState(${JSON.stringify(meta)})`} 
      style={{ display: 'none' }}
    />
  );
}

export const portalViews = {
  home: ({ meta }: ViewProps) => {
    return (
      <>
        <NavigationState meta={meta} />
        <h2>Welkom in de Multi-App Portal</h2>
        <p>Kies een hoofd-applicatie uit de zwarte balk aan de linkerzijde (bijv. <strong>Customers</strong>).</p>
      </>
    );
  }
};
