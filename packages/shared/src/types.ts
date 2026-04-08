// Shared types and interfaces
// Used across all applications

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'warden' | 'admin';
  createdAt: Date;
}

export interface Room {
  id: string;
  name: string;
  description: string;
  price: number;
  location: string;
  capacity: number;
  amenities: string[];
  availableFrom: Date;
  isAvailable: boolean;
}

export interface Booking {
  id: string;
  userId: string;
  roomId: string;
  checkInDate: Date;
  checkOutDate: Date;
  status: 'pending' | 'confirmed' | 'cancelled';
  totalPrice: number;
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}
