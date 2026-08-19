import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { html } from 'hono/html'
import { renderLayout } from '../../shared/layout.js'
import customersApp from '../customers/routes.js'

const app = new Hono()

// Global Render Helper (Full Page vs HTMX Partial Switch)
globalThis.renderSmart = function(c, viewHtml) {
  const isHx = c.req.header('HX-Request') === 'true'
  if (isHx) {
    return c.html(viewHtml)
  }
  return c.html(renderLayout({ content: viewHtml }))
}

// Portal Home Route
app.get('/portal', (c) => {
  const meta = {
    currentPath: '/portal',
    breadcrumbs: [{ label: 'Portal', path: '/portal' }],
    subAside: { title: '', items: [] },
    contextActions: []
  }

  const content = html`
    <div x-init='
      $store.navigation.setState(${JSON.stringify(meta)})
    ' style="display:none;"></div>

    <h2>Welkom in de Multi-App Portal</h2>
    <p>Kies een hoofd-applicatie uit de zwarte balk aan de linkerzijde (bijv. <strong>Customers</strong>).</p>
  `
  return renderSmart(c, content)
})

// Mount Sub-Apps
app.route('/Customers', customersApp)

// Fallback Redirect naar Portal
app.get('/', (c) => c.redirect('/portal'))

const port = 3000
console.log(`Server gestart op http://localhost:${port}`)
console.log(`Directe Bookmark Test URL: http://localhost:${port}/Customers/123-Aramco/Contact/356-Jenssen/edit`)

serve({ fetch: app.fetch, port })
