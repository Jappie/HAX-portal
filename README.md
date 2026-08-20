# HAX Portal - Multi-App Navigation POC

A proof-of-concept enterprise portal demonstrating layered application navigation with HTMX v4 and Alpine.js.

## Architecture

- **Backend**: Hono (lightweight web framework)
- **Frontend**: HTMX v4 for dynamic HTML, Alpine.js for reactive state
- **Pattern**: Server-rendered HTML with client-side interactivity

## Project Structure

```
HAX-portal/
├── apps/
│   ├── portal/
│   │   ├── server.js    # Main server entry (port 3000)
│   │   ├── app.js       # Hono app initialization
│   │   ├── routes.js    # Portal routes
│   │   └── views.js     # Portal view templates
│   └── customers/
│       ├── server.js    # Standalone server (port 3001)
│       ├── app.js       # Customers Hono app
│       ├── routes.js    # Customer routes
│       ├── views.js     # Customer view templates
│       └── data.js      # Data models
└── shared/
    └── layout.js        # Central layout template
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

**Note:** Edit routes (e.g., `/edit`) use `hx-push-url="false"` to avoid cluttering browser history with intermediate edit states.

### Separated Concerns
Each app follows a clean separation:
- **server.js**: Entry point with serve()
- **app.js**: Hono app setup and route mounting
- **routes.js**: Route definitions with metadata
- **views.js**: HTML view templates
- **data.js**: Data models (where applicable)

### Error Handling
Both portal and customers apps have 404 and global error handlers that reset the navigation state, preventing stale breadcrumbs and sub-menus.

## Quick Start

```bash
npm install
npm run dev        # Start portal on port 3000
npm run dev:cust   # Start customers app standalone on port 3001
```

Open: http://localhost:3000

Test deep link: http://localhost:3000/Customers/123-Aramco/Contact/356-Jenssen
