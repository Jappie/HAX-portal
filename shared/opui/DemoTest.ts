import { html } from 'hono/html';

export interface DemoTestProps {
  decor: string;
  class?: string;
}

export const DemoTest = ({ decor, class: className = "" }: DemoTestProps) => html`
<article class="ui-card ${decor}" style="position: relative; display: flex; flex-direction: column;">
  <button class="ui-button h2" style="width: 100%; padding-block: var(--size-5, 1.25rem);">DemoTest</button>
  <div class="ui-card-accordion-grid" style="anchor-name: --grid-row; padding-inline: var(--size-5, 1.25rem);">
    <details class="ui-accordion-item" name="card-plus" style="margin: 0; padding: 0;">
      <summary class="ui-accordion-trigger" style="margin: 0; padding-block: var(--size-1, 0.25rem);">Desc</summary>
      <div class="ui-fullwidth-reveal-content" style="position: absolute; left: var(--size-5, 1.25rem); right: var(--size-5, 1.25rem); top: anchor(--grid-row bottom); position-anchor: --grid-row;">
        <p> ${decor} </p>
      </div>
    </details>
    <details class="ui-accordion-item" name="card-plus" style="margin: 0; padding: 0;">
      <summary class="ui-accordion-trigger" style="display: flex; justify-content: flex-end; margin: 0; padding-block: var(--size-1, 0.25rem);">Actions</summary>
      <div class="ui-fullwidth-reveal-content" style="position: absolute; left: var(--size-5, 1.25rem); right: var(--size-5, 1.25rem); top: anchor(--grid-row bottom); position-anchor: --grid-row;">
        <div class="ui-button-group" style="display: flex; justify-content: flex-end; gap: var(--size-2, 0.5rem);">
    <button class="ui-button ${decor}">Save</button>
        </div>
      </div>
    </details>
  </div>
  <style>
    .ui-card-accordion-grid { display: grid; grid-template-columns: 1fr 1fr; transition: margin-bottom 0.15s ease; }
    .ui-card-accordion-grid:has(.ui-accordion-item:nth-of-type(1)[open]) { margin-bottom: var(--desc-height, 6.5rem); }
    .ui-card-accordion-grid:has(.ui-accordion-item:nth-of-type(2)[open]) { margin-bottom: var(--actions-height, 3rem); }
  </style>
</article>
<hr class="ui-divider ${decor}"></hr>
<article role="note" class="ui-callout ${decor}">
  <div class="ui-content">
    <h3>Note</h3>
    <p>This is a Callout!</p>
  </div>
</article>
<button
  commandfor="example-dialog-html"
  command="show-modal"
  class="ui-button ${decor}"
>
  Open dialog
</button>

<dialog
  id="example-dialog-html"
  class="ui-dialog ui-card ${decor}"
  role="alertdialog"
  aria-labelledby="dialog-heading"
  aria-modal="true"
>
  <hgroup>
    <h2 id="dialog-heading" class="ui-h4">Are you sure?</h2>
  </hgroup>
  <div class="ui-content">
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus sodales,
    nulla sit amet porttitor rhoncus.
  </div>
  <div class="ui-actions">
    <button
      commandfor="example-dialog-html"
      command="close"
      class="ui-button ${decor}"
      type="button"
    >
      Cancel
    </button>
    <button
      commandfor="example-dialog-html"
      command="close"
      class="ui-button ui-filled"
      type="button"
    >
      Dismiss
    </button>
  </div>
</dialog>
`;
