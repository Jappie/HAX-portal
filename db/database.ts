// Database module using Node.js built-in sqlite
// Works on Node.js 22.x+ including Termux
// Using Drizzle ORM with native node:sqlite support (as per Hint.md)

import { drizzle } from 'drizzle-orm/node-sqlite';
import { DatabaseSync } from 'node:sqlite';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Create or open the database using Node.js built-in sqlite
const sqlite = new DatabaseSync(join(__dirname, 'hax-portal.db'));

// Initialize Drizzle with node:sqlite client (native support per Hint.md)
const db = drizzle({ client: sqlite });

// Export drizzle instance
export { db };

// Export raw database for direct queries
export { sqlite };

// Export schema types for type safety
export * from './schema.ts';

// Graceful shutdown - safely close database on exit
// Note: node:sqlite may throw if database is already closed
function closeDatabase() {
  try {
    if (sqlite && typeof sqlite.close === 'function') {
      sqlite.close();
    }
  } catch {
    // Ignore errors during shutdown - database might already be closed
    // console.error('Error closing database:', err.message);
  }
}

process.on('exit', closeDatabase);
process.on('SIGINT', () => {
  closeDatabase();
  process.exit(0);
});
process.on('SIGTERM', () => {
  closeDatabase();
  process.exit(0);
});
