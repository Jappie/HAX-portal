import { db } from '../../db/database.ts';
import { customers, contacts, addresses, notes } from '../../db/schema.ts';
import { eq, and, getTableColumns } from 'drizzle-orm';
import type { Customer, Contact, Address, Note } from '../../db/schema.ts';
import type { SelectedFieldsFlat } from 'drizzle-orm/sqlite-core';

function customerSelection(readFields?: string[]): SelectedFieldsFlat | undefined {
  if (!readFields || readFields.length === 0) return undefined;
  const columns = getTableColumns(customers);
  const selection: SelectedFieldsFlat = {};
  for (const field of readFields) {
    if (field in columns) {
      selection[field] = columns[field as keyof typeof columns];
    }
  }
  return Object.keys(selection).length > 0 ? selection : undefined;
}

// ==========================================
// CUSTOMER DATA ACCESS
// ==========================================
export const customersData = {
  // Get all customers - Using Drizzle ORM query builder with node-sqlite driver
  async getAll(readFields?: string[]): Promise<Partial<Customer>[]> {
    const selection = customerSelection(readFields);
    if (selection) {
      return db.select(selection).from(customers).all() as Partial<Customer>[];
    }
    return db.select().from(customers).all();
  },

  // Get customer by ID
  async getById(id: string, readFields?: string[]): Promise<Partial<Customer> | null> {
    const selection = customerSelection(readFields);
    if (selection) {
      const result = await db.select(selection).from(customers).where(eq(customers.id, id)).get();
      return result as Partial<Customer> | null;
    }
    const result = await db.select().from(customers).where(eq(customers.id, id)).get();
    return result || null;
  },

  // Get customers list (legacy method for compatibility)
  async list(): Promise<Customer[]> {
    return this.getAll();
  },

  async createCustomer(data: { id: string; name: string; industry?: string; location?: string }): Promise<Customer> {
    await db.insert(customers).values(data).run();
    const created = await this.getById(data.id);
    return created as Customer;
  },

  async updateCustomer(id: string, data: Partial<Customer>): Promise<void> {
    await db.update(customers).set(data).where(eq(customers.id, id)).run();
  },

  async deleteCustomer(id: string): Promise<void> {
    await db.delete(notes).where(eq(notes.customerId, id)).run();
    await db.delete(addresses).where(eq(addresses.customerId, id)).run();
    await db.delete(contacts).where(eq(contacts.customerId, id)).run();
    await db.delete(customers).where(eq(customers.id, id)).run();
  },

  // ==========================================
  // CONTACT DATA ACCESS
  // ==========================================

  // Get contacts by customer ID
  async getContactsByCustomer(customerId: string): Promise<Contact[]> {
    // Handle both formats: '123' and '123-Aramco'
    const baseId = customerId.split('-')[0];
    return db.select().from(contacts).where(eq(contacts.customerId, baseId)).all();
  },

  // Get contact by ID for a specific customer
  async getContactById(customerId: string, contactId: string): Promise<Contact | null> {
    const baseId = customerId.split('-')[0];
    const result = await db.select().from(contacts).where(and(
      eq(contacts.customerId, baseId),
      eq(contacts.id, contactId)
    )).get();
    return result || null;
  },

  async createContact(customerId: string, data: { id: string; name: string; email?: string; phone?: string }): Promise<Contact> {
    const baseId = customerId.split('-')[0];
    await db.insert(contacts).values({ ...data, customerId: baseId }).run();
    const created = await this.getContactById(customerId, data.id);
    return created as Contact;
  },

  async updateContact(customerId: string, contactId: string, data: Partial<Contact>): Promise<void> {
    const baseId = customerId.split('-')[0];
    await db.update(contacts).set(data).where(and(
      eq(contacts.customerId, baseId),
      eq(contacts.id, contactId)
    )).run();
  },

  async deleteContact(customerId: string, contactId: string): Promise<void> {
    const baseId = customerId.split('-')[0];
    await db.delete(contacts).where(and(
      eq(contacts.customerId, baseId),
      eq(contacts.id, contactId)
    )).run();
  },

  // ==========================================
  // ADDRESS DATA ACCESS
  // ==========================================

  // Get addresses by customer ID
  async getAddressesByCustomer(customerId: string): Promise<Address[]> {
    const baseId = customerId.split('-')[0];
    return db.select().from(addresses).where(eq(addresses.customerId, baseId)).all();
  },

  async createAddress(customerId: string, data: { id: string; type?: string; street?: string; city?: string; country?: string }): Promise<Address> {
    const baseId = customerId.split('-')[0];
    await db.insert(addresses).values({ ...data, customerId: baseId }).run();
    const created = await db.select().from(addresses).where(and(
      eq(addresses.customerId, baseId),
      eq(addresses.id, data.id)
    )).get();
    return created as Address;
  },

  // ==========================================
  // NOTE DATA ACCESS
  // ==========================================

  // Get notes by customer ID
  async getNotesByCustomer(customerId: string): Promise<Note[]> {
    const baseId = customerId.split('-')[0];
    return db.select().from(notes).where(eq(notes.customerId, baseId)).all();
  },

  async createNote(customerId: string, data: { id: string; content: string; date?: string; author?: string }): Promise<Note> {
    const baseId = customerId.split('-')[0];
    await db.insert(notes).values({ ...data, customerId: baseId }).run();
    const created = await db.select().from(notes).where(and(
      eq(notes.customerId, baseId),
      eq(notes.id, data.id)
    )).get();
    return created as Note;
  },
};

// Export types for use in other modules
export type { Customer, Contact, Address, Note };
