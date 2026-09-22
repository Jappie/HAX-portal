import { html } from 'hono/html';

interface ButtonProps {
  label: string;
  path?: string;
  target?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  type?: 'button' | 'submit' | 'reset';
  class?: string;
  disabled?: boolean;
  onclick?: string;
}

export const Button = ({
  label,
  path = '',
  target = 'main-content',
  method = 'GET',
  type = 'button',
  class: className = 'ui-btn ui-btn-sm',
  disabled = false,
  onclick = ''
}: ButtonProps) => {
  // If path is provided, use Alpine AJAX
  if (path) {
    const ajaxClick = `$ajax('${path}', { target: '${target}', method: '${method}' })`;
    const clickHandler = onclick ? `${onclick}; ${ajaxClick}` : ajaxClick;
    return html`<button
      type="${type}"
      class="${className}"
      x-on:click="${clickHandler}"
      ?disabled="${disabled}"
    >${label}</button>`;
  }
  
  // If onclick is provided without path
  if (onclick) {
    return html`<button
      type="${type}"
      class="${className}"
      x-on:click="${onclick}"
      ?disabled="${disabled}"
    >${label}</button>`;
  }
  
  // Default button
  return html`<button
    type="${type}"
    class="${className}"
    ?disabled="${disabled}"
  >${label}</button>`;
};
