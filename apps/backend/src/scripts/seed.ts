import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Room from '../models/Room.js';
import User from '../models/User.js';
import Booking from '../models/Booking.js';

dotenv.config();

const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) throw new Error('MONGODB_URI not defined');

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      family: 4
    });

    console.log('[MongoDB] Connected for seeding');
  } catch (error) {
    console.error('[MongoDB] Connection error:', error);
    process.exit(1);
  }
};

const dummyRooms = [
  {
    roomNumber: '101',
    type: 'Single',
    price: 650,
    amenities: ['WiFi', 'AC', 'Study Desk', 'Bookshelf'],
    rating: 4.5,
    imageUrl: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=300&fit=crop',
    isAvailable: true,
    description: 'Cozy single room perfect for focused study with modern amenities',
    capacity: 1,
    university: 'Stanford University',
    approvalStatus: 'approved',
  },
  {
    roomNumber: '102',
    type: 'Single',
    price: 700,
    amenities: ['WiFi', 'AC', 'En-Suite Bathroom', 'Study Desk'],
    rating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1632323554820-e5b7ec1a2b78?w=400&h=300&fit=crop',
    isAvailable: true,
    description: 'Premium single room with private bathroom and excellent natural lighting',
    capacity: 1,
    university: 'Stanford University',
    approvalStatus: 'approved',
  },
  {
    roomNumber: '201',
    type: 'Double',
    price: 950,
    amenities: ['WiFi', 'AC', 'Laundry', 'Shared Kitchen', 'Study Area'],
    rating: 4.3,
    imageUrl: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=300&fit=crop',
    isAvailable: true,
    description: 'Spacious double room ideal for roommates seeking shared living space',
    capacity: 2,
    university: 'MIT',
    approvalStatus: 'approved',
  },
  {
    roomNumber: '202',
    type: 'Double',
    price: 1000,
    amenities: ['WiFi', 'AC', 'En-Suite Bathroom', 'Laundry', 'Kitchenette'],
    rating: 4.6,
    imageUrl: 'https://images.unsplash.com/photo-1598928211773-0973d37e00a9?w=400&h=300&fit=crop',
    isAvailable: true,
    description: 'Modern double room with private facilities and contemporary design',
    capacity: 2,
    university: 'UC Berkeley',
    approvalStatus: 'approved',
  },
  {
    roomNumber: '301',
    type: 'Suite',
    price: 1400,
    amenities: ['WiFi', 'AC', 'Full Kitchen', 'Living Area', 'En-Suite Bathroom', 'Balcony'],
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1618883713121-92290f344bcc?w=400&h=300&fit=crop',
    isAvailable: true,
    description: 'Luxurious suite with full apartment-style living for premium comfort',
    capacity: 3,
    university: 'Harvard University',
    approvalStatus: 'approved',
  },
  {
    roomNumber: '302',
    type: 'Suite',
    price: 1500,
    amenities: ['WiFi', 'AC', 'Full Kitchen', 'Living Area', 'En-Suite Bathroom', 'Gym Access', 'Concierge'],
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1590080876-91e65bc1e906?w=400&h=300&fit=crop',
    isAvailable: true,
    description: 'Executive suite with premium amenities and dedicated concierge service',
    capacity: 3,
    university: 'Yale University',
    approvalStatus: 'approved',
  },
  {
    roomNumber: '401',
    type: 'Studio',
    price: 550,
    amenities: ['WiFi', 'AC', 'Kitchenette', 'Study Space'],
    rating: 4.2,
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop',
    isAvailable: true,
    description: 'Compact studio apartment ideal for independent students',
    capacity: 1,
    university: 'Columbia University',
    approvalStatus: 'approved',
  },
  {
    roomNumber: '402',
    type: 'Studio',
    price: 600,
    amenities: ['WiFi', 'AC', 'Full Kitchen', 'Workspace', 'Balcony'],
    rating: 4.4,
    imageUrl: 'https://images.unsplash.com/photo-1522368-5903dbfcc1bd?w=400&h=300&fit=crop',
    isAvailable: true,
    description: 'Well-equipped studio with workspace and outdoor space',
    capacity: 1,
    university: 'Princeton University',
    approvalStatus: 'approved',
  },
  {
    roomNumber: '501',
    type: 'Double',
    price: 900,
    amenities: ['WiFi', 'AC', 'Laundry', 'Gym', 'Study Lounge'],
    rating: 4.5,
    imageUrl: 'https://images.unsplash.com/photo-1566195992212-a7fb3e4db3c0?w=400&h=300&fit=crop',
    isAvailable: true,
    description: 'Modern double room with access to shared facilities',
    capacity: 2,
    university: 'Stanford University',
    approvalStatus: 'approved',
  },
  {
    roomNumber: '502',
    type: 'Single',
    price: 750,
    amenities: ['WiFi', 'AC', 'En-Suite Bathroom', 'Terrace', 'Mini Bar'],
    rating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=400&h=300&fit=crop',
    isAvailable: false,
    description: 'Exclusive single room with luxury amenities - Currently Booked',
    capacity: 1,
    university: 'MIT',
    approvalStatus: 'approved',
  },
  {
    roomNumber: '503',
    type: 'Suite',
    price: 1350,
    amenities: ['WiFi', 'AC', 'Full Kitchen', 'Living Area', 'Workspace', 'Entertainment System'],
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=300&fit=crop',
    isAvailable: true,
    description: 'Premium suite with entertainment and business facilities',
    capacity: 3,
    university: 'UC Berkeley',
    approvalStatus: 'approved',
  },
  {
    roomNumber: '504',
    type: 'Studio',
    price: 580,
    amenities: ['WiFi', 'AC', 'Kitchen', 'Workspace', 'Shower'],
    rating: 4.3,
    imageUrl: 'https://images.unsplash.com/photo-1565183938294-7563f3ff68bb?w=400&h=300&fit=crop',
    isAvailable: true,
    description: 'Functional studio with complete facilities',
    capacity: 1,
    university: 'Harvard University',
    approvalStatus: 'approved',
  },
  {
    roomNumber: '505',
    type: 'Double',
    price: 920,
    amenities: ['WiFi', 'AC', 'En-Suite Bathroom', 'Laundry', 'Common Area'],
    rating: 4.6,
    imageUrl: 'https://images.unsplash.com/photo-1598928211773-0973d37e00a9?w=400&h=300&fit=crop',
    isAvailable: true,
    description: 'Contemporary double room with modern amenities and design',
    capacity: 2,
    university: 'Yale University',
    approvalStatus: 'approved',
  },
];

