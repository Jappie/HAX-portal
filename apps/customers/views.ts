import type { Customer, Contact, Address, Note } from './data.ts';
import { html } from 'hono/html';
import { navStateScript } from '../../shared/hax.ts';
import { Button } from '../../shared/opui/Button.ts';

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

// Helper to generate navigation state as JSON script tag
function getNavStateScript(meta: NavigationMeta) {
  return navStateScript(meta);
}

// Helper for context actions
function contextActionsHtml(actions: ContextAction[]) {
  if (actions.length === 0) return '';
  
  return html`<div class="actions" x-data>
    <template x-for="action in $store.navigation.contextActions" x-key="action.label">
      <span>
        <button 
          x-bind:class="'btn ' + action.class"
          x-text="action.label"
          @click="$ajax(action.path, { target: 'main-content', method: 'GET' })"
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
      </span>
    </template>
  </div>`;
}

// Customer Create/Edit Form View
export function CustomerForm({ meta, customer, custId }: { meta: NavigationMeta; customer: Partial<Customer> | null; custId: string }) {
  const navState = getNavStateScript(meta);
  const actions = contextActionsHtml(meta.contextActions);
  const isEdit = !!customer;
  const formAction = isEdit ? `/Customers/${custId}` : '/Customers';

  return html`${navState}
    <div class="content-header">
      <h2>${isEdit ? `Edit Customer: ${customer!.name}` : 'Nieuwe Klant'}</h2>
      ${actions}
    </div>

    <div class="ui-card ui-outlined ui-elevated ui-tonal" style="max-width: 500px;">
      <div class="ui-content">
        <form method="POST" action="${formAction}" style="display: flex; flex-direction: column; gap: var(--size-3);">
          <div>
            <label style="display: block; margin-bottom: var(--size-2);">Klant ID:</label>
            <input type="text" name="id" defaultValue="${isEdit ? customer!.id || '' : ''}" ${isEdit ? 'disabled' : ''} required style="width: 100%; padding: var(--size-2); border: 1px solid var(--gray-4); border-radius: var(--radius-2);"/>
          </div>
          <div>
            <label style="display: block; margin-bottom: var(--size-2);">Naam:</label>
            <input type="text" name="name" defaultValue="${isEdit ? customer!.name || '' : ''}" required style="width: 100%; padding: var(--size-2); border: 1px solid var(--gray-4); border-radius: var(--radius-2);"/>
          </div>
          <div>
            <label style="display: block; margin-bottom: var(--size-2);">Industrie:</label>
            <input type="text" name="industry" defaultValue="${isEdit ? customer!.industry || '' : ''}" style="width: 100%; padding: var(--size-2); border: 1px solid var(--gray-4); border-radius: var(--radius-2);"/>
          </div>
          <div>
            <label style="display: block; margin-bottom: var(--size-2);">Locatie:</label>
            <input type="text" name="location" defaultValue="${isEdit ? customer!.location || '' : ''}" style="width: 100%; padding: var(--size-2); border: 1px solid var(--gray-4); border-radius: var(--radius-2);"/>
          </div>
          <div style="display: flex; gap: var(--size-2);">
            <button type="submit" class="btn btn-primary">${isEdit ? 'Opslaan' : 'Aanmaken'}</button>
            ${Button({ label: 'Annuleren', path: isEdit ? `/Customers/${custId}` : '/Customers', class: 'btn btn-secondary' })}
          </div>
        </form>
      </div>
    </div>`;
}

