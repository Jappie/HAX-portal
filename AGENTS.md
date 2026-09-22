# Agent Instructions

## Codebase
- **Framework**: Hono (ESM) with TypeScript
- **Frontend**: Alpine.js + Alpine AJAX (single runtime, no HTMX)
- **Styling**: OPUI
- **Database**: SQLite via Node.js built-in `node:sqlite` module (Node.js 22.x+)
- **ORM**: Drizzle ORM (v1.0.0-rc4 for node:sqlite compatibility)

## Architecture
- `apps/portal/server.ts` - Server entry point (port 3000)
- `apps/portal/app.ts` - Hono app initialization, discovers and mounts sub-apps
- `apps/portal/appDiscovery.ts` - Discovers apps from database (portal_apps table)
- `apps/portal/routes.ts` - Portal route definitions
- `apps/portal/views.ts` - Portal view components using `hono/html`
- `apps/customers/server.ts` - Customers app standalone server (port 3001)
- `apps/customers/app.ts` - Customers Hono app initialization
- `apps/customers/routes.ts` - Customer route definitions
- `apps/customers/views.ts` - Customer view components using `hono/html`
- `apps/customers/data.ts` - Customer data access layer (raw SQL with node:sqlite)
- `apps/auth/server.ts` - Auth app server (port 3002)
- `apps/auth/app.ts` - Auth Hono app initialization
- `apps/auth/routes.ts` - Auth route definitions
- `apps/auth/views.ts` - Auth view components
- `shared/hax.ts` - Shared utilities (renderSmart)
- `shared/layout.ts` - Central layout with Alpine store for navigation state
- `shared/opui/Button.ts` - Reusable button component with Alpine AJAX support
- `shared/opui/` - OPUI component library
- `shared/components/Breadcrumbs.ts` - Breadcrumb navigation component
- `shared/components/MainAside.ts` - Main navigation sidebar component
- `shared/components/SubAside.ts` - Sub-navigation sidebar component
- `shared/components/ThemeMenu.ts` - Theme selection component
- `shared/auth.ts` - Authentication utilities
- `shared/abacEngine.ts` - Attribute-Based Access Control engine
- `shared/blueprint.ts` - Blueprint generation utilities
- `db/database.ts` - Database connection using `node:sqlite`
- `db/schema.ts` - Drizzle ORM schema definitions
- `db/seed.ts` - Database seeding script
- `db/auth.ts` - Auth database utilities

## Key Patterns
- **Smart rendering**: `renderSmart(c, viewHtml)` detects `X-Alpine-Request: true` header to return partial vs full page
- **Central navigation store**: Alpine.js store (`$store.navigation`) in layout, loaded from `<script type="application/json" id="nav-state">` on DOMContentLoaded and ajax:after events
- **Alpine AJAX navigation**: All navigation uses `@click="$ajax(path, { target: 'main-content', method: 'GET' })"` pattern
- **Separated concerns**: Each app has server.ts, app.ts, routes.ts, views.ts, data.ts
- **Component-based**: Views use `hono/html` for clean Alpine template rendering
- **JSON state transport**: Navigation state is safely transported via `<script type="application/json">` tag (no attribute parsing)

## HTML Concatenation with hono/html
Arrays of HTML parts are used throughout the codebase:
```typescript
import { html } from 'hono/html';
const items = [
  html`<li>Item 1</li>`,
  html`<li>Item 2</li>`
];
// Hono natively unpacks and concatenates arrays inside template literals
const list = html`<ul>${items}</ul>`;
```

This approach prevents double-escaping that would occur with `.join('')`.

## TypeScript Configuration
- **Compiler**: TypeScript with `tsx` runtime
- **Config**: `tsconfig.json` with `allowImportingTsExtensions: true`
- **Type checking**: Run `pnpm run typecheck`

