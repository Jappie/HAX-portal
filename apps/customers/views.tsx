// @ts-nocheck
import type { Customer, Contact, Address, Note } from './data.ts';

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

// Helper component to set navigation state
function NavigationState({ meta }: { meta: NavigationMeta }) {
  return (
    <div 
      x-init={`$store.navigation.setState(${JSON.stringify(meta)})`} 
      style={{ display: 'none' }}
    />
  );
}

// Helper component for context actions
function ContextActions({ actions }: { actions: ContextAction[] }) {
  return (
    <div className="actions" x-data>
      {/* @ts-ignore - Alpine.js template variable */}
      <template x-for="action in $store.navigation.contextActions" x-key="action.label">
        <button 
          className={`btn ${action.class}`} 
          hx-get={action.path}
          hx-target="#main-content"
          hx-push-url={action.path?.includes('/edit') ? 'false' : action.path}
          x-text="action.label"
        />
      </template>
    </div>
  );
}

// Customers List View
export function CustomersList({ meta, customers }: { meta: NavigationMeta; customers: Customer[] }) {
  return (
    <>
      <NavigationState meta={meta} />
      <h2>Klanten Overzicht</h2>
      <p>Selecteer een klant om het gelaagde menu en de details te zien:</p>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {customers.map(customer => (
          <li key={customer.id} style={{ marginBottom: '0.75rem' }}>
            <button 
              className="btn btn-secondary" 
              hx-get={`/Customers/${customer.id}`} 
              hx-target="#main-content" 
              hx-push-url={`/Customers/${customer.id}`}
            >
              {customer.name} ({customer.id})
            </button>
          </li>
        ))}
        <li style={{ marginBottom: '0.75rem' }}>
          <button 
            className="btn btn-secondary" 
            hx-get="/Customers/123/Contact/356/edit" 
            hx-target="#main-content" 
            hx-push-url="false"
          >
            Aramco - Contact Jenssen Bewerken (Direct Test)
          </button>
        </li>
      </ul>
    </>
  );
}

