// Main Aside component using hono/html for Alpine templates
import { html } from 'hono/html';

export function MainAside() {
  return html`<aside class="main-aside" x-data>
    <template x-for="app in $store.navigation.mainApps" x-key="app.id">
      <button 
        x-bind:hx-get="app.path" 
        hx-target="#main-content" 
        hx-swap="innerHTML" 
        x-bind:hx-push-url="app.path"
        x-bind:class="{ 'active': $store.navigation.currentPath.startsWith(app.path) }"
        x-text="app.label"
      >
    </template>
  </aside>`;
}
