# HAS Portal - Multi-App Navigation POC

A proof-of-concept enterprise portal demonstrating layered application navigation with HTMX v4 and Alpine.js.

## Architecture

- **Backend**: Hono (lightweight web framework)
- **Frontend**: HTMX v4 for dynamic HTML, Alpine.js for reactive state
- **Pattern**: Server-rendered HTML with client-side interactivity

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
/Customers/123-Aramco/Contact/356-Jenssen/edit
```

## Quick Start

```bash
npm install
npm run dev
```

Open: http://localhost:3000

Test deep link: http://localhost:3000/Customers/123-Aramco/Contact/356-Jenssen/edit