// Customers List View
export function CustomersList({ meta, customers }: { meta: NavigationMeta; customers: Partial<Customer>[] }) {
  const navState = getNavStateScript(meta);
  const actions = contextActionsHtml(meta.contextActions);
  
  // Use OPUI CardSeries
  const customerItems = customers.map((customer, index) => 
    html`<div class="ui-card ui-outlined ui-elevated ui-tonal ui-primary mb-4" style="border-color: color-mix(in srgb, var(--color-series-${(index % 4) + 1}) 25%, transparent); --_shadow-color: var(--color-series-${(index % 4) + 1}); position: relative; overflow: hidden;">
      <div class="ui-card-bg-glow" style="background-color: var(--color-series-${(index % 4) + 1});"></div>
      <div class="ui-content" style="position: relative; z-index: 1;">
        <h3 style="margin: 0 0 var(--size-2) 0;">${customer.name}</h3>
        <p style="margin: 0; color: var(--text-muted);">${customer.id} - ${customer.industry || 'N/A'}</p>
        <div style="margin-top: var(--size-3);">
          <button 
            class="btn btn-secondary" 
            @click="$ajax('/Customers/${customer.id}', { target: 'main-content', method: 'GET' })"
          >
            View Details
          </button>
        </div>
      </div>
    </div>`
  );

  return html`${navState}
    <div class="content-header">
      <h2>Customers Overview</h2>
      ${actions}
    </div>
    <p>Select a customer to view layered menu and details:</p>
    <div style="display: grid; gap: var(--size-4);">
      ${customerItems}
    </div>`;
}

// Customer Detail View with OPUI Card
export function CustomerDetail({ meta, customer, custId }: { meta: NavigationMeta; customer: Partial<Customer> | null; custId: string }) {
  const navState = getNavStateScript(meta);
  const actions = contextActionsHtml(meta.contextActions);
  
  if (!customer) {
    return html`${navState}
      <h2>Customer Not Found</h2>
      <p>Customer with ID ${custId} does not exist.</p>`;
  }

  return html`${navState}
    <div class="content-header">
      <h2>${customer.name}</h2>
      ${actions}
    </div>

    <div class="ui-card ui-outlined ui-elevated ui-tonal" style="max-width: 600px; margin-bottom: var(--size-6);">
      <div class="ui-content">
        <div style="display: grid; gap: var(--size-3);">
          <div>
            <label style="display: block; margin-bottom: var(--size-2); font-weight: var(--font-weight-6);">Customer ID:</label>
            <span style="display: block; padding: var(--size-2); background: var(--surface-tonal); border-radius: var(--radius-2);">${custId}</span>
          </div>
          <div>
            <label style="display: block; margin-bottom: var(--size-2); font-weight: var(--font-weight-6);">Industry:</label>
            <span style="display: block; padding: var(--size-2); background: var(--surface-tonal); border-radius: var(--radius-2);">${customer.industry || 'N/A'}</span>
          </div>
          <div>
            <label style="display: block; margin-bottom: var(--size-2); font-weight: var(--font-weight-6);">Location:</label>
            <span style="display: block; padding: var(--size-2); background: var(--surface-tonal); border-radius: var(--radius-2);">${customer.location || 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>

    <div style="margin-top: var(--size-6);">
      <h3 style="font-size: var(--font-size-2); margin-bottom: var(--size-4);">Quick Actions</h3>
      <div style="display: flex; gap: var(--size-2); flex-wrap: wrap;">
        <button 
          class="btn btn-secondary" 
          @click="$ajax('/Customers/${custId}/Contact', { target: 'main-content', method: 'GET' })"
        >
          View Contacts
        </button>
        <button 
          class="btn btn-secondary" 
          @click="$ajax('/Customers/${custId}/Address', { target: 'main-content', method: 'GET' })"
        >
          View Addresses
        </button>
        <button 
          class="btn btn-secondary" 
          @click="$ajax('/Customers/${custId}/Notes', { target: 'main-content', method: 'GET' })"
        >
          View Notes
        </button>
      </div>
    </div>`;
}

