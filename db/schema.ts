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
// 6. ZOD SCHEMAS FOR TYPE SAFETY
// ==========================================
export const insertCustomerSchema = createInsertSchema(customers);
export const selectCustomerSchema = createSelectSchema(customers);

export const insertContactSchema = createInsertSchema(contacts);
export const selectContactSchema = createSelectSchema(contacts);

export const insertAddressSchema = createInsertSchema(addresses);
export const selectAddressSchema = createSelectSchema(addresses);

export const insertNoteSchema = createInsertSchema(notes);
export const selectNoteSchema = createSelectSchema(notes);

// ==========================================
// 7. TYPE EXPORTS
// ==========================================
export type Customer = z.infer<typeof selectCustomerSchema>;
export type NewCustomer = z.infer<typeof insertCustomerSchema>;

export type Contact = z.infer<typeof selectContactSchema>;
export type NewContact = z.infer<typeof insertContactSchema>;

export type Address = z.infer<typeof selectAddressSchema>;
export type NewAddress = z.infer<typeof insertAddressSchema>;

export type Note = z.infer<typeof selectNoteSchema>;
export type NewNote = z.infer<typeof insertNoteSchema>;
