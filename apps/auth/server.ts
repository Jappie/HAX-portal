// Auth Server Entry Point
// Standalone server for auth app (port 3002)

import { serve } from '@hono/node-server';
import app from './app.ts';

const port = 3002;

console.log(`🚀 Auth server starting on port ${port}...`);

serve({
  fetch: app.fetch,
  port,
}, () => {
  console.log(`✅ Auth server running at http://localhost:${port}`);
});
