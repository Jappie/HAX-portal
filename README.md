# HAX Portal - Multi-App Navigation POC

A HAX-core Portal demonstrating layered application navigation with **Alpine.js + Alpine AJAX** and TypeScript + Hono + `hono/html` + `node:sqlite`.

> **Note**: This project has migrated from HTMX v4 to Alpine AJAX. The previous HTMX-based navigation has been completely replaced with Alpine AJAX for a single, unified client runtime.

## Architecture

- **Backend**: Hono (lightweight web framework) with TypeScript
- **Frontend**: Alpine.js with Alpine AJAX for dynamic HTML and AJAX navigation
- **Database**: SQLite via Node.js 22.x built-in `node:sqlite` module
- **ORM**: Drizzle ORM (schema definitions only - uses raw SQL for queries)
- **Pattern**: Server-rendered HTML with client-side interactivity via `hono/html` templates

## Project Structure

```
HAX-portal/
├── apps/
│   ├── portal/
│   │   ├── server.ts          # Main server entry (port 3000)
│   │   ├── app.ts             # Hono app initialization, app discovery
│   │   ├── appDiscovery.ts    # Discovers apps from database
│   │   ├── routes.ts          # Portal route definitions
│   │   └── views.ts           # Portal view components (hono/html)
│   ├── customers/
│   │   ├── server.ts          # Standalone server (port 3001)
│   │   ├── app.ts             # Customers Hono app
│   │   ├── routes.ts          # Customer route definitions
│   │   ├── views.ts           # Customer view components (hono/html)
│   │   └── data.ts            # Data access layer (raw SQL)
│   └── auth/
│       ├── server.ts          # Auth server (port 3002)
│       ├── app.ts             # Auth Hono app
│       ├── routes.ts          # Auth route definitions
│       └── views.ts           # Auth view components
├── assets/
│   ├── css/                   # CSS files (OPUI, open-props, custom)
│   ├── fonts/                 # Font files
│   └── js/
│       └── alpine-ajax.patched.min.js  # Alpine AJAX library
├── db/
│   ├── database.ts           # Database connection (node:sqlite)
│   ├── schema.ts             # Drizzle ORM schema definitions
│   ├── seed.ts               # Database seeding script
│   └── auth.ts               # Auth database utilities
├── shared/
│   ├── hax.ts               # Shared utilities (renderSmart)
│   ├── layout.ts            # Central layout with Alpine store
│   ├── auth.ts              # Authentication utilities
│   ├── abacEngine.ts        # Attribute-Based Access Control
│   ├── blueprint.ts         # Blueprint generation
│   ├── opui/               # OPUI component library
│   │   ├── Button.ts        # Reusable AJAX button component
│   │   ├── Card.ts          # Card component
│   │   └── ...
│   └── components/          # Reusable UI components
│       ├── Breadcrumbs.ts   # Breadcrumb navigation
│       ├── MainAside.ts     # Main navigation sidebar
│       ├── SubAside.ts      # Sub-navigation sidebar
│       └── ThemeMenu.ts     # Theme selection
├── package.json
├── tsconfig.json
└── README.md
```

## Key Features

### Single Client Runtime: Alpine.js + Alpine AJAX
The project now uses **Alpine AJAX** exclusively for AJAX navigation, eliminating framework conflicts with HTMX:
- **Alpine.js**: Handles reactive state and component rendering
- **Alpine AJAX**: Handles AJAX requests, response processing, and DOM swapping
- **No HTMX**: Completely removed HTMX v4 and hx-alpine-compat

### Central Navigation Store
Single Alpine.js store (`$store.navigation`) manages:
- Breadcrumbs
- Main app navigation (Customers, Auth, etc.)
- Contextual sub-menus
- Action buttons

The store loads state from a `<script type="application/json" id="nav-state">` tag on:
- `DOMContentLoaded` - initial page load
- `ajax:after` - after every Alpine AJAX request

### Smart Rendering
`renderSmart(c, viewHtml)` detects the `X-Alpine-Request: true` header (sent automatically by Alpine AJAX) to return:
- **Partial HTML** for AJAX requests (swapped into target element)
- **Full layout** for initial page loads

### Layered App Structure
Each sub-app can set its own navigation context that updates the global store, enabling deep nested routes like:
```
/Customers/123-Aramco/Contact/356-Jenssen
```

**Note**: Edit routes (e.g., `/edit`) use `push: false` option to avoid cluttering browser history:
```html
<button @click="$ajax('/path/edit', { target: 'main-content', push: false })">Edit</button>
```

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

# Start auth app standalone on port 3002
pnpm run dev:auth
```

Open: http://localhost:3000

Test deep link: http://localhost:3000/Customers/123-Aramco/Contact/356-Jenssen

## Navigation Pattern

All navigation uses Alpine AJAX's `$ajax()` magic with `@click` handlers:

### Basic Navigation
```html
<button @click="$ajax('/Customers/123', { target: 'main-content', method: 'GET' })">
  View Customer