// Contacts List View with OPUI CardSeries
export function ContactsList({ meta, customer, custId, contacts }: { meta: NavigationMeta; customer: Partial<Customer> | null; custId: string; contacts: Contact[] }) {
  const navState = getNavStateScript(meta);
  const actions = contextActionsHtml(meta.contextActions);
  const customerName = customer ? customer.name : custId;

  if (contacts.length === 0) {
    return html`${navState}
      <div class="content-header">
        <h2>Contacts for ${customerName}</h2>
        ${actions}
      </div>
      <p>No contacts found for this customer.</p>`;
  }

  const contactItems = contacts.map((contact, index) => 
    html`<div class="ui-card ui-outlined ui-elevated ui-tonal mb-4" style="border-color: color-mix(in srgb, var(--color-series-${(index % 4) + 1}) 25%, transparent); --_shadow-color: var(--color-series-${(index % 4) + 1}); position: relative; overflow: hidden;">
      <div class="ui-card-bg-glow" style="background-color: var(--color-series-${(index % 4) + 1});"></div>
      <div class="ui-content" style="position: relative; z-index: 1; padding: var(--size-3);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--size-2);">
          <span style="font-weight: var(--font-weight-6); font-size: var(--font-size-1);">${contact.name}</span>
        </div>
        <div style="margin-top: var(--size-2); font-size: var(--font-size-0); color: var(--text-muted);">
          ${contact.email} | ${contact.phone}
        </div>
        <div style="margin-top: var(--size-3); display: flex; gap: var(--size-2);">
          <button 
            class="btn btn-secondary" 
            @click="$ajax('/Customers/${custId}/Contact/${contact.id}', { target: 'main-content', method: 'GET' })"
          >
            View
          </button>
          <button 
            class="btn btn-primary" 
            @click="$ajax('/Customers/${custId}/Contact/${contact.id}/edit', { target: 'main-content', method: 'GET', push: false })"
          >
            Edit
          </button>
        </div>
      </div>
    </div>`
  );

  return html`${navState}
    <div class="content-header">
      <h2>Contacts for ${customerName}</h2>
      ${actions}
    </div>
    <div style="display: grid; gap: var(--size-4);">
      ${contactItems}
    </div>`;
}

// Contact Detail View with OPUI Card
export function ContactDetail({ meta, customer, custId, contact, contactId }: { meta: NavigationMeta; customer: Partial<Customer> | null; custId: string; contact: Contact | null; contactId: string }) {
  const navState = getNavStateScript(meta);
  const actions = contextActionsHtml(meta.contextActions);
  
  if (!contact) {
    return html`${navState}
      <h2>Contact Not Found</h2>
      <p>Contact with ID ${contactId} does not exist.</p>`;
  }

  const customerName = customer ? customer.name : custId;

  return html`${navState}
    <div class="content-header">
      <h2>Contact: ${contact.name}</h2>
      ${actions}
    </div>

    <div class="ui-card ui-outlined ui-elevated ui-tonal" style="max-width: 500px;">
      <div class="ui-content">
        <div style="display: grid; gap: var(--size-3);">
          <div>
            <label style="display: block; margin-bottom: var(--size-2); font-weight: var(--font-weight-6);">Name:</label>
            <span style="display: block; padding: var(--size-2); background: var(--surface-tonal); border-radius: var(--radius-2);">${contact.name}</span>
          </div>
          <div>
            <label style="display: block; margin-bottom: var(--size-2); font-weight: var(--font-weight-6);">Email:</label>
            <span style="display: block; padding: var(--size-2); background: var(--surface-tonal); border-radius: var(--radius-2);">${contact.email || 'N/A'}</span>
          </div>
          <div>
            <label style="display: block; margin-bottom: var(--size-2); font-weight: var(--font-weight-6);">Phone:</label>
            <span style="display: block; padding: var(--size-2); background: var(--surface-tonal); border-radius: var(--radius-2);">${contact.phone || 'N/A'}</span>
          </div>
          <div>
            <label style="display: block; margin-bottom: var(--size-2); font-weight: var(--font-weight-6);">Customer:</label>
            <span style="display: block; padding: var(--size-2); background: var(--surface-tonal); border-radius: var(--radius-2);">${customerName}</span>
          </div>
        </div>
      </div>
    </div>`;
}

