// Authentication Middleware and Utilities
// Central auth module for the HAX Portal
// Uses Drizzle ORM

import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import { db } from '../db/database.ts';
import { users, sessions, roles, appPermissions } from '../db/schema.ts';
import { eq, or } from 'drizzle-orm';
import type { Context, Next } from 'hono';
import { html } from 'hono/html';
import { renderSmart } from './hax.ts';

// ==========================================
// TYPE DEFINITIONS
// ==========================================

export type SessionUser = {
  id: string;
  email: string;
  name?: string;
  username?: string;
  roleId: string;
  displayName?: string;
  image?: string;
};

// ==========================================
// SESSION MANAGEMENT
// ==========================================

// Get session user from request context
export async function getSessionUser(c: Context): Promise<SessionUser | null> {
  try {
    const sessionId = getCookie(c, 'session_id');
    
    if (!sessionId) {
      return null;
    }
    
    // Get session from database
    const sessionRecord = await db.select().from(sessions).where(eq(sessions.id, sessionId)).get();
    
    if (!sessionRecord || !sessionRecord.userId) {
      return null;
    }
    
    // Check if session has expired
    if (sessionRecord.expiresAt && new Date(sessionRecord.expiresAt).getTime() < Date.now()) {
      // Session expired - invalidate it
      await db.delete(sessions).where(eq(sessions.id, sessionId));
      return null;
    }
    
    // Get user from database
    const userRecord = await db.select().from(users).where(eq(users.id, sessionRecord.userId)).get();
    
    if (!userRecord) {
      return null;
    }
    
    return {
      id: userRecord.id,
      email: userRecord.email,
      name: userRecord.name || userRecord.displayName || undefined,
      username: userRecord.username || undefined,
      roleId: userRecord.roleId,
      displayName: userRecord.displayName || undefined,
      image: userRecord.image || undefined,
    };
  } catch (error) {
    console.error('Error getting session user:', error);
    return null;
  }
}

// Session middleware - attaches user to context
export async function sessionMiddleware(c: Context, next: Next): Promise<void> {
  try {
    const user = await getSessionUser(c);
    c.set('user', user);
    c.set('session', user ? { authenticated: true } : null);
  } catch (error) {
    console.error('Session middleware error:', error);
    c.set('user', null);
    c.set('session', null);
  }
  
  await next();
}

// Require authentication middleware
export async function requireAuth(c: Context, next: Next): Promise<void | Response> {
  const user = c.get('user');
  
  if (!user) {
    const returnUrl = c.req.url;
    return c.redirect(`/login?return=${encodeURIComponent(returnUrl)}`);
  }
  
  await next();
}

// Require specific role(s)
export function requireRole(roles: string | string[]) {
  return async (c: Context, next: Next): Promise<void | Response> => {
    const user = c.get('user');
    
    if (!user) {
      return c.redirect('/login');
    }
    
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(user.roleId)) {
      return c.text('Forbidden: Insufficient permissions', 403);
    }
    
    await next();
  };
}

// ==========================================
// LOGIN/LOGOUT HANDLERS
// ==========================================

