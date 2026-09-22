import { html } from 'hono/html';

export interface AnchoredDialogProps {
  id: string;
  xData?: string;
  title?: string;
  children: string;
  actions?: string;
  class?: string;
}

export const AnchoredDialog = ({ id, xData, title, children, actions, class: className = "" }: AnchoredDialogProps) => html`
<dialog 
    id="${id}" 
    class="ui-dialog ui-card ui-elevated ui-outlined ui-tonal ui-primary" 
    ${xData ? html`x-data="${xData}"` : ''}
    style="
      border-radius: var(--os-radius); 
      max-width: 400px; 
      background: var(--surface-default);
      position: fixed;
      position-anchor: --navbar; 
      bottom: anchor(top); 
      margin-bottom: var(--size-2);
      /* Fallback for browsers without CSS Anchor Positioning */
      inset-block-start: auto;
      inset-inline-start: 50%;
      transform: translateX(-50%);
      bottom: 80px;
    "
  >
    ${title ? html`<hgroup><h3>${title}</h3></hgroup>` : ''}
    
    <div class="ui-content">
      ${children}
    </div>

    ${actions ? html`
      <div class="ui-actions ui-align-end">
        ${actions}
      </div>
    ` : ''}
  </dialog>
`;
