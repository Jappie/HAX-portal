import { db, sqlite } from './database.ts';
import { customers, contacts, addresses, notes, portalApps } from './schema.ts';

async function createTables() {
  console.log('🛠️  Creating tables...');
  
  // Create tables using raw SQL
  const createTablesSQL = `
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      industry TEXT,
      location TEXT
    );
    
    CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL REFERENCES customers(id),
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT
    );
    
    CREATE TABLE IF NOT EXISTS addresses (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL REFERENCES customers(id),
      type TEXT,
      street TEXT,
      city TEXT,
      country TEXT
    );
    
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL REFERENCES customers(id),
      content TEXT NOT NULL,
      date TEXT,
      author TEXT
    );
    
    CREATE TABLE IF NOT EXISTS portal_apps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      fullname TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'default',
      mount_path TEXT NOT NULL,
      module_path TEXT NOT NULL
    );
  `;
  
  try {
    sqlite.exec(createTablesSQL);
    console.log('✅ All tables created');
  } catch (err) {
    console.error('❌ Error creating tables:', err);
    throw err;
  }
}

async function seedDatabase() {
  console.log('🌱 Seeding database...');

  // Create tables first
  await createTables();

  // Clear existing data using Drizzle ORM
  await db.delete(notes);
  await db.delete(addresses);
  await db.delete(contacts);
  await db.delete(customers);
  await db.delete(portalApps);

  // Insert customers using Drizzle ORM
  const customerData = [
    { id: '123', name: 'Aramco', industry: 'Oil & Gas', location: 'Saudi Arabia' },
    { id: '456', name: 'Shell', industry: 'Oil & Gas', location: 'Netherlands' },
    { id: '789', name: 'BP', industry: 'Oil & Gas', location: 'UK' },
  ];

  for (const customer of customerData) {
    await db.insert(customers).values(customer);
  }
  console.log('✅ Inserted customers');

  // Insert contacts using Drizzle ORM
  const contactData = [
    { id: '356', customerId: '123', name: 'Jenssen', email: 'jenssen@aramco.com', phone: '+966-123-456-7890' },
    { id: '357', customerId: '123', name: 'Mohammed', email: 'mohammed@aramco.com', phone: '+966-123-456-7891' },
    { id: '401', customerId: '456', name: 'Jan', email: 'jan@shell.com', phone: '+31-10-123-4567' },
    { id: '501', customerId: '789', name: 'John', email: 'john@bp.com', phone: '+44-20-1234-5678' },
  ];

  for (const contact of contactData) {
    await db.insert(contacts).values(contact);
  }
  console.log('✅ Inserted contacts');

  // Insert addresses using Drizzle ORM
  const addressData = [
    { id: 'addr-1', customerId: '123', type: 'HQ', street: 'King Abdulaziz Road', city: 'Dhahran', country: 'Saudi Arabia' },
    { id: 'addr-2', customerId: '456', type: 'HQ', street: 'Carel van Bylandtlaan 30', city: 'The Hague', country: 'Netherlands' },
    { id: 'addr-3', customerId: '789', type: 'HQ', street: '1 St James Court', city: 'London', country: 'UK' },
  ];

  for (const address of addressData) {
    await db.insert(addresses).values(address);
  }
  console.log('✅ Inserted addresses');

  // Insert notes using Drizzle ORM
  const noteData = [
    { id: 'note-1', customerId: '123', content: 'Large oil contract pending', date: '2024-01-15', author: 'Sales Team' },
  ];

  for (const note of noteData) {
    await db.insert(notes).values(note);
  }
  console.log('✅ Inserted notes');

  // Insert portal apps using Drizzle ORM
  const appData = [
    { name: 'customers', fullname: 'Customers', category: 'main', mountPath: '/Customers', modulePath: '../../apps/customers/app.ts' },
  ];

  for (const app of appData) {
    await db.insert(portalApps).values(app);
  }
  console.log('✅ Inserted portal apps');

  console.log('🎉 Database seeding complete!');
}

// Run seed
seedDatabase().catch((err) => {
  console.error('❌ Error seeding database:', err);
  process.exit(1);
});
