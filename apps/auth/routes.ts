// Auth Routes - Login, Logout, User Management, Role Management, ABAC Management

import { Hono } from 'hono';
import { renderSmart } from '../../shared/hax.ts';
import { auth } from '../../db/auth.ts';
import { 
  requireAuth, 
  requireRole,
  handleLogin, 
  handleLogout,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  getAllPermissions,
  createPermission,
  updatePermission,
  deletePermission,
  getAllSessions,
  invalidateSession,
  getSessionsByUser
} from '../../shared/auth.ts';
import { authViews } from './views.ts';
import type { Context } from 'hono';

const routes = new Hono();

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

// Login route (GET and POST)
routes.get('/login', handleLogin);
routes.post('/login', handleLogin);

// Logout route
routes.get('/logout', handleLogout);
routes.post('/logout', handleLogout);

// ==========================================
// USER MANAGEMENT ROUTES (Admin only)
// ==========================================

// User list - requires admin role
routes.get('/auth/users', requireAuth, requireRole('admin'), async (c: Context) => {
  try {
    const users = await getAllUsers();
    const roles = await getAllRoles();
    
    const meta = {
      currentPath: '/auth/users',
      breadcrumbs: [
        { label: 'Auth', path: '/auth' },
        { label: 'Users', path: '/auth/users' }
      ],
      subAside: {
        title: 'User Management',
        items: [
          { label: 'All Users', path: '/auth/users', active: true },
          { label: 'Create User', path: '/auth/users/create' },
        ]
      },
      contextActions: [
        { label: 'Create User', path: '/auth/users/create', class: 'btn-primary' }
      ]
    };
    
    const content = authViews.userList({ users, roles, meta });
    return renderSmart(c, content);
  } catch (error) {
    console.error('Error in user list route:', error);
    throw error;
  }
});

// Create user form
routes.get('/auth/users/create', requireAuth, requireRole('admin'), async (c: Context) => {
  try {
    const roles = await getAllRoles();
    
    const meta = {
      currentPath: '/auth/users/create',
      breadcrumbs: [
        { label: 'Auth', path: '/auth' },
        { label: 'Users', path: '/auth/users' },
        { label: 'Create', path: '/auth/users/create' }
      ],
      subAside: {
        title: 'User Management',
        items: [
          { label: 'All Users', path: '/auth/users' },
          { label: 'Create User', path: '/auth/users/create', active: true },
        ]
      },
      contextActions: []
    };
    
    const content = authViews.createUser({ roles, meta });
    return renderSmart(c, content);
  } catch (error) {
    console.error('Error in create user route:', error);
    throw error;
  }
});

// Create user handler
routes.post('/auth/users', requireAuth, requireRole('admin'), async (c: Context) => {
  try {
    const form = await c.req.formData();
    const userData = {
      username: form.get('username') as string,
      email: form.get('email') as string,
      password: form.get('password') as string,
      name: form.get('name') as string | undefined,
      displayName: form.get('displayName') as string | undefined,
      roleId: form.get('roleId') as string,
    };
    
    await createUser(userData);
    
    return c.redirect('/auth/users');
  } catch (error) {
    console.error('Error creating user:', error);
    const roles = await getAllRoles();
    const meta = {
      currentPath: '/auth/users/create',
      breadcrumbs: [
        { label: 'Auth', path: '/auth' },
        { label: 'Users', path: '/auth/users' },
        { label: 'Create', path: '/auth/users/create' }
      ],
      subAside: { title: 'User Management', items: [] },
      contextActions: []
    };
    
    const content = authViews.createUser({ roles, meta, error: error instanceof Error ? error.message : 'Error creating user' });
    return renderSmart(c, content);
  }
});

