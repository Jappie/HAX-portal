import { db } from '../../db/database.js';
import { customers, contacts, addresses, notes } from '../../db/schema.js';
import { eq, and } from 'drizzle-orm';
import type { Customer, Contact, Address, Note } from '../../db/schema.js';

// ==========================================
// CUSTOMER DATA ACCESS
// ==========================================
export const customersData = {
  // Get all customers
  async getAll(): Promise<Customer[]> {
    return await db.select().from(customers);
  },

  // Get customer by ID
  async getById(id: string): Promise<Customer | null> {
    const result = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
    return result[0] || null;
  },

  // Get customers list (legacy method for compatibility)
  async list(): Promise<Customer[]> {
    return this.getAll();
  },

  // ==========================================
  // CONTACT DATA ACCESS
  // ==========================================

  // Get contacts by customer ID
  async getContactsByCustomer(customerId: string): Promise<Contact[]> {
    // Handle both formats: '123' and '123-Aramco'
    const baseId = customerId.split('-')[0];
    return await db.select().from(contacts).where(eq(contacts.customerId, baseId));
  },

  // Get contact by ID for a specific customer
  async getContactById(customerId: string, contactId: string): Promise<Contact | null> {
    const baseId = customerId.split('-')[0];
    const result = await db
      .select()
      .from(contacts)
      .where(and(eq(contacts.customerId, baseId), eq(contacts.id, contactId)))
      .limit(1);
    return result[0] || null;
  },

  // ==========================================
  // ADDRESS DATA ACCESS
  // ==========================================

  // Get addresses by customer ID
  async getAddressesByCustomer(customerId: string): Promise<Address[]> {
    const baseId = customerId.split('-')[0];
    return await db.select().from(addresses).where(eq(addresses.customerId, baseId));
  },

  // ==========================================
  // NOTE DATA ACCESS
  // ==========================================

  // Get notes by customer ID
  async getNotesByCustomer(customerId: string): Promise<Note[]> {
    const baseId = customerId.split('-')[0];
    return await db.select().from(notes).where(eq(notes.customerId, baseId));
  },
};

// Export types for use in other modules
export type { Customer, Contact, Address, Note };
