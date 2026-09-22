import { db } from '../db/database.ts';
import { appPermissions } from '../db/schema.ts';
import type { Context, Next } from 'hono';

// --- IN-MEMORY CACHE ---
class AbacCache {
  grants: Map<string, Record<string, string>>;

  constructor() {
    this.grants = new Map(); // Key: `${role}:${resource}`
  }

  // Reload cache live from the DB
  async reload() {
    try {
      const records = await db.select().from(appPermissions).all();
      this.grants.clear();

      for (const row of records) {
        const key = `${row.role}:${row.resource}`;
        if (!this.grants.has(key)) this.grants.set(key, {});
        const resourceGrants = this.grants.get(key)!;
        resourceGrants[row.attribute] = row.actions;
      }
      console.log('✅ ABAC Engine loaded permissions cache');
    } catch (e) {
      console.error('❌ ABAC Engine failed to load permissions', e);
    }
  }

  // Determine allowed read fields
  getAllowedReadFields(role: string, resource: string, allFields: string[]) {
    const rules = this.grants.get(`${role}:${resource}`) || {};
    return allFields.filter(field => {
      const actions = rules[field] || rules['*'] || '';
      return actions.includes('R') || actions.includes('CRUD') || actions.includes('CRU');
    });
  }

  // Determine allowed write fields (Create/Update)
  getAllowedWriteFields(role: string, resource: string, allFields: string[]) {
    const rules = this.grants.get(`${role}:${resource}`) || {};
    return allFields.filter(field => {
      const actions = rules[field] || rules['*'] || '';
      return actions.includes('C') || actions.includes('U') || actions.includes('CRUD') || actions.includes('CRU');
    });
  }
}

export const abacCache = new AbacCache();

// --- HONO ABAC MIDDLEWARE ---
export function authorizeAbac(resource: string) {
  return async (c: Context, next: Next) => {
    const user = c.get('user'); // Injected by Auth middleware
    const role = user?.roleId || 'guest';

    // The available fields would normally come from the schema, 
    // but we can pass them in later or hardcode per resource as an example
    let allFields: string[] = [];
    if (resource === 'customers') {
      allFields = ['id', 'name', 'industry', 'location'];
    } else if (resource === 'auth') {
      // For auth resource, check what action is being performed
      const path = c.req.path;
      if (path.includes('/users')) allFields = ['users'];
      else if (path.includes('/roles')) allFields = ['roles'];
      else if (path.includes('/permissions')) allFields = ['permissions'];
      else if (path.includes('/sessions')) allFields = ['sessions'];
      else allFields = ['users', 'roles', 'permissions', 'sessions'];
    }

    const readFields = abacCache.getAllowedReadFields(role, resource, allFields);
    const writeFields = abacCache.getAllowedWriteFields(role, resource, allFields);

    if (readFields.length === 0) {
      return c.text('Forbidden: No access to this entity', 403);
    }

    // Attach to the Hono context
    c.set('abac', {
      readFields,
      writeFields
    });

    await next();
  };
}

// Reload ABAC cache (can be called after permission changes)
export async function reloadAbacCache() {
  await abacCache.reload();
}