// Contact Edit View with OPUI Card
export function ContactEdit({ meta, customer, custId, contact, contactId }: { meta: NavigationMeta; customer: Partial<Customer> | null; custId: string; contact: Contact | null; contactId: string }) {
  const navState = getNavStateScript(meta);
  const actions = contextActionsHtml(meta.contextActions);
  
  const contactName = contact ? contact.name : contactId.split('-')[1] || contactId;
  const customerName = customer ? customer.name : custId.split('-')[1] || custId;
  const formAction = contact ? `/Customers/${custId}/Contact/${contactId}` : `/Customers/${custId}/Contact`;

  return html`${navState}
    <div class="content-header">
      <h2>Edit Contact: ${contactName}</h2>
      ${actions}
    </div>

    <div class="ui-card ui-outlined ui-elevated ui-tonal" style="max-width: 400px;">
      <div class="ui-content">
        <form id="edit-contact-form" method="POST" action="${formAction}" style="display: flex; flex-direction: column; gap: var(--size-3);">
          <div>
            <label style="display: block; margin-bottom: var(--size-2);">Customer / Organization:</label>
            <input type="text" defaultValue="${customerName} (${custId})" disabled style="width: 100%; padding: var(--size-2); border: 1px solid var(--gray-4); border-radius: var(--radius-2);"/>
          </div>
          <div>
            <label style="display: block; margin-bottom: var(--size-2);">Contact Name:</label>
            <input type="text" name="contactName" defaultValue="${contact ? contact.name : ''}" style="width: 100%; padding: var(--size-2); border: 1px solid var(--gray-4); border-radius: var(--radius-2);"/>
          </div>
          <div>
            <label style="display: block; margin-bottom: var(--size-2);">Email:</label>
            <input type="email" name="email" defaultValue="${contact ? contact.email || '' : ''}" style="width: 100%; padding: var(--size-2); border: 1px solid var(--gray-4); border-radius: var(--radius-2);"/>
          </div>
          <div>
            <label style="display: block; margin-bottom: var(--size-2);">Phone:</label>
            <input type="tel" name="phone" defaultValue="${contact ? contact.phone || '' : ''}" style="width: 100%; padding: var(--size-2); border: 1px solid var(--gray-4); border-radius: var(--radius-2);"/>
          </div>
          <div>
            <button type="submit" class="btn btn-primary">Opslaan</button>
          </div>
        </form>
      </div>
    </div>`;
}

// Contact New View (reuses ContactEdit with empty contact)
export function ContactNew({ meta, customer, custId }: { meta: NavigationMeta; customer: Partial<Customer> | null; custId: string }) {
  const navState = getNavStateScript(meta);
  const actions = contextActionsHtml(meta.contextActions);
  const customerName = customer ? customer.name : custId.split('-')[1] || custId;

  return html`${navState}
    <div class="content-header">
      <h2>Nieuwe Contact voor ${customerName}</h2>
      ${actions}
    </div>

    <div class="ui-card ui-outlined ui-elevated ui-tonal" style="max-width: 400px;">
      <div class="ui-content">
        <form method="POST" action="/Customers/${custId}/Contact" style="display: flex; flex-direction: column; gap: var(--size-3);">
          <div>
            <label style="display: block; margin-bottom: var(--size-2);">Contact ID:</label>
            <input type="text" name="id" required style="width: 100%; padding: var(--size-2); border: 1px solid var(--gray-4); border-radius: var(--radius-2);"/>
          </div>
          <div>
            <label style="display: block; margin-bottom: var(--size-2);">Contact Name:</label>
            <input type="text" name="contactName" required style="width: 100%; padding: var(--size-2); border: 1px solid var(--gray-4); border-radius: var(--radius-2);"/>
          </div>
          <div>
            <label style="display: block; margin-bottom: var(--size-2);">Email:</label>
            <input type="email" name="email" style="width: 100%; padding: var(--size-2); border: 1px solid var(--gray-4); border-radius: var(--radius-2);"/>
          </div>
          <div>
            <label style="display: block; margin-bottom: var(--size-2);">Phone:</label>
            <input type="tel" name="phone" style="width: 100%; padding: var(--size-2); border: 1px solid var(--gray-4); border-radius: var(--radius-2);"/>
          </div>
          <div>
            <button type="submit" class="btn btn-primary">Aanmaken</button>
          </div>
        </form>
      </div>
    </div>`;
}

