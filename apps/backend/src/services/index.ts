import { Property, PropertyDomainService } from '../domains/property/property.domain.js';
import { User as DomainUser, AuthDomainService, LoginRequest, RegisterRequest, AuthResponse } from '../domains/auth/auth.domain.js';
import { UserProfile, UserDomainService } from '../domains/user/user.domain.js';
import jwt from 'jsonwebtoken';

// Mongoose Models
import User from '../models/User.js';
import Room from '../models/Room.js';
import Booking from '../models/Booking.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// ============================================================
// Service Implementations (SRP & Clean Architecture)
// ============================================================

export class RoomService extends PropertyDomainService {
  async searchRooms(query: any): Promise<Property[]> {
    const filter: any = {};
    if (query.type) filter.type = query.type;
    if (query.available === 'true') filter.isAvailable = true;

    const rooms = await Room.find(filter);

    // Map Mongoose document to Domain interface if necessary
    return rooms.map(room => ({
      ...room.toObject(),
      id: room._id.toString(),
      name: `Room ${room.roomNumber}`,
      description: room.description || '',
      location: room.university,
      price: room.price,
      amenities: room.amenities,
      images: [room.imageUrl],
      rating: room.rating,
      reviews: [],
      isAvailable: room.isAvailable,
      createdAt: room.createdAt,
      updatedAt: room.createdAt,
    })) as unknown as Property[];
  }

  async getRoomById(id: string): Promise<Property | null> {
    const room = await Room.findById(id);
    if (!room) return null;

    return {
      ...room.toObject(),
      id: room._id.toString(),
      name: `Room ${room.roomNumber}`,
      description: room.description || '',
      location: room.university,
      price: room.price,
      amenities: room.amenities,
      images: [room.imageUrl],
      rating: room.rating,
      reviews: [],
      isAvailable: room.isAvailable,
      createdAt: room.createdAt,
      updatedAt: room.createdAt,
    } as unknown as Property;
  }
}

export class BookingService {
  async createBooking(data: { roomId: string; userId: string; checkInDate: string; checkOutDate: string }) {
    const room = await Room.findById(data.roomId);
    if (!room) throw new Error('Room not found');

    const booking = new Booking({
      roomId: data.roomId,
      userId: data.userId,
      checkInDate: new Date(data.checkInDate),
      checkOutDate: new Date(data.checkOutDate),
      status: 'Confirmed',
      totalPrice: room.price, // simplistic calculation
      paymentStatus: 'unpaid',
    });

    await booking.save();

    // Return populated booking
    const populatedBooking = await Booking.findById(booking._id).populate('roomId');

    return {
      id: populatedBooking?._id.toString(),
      roomId: populatedBooking?.roomId,
      userId: populatedBooking?.userId,
      checkInDate: populatedBooking?.checkInDate,
      checkOutDate: populatedBooking?.checkOutDate,
      status: populatedBooking?.status,
      totalPrice: populatedBooking?.totalPrice,
      room: populatedBooking?.roomId,
      paymentStatus: populatedBooking?.paymentStatus,
      createdAt: populatedBooking?.createdAt,
    };
  }

  async getBookings(userId: string) {
    const bookings = await Booking.find({ userId }).populate('roomId');
    return bookings.map(b => ({
      id: b._id.toString(),
      roomId: b.roomId?._id?.toString(),
      userId: b.userId.toString(),
      checkInDate: b.checkInDate,
      checkOutDate: b.checkOutDate,
      status: b.status,
      totalPrice: b.totalPrice,
      room: b.roomId, // The populated room
      paymentStatus: b.paymentStatus,
      createdAt: b.createdAt,
    }));
  }
}

export class AuthService extends AuthDomainService {

  async login(request: LoginRequest): Promise<AuthResponse> {
    const user = await User.findOne({ email: request.email.toLowerCase() });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    try {
      const isMatch = await user.comparePassword(request.password);
      if (!isMatch) {
        throw new Error('Invalid credentials');
      }
    } catch (error: any) {
      // Log for debugging
      console.error('[AuthService] Password comparison failed:', error.message);
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      } as unknown as DomainUser,
    };
  }

  async register(data: RegisterRequest): Promise<DomainUser> {
    const existingUser = await User.findOne({ email: data.email.toLowerCase() });

    if (existingUser) {
      throw new Error('Email already exists');
    }

    const newUser = new User({
      name: data.name,
      email: data.email.toLowerCase(),
      password: data.password,
      role: data.role || 'GUEST',
    });

    await newUser.save();

    return {
      id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    } as unknown as DomainUser;
  }

  async validateToken(token: string): Promise<DomainUser> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string, role: string };
      const user = await User.findById(decoded.id);

      if (!user) {
        throw new Error('User not found');
      }

      return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      } as unknown as DomainUser;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
}

export class UserService extends UserDomainService {
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const user = await User.findById(userId);
    if (!user) return null;

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.createdAt,
    } as unknown as UserProfile;
  }
}