// Edit user form
routes.get('/auth/users/:id/edit', requireAuth, requireRole('admin'), async (c: Context) => {
  try {
    const id = c.req.param('id');
    const user = await getUserById(id);
    const roles = await getAllRoles();
    
    if (!user) {
      return c.text('User not found', 404);
    }
    
    const meta = {
      currentPath: `/auth/users/${id}/edit`,
      breadcrumbs: [
        { label: 'Auth', path: '/auth' },
        { label: 'Users', path: '/auth/users' },
        { label: 'Edit', path: `/auth/users/${id}/edit` }
      ],
      subAside: {
        title: 'User Management',
        items: [
          { label: 'All Users', path: '/auth/users' },
          { label: 'Create User', path: '/auth/users/create' },
        ]
      },
      contextActions: []
    };
    
    const content = authViews.editUser({ user, roles, meta });
    return renderSmart(c, content);
  } catch (error) {
    console.error('Error in edit user route:', error);
    throw error;
  }
});

// Update user handler
routes.post('/auth/users/:id', requireAuth, requireRole('admin'), async (c: Context) => {
  try {
    const id = c.req.param('id');
    const form = await c.req.formData();
    const userData: Record<string, string | undefined> = {
      username: form.get('username') as string | undefined,
      email: form.get('email') as string | undefined,
      name: form.get('name') as string | undefined,
      displayName: form.get('displayName') as string | undefined,
      roleId: form.get('roleId') as string | undefined,
    };
    
    // Only update password if provided
    const password = form.get('password') as string;
    if (password) {
      userData.password = password;
    }
    
    await updateUser(id, userData);
    
    return c.redirect('/auth/users');
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
});

// Delete user handler
routes.post('/auth/users/:id/delete', requireAuth, requireRole('admin'), async (c: Context) => {
  try {
    const id = c.req.param('id');
    await deleteUser(id);
    return c.redirect('/auth/users');
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
});

// ==========================================
// ROLE MANAGEMENT ROUTES (Admin only)
// ==========================================

// Role list
routes.get('/auth/roles', requireAuth, requireRole('admin'), async (c: Context) => {
  try {
    const roles = await getAllRoles();
    
    const meta = {
      currentPath: '/auth/roles',
      breadcrumbs: [
        { label: 'Auth', path: '/auth' },
        { label: 'Roles', path: '/auth/roles' }
      ],
      subAside: {
        title: 'Role Management',
        items: [
          { label: 'All Roles', path: '/auth/roles', active: true },
          { label: 'Create Role', path: '/auth/roles/create' },
        ]
      },
      contextActions: [
        { label: 'Create Role', path: '/auth/roles/create', class: 'btn-primary' }
      ]
    };
    
    const content = authViews.roleList({ roles, meta });
    return renderSmart(c, content);
  } catch (error) {
    console.error('Error in role list route:', error);
    throw error;
  }
});

// Create role form
routes.get('/auth/roles/create', requireAuth, requireRole('admin'), async (c: Context) => {
  const meta = {
    currentPath: '/auth/roles/create',
    breadcrumbs: [
      { label: 'Auth', path: '/auth' },
      { label: 'Roles', path: '/auth/roles' },
      { label: 'Create', path: '/auth/roles/create' }
    ],
    subAside: {
      title: 'Role Management',
      items: [
        { label: 'All Roles', path: '/auth/roles' },
        { label: 'Create Role', path: '/auth/roles/create', active: true },
      ]
    },
    contextActions: []
  };
  
  const content = authViews.createRole({ meta });
  return renderSmart(c, content);
});

// Create role handler
routes.post('/auth/roles', requireAuth, requireRole('admin'), async (c: Context) => {
  try {
    const form = await c.req.formData();
    const roleData = {
      id: form.get('id') as string,
      name: form.get('name') as string,
      description: form.get('description') as string | undefined,
    };
    
    await createRole(roleData);
    
    return c.redirect('/auth/roles');
  } catch (error) {
    console.error('Error creating role:', error);
    const meta = {
      currentPath: '/auth/roles/create',
      breadcrumbs: [
        { label: 'Auth', path: '/auth' },
        { label: 'Roles', path: '/auth/roles' },
        { label: 'Create', path: '/auth/roles/create' }
      ],
      subAside: { title: 'Role Management', items: [] },
      contextActions: []
    };
    
    const content = authViews.createRole({ meta, error: error instanceof Error ? error.message : 'Error creating role' });
    return renderSmart(c, content);
  }
});

// Edit role form
routes.get('/auth/roles/:id/edit', requireAuth, requireRole('admin'), async (c: Context) => {
  try {
    const id = c.req.param('id');
    const role = await getRoleById(id);
    
    if (!role) {
      return c.text('Role not found', 404);
    }
    
    const meta = {
      currentPath: `/auth/roles/${id}/edit`,
      breadcrumbs: [
        { label: 'Auth', path: '/auth' },
        { label: 'Roles', path: '/auth/roles' },
        { label: 'Edit', path: `/auth/roles/${id}/edit` }
      ],
      subAside: {
        title: 'Role Management',
        items: [
          { label: 'All Roles', path: '/auth/roles' },
          { label: 'Create Role', path: '/auth/roles/create' },
        ]
      },
      contextActions: []
    };
    
    const content = authViews.editRole({ role, meta });
    return renderSmart(c, content);
  } catch (error) {
    console.error('Error in edit role route:', error);
    throw error;
  }
});

// Update role handler
routes.post('/auth/roles/:id', requireAuth, requireRole('admin'), async (c: Context) => {
  try {
    const id = c.req.param('id');
    const form = await c.req.formData();
    const roleData = {
      name: form.get('name') as string | undefined,
      description: form.get('description') as string | undefined,
    };
    
    await updateRole(id, roleData);
    
    return c.redirect('/auth/roles');
  } catch (error) {
    console.error('Error updating role:', error);
    throw error;
  }
});

// Delete role handler
routes.post('/auth/roles/:id/delete', requireAuth, requireRole('admin'), async (c: Context) => {
  try {
    const id = c.req.param('id');
    await deleteRole(id);
    return c.redirect('/auth/roles');
  } catch (error) {
    console.error('Error deleting role:', error);
    throw error;
  }
});

// ==========================================
// ABAC PERMISSION MANAGEMENT ROUTES (Admin only)
// ==========================================

// Permission list
routes.get('/auth/permissions', requireAuth, requireRole('admin'), async (c: Context) => {
  try {
    const permissions = await getAllPermissions();
    const roles = await getAllRoles();
    
    // Get unique resources for filter
    const resources = [...new Set(permissions.map(p => String(p.resource)))];
    
    const meta = {
      currentPath: '/auth/permissions',
      breadcrumbs: [
        { label: 'Auth', path: '/auth' },
        { label: 'Permissions', path: '/auth/permissions' }
      ],
      subAside: {
        title: 'ABAC Permissions',
        items: [
          { label: 'All Permissions', path: '/auth/permissions', active: true },
          { label: 'Create Permission', path: '/auth/permissions/create' },
        ]
      },
      contextActions: [
        { label: 'Create Permission', path: '/auth/permissions/create', class: 'btn-primary' }
      ]
    };
    
    const content = authViews.permissionList({ permissions, roles, resources, meta });
    return renderSmart(c, content);
  } catch (error) {
    console.error('Error in permission list route:', error);
    throw error;
  }
});

// Create permission form
routes.get('/auth/permissions/create', requireAuth, requireRole('admin'), async (c: Context) => {
  try {
    const roles = await getAllRoles();
    
    const meta = {
      currentPath: '/auth/permissions/create',
      breadcrumbs: [
        { label: 'Auth', path: '/auth' },
        { label: 'Permissions', path: '/auth/permissions' },
        { label: 'Create', path: '/auth/permissions/create' }
      ],
      subAside: {
        title: 'ABAC Permissions',
        items: [
          { label: 'All Permissions', path: '/auth/permissions' },
          { label: 'Create Permission', path: '/auth/permissions/create', active: true },
        ]
      },
      contextActions: []
    };
    
    const content = authViews.createPermission({ roles, meta });
    return renderSmart(c, content);
  } catch (error) {
    console.error('Error in create permission route:', error);
    throw error;
  }
});

// Create permission handler
routes.post('/auth/permissions', requireAuth, requireRole('admin'), async (c: Context) => {
  try {
    const form = await c.req.formData();
    const permissionData = {
      role: form.get('role') as string,
      resource: form.get('resource') as string,
      attribute: form.get('attribute') as string,
      actions: form.get('actions') as string,
    };
    
    await createPermission(permissionData);
    
    return c.redirect('/auth/permissions');
  } catch (error) {
    console.error('Error creating permission:', error);
    const roles = await getAllRoles();
    const meta = {
      currentPath: '/auth/permissions/create',
      breadcrumbs: [
        { label: 'Auth', path: '/auth' },
        { label: 'Permissions', path: '/auth/permissions' },
        { label: 'Create', path: '/auth/permissions/create' }
      ],
      subAside: { title: 'ABAC Permissions', items: [] },
      contextActions: []
    };
    
    const content = authViews.createPermission({ roles, meta, error: error instanceof Error ? error.message : 'Error creating permission' });
    return renderSmart(c, content);
  }
});

// Edit permission form
routes.get('/auth/permissions/:id/edit', requireAuth, requireRole('admin'), async (c: Context) => {
  try {
    const id = parseInt(c.req.param('id'));
    const permission = (await getAllPermissions()).find(p => p.id === id);
    const roles = await getAllRoles();
    
    if (!permission) {
      return c.text('Permission not found', 404);
    }
    
    const meta = {
      currentPath: `/auth/permissions/${id}/edit`,
      breadcrumbs: [
        { label: 'Auth', path: '/auth' },
        { label: 'Permissions', path: '/auth/permissions' },
        { label: 'Edit', path: `/auth/permissions/${id}/edit` }
      ],
      subAside: {
        title: 'ABAC Permissions',
        items: [
          { label: 'All Permissions', path: '/auth/permissions' },
          { label: 'Create Permission', path: '/auth/permissions/create' },
        ]
      },
      contextActions: []
    };
    
    const content = authViews.editPermission({ permission, roles, meta });
    return renderSmart(c, content);
  } catch (error) {
    console.error('Error in edit permission route:', error);
    throw error;
  }
});

// Update permission handler
routes.post('/auth/permissions/:id', requireAuth, requireRole('admin'), async (c: Context) => {
  try {
    const id = parseInt(c.req.param('id'));
    const form = await c.req.formData();
    const permissionData = {
      role: form.get('role') as string | undefined,
      resource: form.get('resource') as string | undefined,
      attribute: form.get('attribute') as string | undefined,
      actions: form.get('actions') as string | undefined,
    };
    
    await updatePermission(id, permissionData);
    
    return c.redirect('/auth/permissions');
  } catch (error) {
    console.error('Error updating permission:', error);
    throw error;
  }
});

// Delete permission handler
routes.post('/auth/permissions/:id/delete', requireAuth, requireRole('admin'), async (c: Context) => {
  try {
    const id = parseInt(c.req.param('id'));
    await deletePermission(id);
    return c.redirect('/auth/permissions');
  } catch (error) {
    console.error('Error deleting permission:', error);
    throw error;
  }
});

// ==========================================
// SESSION MANAGEMENT ROUTES (Admin only)
// ==========================================

// Session list
routes.get('/auth/sessions', requireAuth, requireRole('admin'), async (c: Context) => {
  try {
    const sessions = await getAllSessions();
    const users = await getAllUsers();
    
    // Map user IDs to usernames
    const userMap = new Map(users.map(u => [u.id, u.username || u.email]));
    
    const sessionsWithUser = sessions.map(s => ({
      ...s,
      username: userMap.get(s.userId) || 'Unknown'
    }));
    
    const meta = {
      currentPath: '/auth/sessions',
      breadcrumbs: [
        { label: 'Auth', path: '/auth' },
        { label: 'Sessions', path: '/auth/sessions' }
      ],
      subAside: {
        title: 'Session Management',
        items: [
          { label: 'Active Sessions', path: '/auth/sessions', active: true },
        ]
      },
      contextActions: []
    };
    
    const content = authViews.sessionList({ sessions: sessionsWithUser, meta });
    return renderSmart(c, content);
  } catch (error) {
    console.error('Error in session list route:', error);
    throw error;
  }
});

// Invalidate session handler
routes.post('/auth/sessions/:id/invalidate', requireAuth, requireRole('admin'), async (c: Context) => {
  try {
    const sessionId = c.req.param('id');
    await invalidateSession(sessionId);
    return c.redirect('/auth/sessions');
  } catch (error) {
    console.error('Error invalidating session:', error);
    throw error;
  }
});

// ==========================================
// AUTH DASHBOARD
// ==========================================

// Auth dashboard
routes.get('/auth', requireAuth, requireRole('admin'), async (c: Context) => {
  try {
    const userCount = (await getAllUsers()).length;
    const roleCount = (await getAllRoles()).length;
    const permissionCount = (await getAllPermissions()).length;
    const sessionCount = (await getAllSessions()).length;
    
    const meta = {
      currentPath: '/auth',
      breadcrumbs: [
        { label: 'Auth', path: '/auth' }
      ],
      subAside: {
        title: 'Auth Management',
        items: [
          { label: 'Dashboard', path: '/auth', active: true },
          { label: 'Users', path: '/auth/users' },
          { label: 'Roles', path: '/auth/roles' },
          { label: 'Permissions', path: '/auth/permissions' },
          { label: 'Sessions', path: '/auth/sessions' },
        ]
      },
      contextActions: []
    };
    
    const content = authViews.dashboard({
      userCount,
      roleCount,
      permissionCount,
      sessionCount,
      meta
    });
    return renderSmart(c, content);
  } catch (error) {
    console.error('Error in auth dashboard route:', error);
    throw error;
  }
});

// ==========================================
// PROFILE ROUTE (for all authenticated users)
// ==========================================

// User profile
routes.get('/auth/profile', requireAuth, async (c: Context) => {
  try {
    const user = c.get('user');
    if (!user) {
      return c.redirect('/login');
    }
    
    // Get full user details
    const fullUser = await getUserById(user.id);
    
    const meta = {
      currentPath: '/auth/profile',
      breadcrumbs: [
        { label: 'Profile', path: '/auth/profile' }
      ],
      subAside: {
        title: 'Profile',
        items: [
          { label: 'My Profile', path: '/auth/profile', active: true },
          { label: 'My Sessions', path: '/auth/profile/sessions' },
        ]
      },
      contextActions: []
    };
    
    const content = authViews.profile({ user: fullUser, meta });
    return renderSmart(c, content);
  } catch (error) {
    console.error('Error in profile route:', error);
    throw error;
  }
});

// User sessions
routes.get('/auth/profile/sessions', requireAuth, async (c: Context) => {
  try {
    const user = c.get('user');
    if (!user) {
      return c.redirect('/login');
    }
    
    const sessions = await getSessionsByUser(user.id);
    
    const meta = {
      currentPath: '/auth/profile/sessions',
      breadcrumbs: [
        { label: 'Profile', path: '/auth/profile' },
        { label: 'Sessions', path: '/auth/profile/sessions' }
      ],
      subAside: {
        title: 'Profile',
        items: [
          { label: 'My Profile', path: '/auth/profile' },
          { label: 'My Sessions', path: '/auth/profile/sessions', active: true },
        ]
      },
      contextActions: []
    };
    
    const content = authViews.profileSessions({ sessions, meta });
    return renderSmart(c, content);
  } catch (error) {
    console.error('Error in profile sessions route:', error);
    throw error;
  }
});

// Invalidate own session
routes.post('/auth/profile/sessions/:id/invalidate', requireAuth, async (c: Context) => {
  try {
    const sessionId = c.req.param('id');
    const currentSession = await auth.api.getSession({ headers: c.req.raw.headers });

    // Sign out fully when invalidating the current session
    if (currentSession && sessionId === currentSession.session.id) {
      const response = await auth.api.signOut({
        headers: c.req.raw.headers,
        asResponse: true,
      });
      const setCookieHeader = response.headers.get('set-cookie');
      if (setCookieHeader) {
        c.header('set-cookie', setCookieHeader, { append: true });
      }
      return c.redirect('/login');
    }

    await invalidateSession(sessionId);
    return c.redirect('/auth/profile/sessions');
  } catch (error) {
    console.error('Error invalidating session:', error);
    throw error;
  }
});

export default routes;