// Address New View
export function AddressNew({ meta, customer, custId }: { meta: NavigationMeta; customer: Partial<Customer> | null; custId: string }) {
  const navState = getNavStateScript(meta);
  const actions = contextActionsHtml(meta.contextActions);
  const customerName = customer ? customer.name : custId.split('-')[1] || custId;

  return html`${navState}
    <div class="content-header">
      <h2>Nieuw Adres voor ${customerName}</h2>
      ${actions}
    </div>

    <div class="ui-card ui-outlined ui-elevated ui-tonal" style="max-width: 400px;">
      <div class="ui-content">
        <form method="POST" action="/Customers/${custId}/Address" style="display: flex; flex-direction: column; gap: var(--size-3);">
          <div>
            <label style="display: block; margin-bottom: var(--size-2);">Adres ID:</label>
            <input type="text" name="id" required style="width: 100%; padding: var(--size-2); border: 1px solid var(--gray-4); border-radius: var(--radius-2);"/>
          </div>
          <div>
            <label style="display: block; margin-bottom: var(--size-2);">Type:</label>
            <input type="text" name="type" placeholder="e.g. hoofdkantoor" style="width: 100%; padding: var(--size-2); border: 1px solid var(--gray-4); border-radius: var(--radius-2);"/>
          </div>
          <div>
            <label style="display: block; margin-bottom: var(--size-2);">Straat:</label>
            <input type="text" name="street" style="width: 100%; padding: var(--size-2); border: 1px solid var(--gray-4); border-radius: var(--radius-2);"/>
          </div>
          <div>
            <label style="display: block; margin-bottom: var(--size-2);">Stad:</label>
            <input type="text" name="city" style="width: 100%; padding: var(--size-2); border: 1px solid var(--gray-4); border-radius: var(--radius-2);"/>
          </div>
          <div>
            <label style="display: block; margin-bottom: var(--size-2);">Land:</label>
            <input type="text" name="country" style="width: 100%; padding: var(--size-2); border: 1px solid var(--gray-4); border-radius: var(--radius-2);"/>
          </div>
          <div>
            <button type="submit" class="btn btn-primary">Aanmaken</button>
          </div>
        </form>
      </div>
    </div>`;
}

// Note New View
export function NoteNew({ meta, customer, custId }: { meta: NavigationMeta; customer: Partial<Customer> | null; custId: string }) {
  const navState = getNavStateScript(meta);
  const actions = contextActionsHtml(meta.contextActions);
  const customerName = customer ? customer.name : custId.split('-')[1] || custId;

  return html`${navState}
    <div class="content-header">
      <h2>Nieuwe Notitie voor ${customerName}</h2>
      ${actions}
    </div>

    <div class="ui-card ui-outlined ui-elevated ui-tonal" style="max-width: 400px;">
      <div class="ui-content">
        <form method="POST" action="/Customers/${custId}/Notes" style="display: flex; flex-direction: column; gap: var(--size-3);">
          <div>
            <label style="display: block; margin-bottom: var(--size-2);">Notitie:</label>
            <textarea name="content" required rows="4" style="width: 100%; padding: var(--size-2); border: 1px solid var(--gray-4); border-radius: var(--radius-2);"></textarea>
          </div>
          <div>
            <button type="submit" class="btn btn-primary">Aanmaken</button>
          </div>
        </form>
      </div>
    </div>`;
}