// Customer Detail View
export function CustomerDetail({ meta, customer, custId }: { meta: NavigationMeta; customer: Customer | null; custId: string }) {
  if (!customer) {
    return (
      <>
        <NavigationState meta={meta} />
        <h2>Klant niet gevonden</h2>
        <p>Klant met ID {custId} bestaat niet.</p>
      </>
    );
  }

  return (
    <>
      <NavigationState meta={meta} />
      <div className="content-header">
        <h2>{customer.name}</h2>
        <ContextActions actions={meta.contextActions} />
      </div>

      <div style={{ display: 'grid', gap: '1rem', maxWidth: '600px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Klant ID:</label>
          <span style={{ display: 'block', padding: '0.5rem', background: '#f1f5f9', borderRadius: '4px' }}>{custId}</span>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Industrie:</label>
          <span style={{ display: 'block', padding: '0.5rem', background: '#f1f5f9', borderRadius: '4px' }}>{customer.industry || 'N/A'}</span>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Locatie:</label>
          <span style={{ display: 'block', padding: '0.5rem', background: '#f1f5f9', borderRadius: '4px' }}>{customer.location || 'N/A'}</span>
        </div>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Snelle Acties</h3>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-secondary" 
            hx-get={`/Customers/${custId}/Contact`} 
            hx-target="#main-content" 
            hx-push-url={`/Customers/${custId}/Contact`}
          >
            Bekijk Contacten
          </button>
          <button 
            className="btn btn-secondary" 
            hx-get={`/Customers/${custId}/Address`} 
            hx-target="#main-content" 
            hx-push-url={`/Customers/${custId}/Address`}
          >
            Bekijk Adressen
          </button>
          <button 
            className="btn btn-secondary" 
            hx-get={`/Customers/${custId}/Notes`} 
            hx-target="#main-content" 
            hx-push-url={`/Customers/${custId}/Notes`}
          >
            Bekijk Notities
          </button>
        </div>
      </div>
    </>
  );
}

// Contacts List View
export function ContactsList({ meta, customer, custId, contacts }: { meta: NavigationMeta; customer: Customer | null; custId: string; contacts: Contact[] }) {
  return (
    <>
      <NavigationState meta={meta} />
      <div className="content-header">
        <h2>Contacten voor {customer ? customer.name : custId}</h2>
        <ContextActions actions={meta.contextActions} />
      </div>

      {contacts.length === 0 ? (
        <p>Geen contacten gevonden voor deze klant.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {contacts.map(contact => (
            <li key={contact.id} style={{ marginBottom: '0.75rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600 }}>{contact.name}</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    className="btn btn-secondary" 
                    hx-get={`/Customers/${custId}/Contact/${contact.id}`} 
                    hx-target="#main-content" 
                    hx-push-url={`/Customers/${custId}/Contact/${contact.id}`}
                  >
                    Bekijken
                  </button>
                  <button 
                    className="btn btn-primary" 
                    hx-get={`/Customers/${custId}/Contact/${contact.id}/edit`} 
                    hx-target="#main-content" 
                    hx-push-url="false"
                  >
                    Bewerken
                  </button>
                </div>
              </div>
              <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#64748b' }}>
                {contact.email} | {contact.phone}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

// Contact Detail View
export function ContactDetail({ meta, customer, custId, contact, contactId }: { meta: NavigationMeta; customer: Customer | null; custId: string; contact: Contact | null; contactId: string }) {
  if (!contact) {
    return (
      <>
        <NavigationState meta={meta} />
        <h2>Contact niet gevonden</h2>
        <p>Contact met ID {contactId} bestaat niet.</p>
      </>
    );
  }

  return (
    <>
      <NavigationState meta={meta} />
      <div className="content-header">
        <h2>Contact: {contact.name}</h2>
        <ContextActions actions={meta.contextActions} />
      </div>

      <div style={{ display: 'grid', gap: '1rem', maxWidth: '500px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Naam:</label>
          <span style={{ display: 'block', padding: '0.5rem', background: '#f1f5f9', borderRadius: '4px' }}>{contact.name}</span>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Email:</label>
          <span style={{ display: 'block', padding: '0.5rem', background: '#f1f5f9', borderRadius: '4px' }}>{contact.email || 'N/A'}</span>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Telefoon:</label>
          <span style={{ display: 'block', padding: '0.5rem', background: '#f1f5f9', borderRadius: '4px' }}>{contact.phone || 'N/A'}</span>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Klant:</label>
          <span style={{ display: 'block', padding: '0.5rem', background: '#f1f5f9', borderRadius: '4px' }}>{customer ? customer.name : custId}</span>
        </div>
      </div>
    </>
  );
}

// Contact Edit View
export function ContactEdit({ meta, customer, custId, contact, contactId }: { meta: NavigationMeta; customer: Customer | null; custId: string; contact: Contact | null; contactId: string }) {
  const contactName = contact ? contact.name : contactId.split('-')[1] || contactId;
  const customerName = customer ? customer.name : custId.split('-')[1] || custId;

  return (
    <>
      <NavigationState meta={meta} />
      <div className="content-header">
        <h2>Contact Bewerken: {contactName}</h2>
        <ContextActions actions={meta.contextActions} />
      </div>

      <form id="edit-contact-form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Klantnummer / Organisatie:</label>
          <input type="text" defaultValue={`${customerName} (${custId})`} disabled style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Contactpersoon Naam:</label>
          <input type="text" name="contactName" defaultValue={contact ? contact.name : ''} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email:</label>
          <input type="email" name="email" defaultValue={contact ? contact.email || '' : ''} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Telefoon:</label>
          <input type="tel" name="phone" defaultValue={contact ? contact.phone || '' : ''} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }} />
        </div>
      </form>
    </>
  );
}

// Addresses List View
export function AddressesList({ meta, customer, custId, addresses }: { meta: NavigationMeta; customer: Customer | null; custId: string; addresses: Address[] }) {
  return (
    <>
      <NavigationState meta={meta} />
      <div className="content-header">
        <h2>Adressen voor {customer ? customer.name : custId}</h2>
        <ContextActions actions={meta.contextActions} />
      </div>

      {addresses.length === 0 ? (
        <p>Geen adressen gevonden voor deze klant.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {addresses.map(address => (
            <li key={address.id} style={{ marginBottom: '0.75rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600 }}>{address.type}: {address.street}</span>
              </div>
              <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#64748b' }}>
                {address.city}, {address.country}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

// Notes List View
export function NotesList({ meta, customer, custId, notes }: { meta: NavigationMeta; customer: Customer | null; custId: string; notes: Note[] }) {
  return (
    <>
      <NavigationState meta={meta} />
      <div className="content-header">
        <h2>Notities voor {customer ? customer.name : custId}</h2>
        <ContextActions actions={meta.contextActions} />
      </div>

      {notes.length === 0 ? (
        <p>Geen notities gevonden voor deze klant.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {notes.map(note => (
            <li key={note.id} style={{ marginBottom: '0.75rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600 }}>{note.content}</span>
              </div>
              <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#64748b' }}>
                {note.date} | {note.author}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
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
