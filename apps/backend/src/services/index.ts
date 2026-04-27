import { Property, PropertyDomainService } from '../domains/property/property.domain';
import { User, AuthDomainService, LoginRequest, RegisterRequest, AuthResponse } from '../domains/auth/auth.domain';
import { UserProfile, UserDomainService } from '../domains/user/user.domain';

// --- MOCK DATA SOURCE (Simulating a database) ---
// We use the mock data from mock-api.js as our "database" for the backend services

const MOCK_DB = {
  users: [
    {
      id: '1',
      name: 'John Student',
      email: 'user@example.com',
      password: 'password123',
      role: 'GUEST',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'admin1',
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'ADMIN',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'warden1',
      name: 'Warden User',
      email: 'warden@example.com',
      password: 'warden123',
      role: 'WARDEN',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  rooms: [
    {
      id: 'room1',
      name: 'Room 101',
      description: 'Comfortable single room with all amenities',
      location: 'State University, Building A',
      price: 500,
      amenities: ['WiFi', 'AC', 'Bed'],
      images: ['/images/room1.jpg'],
      rating: 4.5,
      reviews: [],
      available: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'room2',
      name: 'Room 102',
      description: 'Spacious double room with modern furniture',
      location: 'State University, Building B',
      price: 750,
      amenities: ['WiFi', 'AC', 'Two Beds', 'Balcony'],
      images: ['/images/room2.jpg'],
      rating: 4.7,
      reviews: [],
      available: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'room3',
      name: 'Room 103',
      description: 'Luxury suite with complete amenities',
      location: 'State University, Building C',
      price: 1200,
      amenities: ['WiFi', 'AC', 'Bed', 'Sofa', 'Kitchen'],
      images: ['/images/room3.jpg'],
      rating: 4.9,
      reviews: [],
      available: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  bookings: [] as any[],
  tokens: {} as Record<string, string>, // token -> userId
};

// ============================================================
// Service Implementations (SRP & Clean Architecture)
// ============================================================

export class RoomService extends PropertyDomainService {
  async searchRooms(_query: any): Promise<Property[]> {
    return MOCK_DB.rooms as unknown as Property[];
  }

  async getRoomById(id: string): Promise<Property | null> {
    const room = MOCK_DB.rooms.find(r => r.id === id);
    return room ? (room as unknown as Property) : null;
  }
}

export class BookingService {
  async createBooking(data: { roomId: string; userId: string; checkInDate: string; checkOutDate: string }) {
    const room = MOCK_DB.rooms.find(r => r.id === data.roomId);
    if (!room) throw new Error('Room not found');

    const booking = {
      id: `booking-${Math.random().toString(36).substr(2, 9)}`,
      roomId: data.roomId,
      userId: data.userId,
      checkInDate: data.checkInDate,
      checkOutDate: data.checkOutDate,
      status: 'Confirmed',
      totalPrice: room.price,
      room: room,
      paymentStatus: 'Pending',
      createdAt: new Date(),
    };
    
    MOCK_DB.bookings.push(booking);
    return booking;
  }

  async getBookings(userId: string) {
    return MOCK_DB.bookings.filter(b => b.userId === userId);
  }
}

export class AuthService extends AuthDomainService {
  
  async login(request: LoginRequest): Promise<AuthResponse> {
    const user = MOCK_DB.users.find(u => u.email === request.email && u.password === request.password);
    
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    const token = `mock-token-${Math.random().toString(36).substr(2, 9)}`;
    MOCK_DB.tokens[token] = user.id;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    
    return {
      token,
      user: userWithoutPassword as unknown as User,
    };
  }

  async register(data: RegisterRequest): Promise<User> {
    if (MOCK_DB.users.some(u => u.email === data.email)) {
      throw new Error('Email already exists');
    }

    const newUser = {
      id: `user-${Math.random().toString(36).substr(2, 9)}`,
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role || 'GUEST',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    MOCK_DB.users.push(newUser);
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword as unknown as User;
  }
  
  async validateToken(token: string): Promise<User> {
      const userId = MOCK_DB.tokens[token];
      if (!userId) {
          throw new Error('Invalid token');
      }
      
      const user = MOCK_DB.users.find(u => u.id === userId);
      if (!user) {
          throw new Error('User not found');
      }
      
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword as unknown as User;
  }
}

export class UserService extends UserDomainService {
    async getUserProfile(userId: string): Promise<UserProfile | null> {
        const user = MOCK_DB.users.find(u => u.id === userId);
        if (!user) return null;
        
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...userProfile } = user;
        return userProfile as unknown as UserProfile;
    }
}
