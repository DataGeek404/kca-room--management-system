
import { getAuthToken } from './authService';

const API_BASE_URL = 'http://localhost:5000/api';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'lecturer' | 'maintenance';
  status: 'active' | 'inactive';
  created_at: string;
  last_login?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const getUsers = async (): Promise<ApiResponse<User[]>> => {
  const response = await fetch(`${API_BASE_URL}/users`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch users');
  }

  return response.json();
};

export const updateUserStatus = async (id: number, status: 'active' | 'inactive'): Promise<ApiResponse<void>> => {
  const response = await fetch(`${API_BASE_URL}/users/${id}/status`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update user status');
  }

  return response.json();
};

export const updateUserRole = async (id: number, role: 'admin' | 'lecturer' | 'maintenance'): Promise<ApiResponse<void>> => {
  const response = await fetch(`${API_BASE_URL}/users/${id}/role`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ role }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update user role');
  }

  return response.json();
};

export const deleteUser = async (id: number): Promise<ApiResponse<void>> => {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to delete user');
  }

  return response.json();
};
