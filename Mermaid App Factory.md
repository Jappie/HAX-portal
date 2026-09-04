

# Dynamische Menu-generatie & Architectuur met Hono, Drizzle en Mermaid

---
## Deel 1: De basis van `app.routes` in Hono

In Hono bevat de array `app.routes` een lijst met objecten die de geregistreerde endpoints en middleware beschrijven. Elk route-object bevat exact drie attributen:

*   **`path`** (type: `string`) - Het geregistreerde URL-patroon (bijv. `/api/users/:id`).
*   **`method`** (type: `string`) - De HTTP-methode in hoofdletters (zoals `GET`, `POST`).
*   **`handler`** (type: `Function`) - De daadwerkelijke JavaScript-functie die wordt uitgevoerd.

Omdat `app.routes` in Hono **read-only** is, kun je hier bij de declaratie niet zomaar custom metadata aan meegeven.

---
## Deel 2: Metadata koppelen via een Blueprint Factory (Vanilla JS + Zod)
De meest elegante manier om extra eigenschappen (zoals een `menuName`, `roles` voor autorisatie, en een `isFavorite` vlag) mee te geven zonder build-stap, is door de metadata **direct aan de handler-functie zelf te koppelen**. JavaScript ondersteunt functies als objecten, dus dit kan native.

Bij het opstarten gebruiken we **Zod** om deze properties te valideren. Als bij ontwikkeling een attribuut vergeten is, stopt de applicatie direct met een duidelijke foutmelding in de terminal.

### Volledig Script (`app.js`)
```javascript
import { Hono } from 'hono'
import { z } from 'zod'

const app = new Hono()

// ========================================
// 1. DEFINIEER HET ZOD SCHEMA (DE BLUEPRINT)
// ========================================
const RouteMetadataSchema = z.object({
   // Moet exact 'true' zijn als vlag
   showInMenu: z.literal(true), 
   menuName: z.string().min(1, "MenuName mag niet leeg zijn"),
   // Moet een array van strings zijn
   roles: z.array(z.string()).default([]), 
   // Moet een boolean zijn
   isFavorite: z.boolean().default(false)  
})

// ==========================================
// 2. THE FACTORY FUNCTIE
// ==========================================
function createMenuRoute(config) {
  const fn = config.handler

  // Plak de metadata direct op de handler-functie
  fn.menuName = config.menuName
  fn.roles = config.roles || []
  fn.isFavorite = config.isFavorite || false
  fn.showInMenu = true 

  return fn
}

// ==========================================
// 3. ROUTES DECLAREREN MET METADATA
// ==========================================

// Dashboard is voor iedereen en een favoriet
app.get('/dashboard', createMenuRoute({
  menuName: 'Dashboard',
  isFavorite: true,
  handler: (c) => c.text('Welkom op het dashboard')
}))

// Gebruikersbeheer is alleen voor Admins
app.get('/users', createMenuRoute({
  menuName: 'Gebruiker',
  roles: ['admin'], 
  handler: (c) => c.text('Gebruikerslijst')
}))

// Instellingen is voor Admins en Managers, en is een favoriet
app.get('/settings', createMenuRoute({
  menuName: 'Instellingen',
  roles: ['admin', 'manager'],
  isFavorite: true,
  handler: (c) => c.text('Instellingenpaneel')
}))

// Een normale API-route (zonder createMenuRoute, wordt overgeslagen in het menu)
app.post('/api/data', (c) => c.text('Data opgeslagen'))

// ==========================================
// 4. RUNTIME VALIDATIE MET ZOD BIJ OPSTARTEN
// ==========================================
function validateRoutesWithZod(honoApp) {
  let hasErrors = false

  console.log('🔍 Route validatie starten...')

  honoApp.routes.forEach((route) => {
    // We controleren alleen GET routes die bedoeld zijn voor het menu
    if (route.method === 'GET' && route.handler.showInMenu) {
      
      // Valideer de handler-properties tegen ons Zod schema
      const result = RouteMetadataSchema.safeParse(route.handler)

      if (!result.success) {
        hasErrors = true
        console.error(`\n❌ Validatiefout op route: [GET] ${route.path}`)
        
        result.error.issues.forEach((issue) => {
          console.error(`   -> Eigenschap '${issue.path.join('.')}' : ${issue.message}`)
        })
      }
    }
  })

  if (hasErrors) {
    console.error('\n🚨 Applicatie start gestopt: Los de bovenstaande route-fouten op.')
    process.exit(1) // Forceer een crash bij het opstarten
  } else {
    console.log('✅ Alle menu-routes succesvol gevalideerd met Zod.');
  }
}

// Start de controle direct synchroon bij het laden van het script
validateRoutesWithZod(app)

// ==========================================
// 5. ASIDE MENU DYNAMISCH GENEREREN
// ==========================================
function generateAsideMenu(currentUserRole) {
  return app.routes
    .filter((route) => {
      const handler = route.handler
      if (route.method !== 'GET' || !handler.showInMenu) return false
      if (handler.roles.length > 0 && !handler.roles.includes(currentUserRole)) return false
      return true
    })
    .map((route) => ({
      path: route.path,
      name: route.handler.menuName,
      isFavorite: route.handler.isFavorite
    }))
    .sort((a, b) => b.isFavorite - a.isFavorite) // Favorieten bovenaan
}
```
---
## Deel 3: De geoptimaliseerde Workflow (Mermaid as Code)
Voor een oudere NAS moet de server zo min mogelijk werk verrichten. In plaats van zware parsers op de NAS te draaien, gebruiken we een **buildless generator-concept via Git en de Dev-Env**.
### De Workflow
1. Maak/Wijzigt de architectuur in een `blueprint.md` bestand via **Mermaid.js**.
2. In Dev-Env draai een flinterdun RegEx-script dat de Markdown leest en omzet naar een statisch `blueprint.js` JavaScript-object.
3. Dit object wordt via Git naar de NAS gepusht. De NAS leest direct het pure JS-object in. 
**0% CPU/RAM overhead op de NAS.**

