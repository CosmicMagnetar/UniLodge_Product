import { useState, useCallback } from 'react';
import { Room } from '../types';
import { api } from '../lib/services/api';
import { useToast } from '../components/ToastProvider';

export const useRooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const { error } = useToast();

  const loadRooms = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getRooms();
      setRooms(
        data.map((r: any) => ({
          id: r._id || r.id,
          roomNumber: r.roomNumber,
          type: r.type,
          price: r.price,
          amenities: r.amenities || [],
          rating: r.rating || 0,
          imageUrl: r.imageUrl,
          isAvailable: r.isAvailable !== undefined ? r.isAvailable : r.available,
          description: r.description,
          capacity: r.capacity,
          university: r.university,
        }))
      );
    } catch (err: any) {
      console.error('Failed to load rooms:', err);
      error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  }, [error]);

  return { rooms, loading, loadRooms };
};
