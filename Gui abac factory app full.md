# Dynamic Field-Level ABAC Architectuur: Hono, Drizzle, Better Auth & Live Mermaid

---

## Deel 1: Architectuur Overzicht (Statisch Schema vs. Dynamische Policy)

Deze architectuur scheidt de fysieke datastructuur strikt van de autorisatielogica:

*   **Statisch (Dev - Git Driven):** Databasetabellen (`drizzle`), basistypes en Zod-validaties (`drizzle-zod`). Wijzigingen verlopen via code-reviews en `drizzle-kit` migraties.
*   **Dynamisch (Prod - DB Driven):** Rollen, gebruikerskoppelingen (via Better Auth) en attribuut-permissies (`app_permissions`). Beheerders kunnen live op productie rechten in- of uitschakelen zonder deployments.
*   **Live Visualisatie:** Mermaid.js leest de actuele staat rechtstreeks uit de database en serveert een 'Live View' van de architectuur via HTMX naar de browser.

---

## Deel 2: Database Schema (`schema.ts`)

Met `drizzle-orm` definiëren we de business-tabellen en de dedicated tabel voor de veld-permissies.

``` javascript 
import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';

// --- 1. BUSINESS ENTITEIT ---
export const customers = sqliteTable('customers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  notes: text('notes'), // Gevoelig attribuut
});

// --- 2. FIELD-LEVEL ABAC PERMISSIE TABEL ---
export const appPermissions = sqliteTable('app_permissions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  role: text('role').notNull(),            // Bijv: 'sales', 'support', 'admin'
  resource: text('resource').notNull(),    // Bijv: 'customers'
  attribute: text('attribute').notNull(),  // Bijv: 'notes', 'email', '*'
  actions: text('actions').notNull(),      // Bijv: 'R', 'CRU', 'CRUD'
});
```

---

## Deel 3: In-Memory ABAC Cache & Middleware (abacEngine.js)
Om te voorkomen dat de database bij elke API-call zwaar wordt belast, worden de permissies in een in-memory Map bewaard en synchroon gevalideerd.

``` javascript 
import { createSelectSchema } from 'drizzle-zod';
import { customers, appPermissions } from './schema.ts';
import { z } from 'zod';

// --- IN-MEMORY CACHE ---
class AbacCache {
  constructor() {
    this.grants = new Map(); // Key: `${role}:${resource}`
  }

  // Herlaad de cache live bij wijzigingen in de Admin GUI
  async reload(db) {
    const records = await db.select().from(appPermissions);
    this.grants.clear();

    for (const row of records) {
      const key = `${row.role}:${row.resource}`;
      if (!this.grants.has(key)) this.grants.set(key, {});
      this.grants.get(key)[row.attribute] = row.actions;
    }
  }

  // Bepaal welke kolommen een rol mag lezen
  getAllowedReadFields(role, resource, allFields) {
    const rules = this.grants.get(`${role}:${resource}`) || {};
    return allFields.filter(field => {
      const actions = rules[field] || rules['*'] || '';
      return actions.includes('R');
    });
  }

  // Bouw dynamisch een Zod-schema voor schrijfrechten (C/U)
  getWriteSchema(role, resource) {
    const rules = this.grants.get(`${role}:${resource}`) || {};
    const baseSchema = createSelectSchema(customers);
    const shape = baseSchema.shape;
    const allowedShape = {};

    for (const [field, schema] of Object.entries(shape)) {
      const actions = rules[field] || rules['*'] || '';
      if (actions.includes('C') || actions.includes('U')) {
        allowedShape[field] = schema;
      }
    }
    return z.object(allowedShape);
  }
}

export const abacCache = new AbacCache();

// --- HONO ABAC MIDDLEWARE ---
export function authorizeAbac(resource) {
  return async (c, next) => {
    const user = c.get('user'); // Geinjecteerd door Better Auth
    const role = user?.role || 'guest';

    // 1. Haal toegestane SQL-selectie kolommen op
    const allCustomerFields = ['id', 'name', 'email', 'notes'];
    const readFields = abacCache.getAllowedReadFields(role, resource, allCustomerFields);

    if (readFields.length === 0) {
      return c.text('Forbidden: Geen toegang tot deze entiteit', 403);
    }

    // 2. Koppel context aan de request
    c.set('abac', {
      readFields,
      writeSchema: abacCache.getWriteSchema(role, resource)
    });

    await next();
  };
}
```
---

