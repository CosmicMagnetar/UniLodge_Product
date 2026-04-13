import { describe, it, expect, beforeEach } from 'vitest';

// Mock services for testing
class RoomService {
  async searchRooms(query: any) {
    if (!query || Object.keys(query).length === 0) {
      return [];
    }
    return [
      {
        id: '1',
        name: 'Modern Studio',
        price: 500,
        location: 'Downtown',
        ...query,
      },
    ];
  }

  async getRoomById(id: string) {
    if (!id) return null;
    return {
      id,
      name: 'Modern Studio',
      price: 500,
      location: 'Downtown',
      amenities: ['WiFi', 'AC', 'Kitchen'],
    };
  }
}

class BookingService {
  async createBooking(data: any) {
    if (!data.roomId || !data.userId) {
      throw new Error('Missing required fields');
    }
    return {
      id: 'booking_' + Date.now(),
      ...data,
      status: 'confirmed',
      createdAt: new Date(),
    };
  }

  async getBookings(userId: string) {
    if (!userId) return [];
    return [
      {
        id: 'booking_123',
        userId,
        roomId: 'room_1',
        status: 'confirmed',
        checkIn: '2026-04-20',
        checkOut: '2026-04-25',
      },
    ];
  }

  async cancelBooking(bookingId: string) {
    if (!bookingId) throw new Error('Booking ID required');
    return { id: bookingId, status: 'cancelled' };
  }
}

class AuthService {
  async login(email: string, password: string) {
    if (!email || !password) {
      throw new Error('Email and password required');
    }
    if (email === 'test@example.com' && password === 'password123') {
      return { token: 'jwt_token_123', user: { id: '1', email } };
    }
    throw new Error('Invalid credentials');
  }

  async register(data: any) {
    if (!data.email || !data.password || !data.name) {
      throw new Error('Missing required fields');
    }
    return {
      id: 'user_' + Date.now(),
      email: data.email,
      name: data.name,
      createdAt: new Date(),
    };
  }

  async logout(token: string) {
    if (!token) throw new Error('Token required');
    return { success: true };
  }
}

describe('RoomService', () => {
  let roomService: RoomService;

  beforeEach(() => {
    roomService = new RoomService();
  });

  it('should search rooms with query', async () => {
    const query = { minPrice: 400, maxPrice: 600 };
    const rooms = await roomService.searchRooms(query);
    expect(rooms).toHaveLength(1);
    expect(rooms[0].name).toBe('Modern Studio');
  });

  it('should return empty array for empty query', async () => {
    const rooms = await roomService.searchRooms({});
    expect(rooms).toEqual([]);
  });

  it('should get room by ID', async () => {
    const room = await roomService.getRoomById('1');
    expect(room).toBeDefined();
    expect(room?.id).toBe('1');
    expect(room?.amenities).toContain('WiFi');
  });

  it('should return null for non-existent room ID', async () => {
    const room = await roomService.getRoomById('');
    expect(room).toBeNull();
  });
});

describe('BookingService', () => {
  let bookingService: BookingService;

  beforeEach(() => {
    bookingService = new BookingService();
  });

  it('should create booking successfully', async () => {
    const bookingData = {
      roomId: 'room_1',
      userId: 'user_1',
      checkIn: '2026-04-20',
      checkOut: '2026-04-25',
    };
    const booking = await bookingService.createBooking(bookingData);
    expect(booking.status).toBe('confirmed');
    expect(booking.id).toMatch(/^booking_/);
  });

  it('should throw error when missing required fields', async () => {
    const invalidData = { roomId: 'room_1' };
    await expect(bookingService.createBooking(invalidData)).rejects.toThrow(
      'Missing required fields'
    );
  });

  it('should get bookings for user', async () => {
    const bookings = await bookingService.getBookings('user_1');
    expect(bookings).toHaveLength(1);
    expect(bookings[0].userId).toBe('user_1');
  });

  it('should return empty array for non-existent user', async () => {
    const bookings = await bookingService.getBookings('');
    expect(bookings).toEqual([]);
  });

  it('should cancel booking', async () => {
    const cancelled = await bookingService.cancelBooking('booking_123');
    expect(cancelled.status).toBe('cancelled');
  });

  it('should throw error when canceling without booking ID', async () => {
    await expect(bookingService.cancelBooking('')).rejects.toThrow(
      'Booking ID required'
    );
  });
});

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
  });

  it('should login with valid credentials', async () => {
    const result = await authService.login(
      'test@example.com',
      'password123'
    );
    expect(result.token).toBeDefined();
    expect(result.user.email).toBe('test@example.com');
  });

  it('should throw error with invalid credentials', async () => {
    await expect(
      authService.login('invalid@example.com', 'wrongpass')
    ).rejects.toThrow('Invalid credentials');
  });

  it('should throw error when missing credentials', async () => {
    await expect(authService.login('', 'password')).rejects.toThrow(
      'Email and password required'
    );
  });

  it('should register new user', async () => {
    const newUser = {
      email: 'new@example.com',
      password: 'secure123',
      name: 'John Doe',
    };
    const result = await authService.register(newUser);
    expect(result.email).toBe('new@example.com');
    expect(result.name).toBe('John Doe');
    expect(result.id).toMatch(/^user_/);
  });

  it('should throw error with incomplete registration data', async () => {
    const incompleteData = { email: 'new@example.com' };
    await expect(authService.register(incompleteData)).rejects.toThrow(
      'Missing required fields'
    );
  });

  it('should logout user', async () => {
    const result = await authService.logout('jwt_token_123');
    expect(result.success).toBe(true);
  });

  it('should throw error on logout without token', async () => {
    await expect(authService.logout('')).rejects.toThrow('Token required');
  });
});
