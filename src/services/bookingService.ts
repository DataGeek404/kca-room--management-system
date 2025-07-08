
import { getAuthToken } from './authService';

const API_BASE_URL = 'http://localhost:5000/api';

export interface Booking {
  id: number;
  room_id: number;
  room_name: string;
  building?: string;
  floor?: number;
  user_id: number;
  user_name: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  recurring: boolean;
  status: 'confirmed' | 'pending' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface CreateBookingData {
  roomId: number;
  title: string;
  startTime: string;
  endTime: string;
  recurring?: boolean;
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

export const getMyBookings = async (): Promise<ApiResponse<Booking[]>> => {
  const response = await fetch(`${API_BASE_URL}/bookings/my-bookings`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch bookings');
  }

  return response.json();
};

export const createBooking = async (bookingData: CreateBookingData): Promise<ApiResponse<Booking>> => {
  const response = await fetch(`${API_BASE_URL}/bookings`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(bookingData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create booking');
  }

  return response.json();
};

export const cancelBooking = async (id: number): Promise<ApiResponse<void>> => {
  const response = await fetch(`${API_BASE_URL}/bookings/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to cancel booking');
  }

  return response.json();
};