## Deel 4: Dynamic Querying & Data Injection (routes.js)
In de controller gebruikt Drizzle de gefilterde lijst om uitsluitend de geautoriseerde kolommen op te vragen.

``` javascript 
import { Hono } from 'hono';
import { authorizeAbac } from './abacEngine.js';
import { db } from './db.js';
import { customers } from './schema.ts';

const app = new Hono();

// GET /customers (Read Projection)
app.get('/customers', authorizeAbac('customers'), async (c) => {
  const { readFields } = c.get('abac');

  // Bouw dynamische Drizzle SQL selectie
  const selectProjection = {};
  readFields.forEach(field => {
    selectProjection[field] = customers[field];
  });

  const result = await db.select(selectProjection).from(customers);
  return c.json(result);
});

// PATCH /customers/:id (Write Validation)
app.patch('/customers/:id', authorizeAbac('customers'), async (c) => {
  const { writeSchema } = c.get('abac');
  const body = await c.req.json();

  // Valideer payload: niet-toegestane velden worden door Zod geweigerd/gestript
  const parseResult = writeSchema.safeParse(body);
  if (!parseResult.success) {
    return c.json({ error: 'Onbevoegde of ongeldige attributen', details: parseResult.error }, 400);
  }

  // Voer update uit met gevalideerde data
  await db.update(customers).set(parseResult.data).where(eq(customers.id, c.req.param('id')));
  return c.json({ success: true });
});
```
---

## Deel 5: Dynamische Aside Menu Rendering (Hono + Alpine.js)
Hono filtert de toegankelijke menu-endpoints op basis van de actieve permissies en levert een JSON-structuur. Alpine.js rendert de Aside-UI client-side.
1. Hono Endpoint (/api/menu)

``` javascript 
app.get('/api/menu', async (c) => {
  const user = c.get('user');
  const role = user?.role || 'guest';

  // Beschikbare applicaties/routes
  const routes = [
    { name: 'Klanten', path: '/customers', resource: 'customers' },
    { name: 'Instellingen', path: '/settings', resource: 'settings' }
  ];

  const allowedMenu = routes.filter(r => {
    const fields = abacCache.getAllowedReadFields(role, r.resource, ['id']);
    return fields.length > 0;
  });

  return c.json(allowedMenu);
});
```

2. Frontend HTML Fragment (aside.html)
``` javascript 
<aside x-data="{ menu: [] }" x-init="menu = await (await fetch('/api/menu')).json()">
  <nav>
    <ul>
      <template x-for="item in menu" :key="item.path">
        <li>
          <a :href="item.path" hx-get="item.path" hx-target="#main-content" x-text="item.name"></a>
        </li>
      </template>
    </ul>
  </nav>
</aside>
```
---

## Deel 6: Live Mermaid.js visualisatie-export
Om het architectuurdiagram live vanuit productie in te zien, genereert Hono op aanvraag een Mermaid ERD-string op basis van de huidige status in app_permissions.
1. Hono Export Endpoint
``` javascript 
app.get('/portal/architecture.mermaid', async (c) => {
  const records = await db.select().from(appPermissions);
  
  let mermaidText = 'erDiagram\n';
  mermaidText += '    Customers {\n';
  mermaidText += '        string id PK "R:all"\n';
  
  // Consolideer permissies per attribuut
  const attrMap = {};
  records.filter(r => r.resource === 'customers').forEach(r => {
    if (!attrMap[r.attribute]) attrMap[r.attribute] = [];
    attrMap[r.attribute].push(`${r.role}:${r.actions}`);
  });

  for (const [attr, roles] of Object.entries(attrMap)) {
    mermaidText += `        string ${attr} "${roles.join(' | ')}"\n`;
  }
  
  mermaidText += '    }\n';

  return c.text(mermaidText);
});
```
2. HTMX + Mermaid.js Viewer Page
``` javascript 
<div id="diagram-container" 
     hx-get="/portal/architecture.mermaid" 
     hx-trigger="load" 
     hx-target="#mermaid-target">
  
  <div id="mermaid-target" class="mermaid">
    <!-- Mermaid String stroomt hier binnen -->
  </div>
</div>

<script src="[https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js](https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js)"></script>
<script>
  mermaid.initialize({ startOnLoad: false, theme: 'neutral' });

  // Herteken het diagram direct nadat HTMX de content vervangt
  document.body.addEventListener('htmx:afterSwap', function(evt) {
    if (evt.detail.target.id === 'mermaid-target') {
      mermaid.run({ nodes: [evt.detail.target] });
    }
  });
</script>
```

