
import { getAuthToken } from './authService';

const API_BASE_URL = 'https://kca-campus.onrender.com/api';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'lecturer' | 'maintenance';
  phone?: string;
  bio?: string;
  avatar?: string;
  created_at?: string;
  last_login?: string;
  status: 'active' | 'inactive';
}

export interface UpdateProfileData {
  name: string;
  email: string;
  phone?: string;
  bio?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
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

export const getUserProfile = async (): Promise<ApiResponse<UserProfile>> => {
  const response = await fetch(`${API_BASE_URL}/users/profile`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch profile');
  }

  return response.json();
};

export const updateUserProfile = async (profileData: UpdateProfileData): Promise<ApiResponse<UserProfile>> => {
  const response = await fetch(`${API_BASE_URL}/users/profile`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update profile');
  }

  return response.json();
};

export const changeUserPassword = async (passwordData: ChangePasswordData): Promise<ApiResponse<void>> => {
  const response = await fetch(`${API_BASE_URL}/users/change-password`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(passwordData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to change password');
  }

  return response.json();
};
