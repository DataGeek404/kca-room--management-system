
import { getAuthToken } from './authService';

const API_BASE_URL = 'https://kca-campus.onrender.com/api';

export interface Room {
  id: number;
  name: string;
  type?: string;
  capacity: number;
  building?: string;
  floor?: number;
  location?: string;
  department_id?: number;
  resources: string[];
  description?: string;
  equipment?: string;
  status: 'available' | 'maintenance' | 'occupied' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

export interface CreateRoomData {
  name: string;
  type?: string;
  capacity: number;
  building?: string;
  floor?: number;
  location?: string;
  department_id?: number;
  resources: string[];
  description?: string;
  equipment?: string;
  status?: string;
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

const parseRoomData = (room: any): Room => {
  return {
    ...room,
    resources: Array.isArray(room.resources) ? room.resources : []
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

  const result = await response.json();
  
  if (result.success && result.data) {
    result.data = result.data.map(parseRoomData);
  }

  return result;
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

  const result = await response.json();
  
  if (result.success && result.data) {
    result.data = parseRoomData(result.data);
  }

  return result;
};

export const updateRoom = async (id: number, roomData: Partial<CreateRoomData> & { status?: string }): Promise<ApiResponse<Room>> => {
  try {
    // Get the current room data first
    const currentRoomResponse = await fetch(`${API_BASE_URL}/rooms`, {
      headers: getAuthHeaders(),
    });
    
    if (!currentRoomResponse.ok) {
      throw new Error('Failed to fetch current room data');
    }
    
    const roomsResult = await currentRoomResponse.json();
    const currentRoom = roomsResult.data?.find((room: Room) => room.id === id);
    
    if (!currentRoom) {
      throw new Error('Room not found');
    }

    // Merge current data with updates to ensure all required fields are present
    const updateData = {
      name: roomData.name || currentRoom.name,
      capacity: roomData.capacity || currentRoom.capacity,
      building: roomData.building || currentRoom.building,
      floor: roomData.floor || currentRoom.floor,
      resources: roomData.resources || currentRoom.resources || [],
      description: roomData.description !== undefined ? roomData.description : currentRoom.description,
      status: roomData.status || currentRoom.status
    };

    const response = await fetch(`${API_BASE_URL}/rooms/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update room');
    }

    const result = await response.json();
    
    if (result.success && result.data) {
      result.data = parseRoomData(result.data);
    }

    return result;
  } catch (error) {
    console.error('Error updating room:', error);
    throw error;
  }
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
