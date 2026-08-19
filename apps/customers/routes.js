import { Hono } from 'hono'
import { html } from 'hono/html'

const app = new Hono()

// Deep Nested Route Handler: /Customers/:custId/Contact/:contactId/edit
app.get('/:custId/Contact/:contactId/edit', (c) => {
  const custId = c.req.param('custId')       // e.g. '123-Aramco'
  const contactId = c.req.param('contactId') // e.g. '356-Jenssen'

  const customerName = custId.split('-')[1] || custId
  const contactName = contactId.split('-')[1] || contactId

  // Plakkerige / Gelaagde Metadata Structuur voor deze specifieke diepe route
  const meta = {
    currentPath: c.req.path,
    breadcrumbs: [
      { label: 'Customers', path: '/Customers' },
      { label: customerName, path: `/Customers/${custId}` },
      { label: 'Contacten', path: `/Customers/${custId}/Contact` },
      { label: contactName, path: `/Customers/${custId}/Contact/${contactId}` },
      { label: 'Bewerken', path: `/Customers/${custId}/Contact/${contactId}/edit` }
    ],
    subAside: {
      title: `${customerName} Menu`,
      items: [
        { label: 'Algemeen Overzicht', path: `/Customers/${custId}` },
        { label: 'Contacten', path: `/Customers/${custId}/Contact`, active: true },
        { label: 'Adressen', path: `/Customers/${custId}/Address` },
        { label: 'Notities', path: `/Customers/${custId}/Notes` }
      ]
    },
    contextActions: [
      { label: 'Annuleren', path: `/Customers/${custId}/Contact/${contactId}`, class: 'btn-secondary' },
      { label: 'Opslaan', action: 'submit-form', class: 'btn-primary' }
    ]
  }

  // De HTML Partial die Alpine adviseert de $store.navigation live bij te werken
  const content = html`
    <div x-init='
      $store.navigation.setState(${JSON.stringify(meta)})
    ' style="display:none;"></div>

    <div class="content-header">
      <h2>Contact Bewerken: ${contactName}</h2>
      
      <!-- Contextual Action Buttons in Content Header -->
      <div class="actions" x-data>
        <template x-for="action in $store.navigation.contextActions" :key="action.label">
          <button :class="'btn ' + action.class" 
                  :hx-get="action.path" 
                  hx-target="#main-content"
                  x-text="action.label"></button>
        </template>
      </div>
    </div>

    <form id="edit-contact-form" style="display: flex; flex-direction: column; gap: 1rem; max-width: 400px;">
      <div>
        <label style="display:block; margin-bottom: 0.5rem;">Klantnummer / Organisatie:</label>
        <input type="text" value="${customerName} (${custId})" disabled style="width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px;" />
      </div>
      <div>
        <label style="display:block; margin-bottom: 0.5rem;">Contactpersoon Naam:</label>
        <input type="text" name="contactName" value="${contactName}" style="width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px;" />
      </div>
    </form>
  `

  return renderSmart(c, content)
})

// Root Sub-App Overzicht (/Customers)
app.get('/', (c) => {
  const meta = {
    currentPath: '/Customers',
    breadcrumbs: [
      { label: 'Customers', path: '/Customers' }
    ],
    subAside: {
      title: 'Klantbeheer',
      items: [
        { label: 'Alle Klanten', path: '/Customers', active: true },
        { label: 'Nieuwe Klant', path: '/Customers/new' }
      ]
    },
    contextActions: []
  }

  const content = html`
    <div x-init='
      $store.navigation.setState(${JSON.stringify(meta)})
    ' style="display:none;"></div>

    <h2>Klanten Overzicht</h2>
    <p>Selecteer een klant om het gelaagde menu en de details te zien:</p>
    <ul>
      <li>
        <button class="btn btn-secondary" 
                hx-get="/Customers/123-Aramco/Contact/356-Jenssen/edit" 
                hx-target="#main-content" 
                hx-push-url="/Customers/123-Aramco/Contact/356-Jenssen/edit">
          Aramco - Contact Jenssen Bewerken
        </button>
      </li>
    </ul>
  `

  return renderSmart(c, content)
})

export default app
