import { Hono } from 'hono'
import { customerViews } from './views.js'
import { customersData } from './data.js'

const routes = new Hono()

// Root Sub-App Overzicht (/Customers)
routes.get('/', (c) => {
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

  const customers = customersData.list
  const content = customerViews.list({ meta, customers })
  return renderSmart(c, content)
})

// Customer Detail Route: /Customers/:custId
routes.get('/:custId', (c) => {
  const custId = c.req.param('custId')
  const customer = customersData.getById(custId)
  const customerName = customer ? customer.name : custId.split('-')[1] || custId

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
  }

  const content = customerViews.detail({ meta, customer, custId })
  return renderSmart(c, content)
})

// Customer Contacts List: /Customers/:custId/Contact
routes.get('/:custId/Contact', (c) => {
  const custId = c.req.param('custId')
  const customer = customersData.getById(custId)
  const customerName = customer ? customer.name : custId.split('-')[1] || custId
  const contacts = customersData.getContactsByCustomer(custId)

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
  }

  const content = customerViews.contactsList({ meta, customer, custId, contacts })
  return renderSmart(c, content)
})

// Contact Detail: /Customers/:custId/Contact/:contactId
routes.get('/:custId/Contact/:contactId', (c) => {
  const custId = c.req.param('custId')
  const contactId = c.req.param('contactId')
  const customer = customersData.getById(custId)
  const customerName = customer ? customer.name : custId.split('-')[1] || custId
  const contact = customersData.getContactById(custId, contactId)
  const contactName = contact ? contact.name : contactId.split('-')[1] || contactId

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
  }

  const content = customerViews.contactDetail({ meta, customer, custId, contact, contactId })
  return renderSmart(c, content)
})

// Contact Edit: /Customers/:custId/Contact/:contactId/edit
routes.get('/:custId/Contact/:contactId/edit', (c) => {
  const custId = c.req.param('custId')
  const contactId = c.req.param('contactId')
  const customer = customersData.getById(custId)
  const customerName = customer ? customer.name : custId.split('-')[1] || custId
  const contact = customersData.getContactById(custId, contactId)
  const contactName = contact ? contact.name : contactId.split('-')[1] || contactId

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
  }

  const content = customerViews.contactEdit({ meta, customer, custId, contact, contactId })
  return renderSmart(c, content)
})

// Customer Addresses: /Customers/:custId/Address
routes.get('/:custId/Address', (c) => {
  const custId = c.req.param('custId')
  const customer = customersData.getById(custId)
  const customerName = customer ? customer.name : custId.split('-')[1] || custId
  const addresses = customersData.getAddressesByCustomer(custId)

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
  }

  const content = customerViews.addressesList({ meta, customer, custId, addresses })
  return renderSmart(c, content)
})

// Customer Notes: /Customers/:custId/Notes
routes.get('/:custId/Notes', (c) => {
  const custId = c.req.param('custId')
  const customer = customersData.getById(custId)
  const customerName = customer ? customer.name : custId.split('-')[1] || custId
  const notes = customersData.getNotesByCustomer(custId)

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
  }

  const content = customerViews.notesList({ meta, customer, custId, notes })
  return renderSmart(c, content)
})

export default routes
