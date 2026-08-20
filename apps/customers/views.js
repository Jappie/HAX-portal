import { html } from 'hono/html'

export const customerViews = {
  // Customers List View
  list: ({ meta, customers }) => {
    return html`
      <div x-init='
        $store.navigation.setState(${JSON.stringify(meta)})
      ' style="display:none;"></div>

      <h2>Klanten Overzicht</h2>
      <p>Selecteer een klant om het gelaagde menu en de details te zien:</p>
      <ul style="list-style: none; padding: 0;">
        ${customers.map(customer => html`
          <li style="margin-bottom: 0.75rem;">
            <button class="btn btn-secondary" 
                    hx-get="/Customers/${customer.id}" 
                    hx-target="#main-content" 
                    hx-push-url="/Customers/${customer.id}">
              ${customer.name} (${customer.id})
            </button>
          </li>
        `)}
        <li style="margin-bottom: 0.75rem;">
          <button class="btn btn-secondary" 
                  hx-get="/Customers/123-Aramco/Contact/356-Jenssen/edit" 
                  hx-target="#main-content" 
                  hx-push-url="false">
            Aramco - Contact Jenssen Bewerken (Direct Test)
          </button>
        </li>
      </ul>
    `
  },

  // Customer Detail View
  detail: ({ meta, customer, custId }) => {
    if (!customer) {
      return html`
        <div x-init='
          $store.navigation.setState(${JSON.stringify(meta)})
        ' style="display:none;"></div>
        <h2>Klant niet gevonden</h2>
        <p>Klant met ID ${custId} bestaat niet.</p>
      `
    }

    return html`
      <div x-init='
        $store.navigation.setState(${JSON.stringify(meta)})
      ' style="display:none;"></div>

      <div class="content-header">
        <h2>${customer.name}</h2>
        <div class="actions" x-data>
          <template x-for="action in $store.navigation.contextActions" :key="action.label">
            <button :class="'btn ' + action.class" 
                    :hx-get="action.path" 
                    hx-target="#main-content"
                    :hx-push-url="action.path.includes('/edit') ? 'false' : action.path"
                    x-text="action.label"></button>
          </template>
        </div>
      </div>

      <div style="display: grid; gap: 1rem; max-width: 600px;">
        <div>
          <label style="display:block; margin-bottom: 0.5rem; font-weight: 600;">Klant ID:</label>
          <span style="display: block; padding: 0.5rem; background: #f1f5f9; border-radius: 4px;">${custId}</span>
        </div>
        <div>
          <label style="display:block; margin-bottom: 0.5rem; font-weight: 600;">Industrie:</label>
          <span style="display: block; padding: 0.5rem; background: #f1f5f9; border-radius: 4px;">${customer.industry}</span>
        </div>
        <div>
          <label style="display:block; margin-bottom: 0.5rem; font-weight: 600;">Locatie:</label>
          <span style="display: block; padding: 0.5rem; background: #f1f5f9; border-radius: 4px;">${customer.location}</span>
        </div>
      </div>

      <div style="margin-top: 2rem;">
        <h3 style="font-size: 1.125rem; margin-bottom: 1rem;">Snelle Acties</h3>
        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
          <button class="btn btn-secondary" 
                  hx-get="/Customers/${custId}/Contact" 
                  hx-target="#main-content" 
                  hx-push-url="/Customers/${custId}/Contact">
            Bekijk Contacten
          </button>
          <button class="btn btn-secondary" 
                  hx-get="/Customers/${custId}/Address" 
                  hx-target="#main-content" 
                  hx-push-url="/Customers/${custId}/Address">
            Bekijk Adressen
          </button>
          <button class="btn btn-secondary" 
                  hx-get="/Customers/${custId}/Notes" 
                  hx-target="#main-content" 
                  hx-push-url="/Customers/${custId}/Notes">
            Bekijk Notities
          </button>
        </div>
      </div>
    `
  },

  // Contacts List View
  contactsList: ({ meta, customer, custId, contacts }) => {
    return html`
      <div x-init='
        $store.navigation.setState(${JSON.stringify(meta)})
      ' style="display:none;"></div>

      <div class="content-header">
        <h2>Contacten voor ${customer ? customer.name : custId}</h2>
        <div class="actions" x-data>
          <template x-for="action in $store.navigation.contextActions" :key="action.label">
            <button :class="'btn ' + action.class" 
                    :hx-get="action.path" 
                    hx-target="#main-content"
                    :hx-push-url="action.path.includes('/edit') ? 'false' : action.path"
                    x-text="action.label"></button>
          </template>
        </div>
      </div>

      ${contacts.length === 0 ? html`
        <p>Geen contacten gevonden voor deze klant.</p>
      ` : html`
        <ul style="list-style: none; padding: 0;">
          ${contacts.map(contact => html`
            <li style="margin-bottom: 0.75rem; padding: 0.75rem; background: #f8fafc; border-radius: 6px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: 600;">${contact.name}</span>
                <div style="display: flex; gap: 0.5rem;">
                  <button class="btn btn-secondary" 
                          hx-get="/Customers/${custId}/Contact/${contact.id}" 
                          hx-target="#main-content" 
                          hx-push-url="/Customers/${custId}/Contact/${contact.id}">
                    Bekijken
                  </button>
                  <button class="btn btn-primary" 
                          hx-get="/Customers/${custId}/Contact/${contact.id}/edit" 
                          hx-target="#main-content" 
                          hx-push-url="false">
                    Bewerken
                  </button>
                </div>
              </div>
              <div style="margin-top: 0.5rem; font-size: 0.875rem; color: #64748b;">
                ${contact.email} | ${contact.phone}
              </div>
            </li>
          `)}
        </ul>
      `}
    `
  },

  // Contact Detail View
  contactDetail: ({ meta, customer, custId, contact, contactId }) => {
    if (!contact) {
      return html`
        <div x-init='
          $store.navigation.setState(${JSON.stringify(meta)})
        ' style="display:none;"></div>
        <h2>Contact niet gevonden</h2>
        <p>Contact met ID ${contactId} bestaat niet.</p>
      `
    }

    return html`
      <div x-init='
        $store.navigation.setState(${JSON.stringify(meta)})
      ' style="display:none;"></div>

      <div class="content-header">
        <h2>Contact: ${contact.name}</h2>
        <div class="actions" x-data>
          <template x-for="action in $store.navigation.contextActions" :key="action.label">
            <button :class="'btn ' + action.class" 
                    :hx-get="action.path" 
                    hx-target="#main-content"
                    :hx-push-url="action.path.includes('/edit') ? 'false' : action.path"
                    x-text="action.label"></button>
          </template>
        </div>
      </div>

      <div style="display: grid; gap: 1rem; max-width: 500px;">
        <div>
          <label style="display:block; margin-bottom: 0.5rem; font-weight: 600;">Naam:</label>
          <span style="display: block; padding: 0.5rem; background: #f1f5f9; border-radius: 4px;">${contact.name}</span>
        </div>
        <div>
          <label style="display:block; margin-bottom: 0.5rem; font-weight: 600;">Email:</label>
          <span style="display: block; padding: 0.5rem; background: #f1f5f9; border-radius: 4px;">${contact.email}</span>
        </div>
        <div>
          <label style="display:block; margin-bottom: 0.5rem; font-weight: 600;">Telefoon:</label>
          <span style="display: block; padding: 0.5rem; background: #f1f5f9; border-radius: 4px;">${contact.phone}</span>
        </div>
        <div>
          <label style="display:block; margin-bottom: 0.5rem; font-weight: 600;">Klant:</label>
          <span style="display: block; padding: 0.5rem; background: #f1f5f9; border-radius: 4px;">${customer ? customer.name : custId}</span>
        </div>
      </div>
    `
  },

  // Contact Edit View
  contactEdit: ({ meta, customer, custId, contact, contactId }) => {
    const contactName = contact ? contact.name : contactId.split('-')[1] || contactId
    const customerName = customer ? customer.name : custId.split('-')[1] || custId

    return html`
      <div x-init='
        $store.navigation.setState(${JSON.stringify(meta)})
      ' style="display:none;"></div>

      <div class="content-header">
        <h2>Contact Bewerken: ${contactName}</h2>
        <div class="actions" x-data>
          <template x-for="action in $store.navigation.contextActions" :key="action.label">
            <button :class="'btn ' + action.class" 
                    :hx-get="action.path" 
                    hx-target="#main-content"
                    :hx-push-url="action.path.includes('/edit') ? 'false' : action.path"
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
          <input type="text" name="contactName" value="${contact ? contact.name : ''}" style="width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px;" />
        </div>
        <div>
          <label style="display:block; margin-bottom: 0.5rem;">Email:</label>
          <input type="email" name="email" value="${contact ? contact.email : ''}" style="width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px;" />
        </div>
        <div>
          <label style="display:block; margin-bottom: 0.5rem;">Telefoon:</label>
          <input type="tel" name="phone" value="${contact ? contact.phone : ''}" style="width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px;" />
        </div>
      </form>
    `
  },

  // Addresses List View
  addressesList: ({ meta, customer, custId, addresses }) => {
    return html`
      <div x-init='
        $store.navigation.setState(${JSON.stringify(meta)})
      ' style="display:none;"></div>

      <div class="content-header">
        <h2>Adressen voor ${customer ? customer.name : custId}</h2>
        <div class="actions" x-data>
          <template x-for="action in $store.navigation.contextActions" :key="action.label">
            <button :class="'btn ' + action.class" 
                    :hx-get="action.path" 
                    hx-target="#main-content"
                    :hx-push-url="action.path.includes('/edit') ? 'false' : action.path"
                    x-text="action.label"></button>
          </template>
        </div>
      </div>

      ${addresses.length === 0 ? html`
        <p>Geen adressen gevonden voor deze klant.</p>
      ` : html`
        <ul style="list-style: none; padding: 0;">
          ${addresses.map(address => html`
            <li style="margin-bottom: 0.75rem; padding: 0.75rem; background: #f8fafc; border-radius: 6px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: 600;">${address.type}: ${address.street}</span>
              </div>
              <div style="margin-top: 0.5rem; font-size: 0.875rem; color: #64748b;">
                ${address.city}, ${address.country}
              </div>
            </li>
          `)}
        </ul>
      `}
    `
  },

  // Notes List View
  notesList: ({ meta, customer, custId, notes }) => {
    return html`
      <div x-init='
        $store.navigation.setState(${JSON.stringify(meta)})
      ' style="display:none;"></div>

      <div class="content-header">
        <h2>Notities voor ${customer ? customer.name : custId}</h2>
        <div class="actions" x-data>
          <template x-for="action in $store.navigation.contextActions" :key="action.label">
            <button :class="'btn ' + action.class" 
                    :hx-get="action.path" 
                    hx-target="#main-content"
                    :hx-push-url="action.path.includes('/edit') ? 'false' : action.path"
                    x-text="action.label"></button>
          </template>
        </div>
      </div>

      ${notes.length === 0 ? html`
        <p>Geen notities gevonden voor deze klant.</p>
      ` : html`
        <ul style="list-style: none; padding: 0;">
          ${notes.map(note => html`
            <li style="margin-bottom: 0.75rem; padding: 0.75rem; background: #f8fafc; border-radius: 6px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: 600;">${note.content}</span>
              </div>
              <div style="margin-top: 0.5rem; font-size: 0.875rem; color: #64748b;">
                ${note.date} | ${note.author}
              </div>
            </li>
          `)}
        </ul>
      `}
    `
  }
}