### De Bron (`blueprint.md`)
# Applicatie Blueprint.

``` mermaid
erDiagram
    Dashboard {
        string menuName "Dashboard"
        boolean isFavorite true
        string roles "all"
    }
    Users {
        integer id "PK"
        string name "required"
        string menuName "Gebruikers"
        string roles "admin"
    }
    Orders {
        integer id "PK"
        float total "required"
        integer user_id "FK"
        string menuName "Bestellingen"
        string roles "admin,manager"
    }
```

### Het Lokale Conversie Script (`generate-blueprint.js`)

``` javascript
import fs from 'fs';

const markdown = fs.readFileSync('blueprint.md', 'utf8');
const tableRegex = /(\w+)\s*\{\s*([\s\S]*?)\}/g;
const appConfig = {};

let match;
while ((match = tableRegex.exec(markdown)) !== null) {
  const tableName = match[1];
  const propertiesRaw = match[2].split('\n');
  
  appConfig[tableName] = {};

  propertiesRaw.forEach(line => {
    const metaMatch = line.match(/(\w+)\s+"?([^"\n]+)"?/);
    if (metaMatch) {
      const key = metaMatch[1];
      let value = metaMatch[2];
      
      if (value === 'true') value = true;
      if (value === 'false') value = false;
      
      appConfig[tableName][key] = value;
    }
  });
}

const outputCode = `// GEGENEREERD - NIET HANDMATIG WIJZIGEN\nexport const appConfig = ${JSON.stringify(appConfig, null, 2)};`;
fs.writeFileSync('blueprint.js', outputCode);
console.log('✅ blueprint.js gegenereerd voor deployment!');

