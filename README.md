# HAX Portal - Multi-App Navigation POC

A HAX-core Portal demonstrating layered application navigation with **HTMX v4, Alpine.js, and TypeScript + Hono JSX + node:sqlite**.

## Architecture

- **Backend**: Hono (lightweight web framework) with TypeScript
- **Frontend**: HTMX v4 for dynamic HTML, Alpine.js for reactive state
- **Database**: SQLite via Node.js 22.x built-in `node:sqlite` module
- **ORM**: Drizzle ORM 
- **Pattern**: Server-rendered HTML with client-side interactivity via Hono's JSX

## Project Structure

```
HAX-portal/
├── apps/
│   ├── portal/
│   │   ├── server.tsx    # Main server entry (port 3000)
│   │   ├── app.tsx       # Hono app initialization, app discovery
│   │   ├── routes.tsx    # Portal route definitions
│   │   └── views.tsx     # Portal view components (hono/html)
│   └── customers/
│       ├── server.tsx    # Standalone server (port 3001)
│       ├── app.tsx       # Customers Hono app
│       ├── routes.tsx    # Customer route definitions
│       ├── views.tsx     # Customer view components (hono/html)
│       └── data.ts       # Data access layer (raw SQL)
├── db/
│   ├── database.ts      # Database connection (node:sqlite)
│   ├── schema.ts        # Drizzle ORM schema definitions
│   └── seed.ts          # Database seeding script
├── shared/
│   ├── hax.tsx          # Shared utilities (renderSmart)
│   ├── layout.tsx       # Central layout with Alpine store
│   └── components/      # Reusable UI components
│       ├── Breadcrumbs.tsx
│       ├── MainAside.tsx
│       └── SubAside.tsx
├── package.json
├── tsconfig.json
└── README.md
```

## Key Features

### Central Navigation Store
Single Alpine.js store (`$store.navigation`) manages:
- Breadcrumbs
- Main app navigation (Customers, etc.)
- Contextual sub-menus
- Action buttons

### Smart Rendering
`renderSmart()` detects `HX-Request-Type: partial` to return either:
- **Partial HTML** for HTMX swaps
- **Full layout** for initial page loads

### Layered App Structure
Each sub-app can set its own navigation context that updates the global store, enabling deep nested routes like:
```
/Customers/123-Aramco/Contact/356-Jenssen
```

**Note**: Edit routes (e.g., `/edit`) use `hx-push-url="false"` to avoid cluttering browser history with intermediate edit states.

### Component-Based with hono/html
- **All views use `hono/html`** for consistent Alpine template rendering
- **Nested components** return `HtmlEscapedString` which can be embedded in other templates
- **No escaping issues** - Alpine directives and expressions are preserved
- **Type-safe props** - Components can still have typed props

## Quick Start

```bash
# Install dependencies
pnpm install

# Seed the database (creates tables and inserts sample data)
pnpm run seed

# Start portal on port 3000
pnpm run dev

# Start customers app standalone on port 3001
pnpm run dev:cust
```

Open: http://localhost:3000

Test deep link: http://localhost:3000/Customers/123-Aramco/Contact/356-Jenssen

## TypeScript Development

```bash
# Run TypeScript type check
pnpm run typecheck
```

The project uses:
- TypeScript with `tsx` runtime for direct execution
- Hono's JSX runtime for TSX templates
- `allowImportingTsExtensions: true` for `.ts`/`.tsx` imports

## Database Schema

The SQLite database (`db/hax-portal.db`) contains:

- **customers**: Customer information (id, name, industry, location)
- **contacts**: Customer contacts (id, customer_id, name, email, phone)
- **addresses**: Customer addresses (id, customer_id, type, street, city, country)
- **notes**: Customer notes (id, customer_id, content, date, author)
- **portal_apps**: Registered applications for the portal

## Technical Insights

### 1. Hono JSX with Alpine.js - The Escaping Problem