</button>
```

### With Shared Button Component
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

### Navigation Components
The breadcrumbs, main aside, and sub-aside components all use the same pattern:
```html
<button @click="$ajax(item.path, { target: 'main-content', method: 'GET' })" x-text="item.label"></button>
```

## Alpine AJAX Configuration

### Script Loading
Alpine AJAX must be loaded **before** Alpine.js:
```html
<script src="/assets/js/alpine-ajax.patched.min.js"></script>
<script src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js"></script>
```

### Request Headers
Alpine AJAX automatically sends:
- `X-Alpine-Request: true` - Used by `renderSmart()` to detect partial requests

### Event System
- `ajax:after` - Fires on window after every AJAX request completes
- `ajax:send` - Fires before request is sent
- `ajax:success` - Fires on successful response
- `ajax:error` - Fires on error response

## TypeScript Development

```bash
# Run TypeScript type check
pnpm run typecheck
```

The project uses:
- TypeScript with `tsx` runtime for direct execution
- `hono/html` tagged templates for Alpine-compatible HTML
- `allowImportingTsExtensions: true` for `.ts` imports

## Database Schema

The SQLite database (`db/hax-portal.db`) contains:

- **customers**: Customer information (id, name, industry, location)
- **contacts**: Customer contacts (id, customer_id, name, email, phone)
- **addresses**: Customer addresses (id, customer_id, type, street, city, country)
- **notes**: Customer notes (id, customer_id, content, date, author)
- **portal_apps**: Registered applications for the portal
- **users**: User accounts (better-auth)
- **sessions**: User sessions (better-auth)
- **roles**: RBAC roles
- **permissions**: RBAC permissions
- **abac_policies**: Attribute-Based Access Control policies

## Technical Insights

### 1. Why Alpine AJAX over HTMX?

**Framework Conflicts Eliminated:**
- No more `htmx.process()` calls needed after Alpine renders DOM
- No more `data-state` attribute parsing breaking on special characters
- Single runtime instead of two frameworks competing over the same DOM

**Simpler Architecture:**
- Alpine.js handles reactivity and component rendering
- Alpine AJAX handles AJAX requests and DOM updates
- Clean separation of concerns

**Better Progressive Enhancement:**
- Buttons work without JavaScript (though without AJAX navigation)
- No need for `<a>` tags - buttons with `@click` handlers are sufficient

### 2. Hono html with Alpine.js Directives

**The Issue:** Hono's JSX runtime escapes special characters (`>`, `<`, `{`, `}`) in children and attribute values. This breaks Alpine templates.

**The Solution:** Use `hono/html` tagged templates for all Alpine template sections:

```typescript
import { html } from 'hono/html';

function Breadcrumbs() {
  return html`<nav x-data>
    <template x-for="(item, index) in $store.navigation.breadcrumbs" x-key="item.path">
      <template x-if="index > 0"><span>/</span></template>
      <button @click="$ajax(item.path, { target: 'main-content' })" x-text="item.label"></button>
    </template>
  </nav>`;
}
```

**Why this works:** `hono/html` tagged templates do NOT escape their content, preserving Alpine directives and JavaScript expressions.

### 3. Safe JSON State Transport

**Previous (Problematic):**
```typescript
// Breaks on special characters like apostrophes
raw(`<div data-state='${json}' style="display: none;"></div>`)
```

**Current (Safe):**
```typescript
// Safe - JSON is in a script tag, not an attribute
html`<script type="application/json" id="nav-state">${json}</script>`
```

**Benefits:**
- Handles special characters correctly (O'Brien, <div>, etc.)
- No attribute parsing needed
- Standard JSON parsing
- Works with any valid JSON

### 4. Component Architecture

All UI components use `hono/html` and return `HtmlEscapedString`:

```typescript
// shared/components/Breadcrumbs.ts
export function Breadcrumbs() {
  return html`<nav x-data>...</nav>`;
}

// shared/layout.ts
import { Breadcrumbs } from './components/Breadcrumbs.ts';

export function Layout({ content }) {
  const breadcrumbsHtml = Breadcrumbs();
  return html`<html>...${breadcrumbsHtml}...</html>`;
}
```

**Benefits:**
- Consistent approach - all HTML uses `hono/html`
- No escaping issues ever
- Nested components work seamlessly
- Type-safe props still work
- Cleaner code

### 5. No More htmx.process()

**Previous (HTMX):**
```javascript
setState(meta) {
  // Update store
  this.currentPath = meta.currentPath;
  // ...
  // Re-process HTMX attributes
  setTimeout(() => {
    ['.breadcrumbs', '.sub-aside', '.main-aside', '.actions'].forEach(selector => {
      const el = document.querySelector(selector);
      if (el) htmx.process(el);
    });
  }, 0);
}
```

**Current (Alpine AJAX):**
```javascript
load() {
  const script = document.getElementById('nav-state');
  if (script) {
    const state = JSON.parse(script.textContent || '{}');
    Object.assign(this, state);
  }
}
// Event listeners handle automatic loading
document.addEventListener('DOMContentLoaded', () => store.load());
window.addEventListener('ajax:after', () => store.load());
```

**Benefits:**
- No framework conflicts
- No timing races
- Simpler code
- More reliable

## Mermaid Architecture Diagram

The portal includes a live Mermaid.js architecture diagram that visualizes the ABAC configuration from the database. Access it at:
```
http://localhost:3000/portal/architecture
```

The diagram is generated dynamically and rendered client-side via Mermaid.js.

## Authentication & Authorization

The portal includes a complete authentication and authorization system:
- **Authentication**: better-auth integration
- **RBAC**: Role-Based Access Control
- **ABAC**: Attribute-Based Access Control via `shared/abacEngine.ts`

## Contributing

When adding new features:
1. Use `hono/html` for all HTML templates
2. Use Alpine AJAX (`$ajax()`) for all AJAX navigation
3. Use `@click` handlers on `<button>` elements
4. Transport state via `<script type="application/json">` tags
5. Listen to `DOMContentLoaded` and `ajax:after` events for state loading
6. Run `pnpm run typecheck` before committing

## License

MIT
