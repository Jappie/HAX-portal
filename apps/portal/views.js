import { html } from 'hono/html'

export const portalViews = {
  home: ({ meta }) => {
    return html`
      <div x-init='
        $store.navigation.setState(${JSON.stringify(meta)})
      ' style="display:none;"></div>

      <h2>Welkom in de Multi-App Portal</h2>
      <p>Kies een hoofd-applicatie uit de zwarte balk aan de linkerzijde (bijv. <strong>Customers</strong>).</p>
    `
  }
}
