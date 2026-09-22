// Sub Aside component using hono/html for Alpine templates
import { html } from 'hono/html';

export function SubAside() {
  return html`<aside class="sub-aside" x-data x-show="$store.navigation.subAside.items.length > 0">
    <h3 x-text="$store.navigation.subAside.title">Submenu</h3>
    <ul>
      <template x-for="item in $store.navigation.subAside.items" x-key="item.path">
        <li>
          <button 
            @click="$ajax(item.path, { target: 'main-content', method: 'GET' })"
            x-bind:class="{ 'active': item.active }"
            x-text="item.label"
          ></button>
        </li>
      </template>
    </ul>
  </aside>`;
}
