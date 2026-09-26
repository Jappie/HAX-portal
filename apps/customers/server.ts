// Customers app can be run standalone or mounted
// This file is for standalone execution (if needed)
import { serve } from '@hono/node-server';
import app from './app.ts';
import { accessCache } from '../../shared/access.ts';

const port = 3001;

// Initialize the ABAC permissions cache (the mounted portal does this in its server)
await accessCache.reload();

console.log(`Customers app running on http://localhost:${port}`);
serve({ fetch: app.fetch, port });
