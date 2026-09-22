# Agent Instructions

## Codebase
- **Framework**: Hono (ESM) with TypeScript
- **Frontend**: HTMX v4 + Alpine.js
- **Styling**: OPUI
- **Database**: SQLite via Node.js built-in `node:sqlite` module (Node.js 22.x+)
- **ORM**: Drizzle ORM ( v1.0.0-rc4 for node:sqlite compatibility) 

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
- `apps/customers/data.ts` - Customer data access layer (Drizzle ORM)
- `shared/hax.ts` - Shared utilities (renderSmart)
- `shared/layout.ts` - Central layout with Alpine store for navigation state
- `db/database.ts` - Database connection using `node:sqlite`
- `db/schema.ts` - Drizzle ORM schema definitions
- `db/seed.ts` - Database seeding script

## Key Patterns
- **Smart rendering**: `renderSmart(c, viewHtml)` detects `HX-Request-Type: partial` to return partial vs full page
- **Central navigation store**: Alpine.js store (`$store.navigation`) in layout, updated via `x-init` with JSON from routes
- **HTMX attributes**: All navigation uses `hx-get`, `hx-target="#main-content"`, `hx-swap="innerHTML"`
- **Separated concerns**: Each app has server.ts, app.ts, routes.ts, views.ts, data.ts
- **Component-based**: Views use `hono/html` for clean Alpine template rendering

## HTML Concatenation with hono/html
Joining an Array of HTML parts) is used throughout the codebase:
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
- Use `HX-Request-Type == 'partial'` to detect HTMX partial requests
- Navigation metadata (breadcrumbs, subAside, contextActions) is JSON-stringified into `data-state` attribute on a hidden div, parsed by Alpine's `x-init`
- No separate API endpoints; state is embedded in HTML responses
- Both portal and customers apps have 404 and error handlers to reset navigation state
- **HTMX attribute expressions**: Avoid using JavaScript expressions in HTMX attributes that reference Alpine template variables. These get evaluated on the server where the variables don't exist. Use simple path references instead.

## HTMX + Alpine Integration
- Alpine dynamically re-renders breadcrumbs/subAside/mainAside when store updates
- HTMX does NOT auto-process new elements added by Alpine outside the swap target
- **Fix**: Call `htmx.process()` on these containers in `setState` after store update (implemented in layout)
- **Important**: `hono/html` tagged templates do NOT escape their content, making them ideal for Alpine.js templates. Regular TSX does escape content, which breaks Alpine expressions containing special characters like `>`, `<`, `{`, `}`.

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
      <template x-for="(item, index) in items" x-key="item.path">
        <template x-if="index > 0"><span>/</span></template>
        <button x-text="item.label"></button>
      </template>
    </nav>`;
  }
  ```

### 3. Drizzle ORM with node:sqlite - Limitations
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

# Run TypeScript type check
pnpm run typecheck
```

## Termux-Specific Notes
- **node:sqlite works** - No need for better-sqlite3 native compilation
- **No build step** - Uses `tsx` for direct TypeScript execution
- **File paths**: Use forward slashes (`/`) in module paths
- **Database location**: SQLite database file is created at `db/hax-portal.db`
- **Path handling**: Use `import { join, dirname } from 'node:path'` and `import { fileURLToPath } from 'node:url'` to get absolute paths for database files.

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

# Run TypeScript type check
pnpm run typecheck
```

## Termux-Specific Notes
- **node:sqlite works** - No need for better-sqlite3 native compilation
- **No build step** - Uses `tsx` for direct TypeScript execution
- **File paths**: Use forward slashes (`/`) in module paths
- **Database location**: SQLite database file is created at `db/hax-portal.db`
- **Path handling**: Use `import { join, dirname } from 'node:path'` and `import { fileURLToPath } from 'node:url'` to get absolute paths for database files.

on
- **File paths**: Use forward slashes (`/`) in module paths
- **Database location**: SQLite database file is created at `db/hax-portal.db`
- **Path handling**: Use `import { join, dirname } from 'node:path'` and `import { fileURLToPath } from 'node:url'` to get absolute paths for database files.

s**: Use forward slashes (`/`) in module paths
- **Database location**: SQLite database file is created at `db/hax-portal.db`
- **Path handling**: Use `import { join, dirname } from 'node:path'` and `import { fileURLToPath } from 'node:url'` to get absolute paths for database files.

.

e files.

.
abase files.
'` to get absolute paths for database files.
les.
or database files.

