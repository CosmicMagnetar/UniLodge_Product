import express, { Router, Request, Response } from 'express';
import { z } from 'zod';
import { validateRequest } from '../middleware/validate';
import { BookingService } from '../services';
import { requireAuth } from './auth';

const bookingRouter: Router = express.Router();
const bookingService = new BookingService();

const CreateBookingSchema = z.object({
    roomId: z.string().min(1, 'Room ID is required'),
    checkInDate: z.string().min(1, 'Check-in date is required'),
    checkOutDate: z.string().min(1, 'Check-out date is required'),
});

bookingRouter.use(requireAuth);

bookingRouter.post('/', validateRequest(CreateBookingSchema), async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const booking = await bookingService.createBooking({ ...req.body, userId });
        res.status(201).json(booking);
    } catch (error: any) {
        res.status(400).json({ error: 'Failed to create booking', message: error.message });
    }
});

bookingRouter.get('/', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const bookings = await bookingService.getBookings(userId);
        res.status(200).json(bookings);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch bookings', message: error.message });
    }
});

export default bookingRouter;
