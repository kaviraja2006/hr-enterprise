export const ROLES = {
  ADMIN: 'admin',
  HR: 'hr',
  MANAGER: 'manager',
  EMPLOYEE: 'employee',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<Role, string> = {
  [ROLES.ADMIN]: 'Administrator',
  [ROLES.HR]: 'HR Manager',
  [ROLES.MANAGER]: 'Department Manager',
  [ROLES.EMPLOYEE]: 'Employee',
};

export const ROLE_HIERARCHY: Record<Role, number> = {
  [ROLES.ADMIN]: 100,
  [ROLES.HR]: 75,
  [ROLES.MANAGER]: 50,
  [ROLES.EMPLOYEE]: 25,
};

export function isRoleHigherOrEqual(role1: Role, role2: Role): boolean {
  return ROLE_HIERARCHY[role1] >= ROLE_HIERARCHY[role2];
}

export function isAdmin(role: string): boolean {
  return role === ROLES.ADMIN;
}

export function isHR(role: string): boolean {
  return role === ROLES.HR || role === ROLES.ADMIN;
}

export function isManager(role: string): boolean {
  return (
    role === ROLES.MANAGER || role === ROLES.HR || role === ROLES.ADMIN
  );
}