import { html } from 'hono/html';

export interface CardSeries2Props {
  title: string;
  children: string;
  class?: string;
}

export const CardSeries2 = ({ title, children, class: className = "" }: CardSeries2Props) => html`
<div class="ui-card ui-outlined" style="border-color: color-mix(in srgb, var(--color-series-2) 25%, transparent);">
<div class="ui-content">
      <div class="ui-card-bg-glow" style="background-color: var(--color-series-2)"></div>
      
      <div class="ui-card-label-container">
        <div class="ui-indicator-dot" style="background-color: var(--color-series-2)"></div>
    <div class="ui-card-label">
            ${title}
      </div>       
      </div>
      ${children}
      </div>
    </div>
`;
