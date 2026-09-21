# Migratie: van HTMX + Alpine naar Alpine AJAX

> **Werk-instructie, geen code.** Dit document beschrijft de beoogde migratie zodat deze
> reviewbaar is terwijl de implementatie lokaal al loopt. Implementatie-PR's refereren aan
> deze stappen. Dit document zelf bevat geen codewijzigingen en kan onafhankelijk van de
> lokale werkbranch gemerged worden.

## Doel

- Eén client-runtime: **Alpine.js** (components, store, JSON-rendering) met **Alpine AJAX**
  als enige transport (partial-detectie, swap, URL/history).
- Weg: HTMX v4, `hx-alpine-compat`, alle `hx-*`-attributen, de `htmx.process()`-brug en
  de `renderSmart`-detected `HX-Request-Type`-header.
- Breadcrumbs/(Sub)Menu/ContextActions blijven **JSON**: het server-contract verandert niet,
  de client behoudt render-vrijheid (lijst ↔ accordeon ↔ chips; opui-restyle is straks een
  zuiver frontend-commit).
- Voorbereiden op restyle met `Jappie/shared` (opui / Open Props): echte links,
  `aria-current="page"` i.p.v. `active`-classes, semantische markup.

## Waarom

De "gevechten" tussen htmx en Alpine zitten op drie plekken:

1. `x-bind:hx-get` + `htmx.process()` in `shared/layout.ts` — Alpine rendert de nav-DOM,
   htmx moet die daarna opnieuw verwerken. Twee frameworks over dezelfde attributen.
2. `<button>` i.p.v. `<a href>` — geen echte navigatie, geen cmd/midden-klik, geen
   degradatie zonder JS.
3. `data-state='${json}'` via `raw()` in een single-quoted attribute — breekt zodra een
   label een `'` of `</` bevat; bovendien een timing-race tussen store-update en
   `htmx.process()`.

## Stappen

### 1. Transport & partial-detectie

- `shared/hax.ts`: partial-detectie op de Alpine AJAX-request-header:

  ```ts
  export const renderSmart = (c: Context, viewHtml: any) => {
    const isAjax = c.req.header('X-Alpine-Request') === 'true';
    return isAjax ? c.html(viewHtml) : c.html(renderLayout({ content: viewHtml }));
  };
  ```

  Alpine AJAX stuurt `X-Alpine-Request: true` mee op elke request (src/index.js,
  request-headers in `send()`); dit vervangt de `HX-Request-Type == 'partial'`-check.

- Scripts in `shared/layout.ts`: `htmx.min.js` en `hx-alpine-compat.js` eruit;
  Alpine AJAX CDN build **vóór** Alpine core (volgorde is verplicht):

  ```html
  <script src=".../alpine-ajax@0.12.6/dist/cdn.js"></script>
  <script src=".../alpinejs@3.x.x/dist/cdn.min.js" defer></script>
  ```

  Liever vendoren via `Jappie/shared` (`/common/js/`), zie stap 5.

### 2. Navigatie-state: JSON blijft, transport wordt veilig

- `getNavStateScript()` (in `apps/portal/views.ts`, `apps/customers/views.ts` en de
  `app.ts`-error/notFound-handlers) verdwijnt.
- Vervanging: JSON in een script-tag, ontsnapt door hono/html zelf (geen `raw()`):

  ```html
  <script type="application/json" id="nav-state">
    { "currentPath": "...", "breadcrumbs": [...], "subAside": {...}, "contextActions": [...] }
  </script>
  ```

- Store in `shared/layout.ts` wordt:

  ```js
  Alpine.store('navigation', {
    currentPath: '', breadcrumbs: [], subAside: {}, contextActions: [],
    load() {
      const s = document.getElementById('nav-state');
      if (s) Object.assign(this, JSON.parse(s.textContent));
    }
  });
  document.addEventListener('ajax:after', () => Alpine.store('navigation').load());
  document.addEventListener('DOMContentLoaded', () => Alpine.store('navigation').load());
  ```

  - `ajax:after` vuurt op window als het triggerende element detached raakt
    (upstream src/index.js:468-470), dus window-listener dekt alles.
  - `setState()` en de vier `htmx.process()`-aanroepen verdwijnen uit de store.
  - Elke JSON is nu veilig (`O'Brien`, `</div>` in labels): geen attribute-parsing meer.

### 3. Navigatie-componenten: echte links

Alle drie de componenten (`shared/components/Breadcrumbs.ts`, `MainAside.ts`, `SubAside.ts`)
en `contextActionsHtml` in `apps/customers/views.ts` volgen hetzelfde patroon:

Voor (htmx):