const dummyUsers = [
  {
    name: 'Admin User',
    email: 'admin@unilodge.com',
    password: 'Admin@123',
    role: 'ADMIN',
  },
  {
    name: 'Test Warden',
    email: 'warden@unilodge.com',
    password: 'Warden@123',
    role: 'WARDEN',
  },
  {
    name: 'Test Guest',
    email: 'guest@unilodge.com',
    password: 'Guest@123',
    role: 'GUEST',
  },
];

const seed = async (): Promise<void> => {
  try {
    await connectDB();

    console.log('🌱 Starting database seed...\n');

    // Clear existing data
    const roomCount = await Room.countDocuments();
    const userCount = await User.countDocuments();

    if (roomCount > 0) {
      console.log(`⚠️  Found ${roomCount} existing rooms. Clearing...`);
      await Room.deleteMany({});
    }

    if (userCount > 0) {
      console.log(`⚠️  Found ${userCount} existing users. Keeping for safety...\n`);
    }

    // Seed users
    console.log('👥 Seeding users...');
    for (const userData of dummyUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        console.log(`  ✓ Created user: ${userData.email} (${userData.role})`);
      } else {
        console.log(`  ℹ️  User already exists: ${userData.email}`);
      }
    }

    // Seed rooms
    console.log('\n🏠 Seeding rooms...');
    const insertedRooms = await Room.insertMany(dummyRooms);
    console.log(`  ✓ Created ${insertedRooms.length} rooms\n`);

    // Seed bookings for guest
    console.log('\n📅 Seeding bookings...');
    const guestUser = await User.findOne({ email: 'guest@unilodge.com' });
    if (guestUser && insertedRooms.length > 0) {
      // Check if bookings already exist
      const existingBookings = await Booking.countDocuments();
      if (existingBookings > 0) {
        console.log(`⚠️  Found ${existingBookings} existing bookings. Clearing...`);
        await Booking.deleteMany({});
      }

      const booking1 = new Booking({
        roomId: insertedRooms[0]._id,
        userId: guestUser._id,
        checkInDate: new Date(),
        checkOutDate: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days later
        status: 'Confirmed',
        totalPrice: insertedRooms[0].price,
        paymentStatus: 'paid',
      });
      await booking1.save();

      const booking2 = new Booking({
        roomId: insertedRooms[1]._id,
        userId: guestUser._id,
        checkInDate: new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000), // 14 days later
        checkOutDate: new Date(new Date().getTime() + 21 * 24 * 60 * 60 * 1000), // 21 days later
        status: 'Pending',
        totalPrice: insertedRooms[1].price,
        paymentStatus: 'unpaid',
      });
      await booking2.save();

      console.log(`  ✓ Created 2 bookings for guest@unilodge.com\n`);
    }

    // Print summary
    console.log('📊 Seed Summary:');
    console.log(`  • Total Rooms: ${await Room.countDocuments()}`);
    console.log(`  • Total Users: ${await User.countDocuments()}`);
    console.log(`  • Total Bookings: ${await Booking.countDocuments()}`);
    console.log('\n✨ Database seeding completed successfully!');
    console.log('\n🔐 Test credentials:');
    dummyUsers.forEach(user => {
      console.log(`  • Email: ${user.email} | Password: ${user.password} | Role: ${user.role}`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Connection closed. Seed completed!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seed();
