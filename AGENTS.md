# Agent Instructions

## Codebase
- **Framework**: Hono (ESM)
- **Frontend**: HTMX v4 + Alpine.js
- **Styling**: Inline CSS in layout template

## Architecture
- `apps/portal/server.js` - Server entry point (port 3000)
- `apps/portal/app.js` - Hono app initialization, mounts sub-apps and routes
- `apps/portal/routes.js` - Portal route definitions
- `apps/portal/views.js` - Portal HTML view templates
- `apps/customers/server.js` - Customers app standalone server (port 3001)
- `apps/customers/app.js` - Customers Hono app initialization
- `apps/customers/routes.js` - Customer route definitions
- `apps/customers/views.js` - Customer HTML view templates
- `apps/customers/data.js` - Customer data models
- `shared/layout.js` - Central layout with Alpine store for navigation state

## Key Patterns
- **Smart rendering**: `renderSmart(c, html)` detects `HX-Request-Type: partial` to return partial vs full page
- **Central navigation store**: Alpine.js store in layout, updated via `x-init` with JSON from routes
- **HTMX attributes**: All navigation uses `hx-get`, `hx-target="#main-content"`, `hx-swap="innerHTML"`
- **Separated concerns**: Each app has server.js, app.js, routes.js, views.js, data.js

## Constraints
- Use `HX-Request-Type == 'partial'` to detect HTMX partial requests
- Navigation metadata (breadcrumbs, subAside, contextActions) is JSON-stringified into `x-init`
- No separate API endpoints; state is embedded in HTML responses
- Both portal and customers apps have 404 and error handlers to reset navigation state

## HTMX + Alpine Gotcha
- Alpine dynamically re-renders breadcrumbs/subAside/mainAside when store updates
- HTMX does NOT auto-process new elements added by Alpine outside the swap target
- **Fix**: Call `htmx.process()` on these containers in `setState` after store update
