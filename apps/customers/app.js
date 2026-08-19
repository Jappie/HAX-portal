import { Hono } from 'hono'
import { html } from 'hono/html'
import customerRoutes from './routes.js'

const app = new Hono()

// Mount customer routes
app.route('/', customerRoutes)

// 404 Handler - Unmatched customer routes
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
    <h2>404 - Customer Page Not Found</h2>
    <p>The customer page "${c.req.path}" does not exist.</p>
  `
  return renderSmart(c, content)
})

// Global Error Handler - All other errors in customers app
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