**The Issue:** Hono's JSX runtime escapes special characters (`>`, `<`, `{`, `}`) in children and attribute values. This breaks Alpine templates:

```tsx
// This gets escaped to: x-if="index &gt; 0"
<template x-if="index > 0">
```

**The Solution:** Use `hono/html` tagged templates for Alpine template sections:

```tsx
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

**Why this works:** `hono/html` tagged templates do NOT escape their content, preserving Alpine directives and JavaScript expressions.

### 2. HTMX Attributes with Alpine Variables

**Problem:** HTMX tries to evaluate attribute values on the server. When you use:
```html
<button hx-push-url="item.path.includes('/edit') ? 'false' : item.path">
```
HTMX tries to evaluate `item.path.includes('/edit')` on the server, where `item` is undefined.

**Solution:** Use simple path references:
```html
<button hx-push-url="item.path">
```
Let the browser handle the URL pushing based on the path. Alpine will substitute `item.path` with the actual value.

### 3. Component Architecture

All UI components use `hono/html` and return `HtmlEscapedString`:

```tsx
// shared/components/Breadcrumbs.tsx
export function Breadcrumbs() {
  return html`<nav x-data>...</nav>`;
}

// shared/layout.tsx
import { Breadcrumbs } from './components/Breadcrumbs.tsx';

export function Layout({ children }) {
  const breadcrumbsHtml = Breadcrumbs();
  return html`<html>...${breadcrumbsHtml}...</html>`;
}
```

**Benefits:**
- Consistent approach - all HTML uses `hono/html`
- No escaping issues ever
- Nested components work seamlessly
- Type-safe props still work
- Cleaner code than mixing TSX and `hono/html`

### 5. Injecting Data into Alpine Store

The `mainApps` array needs to be available in the browser for Alpine to use. We inject it via a script:

```tsx
const mainApps = (globalThis as any).mainApps || [];
const mainAppsJson = JSON.stringify(mainApps);

const navStoreScript = `
  document.addEventListener('alpine:init', () => {
    Alpine.store('navigation', {
      mainApps: ${mainAppsJson},
      ...
    });
  });
`;

return html`<html>
  <script dangerouslySetInnerHTML={{ __html: navStoreScript }} />
  ...
</html>`;
```

**Note:** We use `dangerouslySetInnerHTML` here because the script contains JSON that would otherwise be escaped by `hono/html`.

## Separated Concerns

Each app follows a clean separation:
- **server.tsx**: Entry point with serve()
- **app.tsx**: Hono app setup and route mounting
- **routes.tsx**: Route definitions with navigation metadata
- **views.tsx**: View components using `hono/html`
- **data.ts**: Data access layer (database, json, API etc.)

## Error Handling

Both portal and customers apps have 404 and global error handlers that reset the navigation state, preventing stale breadcrumbs and sub-menus.

## HTMX + Alpine Integration

- Alpine dynamically re-renders breadcrumbs/subAside/mainAside when store updates
- HTMX does NOT auto-process new elements added by Alpine outside the swap target
- **Fix**: Call `htmx.process()` on these containers in `setState` after store update (implemented in layout)

## License

MIT
T
T
**server.tsx**: Entry point with serve()
- **app.tsx**: Hono app setup and route mounting
- **routes.tsx**: Route definitions with navigation metadata
- **views.tsx**: View components using `hono/html`
- **data.ts**: Data access layer (raw SQL with `node:sqlite`)

## Error Handling

Both portal and customers apps have 404 and global error handlers that reset the navigation state, preventing stale breadcrumbs and sub-menus.

## HTMX + Alpine Integration

- Alpine dynamically re-renders breadcrumbs/subAside/mainAside when store updates
- HTMX does NOT auto-process new elements added by Alpine outside the swap target
- **Fix**: Call `htmx.process()` on these containers in `setState` after store update (implemented in layout)

## License

MIT
re update (implemented in layout)

## License

MIT
)

## License

MIT
