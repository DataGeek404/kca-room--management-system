
import { getAuthToken } from './authService';

const API_BASE_URL = 'http://localhost:5000/api';

export interface Department {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateDepartmentData {
  name: string;
  description?: string;
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

export const getDepartments = async (): Promise<ApiResponse<Department[]>> => {
  const response = await fetch(`${API_BASE_URL}/departments`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch departments');
  }

  return response.json();
};

export const createDepartment = async (departmentData: CreateDepartmentData): Promise<ApiResponse<Department>> => {
  const response = await fetch(`${API_BASE_URL}/departments`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(departmentData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create department');
  }

  return response.json();
};

export const updateDepartment = async (id: number, departmentData: Partial<CreateDepartmentData>): Promise<ApiResponse<Department>> => {
  const response = await fetch(`${API_BASE_URL}/departments/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(departmentData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update department');
  }

  return response.json();
};

export const deleteDepartment = async (id: number): Promise<ApiResponse<void>> => {
  const response = await fetch(`${API_BASE_URL}/departments/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to delete department');
  }

  return response.json();
};
