// Main Aside component using hono/html for Alpine templates
import { html } from 'hono/html';

export function MainAside() {
  return html`<aside class="main-aside" x-data>
    <template x-for="app in $store.navigation.mainApps" x-key="app.id">
      <button 
        @click="$ajax(app.path, { target: 'main-content', method: 'GET' })"
        x-bind:class="{ 'active': $store.navigation.currentPath.startsWith(app.path) }"
        x-text="app.label"
      ></button>
    </template>
  </aside>`;
}
