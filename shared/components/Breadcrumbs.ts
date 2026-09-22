// Breadcrumbs component using hono/html for Alpine templates
import { html } from 'hono/html';

export function Breadcrumbs() {
  return html`<nav class="breadcrumbs" x-data>
    <template x-for="(item, index) in $store.navigation.breadcrumbs" x-key="item.path">
      <span>
        <template x-if="index > 0"><span class="separator">/</span></template>
        <button 
          @click="$ajax(item.path, { target: 'main-content', method: 'GET' })"
          x-text="item.label"
        ></button>
      </span>
    </template>
  </nav>`;
}
