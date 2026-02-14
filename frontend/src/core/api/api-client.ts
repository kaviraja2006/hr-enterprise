import axiosInstance from './axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';

// Backend TransformInterceptor wraps all responses in { data: ... }
interface BackendResponse<T> {
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  statusCode: number;
  message: string;
  error: string;
}

class ApiClient {
  private unwrapResponse<T>(response: AxiosResponse<BackendResponse<T>>): T {
    // Backend wraps responses in { data: T, meta?: ... }
    // We extract the actual data
    return response.data.data;
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await axiosInstance.get<BackendResponse<T>>(url, config);
    return this.unwrapResponse(response);
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await axiosInstance.post<BackendResponse<T>>(url, data, config);
    return this.unwrapResponse(response);
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await axiosInstance.patch<BackendResponse<T>>(url, data, config);
    return this.unwrapResponse(response);
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await axiosInstance.put<BackendResponse<T>>(url, data, config);
    return this.unwrapResponse(response);
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await axiosInstance.delete<BackendResponse<T>>(url, config);
    return this.unwrapResponse(response);
  }
}

export const apiClient = new ApiClient();