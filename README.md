# HAX Portal - Multi-App Navigation POC

A proof-of-concept enterprise portal demonstrating layered application navigation with **HTMX v4, Alpine.js, and TypeScript + Hono JSX**.

## Architecture

- **Backend**: Hono (lightweight web framework) with TypeScript
- **Frontend**: HTMX v4 for dynamic HTML, Alpine.js for reactive state
- **Database**: SQLite via Node.js 22.x built-in `node:sqlite` module
- **ORM**: Drizzle ORM for type-safe database operations
- **Pattern**: Server-rendered HTML with client-side interactivity via Hono's JSX

## Project Structure

```
HAX-portal/
├── apps/
│   ├── portal/
│   │   ├── server.tsx    # Main server entry (port 3000)
│   │   ├── app.tsx       # Hono app initialization
│   │   ├── routes.tsx    # Portal routes
│   │   └── views.tsx     # Portal TSX view components
│   └── customers/
│       ├── server.tsx    # Standalone server (port 3001)
│       ├── app.tsx       # Customers Hono app
│       ├── routes.tsx    # Customer routes
│       ├── views.tsx     # Customer TSX view components
│       └── data.ts       # Data access layer (Drizzle ORM)
├── db/
│   ├── database.ts      # Database connection (node:sqlite)
│   ├── schema.ts        # Drizzle ORM schema definitions
│   └── seed.ts          # Database seeding script
├── shared/
│   ├── hax.tsx          # Shared utilities (renderSmart)
│   └── layout.tsx       # Central layout with Alpine store
├── package.json
├── tsconfig.json
└── README.md
```

## Key Features

### Central Navigation Store
Single Alpine.js store (`$store.navigation`) manages:
- Breadcrumbs
- Main app navigation (Customers, Suppliers, HR)
- Contextual sub-menus
- Action buttons

### Smart Rendering
`renderSmart()` detects `HX-Request-Type: partial` to return either:
- **Partial HTML** for HTMX swaps
- **Full layout** for initial page loads

### Layered App Structure
Each sub-app (e.g., Customers) can set its own navigation context that updates the global store, enabling deep nested routes like:
```
/Customers/123-Aramco/Contact/356-Jenssen
```

**Note**: Edit routes (e.g., `/edit`) use `hx-push-url="false"` to avoid cluttering browser history with intermediate edit states.

### TSX Templates with Hono JSX
- **Type-safe components**: All views are now TSX components with typed props
- **Alpine.js integration**: Alpine.js directives work directly in JSX
- **Better IDE support**: Syntax highlighting, autocompletion, type checking

### SQLite Database with Drizzle ORM
- **Node.js 22.x built-in**: Uses `node:sqlite` (no installation needed)
- **Works on Termux**: Confirmed working on Android/Termux
- **Type-safe queries**: Drizzle ORM provides full TypeScript support
- **Easy seeding**: Run `pnpm run seed` to create tables and insert sample data

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

Test deep link: http://localhost:3000/Customers/123/Contact/356

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

## Technical Highlights

### 1. Node.js Built-in SQLite
Node.js 22.x includes `node:sqlite` which is API-compatible with `better-sqlite3`, making it work seamlessly with Drizzle ORM without any native compilation.

### 2. Hono JSX with Alpine.js
Hono's JSX runtime preserves Alpine.js directives as HTML attributes, allowing you to write:
```tsx
<div x-data>
  <template x-for="item in items" x-key="item.id">
    <button x-text="item.label"></button>
  </template>
</div>
```

### 3. Smart Rendering Pattern
The `renderSmart` utility automatically detects HTMX partial requests and returns either:
- Raw HTML for HTMX swaps
- Full layout with navigation for initial page loads

### 4. Central Navigation State
Alpine.js store manages navigation state across the entire application, updated via `x-init` from each route.

## Separated Concerns

Each app follows a clean separation:
- **server.tsx**: Entry point with serve()
- **app.tsx**: Hono app setup and route mounting
- **routes.tsx**: Route definitions with metadata
- **views.tsx**: TSX view components
- **data.ts**: Data access layer (Drizzle ORM)

## Error Handling

Both portal and customers apps have 404 and global error handlers that reset the navigation state, preventing stale breadcrumbs and sub-menus.

## License

MIT
