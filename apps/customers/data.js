// Customer data models and sample data

export const customersData = {
  list: [
    { id: '123-Aramco', name: 'Aramco', industry: 'Oil & Gas', location: 'Saudi Arabia' },
    { id: '456-Shell', name: 'Shell', industry: 'Oil & Gas', location: 'Netherlands' },
    { id: '789-BP', name: 'BP', industry: 'Oil & Gas', location: 'UK' }
  ],

  getById: (id) => {
    return customersData.list.find(c => c.id === id)
  },

  contacts: {
    '123-Aramco': [
      { id: '356-Jenssen', name: 'Jenssen', email: 'jenssen@aramco.com', phone: '+966-123-456-7890' },
      { id: '357-Mohammed', name: 'Mohammed', email: 'mohammed@aramco.com', phone: '+966-123-456-7891' }
    ],
    '456-Shell': [
      { id: '401-Jan', name: 'Jan', email: 'jan@shell.com', phone: '+31-10-123-4567' }
    ],
    '789-BP': [
      { id: '501-John', name: 'John', email: 'john@bp.com', phone: '+44-20-1234-5678' }
    ]
  },

  getContactsByCustomer: (customerId) => {
    return customersData.contacts[customerId] || []
  },

  getContactById: (customerId, contactId) => {
    const contacts = customersData.getContactsByCustomer(customerId)
    return contacts.find(c => c.id === contactId)
  },

  addresses: {
    '123-Aramco': [
      { id: 'addr-1', type: 'HQ', street: 'King Abdulaziz Road', city: 'Dhahran', country: 'Saudi Arabia' }
    ],
    '456-Shell': [
      { id: 'addr-1', type: 'HQ', street: 'Carel van Bylandtlaan 30', city: 'The Hague', country: 'Netherlands' }
    ],
    '789-BP': [
      { id: 'addr-1', type: 'HQ', street: '1 St James\'s Court', city: 'London', country: 'UK' }
    ]
  },

  getAddressesByCustomer: (customerId) => {
    return customersData.addresses[customerId] || []
  },

  notes: {
    '123-Aramco': [
      { id: 'note-1', date: '2024-01-15', author: 'Sales Team', content: 'Large oil contract pending' }
    ]
  },

  getNotesByCustomer: (customerId) => {
    return customersData.notes[customerId] || []
  }
}
