
import { getAuthToken } from './authService';

const API_BASE_URL = 'http://localhost:5000/api';

export interface MaintenanceRequest {
  id: number;
  room_id: number;
  room_name: string;
  building?: string;
  floor?: number;
  issue: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  reported_by: number;
  reported_by_name: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface CreateMaintenanceRequestData {
  roomId: number;
  issue: string;
  priority: 'low' | 'medium' | 'high';
  description?: string;
}

export interface UpdateMaintenanceRequestData {
  status: 'pending' | 'in-progress' | 'completed';
  notes?: string;
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

export const getMaintenanceRequests = async (params?: {
  status?: string;
  priority?: string;
}): Promise<ApiResponse<MaintenanceRequest[]>> => {
  const queryParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, value);
      }
    });
  }

  const url = `${API_BASE_URL}/maintenance${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch maintenance requests');
  }

  return response.json();
};

export const createMaintenanceRequest = async (requestData: CreateMaintenanceRequestData): Promise<ApiResponse<MaintenanceRequest>> => {
  const response = await fetch(`${API_BASE_URL}/maintenance`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(requestData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create maintenance request');
  }

  return response.json();
};

export const updateMaintenanceRequest = async (id: number, updateData: UpdateMaintenanceRequestData): Promise<ApiResponse<void>> => {
  const response = await fetch(`${API_BASE_URL}/maintenance/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update maintenance request');
  }

  return response.json();
};
