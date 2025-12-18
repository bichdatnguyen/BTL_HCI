/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * User/Profile type for login and authentication
 */
export interface User {
  id: string;
  username: string;
  email?: string;
  password?: string;
  name: string;
  avatar: string;
  initials: string;
  streak: number;
  lastLoginDate: string | null;
  birthday?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Login request
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * Login response
 */
export interface LoginResponse {
  success: boolean;
  message: string;
  user?: User;
  streak?: number;
  error?: string;
}