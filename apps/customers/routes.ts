import { Hono } from 'hono';
import { renderSmart } from '../../shared/hax.ts';
import { createMenuRoute } from '../../shared/blueprint.ts';
import {
  CustomersList,
  CustomerDetail,
  ContactsList,
  ContactDetail,
  ContactEdit,
  AddressesList,
  NotesList
} from './views.ts';
import { customersData } from './data.ts';
import type { Context } from 'hono';

const routes = new Hono();

// Helper to extract customer ID from param (handles both '123' and '123-Aramco' formats)
function extractCustomerId(custId: string): string {
  return custId.split('-')[0];
}

// Helper to extract display name from param
function extractDisplayName(custId: string): string {
  return custId.split('-')[1] || custId;
}

// Root Sub-App Overzicht (/Customers)
routes.get('/', createMenuRoute({
  menuName: 'Customers',
  isFavorite: true,
  resource: 'customers',
  roles: ['admin', 'sales', 'guest'],
  handler: async (c: Context) => {
    // Inject mock user if better-auth isn't fully active for requests during dev
    if (!c.get('user')) c.set('user', { roleId: 'admin' });

    // Use ABAC engine middleware output if applied
    const customers = await customersData.getAll(c.get('abac')?.readFields);
    
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
    };

    const content = CustomersList({ meta, customers });
    return renderSmart(c, content);
  }
}));

// Customer Detail Route: /Customers/:custId
routes.get('/:custId', async (c: Context) => {
  const custId = c.req.param('custId');
  const customerId = extractCustomerId(custId);
  const customer = await customersData.getById(customerId);
  const customerName = customer ? customer.name : extractDisplayName(custId);

  const meta = {
    currentPath: `/Customers/${custId}`,
    breadcrumbs: [
      { label: 'Customers', path: '/Customers' },
      { label: customerName, path: `/Customers/${custId}` }
    ],
    subAside: {
      title: `${customerName} Menu`,
      items: [
        { label: 'Algemeen Overzicht', path: `/Customers/${custId}`, active: true },
        { label: 'Contacten', path: `/Customers/${custId}/Contact` },
        { label: 'Adressen', path: `/Customers/${custId}/Address` },
        { label: 'Notities', path: `/Customers/${custId}/Notes` }
      ]
    },
    contextActions: [
      { label: 'Bewerken', path: `/Customers/${custId}/edit`, class: 'btn-primary' },
      { label: 'Verwijderen', path: `/Customers/${custId}/delete`, class: 'btn-danger' }
    ]
  };

  const content = CustomerDetail({ meta, customer, custId });
  return renderSmart(c, content);
});

// Customer Contacts List: /Customers/:custId/Contact
routes.get('/:custId/Contact', async (c: Context) => {
  const custId = c.req.param('custId');
  const customerId = extractCustomerId(custId);
  const customer = await customersData.getById(customerId);
  const customerName = customer ? customer.name : extractDisplayName(custId);
  const contacts = await customersData.getContactsByCustomer(custId);

  const meta = {
    currentPath: `/Customers/${custId}/Contact`,
    breadcrumbs: [
      { label: 'Customers', path: '/Customers' },
      { label: customerName, path: `/Customers/${custId}` },
      { label: 'Contacten', path: `/Customers/${custId}/Contact` }
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
      { label: 'Nieuwe Contact', path: `/Customers/${custId}/Contact/new`, class: 'btn-primary' }
    ]
  };

  const content = ContactsList({ meta, customer, custId, contacts });
  return renderSmart(c, content);
});

