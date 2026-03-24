/**
 * Role-based Permission System
 * 
 * Role Hierarchy:
 * - Property Manager: Full CRUD access to Task, Property, Inventory, Team
 * - Property Supervisor: CRUD on Inventory & Task, R on Team & Property
 * - Staff: RU on Inventory & Task, R on Team & Property
 * - Others (Outsource Staff): RU on Task only
 * 
 * Permissions: C = Create, R = Read, U = Update, D = Delete
 */

// Define role types
export const ROLES = {
  PROPERTY_MANAGER: 'Property Manager',
  PROPERTY_SUPERVISOR: 'Property Supervisor',
  STAFF: 'Staff',
  OTHERS: 'Others'
};

// Resource types
export const RESOURCES = {
  TASK: 'task',
  PROPERTY: 'property',
  INVENTORY: 'inventory',
  TEAM: 'team'
};

// Permission types
export const PERMISSIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete'
};

// Define permission matrix
const PERMISSION_MATRIX = {
  [ROLES.PROPERTY_MANAGER]: {
    [RESOURCES.TASK]: ['create', 'read', 'update', 'delete'],
    [RESOURCES.PROPERTY]: ['create', 'read', 'update', 'delete'],
    [RESOURCES.INVENTORY]: ['create', 'read', 'update', 'delete'],
    [RESOURCES.TEAM]: ['create', 'read', 'update', 'delete']
  },
  [ROLES.PROPERTY_SUPERVISOR]: {
    [RESOURCES.TASK]: ['create', 'read', 'update', 'delete'],
    [RESOURCES.PROPERTY]: ['read'],
    [RESOURCES.INVENTORY]: ['create', 'read', 'update', 'delete'],
    [RESOURCES.TEAM]: ['read']
  },
  [ROLES.STAFF]: {
    [RESOURCES.TASK]: ['read'],
    [RESOURCES.PROPERTY]: ['read'],
    [RESOURCES.INVENTORY]: ['read', 'update'],
    [RESOURCES.TEAM]: ['read']
  },
  // Outsource Staff
  [ROLES.OTHERS]: {
    [RESOURCES.TASK]: ['read'],
    [RESOURCES.PROPERTY]: [],
    [RESOURCES.INVENTORY]: [],
    [RESOURCES.TEAM]: []
  }
};

/**
 * Check if a user has a specific permission for a resource
 * @param {string} userRole - The user's role (from user.teamRole)
 * @param {string} resource - The resource to check (task, property, inventory, team)
 * @param {string} permission - The permission to check (create, read, update, delete)
 * @returns {boolean} - True if user has permission, false otherwise
 */
export const hasPermission = (userRole, resource, permission) => {
  // Client role always has full access
  if (!userRole || userRole === 'client') {
    return true;
  }

  // Check if role exists in permission matrix
  if (!PERMISSION_MATRIX[userRole]) {
    return false;
  }

  // Check if resource exists for this role
  if (!PERMISSION_MATRIX[userRole][resource]) {
    return false;
  }

  // Check if user has the specific permission
  return PERMISSION_MATRIX[userRole][resource].includes(permission);
};

/**
 * Check if user can create a resource
 */
export const canCreate = (userRole, resource) => {
  return hasPermission(userRole, resource, PERMISSIONS.CREATE);
};

/**
 * Check if user can read a resource
 */
export const canRead = (userRole, resource) => {
  return hasPermission(userRole, resource, PERMISSIONS.READ);
};

/**
 * Check if user can update a resource
 */
export const canUpdate = (userRole, resource) => {
  return hasPermission(userRole, resource, PERMISSIONS.UPDATE);
};

/**
 * Check if user can delete a resource
 */
export const canDelete = (userRole, resource) => {
  return hasPermission(userRole, resource, PERMISSIONS.DELETE);
};

/**
 * Get all permissions for a user role and resource
 * @param {string} userRole - The user's role
 * @param {string} resource - The resource to check
 * @returns {object} - Object with permission flags { canCreate, canRead, canUpdate, canDelete }
 */
export const getResourcePermissions = (userRole, resource) => {
  return {
    canCreate: canCreate(userRole, resource),
    canRead: canRead(userRole, resource),
    canUpdate: canUpdate(userRole, resource),
    canDelete: canDelete(userRole, resource)
  };
};

/**
 * Check if user is outsource staff
 */
export const isOutsourceStaff = (userRole) => {
  return userRole === ROLES.OTHERS;
};

/**
 * Check if user is staff or outsource staff
 */
export const isStaffOrOutsource = (userRole) => {
  return [ROLES.STAFF, ROLES.OTHERS].includes(userRole);
};

/**
 * Check if user has any access to a resource (at least read permission)
 */
export const hasResourceAccess = (userRole, resource) => {
  return canRead(userRole, resource);
};
