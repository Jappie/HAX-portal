# Agent Instructions

## Codebase
- **Framework**: Hono (ESM) with TypeScript
- **Frontend**: HTMX v4 + Alpine.js
- **Styling**: Inline CSS in layout template
- **Database**: SQLite via Node.js built-in `node:sqlite` module (Node.js 22.x+)
- **ORM**: Drizzle ORM with `drizzle-orm/better-sqlite3` adapter

## Architecture
- `apps/portal/server.tsx` - Server entry point (port 3000)
- `apps/portal/app.tsx` - Hono app initialization, discovers and mounts sub-apps
- `apps/portal/appDiscovery.tsx` - Discovers apps from database (portal_apps table)
- `apps/portal/routes.tsx` - Portal route definitions
- `apps/portal/views.tsx` - Portal TSX view components
- `apps/customers/portal.json` - App metadata for discovery
- `apps/customers/server.tsx` - Customers app standalone server (port 3001)
- `apps/customers/app.tsx` - Customers Hono app initialization
- `apps/customers/routes.tsx` - Customer route definitions
- `apps/customers/views.tsx` - Customer TSX view components
- `apps/customers/data.ts` - Customer data access layer (Drizzle ORM)
- `shared/hax.tsx` - Shared utilities (renderSmart)
- `shared/layout.tsx` - Central layout with Alpine store for navigation state
- `db/database.ts` - Database connection using `node:sqlite`
- `db/schema.ts` - Drizzle ORM schema definitions
- `db/seed.ts` - Database seeding script

## Key Patterns
- **Smart rendering**: `renderSmart(c, viewHtml)` detects `HX-Request-Type: partial` to return partial vs full page
- **Central navigation store**: Alpine.js store in layout, updated via `x-init` with JSON from routes
- **HTMX attributes**: All navigation uses `hx-get`, `hx-target="#main-content"`, `hx-swap="innerHTML"`
- **Separated concerns**: Each app has server.tsx, app.tsx, routes.tsx, views.tsx, data.ts
- **TSX Templates**: Views now use Hono's JSX support with Alpine.js directives directly in JSX

## Database (SQLite with Drizzle ORM)
- **Engine**: Node.js 22.x built-in `node:sqlite` module (no installation needed)
- **Database file**: `db/hax-portal.db`
- **Tables**: customers, contacts, addresses, notes, portal_apps
- **Drizzle adapter**: Uses `drizzle-orm/better-sqlite3` (API-compatible with node:sqlite)
- **Seeding**: Run `pnpm run seed` to create tables and insert sample data

## TypeScript Configuration
- **Compiler**: TypeScript with `tsx` runtime
- **Config**: `tsconfig.json` with `allowImportingTsExtensions: true`
- **JSX**: Uses Hono's JSX runtime (`jsxImportSource: "hono/jsx"`)
- **Type checking**: Run `pnpm run typecheck`

## Constraints
- Use `HX-Request-Type == 'partial'` to detect HTMX partial requests
- Navigation metadata (breadcrumbs, subAside, contextActions) is JSON-stringified into `x-init`
- No separate API endpoints; state is embedded in HTML responses
- Both portal and customers apps have 404 and error handlers to reset navigation state

## HTMX + Alpine Gotcha
- Alpine dynamically re-renders breadcrumbs/subAside/mainAside when store updates
- HTMX does NOT auto-process new elements added by Alpine outside the swap target
- **Fix**: Call `htmx.process()` on these containers in `setState` after store update

## Special Features & Discoveries

### 1. Node.js 22.x Built-in SQLite (`node:sqlite`)
**Discovery**: Node.js 22.x includes a built-in `node:sqlite` module that works on Termux!
- **No installation needed** - Available in Node.js 22.x core
- **API-compatible** with `better-sqlite3` - Works with Drizzle ORM's `better-sqlite3` adapter
- **Works on Termux** - Confirmed working on Android/Termux environment
- **Usage**:
  ```typescript
  import { DatabaseSync } from 'node:sqlite';
  const db = new DatabaseSync('database.db');
  ```

### 2. Hono JSX with Alpine.js Directives
**Discovery**: Hono's JSX runtime preserves Alpine.js directives as HTML attributes
- **Alpine.js in JSX**: Directives like `x-data`, `x-for`, `x-text` work directly in JSX
- **Template syntax**: Use `x-key` instead of `:key` for Alpine.js templates
- **Class binding**: Use `x-bind:class` instead of `:class`
- **Example**:
  ```tsx
  <div x-data>
    <template x-for="item in items" x-key="item.id">
      <button x-text="item.label" x-bind:class="{ active: item.active }"></button>
    </template>
  </div>
  ```

### 3. TSX Templates with Hono
**Pattern**: Views are now TSX components instead of `hono/html` tagged templates
- **Type-safe props**: Components have typed props for better IDE support
- **Component-based**: Reusable components like `NavigationState`, `ContextActions`
- **Seamless integration**: Works with `c.html(<Component />)` in routes

### 4. Drizzle ORM with node:sqlite
**Setup**: Using `drizzle-orm/better-sqlite3` adapter with `node:sqlite`
- **Database**: `db/database.ts` exports drizzle instance
- **Schema**: `db/schema.ts` defines tables with Drizzle
- **Seeding**: `db/seed.ts` creates tables and inserts data
- **Data access**: `apps/customers/data.ts` uses Drizzle queries

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
