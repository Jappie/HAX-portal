import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// ==========================================
// 1. CUSTOMERS TABLE
// ==========================================
export const customers = sqliteTable('customers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  industry: text('industry'),
  location: text('location'),
});

// ==========================================
// 2. CONTACTS TABLE
// ==========================================
export const contacts = sqliteTable('contacts', {
  id: text('id').primaryKey(),
  customerId: text('customer_id').notNull().references(() => customers.id),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
});

// ==========================================
// 3. ADDRESSES TABLE
// ==========================================
export const addresses = sqliteTable('addresses', {
  id: text('id').primaryKey(),
  customerId: text('customer_id').notNull().references(() => customers.id),
  type: text('type'),
  street: text('street'),
  city: text('city'),
  country: text('country'),
});

// ==========================================
// 4. NOTES TABLE
// ==========================================
export const notes = sqliteTable('notes', {
  id: text('id').primaryKey(),
  customerId: text('customer_id').notNull().references(() => customers.id),
  content: text('content').notNull(),
  date: text('date'),
  author: text('author'),
});

// ==========================================
// 5. PORTAL APPLICATIONS TABLE
// ==========================================
export const portalApps = sqliteTable('portal_apps', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  fullname: text('fullname').notNull(),
  category: text('category').notNull().default('default'),
  mountPath: text('mount_path').notNull(),
  modulePath: text('module_path').notNull(),
});

// ==========================================
// 6. AUTHENTICATION & ABAC TABLES
// ==========================================
// Standard better-auth schema tables
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' }).notNull().default(false),
  image: text('image'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  
  // Custom ABAC fields
  username: text('username').unique(),
  password: text('password'),
  displayName: text('display_name'),
  roleId: text('role_id').notNull().default('guest'),
});

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  token: text('token'),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const accounts = sqliteTable('accounts', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(() => users.id),
  accessToken: text('access_token'),
  accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp' }),
  refreshToken: text('refresh_token'),
  refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp' }),
  scope: text('scope'),
  idToken: text('id_token'),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  password: text('password'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const verifications = sqliteTable('verifications', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const roles = sqliteTable('roles', {
  id: text('id').primaryKey(), // e.g. 'admin', 'sales'
  name: text('name').notNull(),
  description: text('description'),
});

export const appPermissions = sqliteTable('app_permissions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  role: text('role').notNull(),            // e.g. 'sales', 'support', 'admin'
  resource: text('resource').notNull(),    // e.g. 'customers'
  attribute: text('attribute').notNull(),  // e.g. 'notes', 'email', '*'
  actions: text('actions').notNull(),      // e.g. 'R', 'CRU', 'CRUD'
});

export const portalUsers = sqliteTable('portal_users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
});

import { primaryKey } from 'drizzle-orm/sqlite-core';
export const portalUserRoles = sqliteTable('portal_user_roles', {
  userId: integer('user_id').notNull().references(() => portalUsers.id),
  appKey: text('app_key').notNull(), 
  role: text('role').notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.appKey] }),
}));

// ==========================================
// 7. ZOD SCHEMAS FOR TYPE SAFETY
// ==========================================
export const insertCustomerSchema = createInsertSchema(customers);
export const selectCustomerSchema = createSelectSchema(customers);

export const insertContactSchema = createInsertSchema(contacts);
export const selectContactSchema = createSelectSchema(contacts);

export const insertAddressSchema = createInsertSchema(addresses);
export const selectAddressSchema = createSelectSchema(addresses);

export const insertNoteSchema = createInsertSchema(notes);
export const selectNoteSchema = createSelectSchema(notes);

const ALPHANUMERIC_UNDERSCORE = /^[a-zA-Z0-9_]+$/;

export const insertUserSchema = createInsertSchema(users, {
  username: (schema) => 
    schema
      .min(3, 'Gebruikersnaam moet minimaal 3 tekens zijn')
      .max(32, 'Gebruikersnaam mag maximaal 32 tekens zijn')
      .regex(ALPHANUMERIC_UNDERSCORE, 'Alleen letters, cijfers en underscores toegestaan')
      .optional(),

  email: z.string().email('Ongeldig e-mailadres').max(255, 'E-mailadres is te lang'),

  displayName: (schema) => 
    schema
      .min(2, 'Weergavenaam moet minimaal 2 tekens zijn')
      .max(50, 'Weergavenaam mag maximaal 50 tekens zijn')
      .optional(),

  roleId: (schema) => 
    schema
      .min(2, 'Rol-ID is te kort')
      .max(24, 'Rol-ID is te lang')
});
export const selectUserSchema = createSelectSchema(users);

export const insertRoleSchema = createInsertSchema(roles, {
  id: (schema) => 
    schema
      .min(2, 'Rol-sleutel moet minimaal 2 tekens zijn')
      .max(24, 'Rol-sleutel mag maximaal 24 tekens zijn')
      .regex(ALPHANUMERIC_UNDERSCORE, 'Rol-sleutel mag geen spaties of speciale tekens bevatten'),

  name: (schema) => 
    schema
      .min(2, 'Rolnaam is verplicht')
      .max(40, 'Rolnaam is te lang'),

  description: (schema) => 
    schema
      .max(200, 'Beschrijving mag maximaal 200 tekens bevatten')
      .optional()
});
export const selectRoleSchema = createSelectSchema(roles);

export const insertAppPermissionSchema = createInsertSchema(appPermissions);
export const selectAppPermissionSchema = createSelectSchema(appPermissions);

// ==========================================
// 8. TYPE EXPORTS
// ==========================================
export type Customer = z.infer<typeof selectCustomerSchema>;
export type NewCustomer = z.infer<typeof insertCustomerSchema>;

export type Contact = z.infer<typeof selectContactSchema>;
export type NewContact = z.infer<typeof insertContactSchema>;

export type Address = z.infer<typeof selectAddressSchema>;
export type NewAddress = z.infer<typeof insertAddressSchema>;

export type Note = z.infer<typeof selectNoteSchema>;
export type NewNote = z.infer<typeof insertNoteSchema>;

export type User = z.infer<typeof selectUserSchema>;
export type NewUser = z.infer<typeof insertUserSchema>;

export type Role = z.infer<typeof selectRoleSchema>;
export type NewRole = z.infer<typeof insertRoleSchema>;

export type AppPermission = z.infer<typeof selectAppPermissionSchema>;
export type NewAppPermission = z.infer<typeof insertAppPermissionSchema>;
