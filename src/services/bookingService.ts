import { getAuthToken } from './authService';

const API_BASE_URL = 'https://kca-campus.onrender.com/api';

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
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
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

// Helper function to check if backend is running
const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`, {
      method: 'GET'
    });
    return response.ok;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
};

export const getMyBookings = async (): Promise<ApiResponse<Booking[]>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/my-bookings`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch bookings');
    }

    return response.json();
  } catch (error) {
    console.error('Get bookings error:', error);
    throw error;
  }
};

export const getAllBookings = async (params?: {
  status?: string;
  room_id?: number;
}): Promise<ApiResponse<Booking[]>> => {
  try {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }

    const url = `${API_BASE_URL}/bookings${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch bookings');
    }

    return response.json();
  } catch (error) {
    console.error('Get all bookings error:', error);
    throw error;
  }
};

export const createBooking = async (bookingData: CreateBookingData): Promise<ApiResponse<Booking>> => {
  console.log('Creating booking with data:', bookingData);
  console.log('Data types before submission:', {
    roomId: typeof bookingData.roomId,
    title: typeof bookingData.title,
    startTime: typeof bookingData.startTime,
    endTime: typeof bookingData.endTime,
    recurring: typeof bookingData.recurring,
    description: typeof bookingData.description
  });
  
  // Validate data types before sending
  if (!Number.isInteger(bookingData.roomId) || bookingData.roomId <= 0) {
    throw new Error('Invalid room ID: must be a positive integer');
  }
  
  if (!bookingData.title || bookingData.title.trim().length < 3) {
    throw new Error('Title must be at least 3 characters long');
  }
  
  if (!bookingData.startTime || !bookingData.endTime) {
    throw new Error('Start time and end time are required');
  }

  // Validate ISO 8601 datetime format
  const startDate = new Date(bookingData.startTime);
  const endDate = new Date(bookingData.endTime);
  
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new Error('Invalid datetime format');
  }
  
  if (endDate <= startDate) {
    throw new Error('End time must be after start time');
  }
  
  try {
    // Check if backend is running
    const isBackendRunning = await checkBackendHealth();
    if (!isBackendRunning) {
      throw new Error('Backend server is not running. Please make sure the backend server is started.');
    }

    // Prepare clean data for submission
    const cleanedData = {
      roomId: parseInt(bookingData.roomId.toString(), 10),
      title: bookingData.title.trim(),
      startTime: bookingData.startTime,
      endTime: bookingData.endTime,
      recurring: Boolean(bookingData.recurring || false),
      ...(bookingData.description?.trim() && { description: bookingData.description.trim() })
    };

    console.log('Sending cleaned data to backend:', cleanedData);

    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(cleanedData),
    });

    console.log('Response status:', response.status);
    
    const responseData = await response.json();
    console.log('Response data:', responseData);
    
    if (responseData.errors) {
      console.log('Validation errors:', responseData.errors);
      // Log detailed validation errors
      responseData.errors.forEach((error: any, index: number) => {
        console.log(`Validation error ${index + 1}:`, {
          field: error.path || error.param,
          message: error.msg,
          value: error.value,
          location: error.location
        });
      });
    }

    if (!response.ok) {
      // Provide more detailed error information
      if (response.status === 500) {
        throw new Error('Server error: Please check if the database is running and properly configured.');
      } else if (response.status === 400) {
        const errorMessage = responseData.errors 
          ? `Validation failed: ${responseData.errors.map((e: any) => `${e.param || e.path}: ${e.msg}`).join(', ')}`
          : responseData.message || 'Bad request';
        throw new Error(errorMessage);
      } else {
        throw new Error(responseData.message || `Request failed with status ${response.status}`);
      }
    }

    return responseData;
  } catch (error) {
    console.error('Create booking error:', error);
    throw error;
  }
};

export const updateBooking = async (id: number, bookingData: CreateBookingData): Promise<ApiResponse<Booking>> => {
  console.log('Updating booking with data:', { id, ...bookingData });
  
  // Validate data types before sending
  if (!Number.isInteger(bookingData.roomId) || bookingData.roomId <= 0) {
    throw new Error('Invalid room ID: must be a positive integer');
  }
  
  if (!bookingData.title || bookingData.title.trim().length < 3) {
    throw new Error('Title must be at least 3 characters long');
  }
  
  if (!bookingData.startTime || !bookingData.endTime) {
    throw new Error('Start time and end time are required');
  }

  // Validate ISO 8601 datetime format
  const startDate = new Date(bookingData.startTime);
  const endDate = new Date(bookingData.endTime);
  
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new Error('Invalid datetime format');
  }
  
  if (endDate <= startDate) {
    throw new Error('End time must be after start time');
  }
  
  try {
    // Prepare clean data for submission
    const cleanedData = {
      roomId: parseInt(bookingData.roomId.toString(), 10),
      title: bookingData.title.trim(),
      startTime: bookingData.startTime,
      endTime: bookingData.endTime,
      recurring: Boolean(bookingData.recurring || false),
      ...(bookingData.description?.trim() && { description: bookingData.description.trim() })
    };

    console.log('Sending cleaned update data to backend:', cleanedData);

    const response = await fetch(`${API_BASE_URL}/bookings/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(cleanedData),
    });

    console.log('Update response status:', response.status);
    
    const responseData = await response.json();
    console.log('Update response data:', responseData);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Booking not found');
      } else if (response.status === 403) {
        throw new Error('You do not have permission to update this booking');
      } else if (response.status === 400) {
        const errorMessage = responseData.errors 
          ? `Validation failed: ${responseData.errors.map((e: any) => `${e.param || e.path}: ${e.msg}`).join(', ')}`
          : responseData.message || 'Bad request';
        throw new Error(errorMessage);
      } else {
        throw new Error(responseData.message || `Update failed with status ${response.status}`);
      }
    }

    return responseData;
  } catch (error) {
    console.error('Update booking error:', error);
    throw error;
  }
};

export const cancelBooking = async (id: number): Promise<ApiResponse<void>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const responseData = await response.json();

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Booking not found');
      } else if (response.status === 403) {
        throw new Error('You do not have permission to cancel this booking');
      } else if (response.status === 400) {
        throw new Error(responseData.message || 'Cannot cancel this booking');
      } else {
        throw new Error(responseData.message || 'Failed to cancel booking');
      }
    }

    return responseData;
  } catch (error) {
    console.error('Cancel booking error:', error);
    throw error;
  }
};

// Admin-only functions
export const hardDeleteBooking = async (id: number): Promise<ApiResponse<void>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/admin/hard-delete/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const responseData = await response.json();

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Booking not found');
      } else if (response.status === 403) {
        throw new Error('Admin access required');
      } else {
        throw new Error(responseData.message || 'Failed to delete booking');
      }
    }

    return responseData;
  } catch (error) {
    console.error('Hard delete booking error:', error);
    throw error;
  }
};

export const bulkUpdateBookings = async (bookingIds: number[], status: string): Promise<ApiResponse<{updatedCount: number}>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/admin/bulk-update`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ bookingIds, status }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Admin access required');
      } else if (response.status === 400) {
        throw new Error(responseData.message || 'Invalid bulk update request');
      } else {
        throw new Error(responseData.message || 'Failed to bulk update bookings');
      }
    }

    return responseData;
  } catch (error) {
    console.error('Bulk update bookings error:', error);
    throw error;
  }
};
