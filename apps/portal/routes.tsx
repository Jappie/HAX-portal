import { Hono } from 'hono';
import { renderSmart } from '../../shared/hax.tsx';
import { portalViews } from './views.tsx';
import type { Context } from 'hono';

const routes = new Hono();

// Portal Home Route
routes.get('/portal', (c: Context) => {
  const meta = {
    currentPath: '/portal',
    breadcrumbs: [{ label: 'Portal', path: '/portal' }],
    subAside: { title: '', items: [] },
    contextActions: []
  };

  const content = <portalViews.home meta={meta} />;
  return renderSmart(c, content);
});

// Fallback Redirect naar Portal
routes.get('/', (c: Context) => c.redirect('/portal'));

export default routes;