// Addresses List View with OPUI CardSeries
export function AddressesList({ meta, customer, custId, addresses }: { meta: NavigationMeta; customer: Partial<Customer> | null; custId: string; addresses: Address[] }) {
  const navState = getNavStateScript(meta);
  const actions = contextActionsHtml(meta.contextActions);
  const customerName = customer ? customer.name : custId;

  if (addresses.length === 0) {
    return html`${navState}
      <div class="content-header">
        <h2>Addresses for ${customerName}</h2>
        ${actions}
      </div>
      <p>No addresses found for this customer.</p>`;
  }

  const addressItems = addresses.map((address, index) => 
    html`<div class="ui-card ui-outlined ui-elevated ui-tonal mb-4" style="border-color: color-mix(in srgb, var(--color-series-${(index % 4) + 1}) 25%, transparent); --_shadow-color: var(--color-series-${(index % 4) + 1}); position: relative; overflow: hidden;">
      <div class="ui-card-bg-glow" style="background-color: var(--color-series-${(index % 4) + 1});"></div>
      <div class="ui-content" style="position: relative; z-index: 1; padding: var(--size-3);">
        <div style="font-weight: var(--font-weight-6); margin-bottom: var(--size-2);">${address.type || 'Address'}: ${address.street}</div>
        <div style="font-size: var(--font-size-0); color: var(--text-muted);">
          ${address.city}, ${address.country}
        </div>
      </div>
    </div>`
  );

  return html`${navState}
    <div class="content-header">
      <h2>Addresses for ${customerName}</h2>
      ${actions}
    </div>
    <div style="display: grid; gap: var(--size-4);">
      ${addressItems}
    </div>`;
}

// Notes List View with OPUI CardSeries
export function NotesList({ meta, customer, custId, notes }: { meta: NavigationMeta; customer: Partial<Customer> | null; custId: string; notes: Note[] }) {
  const navState = getNavStateScript(meta);
  const actions = contextActionsHtml(meta.contextActions);
  const customerName = customer ? customer.name : custId;

  if (notes.length === 0) {
    return html`${navState}
      <div class="content-header">
        <h2>Notes for ${customerName}</h2>
        ${actions}
      </div>
      <p>No notes found for this customer.</p>`;
  }

  const noteItems = notes.map((note, index) => 
    html`<div class="ui-card ui-outlined ui-elevated ui-tonal mb-4" style="border-color: color-mix(in srgb, var(--color-series-${(index % 4) + 1}) 25%, transparent); --_shadow-color: var(--color-series-${(index % 4) + 1}); position: relative; overflow: hidden;">
      <div class="ui-card-bg-glow" style="background-color: var(--color-series-${(index % 4) + 1});"></div>
      <div class="ui-content" style="position: relative; z-index: 1; padding: var(--size-3);">
        <div style="font-weight: var(--font-weight-6); margin-bottom: var(--size-2);">${note.content}</div>
        <div style="font-size: var(--font-size-0); color: var(--text-muted);">
          ${note.date} | ${note.author}
        </div>
      </div>
    </div>`
  );

  return html`${navState}
    <div class="content-header">
      <h2>Notes for ${customerName}</h2>
      ${actions}
    </div>
    <div style="display: grid; gap: var(--size-4);">
      ${noteItems}
    </div>`;
}

// Export as object for compatibility with existing routes
export const customerViews = {
  list: CustomersList,
  detail: CustomerDetail,
  form: CustomerForm,
  contactsList: ContactsList,
  contactDetail: ContactDetail,
  contactEdit: ContactEdit,
  contactNew: ContactNew,
  addressNew: AddressNew,
  addressesList: AddressesList,
  noteNew: NoteNew,
  notesList: NotesList
};
