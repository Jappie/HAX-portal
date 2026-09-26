// Auth Views - HTML templates for user, role, and permission management

import { html } from 'hono/html';
import { navStateScript } from '../../shared/hax.ts';
import { Button } from '../../shared/opui/Button.ts';

interface BreadcrumbItem {
  label: string;
  path: string;
}

interface SubAsideItem {
  label: string;
  path: string;
  active?: boolean;
}

interface SubAside {
  title: string;
  items: SubAsideItem[];
}

interface ContextAction {
  label: string;
  path?: string;
  class: string;
  action?: string;
}

interface NavigationMeta {
  currentPath: string;
  breadcrumbs: BreadcrumbItem[];
  subAside: SubAside;
  contextActions: ContextAction[];
}

interface ViewProps {
  meta: NavigationMeta;
}

// Helper to generate navigation state as JSON script tag
function getNavStateScript(meta: NavigationMeta) {
  return navStateScript(meta);
}

// ==========================================
// LOGIN VIEW
// ==========================================

export const authViews = {
  // Dashboard
  dashboard: ({ userCount, roleCount, permissionCount, sessionCount, meta }: ViewProps & {
    userCount: number;
    roleCount: number;
    permissionCount: number;
    sessionCount: number;
  }) => {
    const navState = getNavStateScript(meta);
    
    return html`${navState}
      <div class="content-header">
        <h2>Auth Management Dashboard</h2>
      </div>
      
      <div class="ui-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--size-4); margin-bottom: var(--size-6);">
        <div class="ui-card ui-outlined ui-elevated ui-tonal" style="padding: var(--size-4); text-align: center;">
          <h3 style="margin: 0 0 var(--size-2) 0; font-size: var(--font-size-2);">${userCount}</h3>
          <p style="margin: 0; color: var(--text-muted);">Users</p>
        </div>
        <div class="ui-card ui-outlined ui-elevated ui-tonal" style="padding: var(--size-4); text-align: center;">
          <h3 style="margin: 0 0 var(--size-2) 0; font-size: var(--font-size-2);">${roleCount}</h3>
          <p style="margin: 0; color: var(--text-muted);">Roles</p>
        </div>
        <div class="ui-card ui-outlined ui-elevated ui-tonal" style="padding: var(--size-4); text-align: center;">
          <h3 style="margin: 0 0 var(--size-2) 0; font-size: var(--font-size-2);">${permissionCount}</h3>
          <p style="margin: 0; color: var(--text-muted);">Permissions</p>
        </div>
        <div class="ui-card ui-outlined ui-elevated ui-tonal" style="padding: var(--size-4); text-align: center;">
          <h3 style="margin: 0 0 var(--size-2) 0; font-size: var(--font-size-2);">${sessionCount}</h3>
          <p style="margin: 0; color: var(--text-muted);">Active Sessions</p>
        </div>
      </div>
      
      <div class="ui-card ui-outlined ui-elevated ui-tonal" style="padding: var(--size-6);">
        <h3 style="margin-top: 0;">Quick Actions</h3>
        <div style="display: flex; gap: var(--size-4); flex-wrap: wrap; margin-top: var(--size-4);">
          ${Button({ label: 'Manage Users', path: '/auth/users', class: 'ui-btn ui-btn-sm ui-btn-primary' })}
          ${Button({ label: 'Manage Roles', path: '/auth/roles', class: 'ui-btn ui-btn-sm ui-btn-secondary' })}
          ${Button({ label: 'Manage Permissions', path: '/auth/permissions', class: 'ui-btn ui-btn-sm ui-btn-secondary' })}
          ${Button({ label: 'View Sessions', path: '/auth/sessions', class: 'ui-btn ui-btn-sm ui-btn-secondary' })}
        </div>
      </div>
    `;
  },

  // ==========================================
  // USER MANAGEMENT VIEWS
  // ==========================================

  userList: ({ users, roles, meta }: ViewProps & { users: Record<string, unknown>[]; roles: Record<string, unknown>[] }) => {
    const navState = getNavStateScript(meta);
    
    return html`${navState}
      <div class="content-header">
        <h2>User Management</h2>
      </div>
      
      <div class="ui-card ui-outlined ui-elevated ui-tonal" style="padding: var(--size-4);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--size-4);">
          <h3 style="margin: 0;">Users (${users.length})</h3>
          ${Button({ label: '+ Create User', path: '/auth/users/create', class: 'ui-btn ui-btn-sm ui-btn-primary' })}
        </div>
        
        ${users.length === 0 ? html`<p style="color: var(--text-muted);">No users found.</p>` : ''}
        
        <div class="ui-table-container" style="overflow-x: auto;">
          <table class="ui-table" style="width: 100%;">
            <thead>
              <tr>
                <th style="text-align: left; padding: var(--size-2);">Username</th>
                <th style="text-align: left; padding: var(--size-2);">Email</th>
                <th style="text-align: left; padding: var(--size-2);">Display Name</th>
                <th style="text-align: left; padding: var(--size-2);">Role</th>
                <th style="text-align: left; padding: var(--size-2);">Created</th>
                <th style="text-align: right; padding: var(--size-2);">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${users.map(user => {
                const role = roles.find(r => r.id === user.roleId);
                const roleName = role ? role.name : user.roleId;
                const createdDate = new Date(user.createdAt).toLocaleDateString();
                
                return html`<tr>
                  <td style="padding: var(--size-2);">${user.username || user.email}</td>
                  <td style="padding: var(--size-2);">${user.email}</td>
                  <td style="padding: var(--size-2);">${user.displayName || user.name || '-'}</td>
                  <td style="padding: var(--size-2);">
                    <span class="ui-badge ui-badge-sm" style="background: var(--color-primary-light); color: var(--color-primary-dark);">
                      ${roleName}
                    </span>
                  </td>
                  <td style="padding: var(--size-2); color: var(--text-muted);">${createdDate}</td>
                  <td style="padding: var(--size-2); text-align: right;">
                    ${Button({ label: 'Edit', path: `/auth/users/${user.id}/edit`, class: 'ui-btn ui-btn-xs ui-btn-secondary' })}
                    <form method="POST" action="/auth/users/${user.id}/delete" style="display: inline;">
                      <button type="submit" class="ui-btn ui-btn-xs ui-btn-danger" 
                              onclick="return confirm('Are you sure you want to delete this user?')">
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>`;
              })}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  createUser: ({ roles, meta, error }: ViewProps & { roles: Record<string, unknown>[]; error?: string }) => {
    const navState = getNavStateScript(meta);
    
    const errorHtml = error ? html`<div class="ui-alert ui-alert-error" style="margin-bottom: var(--size-4);">${error}</div>` : '';
    
    return html`${navState}
      <div class="content-header">
        <h2>Create User</h2>
      </div>
      
      <div class="ui-card ui-outlined ui-elevated ui-tonal" style="padding: var(--size-6); max-width: 600px;">
        ${errorHtml}
        
        <form method="POST" action="/auth/users">
          <div class="form-group" style="margin-bottom: var(--size-4);">
            <label for="username" style="display: block; margin-bottom: var(--size-2); font-weight: var(--font-weight-6);">
              Username *
            </label>
            <input 
              type="text" 
              id="username" 
              name="username" 
              required
              placeholder="Enter username"
              style="width: 100%; padding: var(--size-3); border: 1px solid var(--border); border-radius: var(--radius-2);"
            >
          </div>
          
          <div class="form-group" style="margin-bottom: var(--size-4);">
            <label for="email" style="display: block; margin-bottom: var(--size-2); font-weight: var(--font-weight-6);">
              Email *
            </label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              required
              placeholder="Enter email"
              style="width: 100%; padding: var(--size-3); border: 1px solid var(--border); border-radius: var(--radius-2);"
            >
          </div>
          
          <div class="form-group" style="margin-bottom: var(--size-4);">
            <label for="password" style="display: block; margin-bottom: var(--size-2); font-weight: var(--font-weight-6);">
              Password *
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
          
          <div class="form-group" style="margin-bottom: var(--size-4);">
            <label for="name" style="display: block; margin-bottom: var(--size-2); font-weight: var(--font-weight-6);">
              Name
            </label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              placeholder="Enter full name"
              style="width: 100%; padding: var(--size-3); border: 1px solid var(--border); border-radius: var(--radius-2);"
            >
          </div>
          
          <div class="form-group" style="margin-bottom: var(--size-4);">
            <label for="displayName" style="display: block; margin-bottom: var(--size-2); font-weight: var(--font-weight-6);">
              Display Name
            </label>
            <input 
              type="text" 
              id="displayName" 
              name="displayName" 
              placeholder="Enter display name"
              style="width: 100%; padding: var(--size-3); border: 1px solid var(--border); border-radius: var(--radius-2);"
            >
          </div>
          
          <div class="form-group" style="margin-bottom: var(--size-4);">
            <label for="roleId" style="display: block; margin-bottom: var(--size-2); font-weight: var(--font-weight-6);">
              Role *
            </label>
            <select 
              id="roleId" 
              name="roleId" 
              required
              style="width: 100%; padding: var(--size-3); border: 1px solid var(--border); border-radius: var(--radius-2);"
            >
              <option value="">Select a role</option>
              ${roles.map(role => html`<option value="${role.id}">${role.name} (${role.id})</option>`)}
            </select>
          </div>
          
          <div style="display: flex; gap: var(--size-4); margin-top: var(--size-6);">
            <button type="submit" class="ui-btn ui-btn-primary">Create User</button>
            ${Button({ label: 'Cancel', path: '/auth/users', class: 'ui-btn ui-btn-secondary' })}
          </div>
        </form>
      </div>
    `;
  },

  editUser: ({ user, roles, meta }: ViewProps & { user: Record<string, unknown>; roles: Record<string, unknown>[] }) => {
    const navState = getNavStateScript(meta);
    
    return html`${navState}
      <div class="content-header">
        <h2>Edit User: ${user.username || user.email}</h2>
      </div>
      
      <div class="ui-card ui-outlined ui-elevated ui-tonal" style="padding: var(--size-6); max-width: 600px;">
        <form method="POST" action="/auth/users/${user.id}">
          <div class="form-group" style="margin-bottom: var(--size-4);">
            <label for="username" style="display: block; margin-bottom: var(--size-2); font-weight: var(--font-weight-6);">
              Username *
            </label>
            <input 
              type="text" 
              id="username" 
              name="username" 
              required
              value="${user.username || ''}"
              style="width: 100%; padding: var(--size-3); border: 1px solid var(--border); border-radius: var(--radius-2);"
            >
          </div>
          
          <div class="form-group" style="margin-bottom: var(--size-4);">
            <label for="email" style="display: block; margin-bottom: var(--size-2); font-weight: var(--font-weight-6);">
              Email *
            </label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              required
              value="${user.email || ''}"
              style="width: 100%; padding: var(--size-3); border: 1px solid var(--border); border-radius: var(--radius-2);"
            >
          </div>
          
          <div class="form-group" style="margin-bottom: var(--size-4);">
            <label for="password" style="display: block; margin-bottom: var(--size-2); font-weight: var(--font-weight-6);">
              New Password (leave blank to keep current)
            </label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              placeholder="Enter new password"
              style="width: 100%; padding: var(--size-3); border: 1px solid var(--border); border-radius: var(--radius-2);"
            >
          </div>
          
          <div class="form-group" style="margin-bottom: var(--size-4);">
            <label for="name" style="display: block; margin-bottom: var(--size-2); font-weight: var(--font-weight-6);">
              Name
            </label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              value="${user.name || ''}"
              placeholder="Enter full name"
              style="width: 100%; padding: var(--size-3); border: 1px solid var(--border); border-radius: var(--radius-2);"
            >
          </div>
          
          <div class="form-group" style="margin-bottom: var(--size-4);">
            <label for="displayName" style="display: block; margin-bottom: var(--size-2); font-weight: var(--font-weight-6);">
              Display Name
            </label>
            <input 
              type="text" 
              id="displayName" 
              name="displayName" 
              value="${user.displayName || ''}"
              placeholder="Enter display name"
              style="width: 100%; padding: var(--size-3); border: 1px solid var(--border); border-radius: var(--radius-2);"
            >
          </div>
          
          <div class="form-group" style="margin-bottom: var(--size-4);">
            <label for="roleId" style="display: block; margin-bottom: var(--size-2); font-weight: var(--font-weight-6);">
              Role *
            </label>
            <select 
              id="roleId" 
              name="roleId" 
              required
              style="width: 100%; padding: var(--size-3); border: 1px solid var(--border); border-radius: var(--radius-2);"
            >
              ${roles.map(role => html`<option value="${role.id}" ${user.roleId === role.id ? 'selected' : ''}>${role.name} (${role.id})</option>`)}
            </select>
          </div>
          
          <div style="display: flex; gap: var(--size-4); margin-top: var(--size-6);">
            <button type="submit" class="ui-btn ui-btn-primary">Update User</button>
            ${Button({ label: 'Cancel', path: '/auth/users', class: 'ui-btn ui-btn-secondary' })}
          </div>
        </form>
      </div>
    `;
  },

  // ==========================================
  // ROLE MANAGEMENT VIEWS
  // ==========================================

  roleList: ({ roles, meta }: ViewProps & { roles: Record<string, unknown>[] }) => {
    const navState = getNavStateScript(meta);
    
    return html`${navState}
      <div class="content-header">
        <h2>Role Management</h2>
      </div>
      
      <div class="ui-card ui-outlined ui-elevated ui-tonal" style="padding: var(--size-4);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--size-4);">
          <h3 style="margin: 0;">Roles (${roles.length})</h3>
          ${Button({ label: '+ Create Role', path: '/auth/roles/create', class: 'ui-btn ui-btn-sm ui-btn-primary' })}
        </div>
        
        ${roles.length === 0 ? html`<p style="color: var(--text-muted);">No roles found.</p>` : ''}
        
        <div class="ui-table-container" style="overflow-x: auto;">
          <table class="ui-table" style="width: 100%;">
            <thead>
              <tr>
                <th style="text-align: left; padding: var(--size-2);">ID</th>
                <th style="text-align: left; padding: var(--size-2);">Name</th>
                <th style="text-align: left; padding: var(--size-2);">Description</th>
                <th style="text-align: right; padding: var(--size-2);">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${roles.map(role => html`<tr>
                <td style="padding: var(--size-2);"><code>${role.id}</code></td>
                <td style="padding: var(--size-2);">${role.name}</td>
                <td style="padding: var(--size-2); color: var(--text-muted);">${role.description || '-'}</td>
                <td style="padding: var(--size-2); text-align: right;">
                  ${Button({ label: 'Edit', path: `/auth/roles/${role.id}/edit`, class: 'ui-btn ui-btn-xs ui-btn-secondary' })}
                  ${role.id !== 'admin' && role.id !== 'guest' ? html`
                    <form method="POST" action="/auth/roles/${role.id}/delete" style="display: inline;">
                      <button type="submit" class="ui-btn ui-btn-xs ui-btn-danger" 
                              onclick="return confirm('Are you sure you want to delete this role? Users with this role will be assigned to guest.')">
                        Delete
                      </button>
                    </form>
                  ` : ''}
                </td>
              </tr>`)}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  createRole: ({ meta, error }: ViewProps & { error?: string }) => {
    const navState = getNavStateScript(meta);
    
    const errorHtml = error ? html`<div class="ui-alert ui-alert-error" style="margin-bottom: var(--size-4);">${error}</div>` : '';
    
    return html`${navState}
      <div class="content-header">
        <h2>Create Role</h2>
      </div>
      
      <div class="ui-card ui-outlined ui-elevated ui-tonal" style="padding: var(--size-6); max-width: 600px;">
        ${errorHtml}
        
        <form method="POST" action="/auth/roles">
          <div class="form-group" style="margin-bottom: var(--size-4);">
            <label for="id" style="display: block; margin-bottom: var(--size-2); font-weight: var(--font-weight-6);">
              Role ID *
            </label>
            <input 
              type="text" 
              id="id" 
              name="id" 
              required
              placeholder="e.g., sales, support, manager"
              pattern="[a-zA-Z0-9_]+"
              title="Only letters, numbers, and underscores"
              style="width: 100%; padding: var(--size-3); border: 1px solid var(--border); border-radius: var(--radius-2);"
            >
          </div>
          
          <div class="form-group" style="margin-bottom: var(--size-4);">
            <label for="name" style="display: block; margin-bottom: var(--size-2); font-weight: var(--font-weight-6);">
              Role Name *
            </label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              required
              placeholder="e.g., Sales Agent"
              style="width: 100%; padding: var(--size-3); border: 1px solid var(--border); border-radius: var(--radius-2);"
            >
          </div>
          
          <div class="form-group" style="margin-bottom: var(--size-4);">
            <label for="description" style="display: block; margin-bottom: var(--size-2); font-weight: var(--font-weight-6);">
              Description
            </label>
            <textarea 
              id="description" 
              name="description" 
              placeholder="Enter role description"
              rows="3"
              style="width: 100%; padding: var(--size-3); border: 1px solid var(--border); border-radius: var(--radius-2);"
            ></textarea>
          </div>
          
          <div style="display: flex; gap: var(--size-4); margin-top: var(--size-6);">
            <button type="submit" class="ui-btn ui-btn-primary">Create Role</button>
            ${Button({ label: 'Cancel', path: '/auth/roles', class: 'ui-btn ui-btn-secondary' })}
          </div>
        </form>
      </div>
    `;
  },

  editRole: ({ role, meta }: ViewProps & { role: Record<string, unknown> }) => {
    const navState = getNavStateScript(meta);
    
    return html`${navState}
      <div class="content-header">
        <h2>Edit Role: ${role.name}</h2>
      </div>
      
      <div class="ui-card ui-outlined ui-elevated ui-tonal" style="padding: var(--size-6); max-width: 600px;">
        <form method="POST" action="/auth/roles/${role.id}">
          <div class="form-group" style="margin-bottom: var(--size-4);">
            <label for="id" style="display: block; margin-bottom: var(--size-2); font-weight: var(--font-weight-6);">
              Role ID *
            </label>
            <input 
              type="text" 
              id="id" 
              name="id" 
              value="${role.id}"
              disabled
              style="width: 100%; padding: var(--size-3); border: 1px solid var(--border); border-radius: var(--radius-2); background: var(--surface-1);"
            >
          </div>
          
          <div class="form-group" style="margin-bottom: var(--size-4);">
            <label for="name" style="display: block; margin-bottom: var(--size-2); font-weight: var(--font-weight-6);">
              Role Name *
            </label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              required
              value="${role.name || ''}"
              placeholder="Enter role name"
              style="width: 100%; padding: var(--size-3); border: 1px solid var(--border); border-radius: var(--radius-2);"
            >
          </div>
          
          <div class="form-group" style="margin-bottom: var(--size-4);">
            <label for="description" style="display: block; margin-bottom: var(--size-2); font-weight: var(--font-weight-6);">
              Description
            </label>
            <textarea 
              id="description" 
              name="description" 
              placeholder="Enter role description"
              rows="3"
              style="width: 100%; padding: var(--size-3); border: 1px solid var(--border); border-radius: var(--radius-2);"
            >${role.description || ''}</textarea>
          </div>
          
          <div style="display: flex; gap: var(--size-4); margin-top: var(--size-6);">
            <button type="submit" class="ui-btn ui-btn-primary">Update Role</button>
            ${Button({ label: 'Cancel', path: '/auth/roles', class: 'ui-btn ui-btn-secondary' })}
          </div>
        </form>
      </div>
    `;
  },

  // ==========================================
  // PERMISSION MANAGEMENT VIEWS
  // ==========================================

  permissionList: ({ permissions, roles, resources, meta }: ViewProps & { 
    permissions: Record<string, unknown>[]; 
    roles: Record<string, unknown>[]; 
    resources: string[];
  }) => {
    const navState = getNavStateScript(meta);
    
    return html`${navState}
      <div class="content-header">
        <h2>ABAC Permission Management</h2>
        <p style="color: var(--text-muted); margin-top: var(--size-2);">
          Attribute-Based Access Control: Define what roles can do on which resources and attributes.
        </p>
      </div>
      
      <div class="ui-card ui-outlined ui-elevated ui-tonal" style="padding: var(--size-4);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--size-4);">
          <h3 style="margin: 0;">Permissions (${permissions.length})</h3>
          ${Button({ label: '+ Create Permission', path: '/auth/permissions/create', class: 'ui-btn ui-btn-sm ui-btn-primary' })}
        </div>
        
        ${permissions.length === 0 ? html`<p style="color: var(--text-muted);">No permissions found.</p>` : ''}
        
        <div class="ui-table-container" style="overflow-x: auto;">
          <table class="ui-table" style="width: 100%;">
            <thead>
              <tr>
                <th style="text-align: left; padding: var(--size-2);">Role</th>
                <th style="text-align: left; padding: var(--size-2);">Resource</th>
                <th style="text-align: left; padding: var(--size-2);">Attribute</th>
                <th style="text-align: left; padding: var(--size-2);">Actions</th>
                <th style="text-align: right; padding: var(--size-2);">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${permissions.map(perm => {
                const role = roles.find(r => r.id === perm.role);
                const roleName = role ? role.name : perm.role;
                
                return html`<tr>
                  <td style="padding: var(--size-2);">
                    <span class="ui-badge ui-badge-sm" style="background: var(--color-primary-light); color: var(--color-primary-dark);">
                      ${roleName}
                    </span>
                  </td>
                  <td style="padding: var(--size-2);"><code>${perm.resource}</code></td>
                  <td style="padding: var(--size-2);"><code>${perm.attribute}</code></td>
                  <td style="padding: var(--size-2);">
                    <code>${perm.actions}</code>
                    ${perm.actions === 'CRUD' ? html`<span style="color: var(--text-muted);"> (Full)</span>` : ''}
                    ${perm.actions === 'CRU' ? html`<span style="color: var(--text-muted);"> (No Delete)</span>` : ''}
                    ${perm.actions === 'R' ? html`<span style="color: var(--text-muted);"> (Read-only)</span>` : ''}
                  </td>
                  <td style="padding: var(--size-2); text-align: right;">
                    ${Button({ label: 'Edit', path: `/auth/permissions/${perm.id}/edit`, class: 'ui-btn ui-btn-xs ui-btn-secondary' })}
                    <form method="POST" action="/auth/permissions/${perm.id}/delete" style="display: inline;">
                      <button type="submit" class="ui-btn ui-btn-xs ui-btn-danger" 
                              onclick="return confirm('Are you sure you want to delete this permission?')">
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>`;
              })}
            </tbody>
          </table>
        </div>
        
        ${resources.length > 0 ? html`
          <div style="margin-top: var(--size-6); padding-top: var(--size-4); border-top: 1px solid var(--border);">
            <h4 style="margin: 0 0 var(--size-2) 0;">Resources with Permissions:</h4>
            <div style="display: flex; flex-wrap: wrap; gap: var(--size-2);">
              ${resources.map(resource => html`
                <span class="ui-badge ui-badge-sm" style="background: var(--surface-2);">
                  ${resource}
                </span>
              `)}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  },

  createPermission: ({ roles, meta, error }: ViewProps & { roles: Record<string, unknown>[]; error?: string }) => {
    const navState = getNavStateScript(meta);
    
    const errorHtml = error ? html`<div class="ui-alert ui-alert-error" style="margin-bottom: var(--size-4);">${error}</div>` : '';
    
    return html`${navState}
      <div class="content-header">
        <h2>Create Permission</h2>
      </div>
      
      <div class="ui-card ui-outlined ui-elevated ui-tonal" style="padding: var(--size-6); max-width: 600px;">
        ${errorHtml}
        
        <form method="POST" action="/auth/permissions">
          <div class="form-group" style="margin-bottom: var(--size-4);">
            <label for="role" style="display: block; margin-bottom: var(--size-2); font-weight: var(--font-weight-6);">
              Role *
            </label>
            <select 
              id="role" 
              name="role" 
              required
              style="width: 100%; padding: var(--size-3); border: 1px solid var(--border); border-radius: var(--radius-2);"
            >
              <option value="">Select a role</option>
              ${roles.map(role => html`<option value="${role.id}">${role.name} (${role.id})</option>`)}
            </select>
          </div>
          
          <div class="form-group" style="margin-bottom: var(--size-4);">
            <label for="resource" style="display: block; margin-bottom: var(--size-2); font-weight: var(--font-weight-6);">
              Resource *
            </label>
            <input 
              type="text" 
              id="resource" 
              name="resource" 
              required
              placeholder="e.g., customers, contacts, addresses"
              style="width: 100%; padding: var(--size-3); border: 1px solid var(--border); border-radius: var(--radius-2);"
            >
          </div>
          
          <div class="form-group" style="margin-bottom: var(--size-4);">
            <label for="attribute" style="display: block; margin-bottom: var(--size-2); font-weight: var(--font-weight-6);">
              Attribute *
            </label>
            <input 
              type="text" 
              id="attribute" 
              name="attribute" 
              required
              placeholder="e.g., id, name, email, * (for all)"
              style="width: 100%; padding: var(--size-3); border: 1px solid var(--border); border-radius: var(--radius-2);"
            >
          </div>
          
          <div class="form-group" style="margin-bottom: var(--size-4);">
            <label for="actions" style="display: block; margin-bottom: var(--size-2); font-weight: var(--font-weight-6);">
              Actions *
            </label>
            <select 
              id="actions" 
              name="actions" 
              required
              style="width: 100%; padding: var(--size-3); border: 1px solid var(--border); border-radius: var(--radius-2);"
            >
              <option value="">Select actions</option>
              <option value="CRUD">CRUD (Full Access)</option>
              <option value="CRU">CRU (Create, Read, Update)</option>
              <option value="RU">RU (Read, Update)</option>
              <option value="R">R (Read-only)</option>
              <option value="C">C (Create only)</option>
              <option value="U">U (Update only)</option>
              <option value="D">D (Delete only)</option>
            </select>
            <p style="margin-top: var(--size-2); color: var(--text-muted); font-size: var(--font-size-0);">
              CRUD = Create, Read, Update, Delete
            </p>
          </div>
          
          <div style="display: flex; gap: var(--size-4); margin-top: var(--size-6);">
            <button type="submit" class="ui-btn ui-btn-primary">Create Permission</button>
            ${Button({ label: 'Cancel', path: '/auth/permissions', class: 'ui-btn ui-btn-secondary' })}
          </div>
        </form>
      </div>
    `;
  },

  editPermission: ({ permission, roles, meta }: ViewProps & { permission: Record<string, unknown>; roles: Record<string, unknown>[] }) => {
    const navState = getNavStateScript(meta);
    
    return html`${navState}
      <div class="content-header">
        <h2>Edit Permission</h2>
      </div>
      
      <div class="ui-card ui-outlined ui-elevated ui-tonal" style="padding: var(--size-6); max-width: 600px;">
        <form method="POST" action="/auth/permissions/${permission.id}">
          <div class="form-group" style="margin-bottom: var(--size-4);">
            <label for="role" style="display: block; margin-bottom: var(--size-2); font-weight: var(--font-weight-6);">
              Role *
            </label>
            <select 
              id="role" 
              name="role" 
              required
              style="width: 100%; padding: var(--size-3); border: 1px solid var(--border); border-radius: var(--radius-2);"
            >
              ${roles.map(role => html`<option value="${role.id}" ${permission.role === role.id ? 'selected' : ''}>${role.name} (${role.id})</option>`)}
            </select>
          </div>
          
          <div class="form-group" style="margin-bottom: var(--size-4);">
            <label for="resource" style="display: block; margin-bottom: var(--size-2); font-weight: var(--font-weight-6);">
              Resource *
            </label>
            <input 
              type="text" 
              id="resource" 
              name="resource" 
              required
              value="${permission.resource}"
              placeholder="Enter resource"
              style="width: 100%; padding: var(--size-3); border: 1px solid var(--border); border-radius: var(--radius-2);"
            >
          </div>
          
          <div class="form-group" style="margin-bottom: var(--size-4);">
            <label for="attribute" style="display: block; margin-bottom: var(--size-2); font-weight: var(--font-weight-6);">
              Attribute *
            </label>
            <input 
              type="text" 
              id="attribute" 
              name="attribute" 
              required
              value="${permission.attribute}"
              placeholder="Enter attribute"
              style="width: 100%; padding: var(--size-3); border: 1px solid var(--border); border-radius: var(--radius-2);"
            >
          </div>
          
          <div class="form-group" style="margin-bottom: var(--size-4);">
            <label for="actions" style="display: block; margin-bottom: var(--size-2); font-weight: var(--font-weight-6);">
              Actions *
            </label>
            <select 
              id="actions" 
              name="actions" 
              required
              style="width: 100%; padding: var(--size-3); border: 1px solid var(--border); border-radius: var(--radius-2);"
            >
              <option value="CRUD" ${permission.actions === 'CRUD' ? 'selected' : ''}>CRUD (Full Access)</option>
              <option value="CRU" ${permission.actions === 'CRU' ? 'selected' : ''}>CRU (Create, Read, Update)</option>
              <option value="RU" ${permission.actions === 'RU' ? 'selected' : ''}>RU (Read, Update)</option>
              <option value="R" ${permission.actions === 'R' ? 'selected' : ''}>R (Read-only)</option>
              <option value="C" ${permission.actions === 'C' ? 'selected' : ''}>C (Create only)</option>
              <option value="U" ${permission.actions === 'U' ? 'selected' : ''}>U (Update only)</option>
              <option value="D" ${permission.actions === 'D' ? 'selected' : ''}>D (Delete only)</option>
            </select>
          </div>
          
          <div style="display: flex; gap: var(--size-4); margin-top: var(--size-6);">
            <button type="submit" class="ui-btn ui-btn-primary">Update Permission</button>
            ${Button({ label: 'Cancel', path: '/auth/permissions', class: 'ui-btn ui-btn-secondary' })}
          </div>
        </form>
      </div>
    `;
  },

  // ==========================================
  // SESSION MANAGEMENT VIEWS
  // ==========================================

  sessionList: ({ sessions, meta }: ViewProps & { sessions: Record<string, unknown>[] }) => {
    const navState = getNavStateScript(meta);
    
    return html`${navState}
      <div class="content-header">
        <h2>Session Management</h2>
      </div>
      
      <div class="ui-card ui-outlined ui-elevated ui-tonal" style="padding: var(--size-4);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--size-4);">
          <h3 style="margin: 0;">Active Sessions (${sessions.length})</h3>
        </div>
        
        ${sessions.length === 0 ? html`<p style="color: var(--text-muted);">No active sessions found.</p>` : ''}
        
        <div class="ui-table-container" style="overflow-x: auto;">
          <table class="ui-table" style="width: 100%;">
            <thead>
              <tr>
                <th style="text-align: left; padding: var(--size-2);">User</th>
                <th style="text-align: left; padding: var(--size-2);">Session ID</th>
                <th style="text-align: left; padding: var(--size-2);">IP Address</th>
                <th style="text-align: left; padding: var(--size-2);">User Agent</th>
                <th style="text-align: left; padding: var(--size-2);">Expires</th>
                <th style="text-align: right; padding: var(--size-2);">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${sessions.map(session => {
                const expiresDate = new Date(session.expiresAt as string | number | Date).toLocaleString();
                
                return html`<tr>
                  <td style="padding: var(--size-2);">${session.username}</td>
                  <td style="padding: var(--size-2); font-family: monospace; font-size: var(--font-size-0);">
                    ${session.id.substring(0, 8)}...
                  </td>
                  <td style="padding: var(--size-2); color: var(--text-muted);">${session.ipAddress || '-'}</td>
                  <td style="padding: var(--size-2); color: var(--text-muted); font-size: var(--font-size-0);">
                    ${session.userAgent ? session.userAgent.substring(0, 30) + '...' : '-'}
                  </td>
                  <td style="padding: var(--size-2);">${expiresDate}</td>
                  <td style="padding: var(--size-2); text-align: right;">
                    <form method="POST" action="/auth/sessions/${session.id}/invalidate" style="display: inline;">
                      <button type="submit" class="ui-btn ui-btn-xs ui-btn-danger" 
                              onclick="return confirm('Are you sure you want to invalidate this session?')">
                        Invalidate
                      </button>
                    </form>
                  </td>
                </tr>`;
              })}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // ==========================================
  // PROFILE VIEWS
  // ==========================================

  profile: ({ user, meta }: ViewProps & { user: Record<string, unknown> }) => {
    const navState = getNavStateScript(meta);
    
    return html`${navState}
      <div class="content-header">
        <h2>My Profile</h2>
      </div>
      
      <div class="ui-grid" style="grid-template-columns: 1fr 1fr; gap: var(--size-6);">
        <div class="ui-card ui-outlined ui-elevated ui-tonal" style="padding: var(--size-6);">
          <h3 style="margin-top: 0;">User Information</h3>
          
          <dl style="margin: var(--size-4) 0 0 0;">
            <div style="display: flex; justify-content: space-between; padding: var(--size-2) 0; border-bottom: 1px solid var(--border);">
              <dt style="color: var(--text-muted);">Username</dt>
              <dd><code>${user.username || 'N/A'}</code></dd>
            </div>
            <div style="display: flex; justify-content: space-between; padding: var(--size-2) 0; border-bottom: 1px solid var(--border);">
              <dt style="color: var(--text-muted);">Email</dt>
              <dd>${user.email}</dd>
            </div>
            <div style="display: flex; justify-content: space-between; padding: var(--size-2) 0; border-bottom: 1px solid var(--border);">
              <dt style="color: var(--text-muted);">Display Name</dt>
              <dd>${user.displayName || user.name || 'N/A'}</dd>
            </div>
            <div style="display: flex; justify-content: space-between; padding: var(--size-2) 0; border-bottom: 1px solid var(--border);">
              <dt style="color: var(--text-muted);">Role</dt>
              <dd>
                <span class="ui-badge ui-badge-sm" style="background: var(--color-primary-light); color: var(--color-primary-dark);">
                  ${user.roleId}
                </span>
              </dd>
            </div>
            <div style="display: flex; justify-content: space-between; padding: var(--size-2) 0;">
              <dt style="color: var(--text-muted);">Created</dt>
              <dd>${new Date(user.createdAt).toLocaleDateString()}</dd>
            </div>
          </dl>
          
          <div style="margin-top: var(--size-6);">
            ${Button({ label: 'View My Sessions', path: '/auth/profile/sessions', class: 'ui-btn ui-btn-sm ui-btn-secondary' })}
          </div>
        </div>
        
        <div class="ui-card ui-outlined ui-elevated ui-tonal" style="padding: var(--size-6);">
          <h3 style="margin-top: 0;">Quick Actions</h3>
          <div style="display: flex; flex-direction: column; gap: var(--size-3); margin-top: var(--size-4);">
            ${Button({ label: 'Edit Profile', path: '/auth/profile/edit', class: 'ui-btn ui-btn-sm ui-btn-primary' })}
            ${Button({ label: 'Sign Out', path: '/logout', class: 'ui-btn ui-btn-sm ui-btn-secondary' })}
          </div>
        </div>
      </div>
    `;
  },

  profileSessions: ({ sessions, meta }: ViewProps & { sessions: Record<string, unknown>[] }) => {
    const navState = getNavStateScript(meta);
    
    return html`${navState}
      <div class="content-header">
        <h2>My Sessions</h2>
        <p style="color: var(--text-muted); margin-top: var(--size-2);">
          These are all the active sessions for your account.
        </p>
      </div>
      
      <div class="ui-card ui-outlined ui-elevated ui-tonal" style="padding: var(--size-4);">
        ${sessions.length === 0 ? html`<p style="color: var(--text-muted);">No active sessions found.</p>` : ''}
        
        <div class="ui-table-container" style="overflow-x: auto;">
          <table class="ui-table" style="width: 100%;">
            <thead>
              <tr>
                <th style="text-align: left; padding: var(--size-2);">Session ID</th>
                <th style="text-align: left; padding: var(--size-2);">IP Address</th>
                <th style="text-align: left; padding: var(--size-2);">User Agent</th>
                <th style="text-align: left; padding: var(--size-2);">Created</th>
                <th style="text-align: left; padding: var(--size-2);">Expires</th>
                <th style="text-align: right; padding: var(--size-2);">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${sessions.map(session => {
                const expiresDate = new Date(session.expiresAt).toLocaleString();
                const createdDate = new Date(session.createdAt).toLocaleString();
                
                return html`<tr>
                  <td style="padding: var(--size-2); font-family: monospace; font-size: var(--font-size-0);">
                    ${session.id.substring(0, 8)}...
                  </td>
                  <td style="padding: var(--size-2);">${session.ipAddress || '-'}</td>
                  <td style="padding: var(--size-2); font-size: var(--font-size-0);">
                    ${session.userAgent ? session.userAgent.substring(0, 30) + '...' : '-'}
                  </td>
                  <td style="padding: var(--size-2);">${createdDate}</td>
                  <td style="padding: var(--size-2);">${expiresDate}</td>
                  <td style="padding: var(--size-2); text-align: right;">
                    <form method="POST" action="/auth/profile/sessions/${session.id}/invalidate" style="display: inline;">
                      <button type="submit" class="ui-btn ui-btn-xs ui-btn-danger" 
                              onclick="return confirm('Are you sure you want to invalidate this session?')">
                        Invalidate
                      </button>
                    </form>
                  </td>
                </tr>`;
              })}
            </tbody>
          </table>
        </div>
        
        <div style="margin-top: var(--size-4); padding-top: var(--size-4); border-top: 1px solid var(--border);">
          <p style="color: var(--text-muted); margin: 0;">
            <strong>Note:</strong> Invalidating your current session will log you out.
          </p>
        </div>
      </div>
    `;
  },
};
