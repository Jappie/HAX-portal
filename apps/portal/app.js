import { Hono } from 'hono'
import { html } from 'hono/html'
import '../../shared/hax.js' // Import shared utilities (renderSmart)
import portalRoutes from './routes.js'
import customersApp from '../customers/app.js'

const app = new Hono()

// Mount portal routes
app.route('/', portalRoutes)

// Mount Sub-Apps
app.route('/Customers', customersApp)

// 404 Handler - Unmatched routes
app.notFound((c) => {
  const meta = {
    currentPath: c.req.path,
    breadcrumbs: [],
    subAside: { title: '', items: [] },
    contextActions: []
  }
  const content = html`
    <div x-init='
      $store.navigation.setState(${JSON.stringify(meta)})
    ' style="display:none;"></div>
    <h2>404 - Page Not Found</h2>
    <p>The page "${c.req.path}" does not exist.</p>
  `
  return renderSmart(c, content)
})

// Global Error Handler - All other errors
app.onError((err, c) => {
  const meta = {
    currentPath: c.req.path,
    breadcrumbs: [],
    subAside: { title: '', items: [] },
    contextActions: []
  }
  const content = html`
    <div x-init='
      $store.navigation.setState(${JSON.stringify(meta)})
    ' style="display:none;"></div>
    <h2>Error</h2>
    <p>${err.message}</p>
  `
  return renderSmart(c, content)
})

export default app
