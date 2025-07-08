
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'lecturer' | 'maintenance';
  avatar?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
