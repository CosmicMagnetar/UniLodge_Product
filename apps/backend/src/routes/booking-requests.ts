import express, { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { validateRequest } from '../middleware/validate';
import BookingRequest from '../models/BookingRequest';
import Room from '../models/Room';
import { requireAuth, requireRole } from './auth';

const requestRouter: Router = express.Router();

// Validation schemas
const CreateBookingRequestSchema = z.object({
    roomId: z.string().min(1, 'Room ID is required'),
    checkInDate: z.string().min(1, 'Check-in date is required'),
    checkOutDate: z.string().min(1, 'Check-out date is required'),
    message: z.string().optional(),
});

// Apply auth middleware to all routes
requestRouter.use(requireAuth);

// Create a booking request (GUEST only)
requestRouter.post(
    '/',
    validateRequest(CreateBookingRequestSchema),
    async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            const userRole = (req as any).user.role;

            // Only guests can create booking requests
            if (userRole !== 'GUEST') {
                res.status(403).json({ error: 'Only guests can submit booking requests' });
                return;
            }

            const { roomId, checkInDate, checkOutDate, message } = req.body;

            // Verify room exists and is available
            const room = await Room.findById(roomId);
            if (!room) {
                res.status(404).json({ error: 'Room not found' });
                return;
            }

            if (!room.isAvailable) {
                res.status(400).json({ error: 'Room is not available' });
                return;
            }

            // Create booking request
            const bookingRequest = new BookingRequest({
                roomId,
                userId,
                checkInDate: new Date(checkInDate),
                checkOutDate: new Date(checkOutDate),
                message: message || '',
                status: 'pending',
            });

            await bookingRequest.save();

            // Populate room and user details
            const populatedRequest = await BookingRequest.findById(bookingRequest._id)
                .populate('roomId')
                .populate('userId');

            res.status(201).json({
                id: populatedRequest?._id.toString(),
                room: populatedRequest?.roomId,
                user: populatedRequest?.userId,
                checkInDate: populatedRequest?.checkInDate,
                checkOutDate: populatedRequest?.checkOutDate,
                message: populatedRequest?.message,
                status: populatedRequest?.status,
                createdAt: populatedRequest?.createdAt,
            });
        } catch (error: any) {
            res.status(500).json({ error: 'Failed to create booking request', message: error.message });
        }
    }
);

// Get my booking requests (for guests to see their own requests) - MUST be BEFORE /:id route
requestRouter.get('/my-requests', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;

        const requests = await BookingRequest.find({ userId })
            .populate('roomId')
            .sort({ createdAt: -1 });

        const result = requests.map((req) => ({
            id: req._id.toString(),
            room: req.roomId,
            user: req.userId,
            checkInDate: req.checkInDate,
            checkOutDate: req.checkOutDate,
            message: req.message,
            status: req.status,
            adminNote: req.adminNote,
            reviewedAt: req.reviewedAt,
            createdAt: req.createdAt,
        }));

        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch booking requests', message: error.message });
    }
});

// Get all booking requests (ADMIN only)
requestRouter.get(
    '/',
    requireRole('ADMIN'),
    async (req: Request, res: Response) => {
        try {
            const { status } = req.query;

            const filter: any = {};
            if (status && typeof status === 'string') {
                filter.status = status;
            }

            const requests = await BookingRequest.find(filter)
                .populate('roomId')
                .populate('userId')
                .populate('reviewedBy')
                .sort({ createdAt: -1 });

            const result = requests.map((req) => ({
                id: req._id.toString(),
                room: req.roomId,
                user: req.userId,
                checkInDate: req.checkInDate,
                checkOutDate: req.checkOutDate,
                message: req.message,
                status: req.status,
                adminNote: req.adminNote,
                reviewedBy: req.reviewedBy,
                reviewedAt: req.reviewedAt,
                createdAt: req.createdAt,
            }));

            res.status(200).json(result);
        } catch (error: any) {
            res.status(500).json({ error: 'Failed to fetch booking requests', message: error.message });
        }
    }
);

// Approve a booking request (ADMIN only)
requestRouter.post(
    '/:id/approve',
    requireRole('ADMIN'),
    async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const adminId = (req as any).user.id;
            const { adminNote } = req.body;

            const request = await BookingRequest.findById(id);
            if (!request) {
                res.status(404).json({ error: 'Booking request not found' });
                return;
            }

            if (request.status !== 'pending') {
                res.status(400).json({ error: `Request already ${request.status}` });
                return;
            }

            // Update request status
            request.status = 'approved';
            request.adminNote = adminNote || '';
            request.reviewedBy = new mongoose.Types.ObjectId(adminId);
            request.reviewedAt = new Date();
            await request.save();

            // Create a booking from the approved request
            const Booking = mongoose.model('Booking');
            const booking = new Booking({
                roomId: request.roomId,
                userId: request.userId,
                checkInDate: request.checkInDate,
                checkOutDate: request.checkOutDate,
                status: 'Confirmed',
                totalPrice: (await Room.findById(request.roomId))?.price || 0,
                paymentStatus: 'unpaid',
            });

            await booking.save();

            // Populate and return
            const populatedRequest = await BookingRequest.findById(id)
                .populate('roomId')
                .populate('userId')
                .populate('reviewedBy');

            res.status(200).json({
                id: populatedRequest?._id.toString(),
                room: populatedRequest?.roomId,
                user: populatedRequest?.userId,
                checkInDate: populatedRequest?.checkInDate,
                checkOutDate: populatedRequest?.checkOutDate,
                message: populatedRequest?.message,
                status: populatedRequest?.status,
                adminNote: populatedRequest?.adminNote,
                reviewedBy: populatedRequest?.reviewedBy,
                reviewedAt: populatedRequest?.reviewedAt,
                createdAt: populatedRequest?.createdAt,
            });
        } catch (error: any) {
            res.status(500).json({ error: 'Failed to approve booking request', message: error.message });
        }
    }
);

// Reject a booking request (ADMIN only)
requestRouter.post(
    '/:id/reject',
    requireRole('ADMIN'),
    async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const adminId = (req as any).user.id;
            const { adminNote } = req.body;

            const request = await BookingRequest.findById(id);
            if (!request) {
                res.status(404).json({ error: 'Booking request not found' });
                return;
            }

            if (request.status !== 'pending') {
                res.status(400).json({ error: `Request already ${request.status}` });
                return;
            }

            // Update request status
            request.status = 'rejected';
            request.adminNote = adminNote || '';
            request.reviewedBy = new mongoose.Types.ObjectId(adminId);
            request.reviewedAt = new Date();
            await request.save();

            // Populate and return
            const populatedRequest = await BookingRequest.findById(id)
                .populate('roomId')
                .populate('userId')
                .populate('reviewedBy');

            res.status(200).json({
                id: populatedRequest?._id.toString(),
                room: populatedRequest?.roomId,
                user: populatedRequest?.userId,
                checkInDate: populatedRequest?.checkInDate,
                checkOutDate: populatedRequest?.checkOutDate,
                message: populatedRequest?.message,
                status: populatedRequest?.status,
                adminNote: populatedRequest?.adminNote,
                reviewedBy: populatedRequest?.reviewedBy,
                reviewedAt: populatedRequest?.reviewedAt,
                createdAt: populatedRequest?.createdAt,
            });
        } catch (error: any) {
            res.status(500).json({ error: 'Failed to reject booking request', message: error.message });
        }
    }
);

export default requestRouter;
