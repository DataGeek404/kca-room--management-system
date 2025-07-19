
import { getAuthToken } from './authService';

const API_BASE_URL = 'https://kca-campus.onrender.com/api';

export interface RoomUtilization {
  id: number;
  name: string;
  building: string;
  floor: number;
  capacity: number;
  total_bookings: number;
  total_hours: number;
  avg_booking_duration: number;
}

export interface BookingStats {
  overview: {
    total_bookings: number;
    confirmed_bookings: number;
    cancelled_bookings: number;
    upcoming_bookings: number;
  };
  monthly: {
    month: string;
    bookings_count: number;
  }[];
}

export interface UserActivity {
  id: number;
  name: string;
  email: string;
  role: string;
  total_bookings: number;
  confirmed_bookings: number;
  cancelled_bookings: number;
  last_booking_date?: string;
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

export const getRoomUtilization = async (params?: {
  startDate?: string;
  endDate?: string;
}): Promise<ApiResponse<RoomUtilization[]>> => {
  const queryParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, value);
      }
    });
  }

  const url = `${API_BASE_URL}/reports/room-utilization${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch room utilization report');
  }

  return response.json();
};

export const getBookingStats = async (): Promise<ApiResponse<BookingStats>> => {
  const response = await fetch(`${API_BASE_URL}/reports/booking-stats`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch booking statistics');
  }

  return response.json();
};

export const getUserActivity = async (): Promise<ApiResponse<UserActivity[]>> => {
  const response = await fetch(`${API_BASE_URL}/reports/user-activity`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch user activity report');
  }

  return response.json();
};
