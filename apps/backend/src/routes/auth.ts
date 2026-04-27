import express, { Router, Request, Response } from 'express';
import { z } from 'zod';
import { validateRequest } from '../middleware/validate';
import { AuthService } from '../services';

const authRouter: Router = express.Router();
const authService = new AuthService();

const LoginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

const RegisterSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['GUEST', 'WARDEN', 'ADMIN']).optional(),
});

authRouter.post('/login', validateRequest(LoginSchema), async (req: Request, res: Response) => {
    try {
        const response = await authService.login(req.body);
        res.status(200).json({ message: 'Login successful', ...response });
    } catch (error: any) {
        res.status(401).json({ error: error.message });
    }
});

authRouter.post('/register', validateRequest(RegisterSchema), async (req: Request, res: Response) => {
    try {
        const user = await authService.register(req.body);
        // Note: For simplicity in the mock, we don't automatically log them in, 
        // but a real implementation might return a token here too.
        res.status(201).json({ message: 'Registration successful', user });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Middleware to protect routes
export const requireAuth = async (req: Request, res: Response, next: express.NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
        return;
    }

    const token = authHeader.split(' ')[1];
    try {
        const user = await authService.validateToken(token);
        (req as any).user = user;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};

// Middleware to check user role
export const requireRole = (requiredRole: string) => {
    return async (req: Request, res: Response, next: express.NextFunction): Promise<void> => {
        // First ensure user is authenticated
        if (!(req as any).user) {
            res.status(401).json({ error: 'Unauthorized: Authentication required' });
            return;
        }

        const userRole = (req as any).user.role;

        if (userRole !== requiredRole) {
            res.status(403).json({ error: `Forbidden: Requires ${requiredRole} role` });
            return;
        }

        next();
    };
};

authRouter.get('/me', requireAuth, (req: Request, res: Response) => {
    res.status(200).json((req as any).user);
});

export default authRouter;
