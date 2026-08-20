import { Hono } from 'hono'
import { html } from 'hono/html'
import '../../shared/hax.js' // Import shared utilities (renderSmart)
import portalRoutes from './routes.js'
import { discoverApps } from './appDiscovery.js'

const app = new Hono()

// Discover and mount apps dynamically
const appsDir = new URL('../', import.meta.url).pathname
const discoveredApps = await discoverApps(appsDir)

for (const appInfo of discoveredApps) {
  try {
    const appModule = await import(appInfo.modulePath)
    app.route(appInfo.mountPath, appModule.default)
    console.log(`Mounted app: ${appInfo.name} at ${appInfo.mountPath}`)
  } catch (err) {
    console.error(`Failed to load app ${appInfo.name}:`, err)
  }
}

// Mount portal routes
app.route('/', portalRoutes)

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
