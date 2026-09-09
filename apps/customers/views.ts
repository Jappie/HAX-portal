// @ts-nocheck
import type { Customer, Contact, Address, Note } from './data.ts';
import { html, raw } from 'hono/html';

interface BreadcrumbItem {
  label: string;
  path: string;
}

interface SubAsideItem {
  label: string;
  path: string;
  active?: boolean;
}

interface SubAside {
  title: string;
  items: SubAsideItem[];
}

interface ContextAction {
  label: string;
  path?: string;
  class: string;
  action?: string;
}

interface NavigationMeta {
  currentPath: string;
  breadcrumbs: BreadcrumbItem[];
  subAside: SubAside;
  contextActions: ContextAction[];
}

// Helper to generate navigation state script
function getNavStateScript(meta: NavigationMeta) {
  // Use JSON.stringify to create a valid JSON string
  const stateJson = JSON.stringify({
    currentPath: meta.currentPath,
    breadcrumbs: meta.breadcrumbs,
    subAside: meta.subAside,
    contextActions: meta.contextActions
  });
  
  // Use raw() to prevent HTML escaping of the data attribute
  return raw(`<div 
    x-init="$store.navigation.setState(JSON.parse($el.dataset.state))"
    data-state='${stateJson}'
    style="display: none;"
  ></div>`, []);
}

// Helper for context actions
function contextActionsHtml(actions: ContextAction[]) {
  if (actions.length === 0) return '';
  
  return html`<div class="actions" x-data>
    <template x-for="action in $store.navigation.contextActions" x-key="action.label">
      <button 
        x-bind:class="'btn ' + action.class"
        x-text="action.label"
        x-bind:hx-get="action.path"
        hx-target="#main-content"
        x-bind:hx-push-url="action.path"
        x-show="action.path"
      >
      </button>
      <button 
        x-bind:class="'btn ' + action.class"
        x-text="action.label"
        x-on:click="if (action.action === 'submit-form') { document.getElementById('edit-contact-form').requestSubmit(); }"
        x-show="action.action && !action.path"
      >
      </button>
    </template>
  </div>`;
}

// Customers List View
export function CustomersList({ meta, customers }: { meta: NavigationMeta; customers: Customer[] }) {
  const navState = getNavStateScript(meta);
  const actions = contextActionsHtml(meta.contextActions);
  
  const customerItems = customers.map(customer => 
    html`<li style="margin-bottom: 0.75rem;">
      <button 
        class="btn btn-secondary" 
        hx-get="/Customers/${customer.id}" 
        hx-target="#main-content" 
        hx-push-url="/Customers/${customer.id}"
      >
        ${customer.name} (${customer.id})
      </button>
    </li>`
  );

  return html`${navState}
    <h2>Klanten Overzicht</h2>
    <p>Selecteer een klant om het gelaagde menu en de details te zien:</p>
    <ul style="list-style: none; padding: 0;">
      ${customerItems}
      <li style="margin-bottom: 0.75rem;">
        <button 
          class="btn btn-secondary" 
          hx-get="/Customers/123/Contact/356/edit" 
          hx-target="#main-content" 
          hx-push-url="false"
        >
          Aramco - Contact Jenssen Bewerken (Direct Test)
        </button>
      </li>
    </ul>`;
}

