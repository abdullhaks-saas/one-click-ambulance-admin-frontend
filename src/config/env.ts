/**
 * Environment configuration
 * In production, these can come from build-time env vars
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';

export const env = {
  API_BASE_URL,
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const;
