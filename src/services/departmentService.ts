
import { getAuthToken } from './authService';

const API_BASE_URL = 'https://kca-campus.onrender.com/api';

export interface Department {
  id: number;
  name: string;
  code: string;
  description?: string;
  head_of_department?: string;
  contact_email?: string;
  contact_phone?: string;
  building?: string;
  floor?: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface CreateDepartmentData {
  name: string;
  code: string;
  description?: string;
  head_of_department?: string;
  contact_email?: string;
  contact_phone?: string;
  building?: string;
  floor?: number;
}

export interface UpdateDepartmentData extends CreateDepartmentData {
  status?: 'active' | 'inactive';
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

export const getDepartment = async (id: number): Promise<ApiResponse<Department>> => {
  const response = await fetch(`${API_BASE_URL}/departments/${id}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch department');
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

export const updateDepartment = async (id: number, departmentData: UpdateDepartmentData): Promise<ApiResponse<Department>> => {
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