## Constraints
- Use `X-Alpine-Request == 'true'` to detect Alpine AJAX partial requests (sent automatically by Alpine AJAX)
- Navigation metadata (breadcrumbs, subAside, contextActions) is JSON-stringified into `<script type="application/json" id="nav-state">` tag, loaded by Alpine store on DOMContentLoaded and ajax:after
- No separate API endpoints; state is embedded in HTML responses
- All apps have 404 and error handlers that output empty or reset navigation state
- **Alpine AJAX usage**: Use `@click="$ajax('/path', { target: 'main-content', method: 'GET' })"` for navigation buttons
- **Button elements**: Keep `<button>` elements (not `<a>` tags) with `@click` handlers for Alpine AJAX

## Alpine AJAX + Alpine.js Integration
- Alpine AJAX sends `X-Alpine-Request: true` header on every request
- `renderSmart()` detects this header to return partial HTML for AJAX requests
- Navigation store loads state from `<script type="application/json" id="nav-state">` on:
  - `DOMContentLoaded` - initial page load
  - `ajax:after` - after every Alpine AJAX request completes
- **No htmx.process() needed**: Alpine AJAX handles all DOM updates automatically
- **No framework conflicts**: Single runtime (Alpine.js + Alpine AJAX) instead of two frameworks competing
- **Safe JSON transport**: Special characters (apostrophes, angle brackets) in labels work correctly

## Special Features & Discoveries

### 1. Hono html with Alpine.js Directives
**Discovery**: `hono/html` tagged templates preserve Alpine.js directives as HTML attributes and do NOT escape content
- **Template syntax**: Use `x-key` instead of `:key` for Alpine.js templates
- **Class binding**: Use `x-bind:class` instead of `:class`
- **Example with hono/html**:
  ```typescript
  import { html } from 'hono/html';
  
  function Breadcrumbs() {
    return html`<nav x-data>
      <template x-for="(item, index) in $store.navigation.breadcrumbs" x-key="item.path">
        <template x-if="index > 0"><span>/</span></template>
        <button @click="$ajax(item.path, { target: 'main-content', method: 'GET' })" x-text="item.label"></button>
      </template>
    </nav>`;
  }
  ```

### 2. Alpine AJAX Navigation Pattern
**Pattern**: All navigation uses buttons with `@click` handlers calling `$ajax()`:
```html
<button @click="$ajax('/Customers/123', { target: 'main-content', method: 'GET' })">
  View Customer
</button>
```

**Options**:
- `target`: DOM element ID to swap content into (default: none, returns full page)
- `method`: HTTP method (GET, POST, PUT, DELETE, PATCH)
- `push`: Push to browser history (default: true)
- `replace`: Replace browser history instead of push

### 3. Shared OPUI Button Component
**Usage**:
```typescript
import { Button } from '../shared/opui/Button.ts';

Button({
  label: 'View Details',
  path: '/Customers/123',
  target: 'main-content',
  method: 'GET',
  class: 'ui-btn ui-btn-sm'
})
```

### 4. Drizzle ORM with node:sqlite - Limitations
**Setup**: While Drizzle ORM can use the `better-sqlite3` adapter with `node:sqlite`, there are compatibility issues:
- **Missing `raw()` method**: Drizzle's better-sqlite3 adapter expects a `raw()` method on Statement objects, which `node:sqlite` doesn't provide
- **Workaround**: Use raw SQL queries with `sqlite.prepare()` and `stmt.all()` / `stmt.get()` instead of Drizzle's query builder
- **Schema**: Drizzle is still used for schema definitions and type safety
- **Data access**: Use raw SQL in the data layer (see `apps/customers/data.ts`)

## Scripts
```bash
# Install dependencies
pnpm install

# Seed the database (creates tables and inserts sample data)
pnpm run seed

# Start the portal server
pnpm run dev

# Start the customers app standalone
pnpm run dev:cust

# Start the auth app standalone
pnpm run dev:auth

# Run TypeScript type check
pnpm run typecheck
```

## Termux-Specific Notes
- **node:sqlite works** - No need for better-sqlite3 native compilation
- **No build step** - Uses `tsx` for direct TypeScript execution
- **File paths**: Use forward slashes (`/`) in module paths
- **Database location**: SQLite database file is created at `db/hax-portal.db`
- **Path handling**: Use `import { join, dirname } from 'node:path'` and `import { fileURLToPath } from 'node:url'` to get absolute paths for database files.
