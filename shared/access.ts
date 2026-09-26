import { db } from '../db/database.ts';
import { appPermissions } from '../db/schema.ts';
import { createAccessControl, role, type Role } from 'better-auth/plugins/access';
import type { Context, Next } from 'hono';

// Authorization built on better-auth's access control (plugins/access).
// The portal keeps its attribute-level grants in the app_permissions table
// (managed by the auth app), but every decision is now made by better-auth
// Role objects: each role's statements are keyed "resource:attribute" and
// checked with role.authorize(), replacing the hand-rolled grants map.

export const ACCESS_ACTIONS = ['create', 'read', 'update', 'delete'] as const;
export type AccessAction = (typeof ACCESS_ACTIONS)[number];

const DB_ACTION_MAP: Record<string, AccessAction> = {
  C: 'create',
  R: 'read',
  U: 'update',
  D: 'delete',
};

// Portal resources and the attributes the ABAC grants operate on.
export const ACCESS_RESOURCES: Record<string, string[]> = {
  customers: ['id', 'name', 'industry', 'location', '*'],
  auth: ['users', 'roles', 'permissions', 'sessions', '*'],
};

export const accessControl = createAccessControl(
  Object.fromEntries(
    Object.entries(ACCESS_RESOURCES).flatMap(([resource, attributes]) =>
      attributes.map((attribute) => [`${resource}:${attribute}`, [...ACCESS_ACTIONS]])
    )
  )
);

export function statementKey(resource: string, attribute: string): string {
  return `${resource}:${attribute}`;
}

function dbActionsToAccess(actions: string): AccessAction[] {
  return [...actions].flatMap((char) => {
    const action = DB_ACTION_MAP[char];
    return action ? [action] : [];
  });
}

class AccessCache {
  roles: Map<string, Role> = new Map();

  async reload() {
    try {
      const records = await db.select().from(appPermissions).all();
      this.roles.clear();

      const statementsByRole = new Map<string, Record<string, string[]>>();
      for (const row of records) {
        const statements = statementsByRole.get(row.role) ?? {};
        statements[statementKey(row.resource, row.attribute)] = dbActionsToAccess(row.actions);
        statementsByRole.set(row.role, statements);
      }

      for (const [roleName, statements] of statementsByRole) {
        this.roles.set(roleName, role(statements));
      }
      console.log('✅ Access control loaded better-auth roles');
    } catch (e) {
      console.error('❌ Access control failed to load permissions', e);
    }
  }

  getRole(roleId: string): Role {
    return this.roles.get(roleId) ?? role({});
  }

  // Better-auth RBAC/ABAC decision: does the role allow this action on the
  // resource attribute?
  allows(roleId: string, resource: string, attribute: string, action: AccessAction): boolean {
    return this.getRole(roleId).authorize({ [statementKey(resource, attribute)]: [action] }).success;
  }

  // Attribute-level read/write grants, used by the customers data layer to
  // project only the allowed fields.
  getAllowedFields(roleId: string, resource: string, allFields: string[], action: AccessAction): string[] {
    return allFields.filter((field) => this.allows(roleId, resource, field, action));
  }
}

export const accessCache = new AccessCache();

// Hono middleware: attach the role's read/write field grants to the context.
export function authorizeAbac(resource: string) {
  return async (c: Context, next: Next): Promise<void | Response> => {
    const user = c.get('user');
    const roleId = user?.roleId || 'guest';

    const allFields = ACCESS_RESOURCES[resource] ?? [];
    const readFields = accessCache.getAllowedFields(roleId, resource, allFields, 'read');
    const writeFields = accessCache.getAllowedFields(roleId, resource, allFields, 'create');

    if (readFields.length === 0 && writeFields.length === 0) {
      return c.text('Forbidden: No access to this entity', 403);
    }

    c.set('abac', {
      readFields,
      writeFields,
    });

    await next();
  };
}

// Route guard: require a better-auth access action on a resource attribute.
export function requirePermission(resource: string, attribute: string, action: AccessAction) {
  return async (c: Context, next: Next): Promise<void | Response> => {
    const user = c.get('user');

    if (!user) {
      return c.redirect('/login');
    }

    if (!accessCache.allows(user.roleId, resource, attribute, action)) {
      return c.text('Forbidden: Insufficient permissions', 403);
    }

    await next();
  };
}

export async function reloadAccessCache() {
  await accessCache.reload();
}
