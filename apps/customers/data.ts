import { db } from '../../db/database.ts';
import { customers, contacts, addresses, notes } from '../../db/schema.ts';
import { eq, and } from 'drizzle-orm';
import type { Customer, Contact, Address, Note } from '../../db/schema.ts';

// ==========================================
// CUSTOMER DATA ACCESS
// ==========================================
export const customersData = {
  // Get all customers - Using Drizzle ORM query builder with node-sqlite driver
  async getAll(readFields?: string[]): Promise<Partial<Customer>[]> {
    if (readFields && readFields.length > 0) {
      // Build projection dynamically
      const selection: Record<string, unknown> = {};
      for (const field of readFields) {
        if (field in customers) {
          selection[field] = (customers as Record<string, unknown>)[field];
        }
      }
      if (Object.keys(selection).length === 0) {
        return []; // No valid fields to read
      }
      return db.select(selection).from(customers).all() as Partial<Customer>[];
    }
    return db.select().from(customers).all();
  },

  // Get customer by ID
  async getById(id: string, readFields?: string[]): Promise<Partial<Customer> | null> {
    if (readFields && readFields.length > 0) {
      const selection: Record<string, unknown> = {};
      for (const field of readFields) {
        if (field in customers) {
          selection[field] = (customers as Record<string, unknown>)[field];
        }
      }
      if (Object.keys(selection).length === 0) return null;
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

  // ==========================================
  // ADDRESS DATA ACCESS
  // ==========================================

  // Get addresses by customer ID
  async getAddressesByCustomer(customerId: string): Promise<Address[]> {
    const baseId = customerId.split('-')[0];
    return db.select().from(addresses).where(eq(addresses.customerId, baseId)).all();
  },

  // ==========================================
  // NOTE DATA ACCESS
  // ==========================================

  // Get notes by customer ID
  async getNotesByCustomer(customerId: string): Promise<Note[]> {
    const baseId = customerId.split('-')[0];
    return db.select().from(notes).where(eq(notes.customerId, baseId)).all();
  },
};

// Export types for use in other modules
export type { Customer, Contact, Address, Note };
