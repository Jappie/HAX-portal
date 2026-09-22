import { html } from 'hono/html';

export interface CardSeriesProps {
  index: number;
  children: string;
  title?: string;
  indicator?: boolean;
  glow?: boolean;
  class?: string;
}

export const CardSeries = ({ index, children, title, indicator = true, glow = true, class: className = "" }: CardSeriesProps) => {
  const series = (index % 4) + 1;
  const seriesColor = `var(--color-series-${series})`;
  
  return html`
    <div class="ui-card ${glow ? 'ui-glow' : ''} ${className}" 
         style="border-color: color-mix(in srgb, ${seriesColor} 25%, transparent); position: relative; overflow: hidden; --_shadow-color: ${seriesColor}">
      ${glow ? html`<div class="ui-card-bg-glow" style="background-color: ${seriesColor}"></div>` : ''}
      
      <div class="ui-card-label-container" style="position: absolute; top: var(--size-3); left: var(--size-3); display: flex; align-items: center; gap: var(--size-1); max-width: 85%">
        ${indicator ? html`<div class="ui-indicator-dot animate-pulse" style="background-color: ${seriesColor}"></div>` : ''}
        ${title ? html`
          <div class="ui-card-label" style="font-weight: var(--font-weight-7); text-transform: uppercase; font-size: var(--font-size-00); color: var(--text-muted); opacity: 0.9">
            ${title}
          </div>
        ` : ''}
      </div>

      <div class="ui-content">
        ${children}
      </div>
    </div>
  `;
};
