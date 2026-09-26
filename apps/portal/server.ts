import { serve } from '@hono/node-server';
import app from './app.ts';
import { accessCache } from '../../shared/access.ts';
import { validateRoutesWithZod } from '../../shared/blueprint.ts';

const port = 3000;

// Initialize caches and validate blueprints
await accessCache.reload();
validateRoutesWithZod(app);

console.log(`Server started on http://localhost:${port}`);
console.log(`Directe Bookmark Test URL: http://localhost:${port}/Customers/123-Aramco/Contact/356-Jenssen`);

serve({ fetch: app.fetch, port });
