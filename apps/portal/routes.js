import { Hono } from 'hono'
import { portalViews } from './views.js'

const routes = new Hono()

// Portal Home Route
routes.get('/portal', (c) => {
  const meta = {
    currentPath: '/portal',
    breadcrumbs: [{ label: 'Portal', path: '/portal' }],
    subAside: { title: '', items: [] },
    contextActions: []
  }

  const content = portalViews.home({ meta })
  return renderSmart(c, content)
})

// Fallback Redirect naar Portal
routes.get('/', (c) => c.redirect('/portal'))

export default routes
