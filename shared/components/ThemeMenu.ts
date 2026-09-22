// ThemeMenu component - same pattern as Breadcrumbs, MainAside, SubAside
// Uses hono/html to preserve Alpine.js directives

import { html } from 'hono/html';

export function ThemeMenu() {
  return html`<div>
    <!-- Settings Backdrop -->
    <div 
      x-show="$store.os.menuOpen" 
      class="settings-backdrop" 
      x-transition:enter-start="opacity-0" 
      x-on:click="$store.os.menuOpen = false"
      style="display: none"
    ></div>

    <!-- Settings Panel -->
    <div 
      class="settings-panel ui-card ui-outlined ui-elevated" 
      x-show="$store.os.menuOpen" 
      style="display: none"
      x-transition:enter="transition ease-out duration-300" 
      x-transition:enter-start="opacity-0 translate-y-8" 
      x-transition:enter-end="opacity-100 translate-y-0"
      x-transition:leave="transition ease-in duration-200"
      x-transition:leave-start="opacity-100 translate-y-0"
      x-transition:leave-end="opacity-0 translate-y-8"
    >
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
    </div>
  </div>`;
}
