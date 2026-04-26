// Mock API Server for Frontend Development
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Mock data
const users = {
  'user@example.com': {
    id: '1',
    name: 'John Student',
    email: 'user@example.com',
    password: 'password123',
    role: 'GUEST',
  },
  'admin@example.com': {
    id: 'admin1',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'ADMIN',
  },
  'warden@example.com': {
    id: 'warden1',
    name: 'Warden User',
    email: 'warden@example.com',
    password: 'warden123',
    role: 'WARDEN',
  },
};

const rooms = [
  {
    _id: 'room1',
    id: 'room1',
    roomNumber: '101',
    type: 'Single',
    price: 500,
    amenities: ['WiFi', 'AC', 'Bed'],
    rating: 4.5,
    imageUrl: '/images/room1.jpg',
    isAvailable: true,
    description: 'Comfortable single room with all amenities',
    capacity: 1,
    university: 'State University',
  },
  {
    _id: 'room2',
    id: 'room2',
    roomNumber: '102',
    type: 'Double',
    price: 750,
    amenities: ['WiFi', 'AC', 'Two Beds', 'Balcony'],
    rating: 4.7,
    imageUrl: '/images/room2.jpg',
    isAvailable: true,
    description: 'Spacious double room with modern furniture',
    capacity: 2,
    university: 'State University',
  },
  {
    _id: 'room3',
    id: 'room3',
    roomNumber: '103',
    type: 'Suite',
    price: 1200,
    amenities: ['WiFi', 'AC', 'Bed', 'Sofa', 'Kitchen'],
    rating: 4.9,
    imageUrl: '/images/room3.jpg',
    isAvailable: true,
    description: 'Luxury suite with complete amenities',
    capacity: 4,
    university: 'State University',
  },
];

const bookings = [];
const tokens = {};

// Generate mock token
function generateToken() {
  return 'mock-token-' + Math.random().toString(36).substr(2, 9);
}

// Auth Routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users[email];
  
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const token = generateToken();
  tokens[token] = { userId: user.id, email: user.email };
  
  res.json({
    message: 'Login successful',
    token,
    user: { ...user, password: undefined },
  });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  
  if (users[email]) {
    return res.status(400).json({ error: 'Email already exists' });
  }
  
  const newUser = {
    id: 'user-' + Math.random().toString(36).substr(2, 9),
    name,
    email,
    password,
    role: 'GUEST',
  };
  
  users[email] = newUser;
  
  const token = generateToken();
  tokens[token] = { userId: newUser.id, email: newUser.email };
  
  res.json({
    message: 'Registration successful',
    token,
    user: { ...newUser, password: undefined },
  });
});

// Check token middleware
function checkAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];
  
  if (!token || !tokens[token]) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  req.user = tokens[token];
  next();
}

app.get('/api/auth/me', checkAuth, (req, res) => {
  // Find the user by email
  for (const [email, user] of Object.entries(users)) {
    if (user.id === req.user.userId) {
      return res.json({ ...user, password: undefined });
    }
  }
  res.status(404).json({ error: 'User not found' });
});

app.post('/api/auth/logout', checkAuth, (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];
  if (token) {
    delete tokens[token];
  }
  res.json({ message: 'Logged out' });
});

// Rooms Routes
app.get('/api/rooms', (req, res) => {
  res.json(rooms);
});

app.get('/api/rooms/:id', (req, res) => {
  const room = rooms.find(r => r.id === req.params.id);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  res.json(room);
});

// Bookings Routes
app.get('/api/bookings', checkAuth, (req, res) => {
  const userBookings = bookings.filter(b => b.userId === req.user.userId);
  res.json(userBookings);
});

app.post('/api/bookings', checkAuth, (req, res) => {
  const { roomId, checkInDate, checkOutDate } = req.body;
  
  const booking = {
    id: 'booking-' + Math.random().toString(36).substr(2, 9),
    _id: 'booking-' + Math.random().toString(36).substr(2, 9),
    roomId,
    userId: req.user.userId,
    checkInDate,
    checkOutDate,
    status: 'Confirmed',
    totalPrice: 500,
    room: rooms.find(r => r.id === roomId),
    paymentStatus: 'Pending',
  };
  
  bookings.push(booking);
  res.status(201).json(booking);
});

app.patch('/api/bookings/:id/status', checkAuth, (req, res) => {
  const { status } = req.body;
  const booking = bookings.find(b => b.id === req.params.id);
  
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }
  
  booking.status = status;
  res.json(booking);
});

app.post('/api/bookings/:id/checkin', checkAuth, (req, res) => {
  const booking = bookings.find(b => b.id === req.params.id);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }
  booking.status = 'Checked In';
  res.json(booking);
});

app.post('/api/bookings/:id/checkout', checkAuth, (req, res) => {
  const booking = bookings.find(b => b.id === req.params.id);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }
  booking.status = 'Checked Out';
  res.json(booking);
});

// Booking Requests
app.post('/api/booking-requests', checkAuth, (req, res) => {
  res.status(201).json({ id: 'req-' + Math.random().toString(36).substr(2, 9), ...req.body });
});

app.get('/api/booking-requests/my-requests', checkAuth, (req, res) => {
  res.json([]);
});

// Analytics
app.get('/api/analytics', checkAuth, (req, res) => {
  res.json({
    totalBookings: bookings.length,
    totalRevenue: 5000,
    occupancyRate: 75,
  });
});

// Wardens
app.get('/api/auth/wardens', (req, res) => {
  res.json([users['warden@example.com']]);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ Mock API Server running on http://localhost:${PORT}`);
  console.log('\nTest Credentials:');
  console.log('Guest: user@example.com / password123');
  console.log('Admin: admin@example.com / admin123');
  console.log('Warden: warden@example.com / warden123');
});
