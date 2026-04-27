import { useState, useCallback } from 'react';
import { Booking } from '../types';
import { api } from '../lib/services/api';
import { useToast } from '../components/ToastProvider';

export const useBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const { error, success } = useToast();

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getBookings();
      setBookings(
        data.map((b: any) => ({
          id: b.id || b._id,
          roomId: typeof b.roomId === 'object' ? b.roomId._id : b.roomId,
          userId: typeof b.userId === 'object' ? b.userId._id : b.userId,
          checkInDate: b.checkInDate,
          checkOutDate: b.checkOutDate,
          status: b.status,
          totalPrice: b.totalPrice,
          room: b.room || b.roomId,
          paymentStatus: b.paymentStatus,
        }))
      );
    } catch (err: any) {
      console.error('Failed to load bookings:', err);
      error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [error]);

  const createBooking = async (roomId: string, checkIn: string, checkOut: string) => {
    try {
      await api.createBooking(roomId, checkIn, checkOut);
      success('Booking created successfully!');
      await loadBookings();
    } catch (err: any) {
      error(err.message || 'Failed to create booking');
      throw err;
    }
  };

  const cancelBooking = async (bookingId: string) => {
    try {
      await api.updateBookingStatus(bookingId, 'Cancelled');
      success('Booking cancelled successfully');
      await loadBookings();
    } catch (err: any) {
      error(err.message || 'Failed to cancel booking');
      throw err;
    }
  };

  const checkInGuest = async (bookingId: string) => {
    try {
      await api.checkIn(bookingId);
      success('Guest checked in successfully');
      await loadBookings();
    } catch (err: any) {
      error(err.message || 'Check-in failed');
      throw err;
    }
  };

  const checkOutGuest = async (bookingId: string) => {
    try {
      await api.checkOut(bookingId);
      success('Guest checked out successfully');
      await loadBookings();
    } catch (err: any) {
      error(err.message || 'Check-out failed');
      throw err;
    }
  };

  return {
    bookings,
    loading,
    loadBookings,
    createBooking,
    cancelBooking,
    checkInGuest,
    checkOutGuest,
  };
};
