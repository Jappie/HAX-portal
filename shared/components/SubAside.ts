// Sub Aside component using hono/html for Alpine templates
import { html } from 'hono/html';

export function SubAside() {
  return html`<aside class="sub-aside" x-data x-show="$store.navigation.subAside.items.length > 0">
    <h3 x-text="$store.navigation.subAside.title">Submenu</h3>
    <ul>
      <template x-for="item in $store.navigation.subAside.items" x-key="item.path">
        <li>
          <button 
            x-bind:hx-get="item.path" 
            hx-target="#main-content" 
            hx-swap="innerHTML" 
            x-bind:hx-push-url="item.path"
            x-bind:class="{ 'active': item.active }"
            x-text="item.label"
          ></button>
        </li>
      </template>
    </ul>
  </aside>`;
}
