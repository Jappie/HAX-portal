import { html } from 'hono/html';

export interface AnchoredInputProps {
  id: string;
  title: string;
  description?: string;
  inputLabel: string;
  inputModel: string;
  confirmText: string;
  confirmClasses?: string;
  onConfirmAttr?: string;
  confirmDisabledAttr?: string;
  xData?: string;
  className?: string;
}

export const AnchoredInput = ({ 
  id, 
  title, 
  description, 
  inputLabel, 
  inputModel, 
  confirmText, 
  confirmClasses = "accent",
  onConfirmAttr = "", 
  confirmDisabledAttr = "", 
  xData = "", 
  className = "" 
}: AnchoredInputProps) => html`
  <dialog 
    id="${id}" 
    class="ui-dialog ui-card ui-elevated ${className}" 
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
    <hgroup>
      <h3>${title}</h3>
    </hgroup>

    <div class="ui-content">
      <label class="ui-text-field ui-filled">
        <span class="ui-label">${inputLabel}</span>
        <span class="ui-field">
          <input type="text" x-model="${inputModel}" style="font-family: var(--font-mono)">
        </span>
        ${description ? html`<span class="ui-end-text">${description}</span>` : ''}
      </label>
    </div>

    <div class="ui-actions ui-align-end">
      <button type="button" class="ui-button ui-tonal" onclick="this.closest('dialog').close()">Cancel</button>
      <button type="button" class="ui-button ui-filled ${confirmClasses}" 
        ${html`${confirmDisabledAttr}`}
        ${html`${onConfirmAttr}`}
      >
        ${confirmText}
      </button>
    </div>
  </dialog>
`;
