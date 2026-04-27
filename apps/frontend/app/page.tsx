// Frontend main entry point - Full UniLodge Application
'use client';

import React, { useState, useEffect } from 'react';
import { Role, User } from '../types';
import { HomePage } from '../lib/pages/HomePage';
import { LoginPage } from '../lib/pages/LoginPage';
import { GuestDashboard } from '../lib/pages/GuestDashboard';
import { AdminDashboard } from '../lib/pages/AdminDashboard';
import { MyBookingsPage } from '../lib/pages/MyBookingsPage';
import { WardenDashboard } from '../lib/pages/WardenDashboard';
import { LoadingPage } from '../components/common/LoadingPage';
import { ToastProvider, useToast } from '../components/ToastProvider';
import Header from '../lib/pages/Header';

// Hooks
import { useAuth } from '../hooks/useAuth';
import { useRooms } from '../hooks/useRooms';
import { useBookings } from '../hooks/useBookings';

const AppContent = () => {
  const [page, setPage] = useState('home');
  const [initialLoading, setInitialLoading] = useState(true);
  const { info, error } = useToast();

  const { currentUser, loadUserFromToken, login, signup, logout } = useAuth();
  const { rooms, loadRooms } = useRooms();
  const { bookings, loadBookings, createBooking, cancelBooking, checkInGuest, checkOutGuest } = useBookings();

  useEffect(() => {
    const initializeApp = async () => {
      const dashboardPage = await loadUserFromToken();
      if (dashboardPage) {
        setPage(dashboardPage);
      }
      await loadRooms();
      setTimeout(() => setInitialLoading(false), 1500);
    };
    
    initializeApp();
  }, [loadUserFromToken, loadRooms]);

  useEffect(() => {
    if (currentUser) {
      loadBookings();
    }
  }, [currentUser, loadBookings]);

  const handleNavigate = (newPage: string) => {
    setPage(newPage);
    if (typeof window !== 'undefined') window.scrollTo(0, 0);
  };

  const handleLogin = async (email: string, password: string) => {
    const dashboardPage = await login(email, password);
    setPage(dashboardPage);
  };

  const handleSignup = async (name: string, email: string, password: string) => {
    const dashboardPage = await signup(name, email, password);
    setPage(dashboardPage);
  };

  const handleLogout = () => {
    logout();
    handleNavigate('home');
  };

  const handleBook = async (roomId: string) => {
    if (!currentUser) {
      handleNavigate('login');
      info('Please login to book a room');
      return;
    }
    if (currentUser.role === Role.ADMIN) {
      error('Admins cannot book rooms.');
      return;
    }

    const checkIn = prompt('Enter check-in date (YYYY-MM-DD):');
    const checkOut = prompt('Enter check-out date (YYYY-MM-DD):');
    if (!checkIn || !checkOut) return;

    await createBooking(roomId, checkIn, checkOut);
    loadRooms(); // Refresh room availability
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    await cancelBooking(bookingId);
    loadRooms();
  };

  const renderPage = () => {
    switch (page) {
      case 'login':
        return <LoginPage onLogin={handleLogin} onSignup={handleSignup} />;
      case 'guest-dashboard':
        return currentUser && <GuestDashboard user={currentUser} rooms={rooms} onBook={handleBook} />;
      case 'admin-dashboard':
        return currentUser && <AdminDashboard user={currentUser} rooms={rooms} bookings={bookings} />;
      case 'warden-dashboard':
        return currentUser && (
          <WardenDashboard
            user={currentUser as User}
            rooms={rooms}
            bookings={bookings}
            onCheckIn={checkInGuest}
            onCheckOut={checkOutGuest}
          />
        );
      case 'my-bookings':
        return <MyBookingsPage bookings={bookings} onCancel={handleCancelBooking} />;
      case 'home':
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  if (initialLoading) return <LoadingPage />;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header user={currentUser as User | null} onNavigate={handleNavigate} onLogout={handleLogout} />
      <main className="flex-grow">{renderPage()}</main>
      <footer className="bg-gray-800 text-gray-400 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} UniLodge Rooms. All rights reserved.</p>
          <p className="mt-2">Your Trusted Partner in Campus Accommodations.</p>
        </div>
      </footer>
    </div>
  );
};

export default function Home() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