// Contact Detail: /Customers/:custId/Contact/:contactId
routes.get('/:custId/Contact/:contactId', async (c: Context) => {
  const custId = c.req.param('custId');
  const contactId = c.req.param('contactId');
  const customerId = extractCustomerId(custId);
  const customer = await customersData.getById(customerId);
  const customerName = customer ? customer.name : extractDisplayName(custId);
  const contact = await customersData.getContactById(custId, contactId);
  const contactName = contact ? contact.name : contactId.split('-')[1] || contactId;

  const meta = {
    currentPath: `/Customers/${custId}/Contact/${contactId}`,
    breadcrumbs: [
      { label: 'Customers', path: '/Customers' },
      { label: customerName, path: `/Customers/${custId}` },
      { label: 'Contacten', path: `/Customers/${custId}/Contact` },
      { label: contactName, path: `/Customers/${custId}/Contact/${contactId}` }
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
      { label: 'Bewerken', path: `/Customers/${custId}/Contact/${contactId}/edit`, class: 'btn-primary' },
      { label: 'Verwijderen', path: `/Customers/${custId}/Contact/${contactId}/delete`, class: 'btn-danger' }
    ]
  };

  const content = ContactDetail({ meta, customer, custId, contact, contactId });
  return renderSmart(c, content);
});

// Contact Edit: /Customers/:custId/Contact/:contactId/edit
routes.get('/:custId/Contact/:contactId/edit', async (c: Context) => {
  const custId = c.req.param('custId');
  const contactId = c.req.param('contactId');
  const customerId = extractCustomerId(custId);
  const customer = await customersData.getById(customerId);
  const customerName = customer ? customer.name : extractDisplayName(custId);
  const contact = await customersData.getContactById(custId, contactId);
  const contactName = contact ? contact.name : contactId.split('-')[1] || contactId;

  const meta = {
    currentPath: `/Customers/${custId}/Contact/${contactId}/edit`,
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
  };

  const content = ContactEdit({ meta, customer, custId, contact, contactId });
  return renderSmart(c, content);
});

// Customer Addresses: /Customers/:custId/Address
routes.get('/:custId/Address', async (c: Context) => {
  const custId = c.req.param('custId');
  const customerId = extractCustomerId(custId);
  const customer = await customersData.getById(customerId);
  const customerName = customer ? customer.name : extractDisplayName(custId);
  const addresses = await customersData.getAddressesByCustomer(customerId);

  const meta = {
    currentPath: `/Customers/${custId}/Address`,
    breadcrumbs: [
      { label: 'Customers', path: '/Customers' },
      { label: customerName, path: `/Customers/${custId}` },
      { label: 'Adressen', path: `/Customers/${custId}/Address` }
    ],
    subAside: {
      title: `${customerName} Menu`,
      items: [
        { label: 'Algemeen Overzicht', path: `/Customers/${custId}` },
        { label: 'Contacten', path: `/Customers/${custId}/Contact` },
        { label: 'Adressen', path: `/Customers/${custId}/Address`, active: true },
        { label: 'Notities', path: `/Customers/${custId}/Notes` }
      ]
    },
    contextActions: [
      { label: 'Nieuw Adres', path: `/Customers/${custId}/Address/new`, class: 'btn-primary' }
    ]
  };

  const content = AddressesList({ meta, customer, custId, addresses });
  return renderSmart(c, content);
});

// Customer Notes: /Customers/:custId/Notes
routes.get('/:custId/Notes', async (c: Context) => {
  const custId = c.req.param('custId');
  const customerId = extractCustomerId(custId);
  const customer = await customersData.getById(customerId);
  const customerName = customer ? customer.name : extractDisplayName(custId);
  const notes = await customersData.getNotesByCustomer(customerId);

  const meta = {
    currentPath: `/Customers/${custId}/Notes`,
    breadcrumbs: [
      { label: 'Customers', path: '/Customers' },
      { label: customerName, path: `/Customers/${custId}` },
      { label: 'Notities', path: `/Customers/${custId}/Notes` }
    ],
    subAside: {
      title: `${customerName} Menu`,
      items: [
        { label: 'Algemeen Overzicht', path: `/Customers/${custId}` },
        { label: 'Contacten', path: `/Customers/${custId}/Contact` },
        { label: 'Adressen', path: `/Customers/${custId}/Address` },
        { label: 'Notities', path: `/Customers/${custId}/Notes`, active: true }
      ]
    },
    contextActions: [
      { label: 'Nieuwe Notitie', path: `/Customers/${custId}/Notes/new`, class: 'btn-primary' }
    ]
  };

  const content = NotesList({ meta, customer, custId, notes });
  return renderSmart(c, content);
});

export default routes;
