import { html, raw } from 'hono/html';

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
  // If path is provided, use Alpine AJAX. The handler must be inserted
  // unescaped: hono/html would otherwise entity-encode the quotes inside the
  // $ajax() expression and Alpine could not evaluate it.
  if (path) {
    const ajaxClick = `$ajax('${path}', { target: '${target}', method: '${method}' })`;
    const clickHandler = onclick ? `${onclick}; ${ajaxClick}` : ajaxClick;
    return html`<button
      type="${type}"
      class="${className}"
      x-on:click="${raw(clickHandler)}"
      ?disabled="${disabled}"
    >${label}</button>`;
  }

  // If onclick is provided without path
  if (onclick) {
    return html`<button
      type="${type}"
      class="${className}"
      x-on:click="${raw(onclick)}"
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
