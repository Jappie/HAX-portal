import { Hono } from 'hono';
import { renderSmart } from '../../shared/hax.ts';
import { createMenuRoute } from '../../shared/blueprint.ts';
import {
  CustomersList,
  CustomerDetail,
  CustomerForm,
  ContactsList,
  ContactDetail,
  ContactEdit,
  ContactNew,
  AddressNew,
  AddressesList,
  NoteNew,
  NotesList
} from './views.ts';
import { customersData } from './data.ts';
import { requirePermission } from '../../shared/access.ts';
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
  roles: ['admin', 'user', 'guest'],
  handler: async (c: Context) => {
    // Field projection comes from the better-auth access middleware
    const user = c.get('user');
    const customers = await customersData.getAll(c.get('abac')?.readFields ?? (user ? ['id', 'name', 'industry', 'location'] : []));
    
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

// Customer Create Form: /Customers/new
routes.get('/new', requirePermission('customers', 'id', 'create'), async (c: Context) => {
  const meta = {
    currentPath: '/Customers/new',
    breadcrumbs: [
      { label: 'Customers', path: '/Customers' },
      { label: 'Nieuwe Klant', path: '/Customers/new' }
    ],
    subAside: {
      title: 'Klantbeheer',
      items: [
        { label: 'Alle Klanten', path: '/Customers' },
        { label: 'Nieuwe Klant', path: '/Customers/new', active: true }
      ]
    },
    contextActions: []
  };

  const content = CustomerForm({ meta, customer: null, custId: '' });
  return renderSmart(c, content);
});

// Customer Create Handler
routes.post('/', requirePermission('customers', 'id', 'create'), async (c: Context) => {
  try {
    const form = await c.req.formData();
    const id = (form.get('id') as string || '').trim();
    const name = (form.get('name') as string || '').trim();
    if (!id || !name) {
      return c.redirect('/Customers/new');
    }
    await customersData.createCustomer({
      id,
      name,
      industry: (form.get('industry') as string || '').trim() || undefined,
      location: (form.get('location') as string || '').trim() || undefined
    });
    return c.redirect(`/Customers/${id}`);
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
});

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

// Customer Edit Form: /Customers/:custId/edit
routes.get('/:custId/edit', requirePermission('customers', 'id', 'update'), async (c: Context) => {
  const custId = c.req.param('custId');
  const customerId = extractCustomerId(custId);
  const customer = await customersData.getById(customerId);
  const customerName = customer ? customer.name : extractDisplayName(custId);

  const meta = {
    currentPath: `/Customers/${custId}/edit`,
    breadcrumbs: [
      { label: 'Customers', path: '/Customers' },
      { label: customerName, path: `/Customers/${custId}` },
      { label: 'Bewerken', path: `/Customers/${custId}/edit` }
    ],
    subAside: {
      title: `${customerName} Menu`,
      items: [
        { label: 'Algemeen Overzicht', path: `/Customers/${custId}` },
        { label: 'Contacten', path: `/Customers/${custId}/Contact` },
        { label: 'Adressen', path: `/Customers/${custId}/Address` },
        { label: 'Notities', path: `/Customers/${custId}/Notes` }
      ]
    },
    contextActions: []
  };

  const content = CustomerForm({ meta, customer, custId });
  return renderSmart(c, content);
});

// Customer Update Handler
routes.post('/:custId', requirePermission('customers', 'id', 'update'), async (c: Context) => {
  try {
    const custId = c.req.param('custId');
    const customerId = extractCustomerId(custId);
    const form = await c.req.formData();
    const name = (form.get('name') as string || '').trim();
    if (!name) {
      return c.redirect(`/Customers/${custId}/edit`);
    }
    await customersData.updateCustomer(customerId, {
      name,
      industry: (form.get('industry') as string || '').trim() || undefined,
      location: (form.get('location') as string || '').trim() || undefined
    });
    return c.redirect(`/Customers/${custId}`);
  } catch (error) {
    console.error('Error updating customer:', error);
    throw error;
  }
});

// Customer Delete Handler
routes.post('/:custId/delete', requirePermission('customers', 'id', 'delete'), async (c: Context) => {
  try {
    const custId = c.req.param('custId');
    const customerId = extractCustomerId(custId);
    await customersData.deleteCustomer(customerId);
    return c.redirect('/Customers');
  } catch (error) {
    console.error('Error deleting customer:', error);
    throw error;
  }
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

// Contact New Form: /Customers/:custId/Contact/new
routes.get('/:custId/Contact/new', requirePermission('customers', 'id', 'create'), async (c: Context) => {
  const custId = c.req.param('custId');
  const customerId = extractCustomerId(custId);
  const customer = await customersData.getById(customerId);
  const customerName = customer ? customer.name : extractDisplayName(custId);

  const meta = {
    currentPath: `/Customers/${custId}/Contact/new`,
    breadcrumbs: [
      { label: 'Customers', path: '/Customers' },
      { label: customerName, path: `/Customers/${custId}` },
      { label: 'Contacten', path: `/Customers/${custId}/Contact` },
      { label: 'Nieuwe Contact', path: `/Customers/${custId}/Contact/new` }
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
    contextActions: []
  };

  const content = ContactNew({ meta, customer, custId });
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


// Contact Create Handler
routes.post('/:custId/Contact', requirePermission('customers', 'id', 'create'), async (c: Context) => {
  try {
    const custId = c.req.param('custId');
    const form = await c.req.formData();
    const id = (form.get('id') as string || '').trim();
    const contactName = (form.get('contactName') as string || '').trim();
    if (!id || !contactName) {
      return c.redirect(`/Customers/${custId}/Contact/new`);
    }
    await customersData.createContact(custId, {
      id,
      name: contactName,
      email: (form.get('email') as string || '').trim() || undefined,
      phone: (form.get('phone') as string || '').trim() || undefined
    });
    return c.redirect(`/Customers/${custId}/Contact`);
  } catch (error) {
    console.error('Error creating contact:', error);
    throw error;
  }
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

// Contact Update Handler
routes.post('/:custId/Contact/:contactId', requirePermission('customers', 'id', 'update'), async (c: Context) => {
  try {
    const custId = c.req.param('custId');
    const contactId = c.req.param('contactId');
    const form = await c.req.formData();
    const contactName = (form.get('contactName') as string || '').trim();
    if (!contactName) {
      return c.redirect(`/Customers/${custId}/Contact/${contactId}/edit`);
    }
    await customersData.updateContact(custId, contactId, {
      name: contactName,
      email: (form.get('email') as string || '').trim() || undefined,
      phone: (form.get('phone') as string || '').trim() || undefined
    });
    return c.redirect(`/Customers/${custId}/Contact/${contactId}`);
  } catch (error) {
    console.error('Error updating contact:', error);
    throw error;
  }
});

// Contact Delete Handler
routes.post('/:custId/Contact/:contactId/delete', requirePermission('customers', 'id', 'delete'), async (c: Context) => {
  try {
    const custId = c.req.param('custId');
    const contactId = c.req.param('contactId');
    await customersData.deleteContact(custId, contactId);
    return c.redirect(`/Customers/${custId}/Contact`);
  } catch (error) {
    console.error('Error deleting contact:', error);
    throw error;
  }
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

// Address New Form: /Customers/:custId/Address/new
routes.get('/:custId/Address/new', requirePermission('customers', 'id', 'create'), async (c: Context) => {
  const custId = c.req.param('custId');
  const customerId = extractCustomerId(custId);
  const customer = await customersData.getById(customerId);
  const customerName = customer ? customer.name : extractDisplayName(custId);

  const meta = {
    currentPath: `/Customers/${custId}/Address/new`,
    breadcrumbs: [
      { label: 'Customers', path: '/Customers' },
      { label: customerName, path: `/Customers/${custId}` },
      { label: 'Adressen', path: `/Customers/${custId}/Address` },
      { label: 'Nieuw Adres', path: `/Customers/${custId}/Address/new` }
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
    contextActions: []
  };

  const content = AddressNew({ meta, customer, custId });
  return renderSmart(c, content);
});

// Address Create Handler
routes.post('/:custId/Address', requirePermission('customers', 'id', 'create'), async (c: Context) => {
  try {
    const custId = c.req.param('custId');
    const form = await c.req.formData();
    const id = (form.get('id') as string || '').trim();
    if (!id) {
      return c.redirect(`/Customers/${custId}/Address/new`);
    }
    await customersData.createAddress(custId, {
      id,
      type: (form.get('type') as string || '').trim() || undefined,
      street: (form.get('street') as string || '').trim() || undefined,
      city: (form.get('city') as string || '').trim() || undefined,
      country: (form.get('country') as string || '').trim() || undefined
    });
    return c.redirect(`/Customers/${custId}/Address`);
  } catch (error) {
    console.error('Error creating address:', error);
    throw error;
  }
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

// Note New Form: /Customers/:custId/Notes/new
routes.get('/:custId/Notes/new', requirePermission('customers', 'id', 'create'), async (c: Context) => {
  const custId = c.req.param('custId');
  const customerId = extractCustomerId(custId);
  const customer = await customersData.getById(customerId);
  const customerName = customer ? customer.name : extractDisplayName(custId);

  const meta = {
    currentPath: `/Customers/${custId}/Notes/new`,
    breadcrumbs: [
      { label: 'Customers', path: '/Customers' },
      { label: customerName, path: `/Customers/${custId}` },
      { label: 'Notities', path: `/Customers/${custId}/Notes` },
      { label: 'Nieuwe Notitie', path: `/Customers/${custId}/Notes/new` }
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
    contextActions: []
  };

  const content = NoteNew({ meta, customer, custId });
  return renderSmart(c, content);
});

// Note Create Handler
routes.post('/:custId/Notes', requirePermission('customers', 'id', 'create'), async (c: Context) => {
  try {
    const custId = c.req.param('custId');
    const user = c.get('user');
    const form = await c.req.formData();
    const content = (form.get('content') as string || '').trim();
    if (!content) {
      return c.redirect(`/Customers/${custId}/Notes/new`);
    }
    await customersData.createNote(custId, {
      id: `n-${Date.now()}`,
      content,
      date: new Date().toISOString().split('T')[0],
      author: user ? (user.displayName || user.username || user.email) : 'Onbekend'
    });
    return c.redirect(`/Customers/${custId}/Notes`);
  } catch (error) {
    console.error('Error creating note:', error);
    throw error;
  }
});

export default routes;
