// ThemeMenu component - renders inside the account dropdown in the header
// Uses hono/html to preserve Alpine.js directives

import { html } from 'hono/html';

export function ThemeMenu() {
  return html`<div class="theme-section">
      <h3>Theme Settings</h3>

      <section>
        <label class="ui-select ui-select-label">
          <span class="ui-label ui-select-title">OS Style</span>
          <span class="ui-field ui-select-field">
            <select x-model="$store.os.theme">
              <option value="ios">iOS</option>
              <option value="windows">Windows</option>
              <option value="gnome">GNOME</option>
              <option value="breeze">KDE Breeze</option>
              <option value="slate">Slate</option>
            </select>
          </span>
        </label>
      </section>

      <section>
        <label class="ui-select ui-select-label">
          <span class="ui-label ui-select-title">Color Palette</span>
          <span class="ui-field ui-select-field">
            <select x-model="$store.os.palette">
              <option value="hard">Hard / Vibrant</option>
              <option value="pastel">Pastels</option>
              <option value="muted">Muted / Earthy</option>
            </select>
          </span>
        </label>
      </section>

      <section>
        <label class="accent-shade-label">Accent Shade</label>
        <div class="color-grid">
          <template x-for="idx in $store.os.colors" x-bind:key="idx">
            <div 
              x-on:click="$store.os.accentIndex = idx" 
              x-bind:class="$store.os.accentIndex === idx ? 'active' : ''" 
              x-bind:style="'background: var(--swatch-' + idx + ')'" 
              class="color-swatch"
            ></div>
          </template>
        </div>
      </section>

      <section>
        <button x-on:click="$store.os.darkMode = !$store.os.darkMode" class="ui-button ui-full" x-text="$store.os.darkMode ? 'Switch to Light' : 'Switch to Dark'"></button>
      </section>
    </div>`;
}
