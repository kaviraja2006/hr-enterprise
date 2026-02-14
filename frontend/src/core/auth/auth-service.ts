import { apiClient } from '../api/api-client';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RefreshTokenRequest,
  RefreshTokenResponse,
  ChangePasswordRequest,
} from '../types/user.types';

const AUTH_BASE = '/auth';

// Backend login response structure (now unwrapped by apiClient)
interface BackendLoginResponse {
  user: {
    id: string;
    email: string;
    roleId?: string;
    roleName?: string;
    employeeId?: string;
    isActive?: boolean;
    lastLoginAt?: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

export const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<BackendLoginResponse>(`${AUTH_BASE}/login`, data);
    const { user: backendUser, tokens } = response;
    
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: backendUser.id,
        email: backendUser.email,
        firstName: '', // Backend doesn't return these in login
        lastName: '',
        fullName: '',
        roleId: backendUser.roleId || '',
        roleName: backendUser.roleName || '',
        employeeId: backendUser.employeeId,
        isActive: backendUser.isActive ?? true,
        emailVerified: true,
        lastLoginAt: backendUser.lastLoginAt,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      permissions: [], // Will be fetched via getProfile
    };
  },

  register: async (data: RegisterRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<BackendLoginResponse>(`${AUTH_BASE}/register`, data);
    const { user: backendUser, tokens } = response;
    
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: backendUser.id,
        email: backendUser.email,
        firstName: data.firstName,
        lastName: data.lastName,
        fullName: `${data.firstName} ${data.lastName}`,
        roleId: backendUser.roleId || '',
        roleName: backendUser.roleName || '',
        employeeId: backendUser.employeeId,
        isActive: backendUser.isActive ?? true,
        emailVerified: false,
        lastLoginAt: backendUser.lastLoginAt,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      permissions: [],
    };
  },

  logout: async (): Promise<void> => {
    return apiClient.post(`${AUTH_BASE}/logout`);
  },

  logoutAll: async (): Promise<void> => {
    return apiClient.post(`${AUTH_BASE}/logout-all`);
  },

  refresh: async (data: RefreshTokenRequest): Promise<RefreshTokenResponse> => {
    const response = await apiClient.post<{ tokens: RefreshTokenResponse }>(`${AUTH_BASE}/refresh`, data);
    return response.tokens;
  },

  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    return apiClient.post(`${AUTH_BASE}/change-password`, data);
  },

  getProfile: async () => {
    return apiClient.get(`${AUTH_BASE}/me`);
  },
};