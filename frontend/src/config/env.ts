export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'https://hr-enterprise-4.onrender.com',
  appName: import.meta.env.VITE_APP_NAME || 'HR Enterprise',
  environment: import.meta.env.MODE || 'development',
} as const;

export type Env = typeof env;