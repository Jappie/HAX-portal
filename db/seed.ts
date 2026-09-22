import { db, sqlite } from './database.ts';
import {
  customers, 
  contacts, 
  addresses, 
  notes, 
  portalApps, 
  users, 
  roles, 
  appPermissions
} from './schema.ts';

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
    
    CREATE TABLE IF NOT EXISTS roles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT
    );
    
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      email_verified BOOLEAN NOT NULL DEFAULT 0,
      image TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      username TEXT UNIQUE,
      password TEXT,
      display_name TEXT,
      role_id TEXT NOT NULL DEFAULT 'guest'
    );
    
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      token TEXT,
      expires_at INTEGER NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      user_id TEXT NOT NULL REFERENCES users(id),
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      account_id TEXT NOT NULL,
      provider_id TEXT NOT NULL,
      user_id TEXT NOT NULL REFERENCES users(id),
      access_token TEXT,
      access_token_expires_at INTEGER,
      refresh_token TEXT,
      refresh_token_expires_at INTEGER,
      scope TEXT,
      id_token TEXT,
      expires_at INTEGER,
      password TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS verifications (
      id TEXT PRIMARY KEY,
      identifier TEXT NOT NULL,
      value TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS app_permissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role TEXT NOT NULL,
      resource TEXT NOT NULL,
      attribute TEXT NOT NULL,
      actions TEXT NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS portal_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE
    );
    
    CREATE TABLE IF NOT EXISTS portal_user_roles (
      user_id INTEGER NOT NULL REFERENCES portal_users(id),
      app_key TEXT NOT NULL, 
      role TEXT NOT NULL,
      PRIMARY KEY (user_id, app_key)
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

  // Clear existing data using raw SQL (safer than drizzle for this)
  const clearTablesSQL = `
    DELETE FROM notes;
    DELETE FROM addresses;
    DELETE FROM contacts;
    DELETE FROM customers;
    DELETE FROM portal_user_roles;
    DELETE FROM portal_users;
    DELETE FROM app_permissions;
    DELETE FROM users;
    DELETE FROM roles;
    DELETE FROM portal_apps;
    DELETE FROM sessions;
    DELETE FROM accounts;
    DELETE FROM verifications;
  `;
  try {
    sqlite.exec(clearTablesSQL);
  } catch {
    console.log('No data to clear (tables may not exist yet)');
  }

  // Insert customers using Drizzle ORM
  const customerData = [
    { id: '123', name: 'Aramco', industry: 'Oil & Gas', location: 'Saudi Arabia' },
    { id: '456', name: 'Shell', industry: 'Oil & Gas', location: 'Netherlands' },
    { id: '789', name: 'BP', industry: 'Oil & Gas', location: 'UK' },
  ];

  for (const customer of customerData) {
    await db.insert(customers).values(customer).run();
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
    await db.insert(contacts).values(contact).run();
  }
  console.log('✅ Inserted contacts');

  // Insert addresses using Drizzle ORM
  const addressData = [
    { id: 'addr-1', customerId: '123', type: 'HQ', street: 'King Abdulaziz Road', city: 'Dhahran', country: 'Saudi Arabia' },
    { id: 'addr-2', customerId: '456', type: 'HQ', street: 'Carel van Bylandtlaan 30', city: 'The Hague', country: 'Netherlands' },
    { id: 'addr-3', customerId: '789', type: 'HQ', street: '1 St James Court', city: 'London', country: 'UK' },
  ];

  for (const address of addressData) {
    await db.insert(addresses).values(address).run();
  }
  console.log('✅ Inserted addresses');

  // Insert notes using Drizzle ORM
  const noteData = [
    { id: 'note-1', customerId: '123', content: 'Large oil contract pending', date: '2024-01-15', author: 'Sales Team' },
  ];

  for (const note of noteData) {
    await db.insert(notes).values(note).run();
  }
  console.log('✅ Inserted notes');

  // Insert portal apps using Drizzle ORM
  const appData = [
    { name: 'customers', fullname: 'Customers', category: 'main', mountPath: '/Customers', modulePath: '../../apps/customers/app.ts' },
    { name: 'auth', fullname: 'Auth', category: 'admin', mountPath: '/Auth', modulePath: '../../apps/auth/app.ts' },
  ];

  for (const app of appData) {
    await db.insert(portalApps).values(app).run();
  }
  console.log('✅ Inserted portal apps');

  // Insert roles using Drizzle ORM
  const roleData = [
    { id: 'admin', name: 'Administrator', description: 'Full access to all features and data' },
    { id: 'user', name: 'Regular User', description: 'Standard user access' },
    { id: 'guest', name: 'Guest', description: 'Read-only access' },
  ];
  for (const role of roleData) {
    await db.insert(roles).values(role).run();
  }
  console.log('✅ Inserted roles');

  // Insert users using Drizzle ORM
  const now = new Date();
  const userData = [
    { 
      id: 'u1', 
      name: 'Admin', 
      username: 'admin', 
      email: 'admin@portal.local', 
      password: 'admin',
      displayName: 'Admin User', 
      roleId: 'admin', 
      createdAt: now, 
      updatedAt: now,
      emailVerified: true
    },
    { 
      id: 'u2', 
      name: 'User', 
      username: 'user', 
      email: 'user@portal.local', 
      password: 'user',
      displayName: 'Regular User', 
      roleId: 'user', 
      createdAt: now, 
      updatedAt: now,
      emailVerified: true
    },
    { 
      id: 'u3', 
      name: 'Guest', 
      username: 'guest', 
      email: 'guest@portal.local', 
      password: 'guest',
      displayName: 'Guest User', 
      roleId: 'guest', 
      createdAt: now, 
      updatedAt: now,
      emailVerified: true
    },
  ];
  
  for (const user of userData) {
    await db.insert(users).values(user).run();
  }
  console.log('✅ Inserted users');

  // Insert ABAC app permissions using Drizzle ORM
  const permissionData = [
    { role: 'admin', resource: 'customers', attribute: 'id', actions: 'CRUD' },
    { role: 'admin', resource: 'customers', attribute: 'name', actions: 'CRUD' },
    { role: 'admin', resource: 'customers', attribute: 'industry', actions: 'CRUD' },
    { role: 'admin', resource: 'customers', attribute: 'location', actions: 'CRUD' },
    { role: 'user', resource: 'customers', attribute: 'id', actions: 'R' },
    { role: 'user', resource: 'customers', attribute: 'name', actions: 'CRU' },
    { role: 'user', resource: 'customers', attribute: 'industry', actions: 'CRU' },
    { role: 'user', resource: 'customers', attribute: 'location', actions: 'CRU' },
    { role: 'guest', resource: 'customers', attribute: 'id', actions: 'R' },
    { role: 'guest', resource: 'customers', attribute: 'name', actions: 'R' },
    { role: 'admin', resource: 'auth', attribute: 'users', actions: 'CRUD' },
    { role: 'admin', resource: 'auth', attribute: 'roles', actions: 'CRUD' },
    { role: 'admin', resource: 'auth', attribute: 'permissions', actions: 'CRUD' },
    { role: 'admin', resource: 'auth', attribute: 'sessions', actions: 'CRUD' },
  ];
  
  for (const perm of permissionData) {
    await db.insert(appPermissions).values(perm).run();
  }
  console.log('✅ Inserted app permissions');

  console.log('🎉 Database seeding complete!');
  console.log('');
  console.log('Demo credentials:');
  console.log('  admin / admin');
  console.log('  user / user');
  console.log('  guest / guest');
  console.log('');
  console.log('Note: Passwords are stored as plain text in the database.');
  console.log('The login handler will validate them directly against the database.');
}

// Run seed
seedDatabase().catch((err) => {
  console.error('❌ Error seeding database:', err);
  process.exit(1);
});
