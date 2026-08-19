# Agent Instructions

## Codebase
- **Framework**: Hono (ESM)
- **Frontend**: HTMX v4 + Alpine.js
- **Styling**: Inline CSS in layout template

## Architecture
- `apps/portal/app.js` - Main entry, mounts sub-apps
- `apps/customers/routes.js` - Sub-app with nested routing
- `shared/layout.js` - Central layout with Alpine store for navigation state

## Key Patterns
- **Smart rendering**: `renderSmart(c, html)` detects `HX-Request-Type: partial` to return partial vs full page
- **Central navigation store**: Alpine.js store in layout, updated via `x-init` with JSON from routes
- **HTMX attributes**: All navigation uses `hx-get`, `hx-target="#main-content"`, `hx-swap="innerHTML"`

## Constraints
- Use `HX-Request-Type == 'partial'` to detect HTMX partial requests
- Navigation metadata (breadcrumbs, subAside, contextActions) is JSON-stringified into `x-init`
- No separate API endpoints; state is embedded in HTML responses