```

---
## Deel 4: De overkoepelende Portal (Drizzle & Externe API's)
Als je meerdere apps inlaadt in één centrale Hono Portal (`mainPortal.route('/', app)`), wil je de rollen en permissies joinen in **Drizzle ORM**. 

Voor SQLite op een NAS is de meest efficiënte methode om **één SQLite-database** te gebruiken, waarbij de tabellen van de sub-apps gescheiden worden met een prefix (`app1_`, `app2_`). Dit houdt de RAM footprint minimaal.

Als een sub-app geen database heeft maar een **verzameling externe API's** is, verandert er in de database niets. De Portal houdt in de tabel `portal_user_roles` simpelweg de `appKey` bij. Hono fungeert dan als een CORS-vrije **BFF (Backend-for-Frontend)** die data ophaalt via `fetch`, eventueel cached, en via **HTMX** als HTML terugstroomt.

### Het Centrale Drizzle Schema & Portal Logiek (`portal.js`)

```javascript
import { sqliteTable, integer, text, primaryKey } from 'drizzle-orm/sqlite-core';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'sqlite3';
import { Hono } from 'hono';
import { eq } from 'drizzle-orm';

// --- 1. DRIZZLE DATABASE SCHEMA ---
export const portalUsers = sqliteTable('portal_users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
});

export const portalUserRoles = sqliteTable('portal_user_roles', {
  userId: integer('user_id').notNull().references(() => portalUsers.id),
  appKey: text('app_key').notNull(), // Bijv: '/users' of 'ExternalWeatherApp'
  role: text('role').notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.appKey] }),
}));

// --- 2. PORTAL DATABASE CLIENT ---
const sqlite = new Database('portal.db');
const db = drizzle(sqlite);

// --- 3. HONO PORTAL CONTROLLER ---
const mainPortal = new Hono();

// Helper om rechten op te halen
async function getAuthorizedAppsForUser(userId) {
  return await db
    .select({ appKey: portalUserRoles.appKey, role: portalUserRoles.role })
    .from(portalUserRoles)
    .where(eq(portalUserRoles.userId, userId));
}

// Dynamische menu-route voor het Aside Menu (HTMX + Alpine)
mainPortal.get('/portal-menu', async (c) => {
  const sessionUser = c.get('user'); // Verkregen uit sessie/auth middleware
  const permissions = await getAuthorizedAppsForUser(sessionUser.id);

const allowedKeys = permissions.map(p => p.appKey);
const menu = mainPortal.routes
.filter((route) => route.method === 'GET' && allowedKeys.includes(route.path))
.map((route) => {
const userPermission = permissions.find(p => p.appKey === route.path);
return {
path: route.path,
name: route.handler.menuName || route.path,
userRoleInApp: userPermission.role
};
});
return c.json(menu);
});
```
------------------------------
## Deel 5: Client-Side Mermaid Rendering (0% NAS Belasting)
Om te voorkomen dat de NAS diagrammen moet omzetten naar afbeeldingen (zoals JPEG), verplaatsen we het tekenwerk volledig naar de browser van de eindgebruiker met de client-side library van Mermaid.js. De NAS stuurt pure tekst (een SVG-blueprint string), en de browser tekent er direct een haarscherpe vector-afbeelding (SVG) van.
Dit integreert feilloos met HTMX door te luisteren naar het htmx:afterSwap event.
## Frontend Implementatie (layout.html)
```html




Portal Dashboard
Applicatie Architectuur
erDiagram
Users ||--o{ Orders : "places"
Users { string menuName "Gebruikers" }

// Initialiseer Mermaid zonder auto-load
mermaid.initialize({
startOnLoad: false,
theme: 'neutral'
});
// Zodra HTMX nieuwe content in de DOM swapt, activeert dit script
// Mermaid om de nieuwe '.mermaid' elementen om te toveren tot SVG's.
document.body.addEventListener('htmx:afterSwap', function(evt) {
mermaid.run({
nodes: document.querySelectorAll('.mermaid')
});
});
// Eerste run voor de elementen die al op de pagina stonden bij harde refresh
mermaid.run({ nodes: document.querySelectorAll('.mermaid') });


```

---

Op deze manier blijft je hele stack—van database-definities via Mermaid-blueprints tot de frontend rendering met HTMX en Alpine—extreem flexibel, onderhoudbaar door een LLM-agent, en draait het soepel binnen de strakke hardwaregrenzen van een oudere NAS.