---

## Deel 7 : Addendum Generiek

Een generieke opzet met SQLite en drizzle-zod borgt dat de lengterestricties strak op de API-boundary worden afgedwongen, ongeacht de onderliggende database.
Generiek Auth & Role Schema met Lengte-validatie (auth-schema.ts)

``` javascript 
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// ==========================================
// 1. GENERIEKE DRIZZLE TABELLEN (SQLITE)
// ==========================================

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  displayName: text('display_name'),
  roleId: text('role_id').notNull(),
});

export const roles = sqliteTable('roles', {
  id: text('id').primaryKey(), // bijv. 'admin', 'sales'
  name: text('name').notNull(),
  description: text('description'),
});

// ==========================================
// 2. DRIZZLE-ZOD MET STRIPTE VELD-LENGTES
// ==========================================

// Regex patronen voor schone input
const ALPHANUMERIC_UNDERSCORE = /^[a-zA-Z0-9_]+$/;

export const insertUserSchema = createInsertSchema(users, {
  username: (schema) => 
    schema
      .min(3, 'Gebruikersnaam moet minimaal 3 tekens zijn')
      .max(32, 'Gebruikersnaam mag maximaal 32 tekens zijn')
      .regex(ALPHANUMERIC_UNDERSCORE, 'Alleen letters, cijfers en underscores toegestaan'),

  email: (schema) => 
    schema
      .email('Ongeldig e-mailadres')
      .max(255, 'E-mailadres is te lang'),

  displayName: (schema) => 
    schema
      .min(2, 'Weergavenaam moet minimaal 2 tekens zijn')
      .max(50, 'Weergavenaam mag maximaal 50 tekens zijn')
      .optional(),

  roleId: (schema) => 
    schema
      .min(2, 'Rol-ID is te kort')
      .max(24, 'Rol-ID is te lang')
});

export const insertRoleSchema = createInsertSchema(roles, {
  id: (schema) => 
    schema
      .min(2, 'Rol-sleutel moet minimaal 2 tekens zijn')
      .max(24, 'Rol-sleutel mag maximaal 24 tekens zijn')
      .regex(ALPHANUMERIC_UNDERSCORE, 'Rol-sleutel mag geen spaties of speciale tekens bevatten'),

  name: (schema) => 
    schema
      .min(2, 'Rolnaam is verplicht')
      .max(40, 'Rolnaam is te lang'),

  description: (schema) => 
    schema
      .max(200, 'Beschrijving mag maximaal 200 tekens bevatten')
      .optional()
});

// Type export voor TypeScript ondersteuning in de Hono controllers
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertRole = z.infer<typeof insertRoleSchema>;
```
Toepassing in Hono Route (userRoute.ts)
``` javascript 
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { insertUserSchema } from './auth-schema.ts';

const app = new Hono();

// zValidator stopt te lange strings direct bij de voordeur (400 Bad Request)
app.post('/api/users', zValidator('json', insertUserSchema), async (c) => {
  const validatedData = c.req.valid('json'); 
  
  // validatedData heeft gegarandeerd goedgekeurde lengtes
  // ... voeg toe aan Drizzle DB
  return c.json({ success: true });
});
```
Geïntegreerde Limieten
| Veld | Min. Lengte | Max. Lengte | Extra Restrictie |
|---|---|---|---|
| username | 3 tekens | 32 tekens | Geen spaties, alleen a-z, 0-9, _ |
| email | - | 255 tekens | RFC-validatie via Zod |
| displayName | 2 tekens | 50 tekens | Optioneel veld |
| roleId / role.id | 2 tekens | 24 tekens | Vaste sleutel (bijv. sales_manager) |
| role.description | - | 200 tekens | Voorkomt database-cluttering |

---

