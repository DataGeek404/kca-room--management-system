
export interface Room {
  id: string;
  name: string;
  capacity: number;
  building: string;
  floor: number;
  resources: string[];
  status: 'available' | 'maintenance' | 'occupied';
  description?: string;
}

export interface Booking {
  id: string;
  roomId: string;
  userId: string;
  userName: string;
  title: string;
  startTime: string;
  endTime: string;
  date: string;
  recurring?: boolean;
  status: 'confirmed' | 'pending' | 'cancelled';
}

export interface MaintenanceRequest {
  id: string;
  roomId: string;
  roomName: string;
  issue: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  reportedBy: string;
  reportedAt: string;
  completedAt?: string;
}
