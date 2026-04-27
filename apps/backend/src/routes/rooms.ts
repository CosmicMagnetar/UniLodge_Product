import express, { Router, Request, Response } from 'express';
import { RoomService } from '../services/index.js';

const roomRouter: Router = express.Router();
const roomService = new RoomService();

roomRouter.get('/', async (req: Request, res: Response) => {
    try {
        const rooms = await roomService.searchRooms(req.query);
        res.status(200).json(rooms);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch rooms', message: error.message });
    }
});

roomRouter.get('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const room = await roomService.getRoomById(req.params.id);
        if (!room) {
            res.status(404).json({ error: 'Room not found' });
            return;
        }
        res.status(200).json(room);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch room', message: error.message });
    }
});

export default roomRouter;