// Customer Detail View
export function CustomerDetail({ meta, customer, custId }: { meta: NavigationMeta; customer: Customer | null; custId: string }) {
  const navState = getNavStateScript(meta);
  const actions = contextActionsHtml(meta.contextActions);
  
  if (!customer) {
    return html`${navState}
      <h2>Klant niet gevonden</h2>
      <p>Klant met ID ${custId} bestaat niet.</p>`;
  }

  return html`${navState}
    <div class="content-header">
      <h2>${customer.name}</h2>
      ${actions}
    </div>

    <div style="display: grid; gap: 1rem; max-width: 600px;">
      <div>
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Klant ID:</label>
        <span style="display: block; padding: 0.5rem; background: #f1f5f9; border-radius: 4px;">${custId}</span>
      </div>
      <div>
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Industrie:</label>
        <span style="display: block; padding: 0.5rem; background: #f1f5f9; border-radius: 4px;">${customer.industry || 'N/A'}</span>
      </div>
      <div>
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Locatie:</label>
        <span style="display: block; padding: 0.5rem; background: #f1f5f9; border-radius: 4px;">${customer.location || 'N/A'}</span>
      </div>
    </div>

    <div style="margin-top: 2rem;">
      <h3 style="font-size: 1.125rem; margin-bottom: 1rem;">Snelle Acties</h3>
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
        <button 
          class="btn btn-secondary" 
          hx-get="/Customers/${custId}/Contact" 
          hx-target="#main-content" 
          hx-push-url="/Customers/${custId}/Contact"
        >
          Bekijk Contacten
        </button>
        <button 
          class="btn btn-secondary" 
          hx-get="/Customers/${custId}/Address" 
          hx-target="#main-content" 
          hx-push-url="/Customers/${custId}/Address"
        >
          Bekijk Adressen
        </button>
        <button 
          class="btn btn-secondary" 
          hx-get="/Customers/${custId}/Notes" 
          hx-target="#main-content" 
          hx-push-url="/Customers/${custId}/Notes"
        >
          Bekijk Notities
        </button>
      </div>
    </div>`;
}

// Contacts List View - 
export function ContactsList({ meta, customer, custId, contacts }: { meta: NavigationMeta; customer: Customer | null; custId: string; contacts: Contact[] }) {
  const navState = getNavStateScript(meta);
  const actions = contextActionsHtml(meta.contextActions);
  const customerName = customer ? customer.name : custId;

  if (contacts.length === 0) {
    return html`${navState}
      <div class="content-header">
        <h2>Contacten voor ${customerName}</h2>
        ${actions}
      </div>
      <p>Geen contacten gevonden voor deze klant.</p>`;
  }

  const contactItems = contacts.map(contact => 
    html`<li style="margin-bottom: 0.75rem; padding: 0.75rem; background: #f8fafc; border-radius: 6px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: 600;">${contact.name}</span>
        <div style="display: flex; gap: 0.5rem;">
          <button 
            class="btn btn-secondary" 
            hx-get="/Customers/${custId}/Contact/${contact.id}" 
            hx-target="#main-content" 
            hx-push-url="/Customers/${custId}/Contact/${contact.id}"
          >
            Bekijken
          </button>
          <button 
            class="btn btn-primary" 
            hx-get="/Customers/${custId}/Contact/${contact.id}/edit" 
            hx-target="#main-content" 
            hx-push-url="false"
          >
            Bewerken
          </button>
        </div>
      </div>
      <div style="margin-top: 0.5rem; font-size: 0.875rem; color: #64748b;">
        ${contact.email} | ${contact.phone}
      </div>
    </li>`
  );

  return html`${navState}
    <div class="content-header">
      <h2>Contacten voor ${customerName}</h2>
      ${actions}
    </div>
    <ul style="list-style: none; padding: 0;">
      ${contactItems}
    </ul>`;
}

// Contact Detail View
export function ContactDetail({ meta, customer, custId, contact, contactId }: { meta: NavigationMeta; customer: Customer | null; custId: string; contact: Contact | null; contactId: string }) {
  const navState = getNavStateScript(meta);
  const actions = contextActionsHtml(meta.contextActions);
  
  if (!contact) {
    return html`${navState}
      <h2>Contact niet gevonden</h2>
      <p>Contact met ID ${contactId} bestaat niet.</p>`;
  }

  const customerName = customer ? customer.name : custId;

  return html`${navState}
    <div class="content-header">
      <h2>Contact: ${contact.name}</h2>
      ${actions}
    </div>

    <div style="display: grid; gap: 1rem; max-width: 500px;">
      <div>
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Naam:</label>
        <span style="display: block; padding: 0.5rem; background: #f1f5f9; border-radius: 4px;">${contact.name}</span>
      </div>
      <div>
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Email:</label>
        <span style="display: block; padding: 0.5rem; background: #f1f5f9; border-radius: 4px;">${contact.email || 'N/A'}</span>
      </div>
      <div>
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Telefoon:</label>
        <span style="display: block; padding: 0.5rem; background: #f1f5f9; border-radius: 4px;">${contact.phone || 'N/A'}</span>
      </div>
      <div>
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Klant:</label>
        <span style="display: block; padding: 0.5rem; background: #f1f5f9; border-radius: 4px;">${customerName}</span>
      </div>
    </div>`;
}

