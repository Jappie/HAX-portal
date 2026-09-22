import { html } from 'hono/html';

export interface CardProps {
  title?: string;
  children: string;
  class?: string;
}

export const Card = ({ title, children, class: className = "" }: CardProps) => html`
  <div class="ui-card ${className}">
    ${title ? html`<div class="ui-content">${title}</div>` : ''}
    <div class="p-3">
      ${children}
    </div>
  </div>
`;
