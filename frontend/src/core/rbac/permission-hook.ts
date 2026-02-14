import { useAuthContext } from '../auth/auth-context';

export function usePermission(permission: string): boolean {
  const { hasPermission } = useAuthContext();
  return hasPermission(permission);
}

export function usePermissions(permissions: string[]): { [key: string]: boolean } {
  const { hasPermission } = useAuthContext();
  
  return permissions.reduce((acc, permission) => {
    acc[permission] = hasPermission(permission);
    return acc;
  }, {} as { [key: string]: boolean });
}

export function useAnyPermission(permissions: string[]): boolean {
  const { hasAnyPermission } = useAuthContext();
  return hasAnyPermission(permissions);
}