// Contact Edit View
export function ContactEdit({ meta, customer, custId, contact, contactId }: { meta: NavigationMeta; customer: Customer | null; custId: string; contact: Contact | null; contactId: string }) {
  const navState = getNavStateScript(meta);
  const actions = contextActionsHtml(meta.contextActions);
  
  const contactName = contact ? contact.name : contactId.split('-')[1] || contactId;
  const customerName = customer ? customer.name : custId.split('-')[1] || custId;

  return html`${navState}
    <div class="content-header">
      <h2>Contact Bewerken: ${contactName}</h2>
      ${actions}
    </div>

    <form id="edit-contact-form" style="display: flex; flex-direction: column; gap: 1rem; max-width: 400px;">
      <div>
        <label style="display: block; margin-bottom: 0.5rem;">Klantnummer / Organisatie:</label>
        <input type="text" defaultValue="${customerName} (${custId})" disabled style="width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px;" />
      </div>
      <div>
        <label style="display: block; margin-bottom: 0.5rem;">Contactpersoon Naam:</label>
        <input type="text" name="contactName" defaultValue="${contact ? contact.name : ''}" style="width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px;" />
      </div>
      <div>
        <label style="display: block; margin-bottom: 0.5rem;">Email:</label>
        <input type="email" name="email" defaultValue="${contact ? contact.email || '' : ''}" style="width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px;" />
      </div>
      <div>
        <label style="display: block; margin-bottom: 0.5rem;">Telefoon:</label>
        <input type="tel" name="phone" defaultValue="${contact ? contact.phone || '' : ''}" style="width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px;" />
      </div>
    </form>`;
}

// Addresses List View
export function AddressesList({ meta, customer, custId, addresses }: { meta: NavigationMeta; customer: Customer | null; custId: string; addresses: Address[] }) {
  const navState = getNavStateScript(meta);
  const actions = contextActionsHtml(meta.contextActions);
  const customerName = customer ? customer.name : custId;

  if (addresses.length === 0) {
    return html`${navState}
      <div class="content-header">
        <h2>Adressen voor ${customerName}</h2>
        ${actions}
      </div>
      <p>Geen adressen gevonden voor deze klant.</p>`;
  }

  const addressItems = addresses.map(address => 
    html`<li style="margin-bottom: 0.75rem; padding: 0.75rem; background: #f8fafc; border-radius: 6px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: 600;">${address.type}: ${address.street}</span>
      </div>
      <div style="margin-top: 0.5rem; font-size: 0.875rem; color: #64748b;">
        ${address.city}, ${address.country}
      </div>
    </li>`
  );

  return html`${navState}
    <div class="content-header">
      <h2>Adressen voor ${customerName}</h2>
      ${actions}
    </div>
    <ul style="list-style: none; padding: 0;">
      ${addressItems}
    </ul>`;
}

// Notes List View
export function NotesList({ meta, customer, custId, notes }: { meta: NavigationMeta; customer: Customer | null; custId: string; notes: Note[] }) {
  const navState = getNavStateScript(meta);
  const actions = contextActionsHtml(meta.contextActions);
  const customerName = customer ? customer.name : custId;

  if (notes.length === 0) {
    return html`${navState}
      <div class="content-header">
        <h2>Notities voor ${customerName}</h2>
        ${actions}
      </div>
      <p>Geen notities gevonden voor deze klant.</p>`;
  }

  const noteItems = notes.map(note => 
    html`<li style="margin-bottom: 0.75rem; padding: 0.75rem; background: #f8fafc; border-radius: 6px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: 600;">${note.content}</span>
      </div>
      <div style="margin-top: 0.5rem; font-size: 0.875rem; color: #64748b;">
        ${note.date} | ${note.author}
      </div>
    </li>`
  );

  return html`${navState}
    <div class="content-header">
      <h2>Notities voor ${customerName}</h2>
      ${actions}
    </div>
    <ul style="list-style: none; padding: 0;">
      ${noteItems}
    </ul>`;
}

// Export as object for compatibility with existing routes
export const customerViews = {
  list: CustomersList,
  detail: CustomerDetail,
  contactsList: ContactsList,
  contactDetail: ContactDetail,
  contactEdit: ContactEdit,
  addressesList: AddressesList,
  notesList: NotesList
};
