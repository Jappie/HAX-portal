// Authentication Configuration for Better-Auth with SQLite (node:sqlite)
// This file exports the auth instance

import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './database.ts';

// Create the auth instance with SQLite database
// Using minimal configuration to avoid type issues
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite',
    usePlural: true, // Our tables are plural: users, sessions, accounts, verifications
  }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24,
  },
});