```html
<button x-bind:hx-get="item.path" hx-target="#main-content" hx-swap="innerHTML"
        x-bind:hx-push-url="item.path" x-bind:class="{active: item.active}"
        x-text="item.label"></button>
```

Na (Alpine AJAX):

```html
<a x-target.push="main-content" :href="item.path"
   :aria-current="$store.navigation.currentPath === item.path ? 'page' : null"
   x-text="item.label"></a>
```

- `x-target.push` = swap + history-push in één attribuut (vervangt `hx-target` +
  `hx-swap` + `hx-push-url`).
- Alpine AJAX leest `href` van de anchor als action (`handleLinks`, src/index.js:157)
  en negeert hash-links zelf — dus breadcrumbs naar `#...` blijven werken.
- `aria-current="page"` is de opui-conventie voor active-state
  (opui `button.css:96`, `list.css:214`); `active`-veld in de JSON kan vervallen,
  `currentPath` volstaat.
- Targets heten zonder `#`: `x-target="main-content"` (id-referentie, geen selector).

### 4. Views & formulieren

- Alle `hx-get`-knoppen in `apps/customers/views.ts` → `<a href + x-target.push>` of
  echte formulieren.
- Contact-edit: `<form method="post" action="..." x-target>` met echte submit-knop;
  de `requestSubmit()`-hack in `contextActionsHtml` vervalt.
- 404/notFound/error-handlers in beide `app.ts`'s: lege state = geen nav-state-script
  renderen (store behoudt vorige waarden) of een lege `nav-state` meesturen — kies één
  en noteer het hier.

### 5. Koppeling met `Jappie/shared` (opui)

- Nav-componenten horen op termijn in `shared/components/ui/` (hono/html +
  Alpine-templates, naar het voorbeeld van `ThemeMenu.template.js`/`Card.js`), zodat
  de opui-restyle één commit in shared is die overal landt.
- Stylesheets uit `shared` (`opui.css`, `os-fonts.css`, `opui-overrides.css`) vervangen
  op termijn de inline `<style>` in `shared/layout.ts`; de `ui-light`/`ui-dark` +
  `$store.os`-body-bind uit `BaseLayout.js` komt daarbij.
- Let op: de `.mobile-layout`-regels in `shared/assets/css/style.css` zijn Mini
  Cloud-tuning (max-width 450px, overflow hidden) — niet zomaar overnemen in het portaal.
- Aandachtspunt voor shared zelf: `shared/layout.js` (v4) bevat nog hetzelfde
  `:hx-get`-patroon; die hoort in dezelfde migratie of vervalt ten gunste van
  `components/layout/BaseLayout.js`.

## Upstream-status van Alpine AJAX

- Upstream (`imacrayon/alpine-ajax`) is stilleker geworden: laatste push maart 2026,
  open PR #164 (aug 2026) en issues #163/#155 zonder reactie.
- Voorgenomen fork-wijzigingen (in voorbereiding, lokaal):
  - **PR #164** (fixes #163): cleanup van `aria-busy` en `RequestCache` bij transport-
    faal (netwerkfout/CORS/offline). Nu blijft `aria-busy` permanent staan en blijft de
    rejected promise in de cache, waardoor een GET naar die URL voor de rest van de
    sessie faalt zonder het netwerk te raken. Te mergen vóórdat de portal de
    loading-states (`aria-busy`) gaat gebruiken.
  - **Issue #155**: GET-formulieren verliezen bestaande query-params uit de action-URL
    (`?messageId=9` + form `limit` → alleen `?limit=50`). Fix: merge `action.search`
    met de form-params (`params.set` per form-key) i.p.v. vervangen.
- De fork dient als CDN-bron in stap 1 zodra die wijzigingen erin zitten.

## Acceptatiecriteria

- [ ] Geen `hx-`-attributen, `htmx`-scripts of `htmx.process()` meer in de codebase.
- [ ] `renderSmart` detecteert partials via `X-Alpine-Request`.
- [ ] Nav-JSON wordt uitsluitend via `<script type="application/json">` getransporteerd;
      geen `raw()` + `data-state` meer.
- [ ] Alle navigatie-elementen zijn `<a href>` met `x-target.push="main-content"`.
- [ ] Active-state via `aria-current="page"`, niet via `active`-class.
- [ ] Klantnaam met apostrof (`O'Brien`) breekt de navigatie niet (regressietest).
- [ ] Back/forward en full refresh renderen de juiste nav-state (store-load op
      `DOMContentLoaded` + `ajax:after`).
- [ ] Zonder JS: navigatie werkt als gewone links (progressive enhancement).
- [ ] `pnpm run typecheck` groen; handmatige smoke-test van alle routes in
      `apps/customers/routes.ts`.
