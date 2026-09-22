import { html } from 'hono/html';

export interface CardPlusProps {
  title: string;
  titleHref?: string;
  description: string;
  children: string;
  class?: string;
}

export const CardPlus = ({ title, titleHref, description, children, class: className = "" }: CardPlusProps) => html`
<article class="ui-card-container ${className}" style="display: flex; flex-direction: column; position: relative;">
  
  <div class="ui-card-main ui-outlined ui-glow ui-elevated ui-tonal ui-filled ui-primary" style="display: flex; flex-direction: column; z-index: 2; border-radius: var(--border-radius);">
    ${titleHref 
      ? html`<a href="${titleHref}" class="ui-button h2" style="width: 100%; padding: var(--size-5, 1.25rem); text-decoration: none; display: block;">${title}</a>`
      : html`<button class="ui-button h2" style="width: 100%; padding: var(--size-5, 1.25rem);">${title}</button>`
    }
    
    <div class="ui-card-accordion-triggers" style="display: grid; grid-template-columns: 1fr 1fr; padding-inline: var(--size-5, 1.25rem);">
      <details class="ui-accordion-item" name="card-plus-group">
        <summary class="ui-accordion-trigger" style="padding-block: var(--size-1, 0.25rem); cursor: pointer;">Desc</summary>
      </details>
      <details class="ui-accordion-item" name="card-plus-group">
        <summary class="ui-accordion-trigger" style="display: flex; justify-content: flex-end; padding-block: var(--size-1, 0.25rem); cursor: pointer;">Actions</summary>
      </details>
    </div>
  </div>

  <div class="ui-card-reveal-drawer ui-outlined ui-glow ui-elevated ui-tonal" style="z-index: 1;">
    <div class="ui-content-wrapper" style="padding-inline: var(--size-5, 1.25rem);">
      <div class="ui-content-desc">
        <p style="margin: 0;">${description}</p>
      </div>
      <div class="ui-content-actions">
        <div class="ui-button-group" style="display: flex; justify-content: flex-end; gap: var(--size-2, 0.5rem);">
          ${children}
        </div>
      </div>
    </div>
  </div>

  <style>
    /* Zorg dat de browser de native accordeon-groep begrijpt */
    .ui-accordion-item { margin: 0; padding: 0; }

    /* De Uitklapbak - De visuele lade */
    .ui-card-reveal-drawer {
      background: var(--ui-tonal);
      border-bottom-left-radius: var(--border-radius);
      border-bottom-right-radius: var(--border-radius);
      
      /* Schuif de lade een klein stukje onder de hoofdkaart om de naad te verbergen */
      margin-top: calc(var(--border-radius) * -1); 
      
      /* Animatie via CSS Grid (0fr naar 1fr) */
      display: grid;
      grid-template-rows: 0fr;
      transition: grid-template-rows 0.2s ease, padding 0.2s ease;
    }

    /* Content wrapper zorgt dat padding niet de 0fr hoogte breekt */
    .ui-content-wrapper {
      overflow: hidden;
      display: flex;
      flex-direction: column;
      padding-block: 0;
      transition: padding 0.2s ease;
    }

    /* Verberg de specifieke secties standaard */
    .ui-content-desc, .ui-content-actions { display: none; }

    /* --- CSS :has() Magie voor actieve status --- */

    /* Als de 'Desc' open staat */
    .ui-card-container:has(details:nth-of-type(1)[open]) .ui-card-reveal-drawer {
      grid-template-rows: 1fr;
    }
    .ui-card-container:has(details:nth-of-type(1)[open]) .ui-content-wrapper {
      /* Extra padding-top compenseert voor het feit dat de lade achter de kaart begint */
      padding-top: calc(var(--border-radius) + var(--size-4, 1rem));
      padding-bottom: var(--size-4, 1rem);
    }
    .ui-card-container:has(details:nth-of-type(1)[open]) .ui-content-desc {
      display: block;
    }

    /* Als de 'Actions' open staat */
    .ui-card-container:has(details:nth-of-type(2)[open]) .ui-card-reveal-drawer {
      grid-template-rows: 1fr;
    }
    .ui-card-container:has(details:nth-of-type(2)[open]) .ui-content-wrapper {
      padding-top: calc(var(--border-radius) + var(--size-4, 1rem));
      padding-bottom: var(--size-4, 1rem);
    }
    .ui-card-container:has(details:nth-of-type(2)[open]) .ui-content-actions {
      display: block;
    }
    
    /* Ruim de standaard HTML details-pijltjes op */
    .ui-accordion-trigger::-webkit-details-marker,
    .ui-accordion-trigger::marker {
      display: none;
      content: "";
    }
  </style>
</article>
`;