// Login page and handler
export async function handleLogin(c: Context) {
  const returnUrl = c.req.query('return') || '/portal';
  
  if (c.req.method === 'POST') {
    const form = await c.req.formData();
    const identifier = form.get('identifier') as string;
    const password = form.get('password') as string;
    
    try {
      // Find user by username or email
      const user = await db.select().from(users).where(
        or(
          eq(users.username, identifier),
          eq(users.email, identifier)
        )
      ).get();
      
      if (!user) {
        return showLoginPage(c, returnUrl, 'Invalid username or password');
      }
      
      // Verify password (plain text comparison for now)
      // In production, you would use a proper password hashing library
      if (user.password !== password) {
        return showLoginPage(c, returnUrl, 'Invalid username or password');
      }
      
      // Create a session
      const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      const expiresAt = new Date(Date.now() + 60 * 60 * 24 * 1000); // 24 hours
      
      // Insert session into database
      await db.insert(sessions).values({
        id: sessionId,
        userId: user.id,
        expiresAt,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).run();
      
      // Set session cookie
      setCookie(c, 'session_id', sessionId, {
        path: '/',
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7, // 7 days
        sameSite: 'lax',
      });
      
      return c.redirect(returnUrl);
    } catch (err) {
      const error = err as Error;
      console.error('Login error:', error);
      const errorMessage = error.message || 'Login failed';
      return showLoginPage(c, returnUrl, errorMessage);
    }
  }
  
  // GET request - show login form
  return showLoginPage(c, returnUrl);
}

// Show login page
function showLoginPage(c: Context, returnUrl: string, error?: string) {
  const errorHtml = error 
    ? html`<div class="ui-alert ui-alert-error" style="margin-bottom: var(--size-4);">
        ${error}
      </div>`
    : '';
  
  const content = html`
    <div class="login-container" style="max-width: 400px; margin: 0 auto; padding: var(--size-4);">
      <div class="ui-card ui-outlined ui-elevated ui-tonal" style="padding: var(--size-8);">
        <h1 style="margin: 0 0 var(--size-6) 0; text-align: center;">Enterprise Portal</h1>
        <p style="text-align: center; color: var(--text-muted); margin: 0 0 var(--size-6) 0;">
          Please sign in to continue
        </p>
        
        ${errorHtml}
        
        <form method="POST" action="/login">
          <input type="hidden" name="return" value="${returnUrl}">
          
          <div class="form-group" style="margin-bottom: var(--size-4);">
            <label for="identifier" style="display: block; margin-bottom: var(--size-2); font-weight: var(--font-weight-6);">
              Username or Email
            </label>
            <input 
              type="text" 
              id="identifier" 
              name="identifier" 
              required
              placeholder="Enter username or email"
              autofocus
              style="width: 100%; padding: var(--size-3); border: 1px solid var(--border); border-radius: var(--radius-2);"
            >
          </div>
          
          <div class="form-group" style="margin-bottom: var(--size-4);">
            <label for="password" style="display: block; margin-bottom: var(--size-2); font-weight: var(--font-weight-6);">
              Password
            </label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              required
              placeholder="Enter password"
              style="width: 100%; padding: var(--size-3); border: 1px solid var(--border); border-radius: var(--radius-2);"
            >
          </div>
          
          <button 
            type="submit" 
            style="width: 100%; padding: var(--size-3); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-2); font-size: var(--font-size-0); cursor: pointer;"
          >
            Sign In
          </button>
        </form>
        
        <div class="footer" style="text-align: center; margin-top: var(--size-4); color: var(--text-muted); font-size: var(--font-size-0);">
          <p>Demo credentials:</p>
          <p style="margin: var(--size-2) 0 0 0;">
            <strong>admin</strong>/admin | <strong>user</strong>/user | <strong>guest</strong>/guest
          </p>
        </div>
      </div>
    </div>
  `;
  
  return renderSmart(c, content);
}

// Logout handler
export async function handleLogout(c: Context) {
  try {
    const sessionId = getCookie(c, 'session_id');
    
    if (sessionId) {
      // Invalidate session in database
      await db.delete(sessions).where(eq(sessions.id, sessionId));
    }
    
    // Clear session cookie
    deleteCookie(c, 'session_id', {
      path: '/',
      httpOnly: true,
    });
    
    return c.redirect('/login');
  } catch (error) {
    console.error('Logout error:', error);
    // Still redirect even if there's an error
    deleteCookie(c, 'session_id', { path: '/' });
    return c.redirect('/login');
  }
}

// ==========================================
// USER MANAGEMENT
// ==========================================

// Get all users with their roles
export async function getAllUsers(): Promise<Record<string, unknown>[]> {
  try {
    return await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      name: users.name,
      displayName: users.displayName,
      roleId: users.roleId,
      createdAt: users.createdAt,
    }).from(users).all();
  } catch (error) {
    console.error('Error getting users:', error);
    return [];
  }
}

// Get user by ID
export async function getUserById(id: string) {
  try {
    return await db.select().from(users).where(eq(users.id, id)).get();
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return null;
  }
}

