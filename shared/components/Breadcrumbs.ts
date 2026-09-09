// Breadcrumbs component using hono/html for Alpine templates
import { html } from 'hono/html';

export function Breadcrumbs() {
  return html`<nav class="breadcrumbs" x-data>
    <template x-for="(item, index) in $store.navigation.breadcrumbs" x-key="item.path">
      <span>
        <template x-if="index > 0"><span class="separator">/</span></template>
        <button 
          x-bind:hx-get="item.path" 
          hx-target="#main-content" 
          hx-swap="innerHTML" 
          x-bind:hx-push-url="item.path"
          x-text="item.label"
        >
      </span>
    </template>
  </nav>`;
}
