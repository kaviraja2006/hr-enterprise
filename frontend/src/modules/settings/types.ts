// Settings/RBAC Types

export interface Role {
  id: string;
  name: string;
  description?: string;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
  permissions?: Permission[];
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  createdAt: string;
}

export interface CreateRoleDto {
  name: string;
  description?: string;
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
}

export interface CreatePermissionDto {
  name: string;
  resource: string;
  action: string;
}

export interface AssignPermissionsDto {
  permissionIds: string[];
}

export interface SystemSettings {
  companyName: string;
  companyLogo?: string;
  timezone: string;
  dateFormat: string;
  currency: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  workingHours: {
    start: string;
    end: string;
    workingDays: number[];
  };
}
