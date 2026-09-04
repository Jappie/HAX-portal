// Database module using Node.js built-in sqlite
// Works on Node.js 22.x+ including Termux
// node:sqlite is API-compatible with better-sqlite3

import { DatabaseSync } from 'node:sqlite';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema.js';

// Create or open the database
// DatabaseSync from node:sqlite is API-compatible with better-sqlite3's Database
const sqlite = new DatabaseSync('db/hax-portal.db') as any;

// Export drizzle instance with schema
export const db = drizzle(sqlite, { schema });

// Export raw database for direct queries
export { sqlite };

// Graceful shutdown
process.on('exit', () => {
  sqlite.close();
});

process.on('SIGINT', () => {
  sqlite.close();
  process.exit(0);
});
