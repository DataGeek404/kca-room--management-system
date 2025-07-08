
import { getAuthToken } from './authService';

const API_BASE_URL = 'http://localhost:5000/api';

export interface Room {
  id: number;
  name: string;
  capacity: number;
  building: string;
  floor: number;
  resources: string[];
  description?: string;
  status: 'available' | 'maintenance' | 'occupied';
  created_at?: string;
  updated_at?: string;
}

export interface CreateRoomData {
  name: string;
  capacity: number;
  building: string;
  floor: number;
  resources: string[];
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

export const getRooms = async (params?: {
  building?: string;
  floor?: number;
  capacity?: number;
  status?: string;
  search?: string;
}): Promise<ApiResponse<Room[]>> => {
  const queryParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
  }

  const url = `${API_BASE_URL}/rooms${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch rooms');
  }

  return response.json();
};

export const createRoom = async (roomData: CreateRoomData): Promise<ApiResponse<Room>> => {
  const response = await fetch(`${API_BASE_URL}/rooms`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(roomData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create room');
  }

  return response.json();
};

export const updateRoom = async (id: number, roomData: Partial<CreateRoomData> & { status?: string }): Promise<ApiResponse<Room>> => {
  const response = await fetch(`${API_BASE_URL}/rooms/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(roomData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update room');
  }

  return response.json();
};

export const deleteRoom = async (id: number): Promise<ApiResponse<void>> => {
  const response = await fetch(`${API_BASE_URL}/rooms/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to delete room');
  }

  return response.json();
};
