// Customers app can be run standalone or mounted
// This file is for standalone execution (if needed)
import { serve } from '@hono/node-server';
import app from './app.tsx';

const port = 3001;
console.log(`Customers app running on http://localhost:${port}`);

serve({ fetch: app.fetch, port });