// Create a new user
export async function createUser(userData: {
  username: string;
  email: string;
  password: string;
  name?: string;
  displayName?: string;
  roleId: string;
}) {
  try {
    const now = new Date();
    const result = await db.insert(users).values({
      id: `u-${Date.now()}`,
      username: userData.username,
      email: userData.email,
      password: userData.password,
      name: userData.name || userData.username,
      displayName: userData.displayName || userData.username,
      roleId: userData.roleId,
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    }).returning().get();
    
    return result;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

// Update user
export async function updateUser(id: string, userData: {
  username?: string;
  email?: string;
  password?: string;
  name?: string;
  displayName?: string;
  roleId?: string;
}) {
  try {
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };
    
    if (userData.username !== undefined) updateData.username = userData.username;
    if (userData.email !== undefined) updateData.email = userData.email;
    if (userData.password !== undefined) updateData.password = userData.password;
    if (userData.name !== undefined) updateData.name = userData.name;
    if (userData.displayName !== undefined) updateData.displayName = userData.displayName;
    if (userData.roleId !== undefined) updateData.roleId = userData.roleId;
    
    await db.update(users).set(updateData).where(eq(users.id, id));
    
    return await getUserById(id);
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

// Delete user
export async function deleteUser(id: string) {
  try {
    // First, invalidate all sessions for this user
    await db.delete(sessions).where(eq(sessions.userId, id));
    
    // Then delete the user
    await db.delete(users).where(eq(users.id, id));
    
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

// ==========================================
// ROLE MANAGEMENT
// ==========================================

// Get all roles
export async function getAllRoles(): Promise<Record<string, unknown>[]> {
  try {
    return await db.select().from(roles).all();
  } catch (error) {
    console.error('Error getting roles:', error);
    return [];
  }
}

// Get role by ID
export async function getRoleById(id: string) {
  try {
    return await db.select().from(roles).where(eq(roles.id, id)).get();
  } catch (error) {
    console.error('Error getting role by ID:', error);
    return null;
  }
}

// Create a new role
export async function createRole(roleData: {
  id: string;
  name: string;
  description?: string;
}) {
  try {
    await db.insert(roles).values({
      id: roleData.id,
      name: roleData.name,
      description: roleData.description || '',
    }).run();
    return roleData;
  } catch (error) {
    console.error('Error creating role:', error);
    throw error;
  }
}

// Update role
export async function updateRole(id: string, roleData: {
  name?: string;
  description?: string;
}) {
  try {
    const updateData: Record<string, unknown> = {};
    
    if (roleData.name !== undefined) updateData.name = roleData.name;
    if (roleData.description !== undefined) updateData.description = roleData.description;
    
    await db.update(roles).set(updateData).where(eq(roles.id, id));
    
    return await getRoleById(id);
  } catch (error) {
    console.error('Error updating role:', error);
    throw error;
  }
}

// Delete role
export async function deleteRole(id: string) {
  try {
    // First, update users with this role to guest
    await db.update(users).set({ roleId: 'guest' }).where(eq(users.roleId, id));
    
    // Then delete the role
    await db.delete(roles).where(eq(roles.id, id));
    
    return true;
  } catch (error) {
    console.error('Error deleting role:', error);
    throw error;
  }
}

// ==========================================
// ABAC PERMISSION MANAGEMENT
// ==========================================

// Get all permissions
export async function getAllPermissions(): Promise<Record<string, unknown>[]> {
  try {
    return await db.select().from(appPermissions).all();
  } catch (error) {
    console.error('Error getting permissions:', error);
    return [];
  }
}

// Get permissions for a specific role
export async function getPermissionsByRole(role: string): Promise<Record<string, unknown>[]> {
  try {
    return await db.select().from(appPermissions).where(eq(appPermissions.role, role)).all();
  } catch (error) {
    console.error('Error getting permissions by role:', error);
    return [];
  }
}

// Create a new permission
export async function createPermission(permissionData: {
  role: string;
  resource: string;
  attribute: string;
  actions: string;
}) {
  try {
    const result = await db.insert(appPermissions).values({
      role: permissionData.role,
      resource: permissionData.resource,
      attribute: permissionData.attribute,
      actions: permissionData.actions,
    }).returning().get();
    
    return result;
  } catch (error) {
    console.error('Error creating permission:', error);
    throw error;
  }
}

// Update permission
export async function updatePermission(id: number, permissionData: {
  role?: string;
  resource?: string;
  attribute?: string;
  actions?: string;
}) {
  try {
    const updateData: Record<string, unknown> = {};
    
    if (permissionData.role !== undefined) updateData.role = permissionData.role;
    if (permissionData.resource !== undefined) updateData.resource = permissionData.resource;
    if (permissionData.attribute !== undefined) updateData.attribute = permissionData.attribute;
    if (permissionData.actions !== undefined) updateData.actions = permissionData.actions;
    
    await db.update(appPermissions).set(updateData).where(eq(appPermissions.id, id));
    
    return await db.select().from(appPermissions).where(eq(appPermissions.id, id)).get();
  } catch (error) {
    console.error('Error updating permission:', error);
    throw error;
  }
}

// Delete permission
export async function deletePermission(id: number) {
  try {
    await db.delete(appPermissions).where(eq(appPermissions.id, id));
    return true;
  } catch (error) {
    console.error('Error deleting permission:', error);
    throw error;
  }
}

// ==========================================
// SESSION MANAGEMENT
// ==========================================

// Get all active sessions
export async function getAllSessions(): Promise<Record<string, unknown>[]> {
  try {
    return await db.select().from(sessions).all();
  } catch (error) {
    console.error('Error getting sessions:', error);
    return [];
  }
}

// Invalidate a session
export async function invalidateSession(sessionId: string) {
  try {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
    return true;
  } catch (error) {
    console.error('Error invalidating session:', error);
    throw error;
  }
}

// Get sessions for a specific user
export async function getSessionsByUser(userId: string): Promise<Record<string, unknown>[]> {
  try {
    return await db.select().from(sessions).where(eq(sessions.userId, userId)).all();
  } catch (error) {
    console.error('Error getting sessions by user:', error);
    return [];
  }
}
