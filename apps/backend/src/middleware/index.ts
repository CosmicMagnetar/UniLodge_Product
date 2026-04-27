/**
 * Middleware Services
 * Refactored to expose Express-compatible middleware functions
 */
import { Request, Response, NextFunction } from 'express';

// ============================================================
// Logging Middleware
// ============================================================
export class LoggingService {
    log(message: string, data?: any): void {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] ${message}`, data || '');
    }

    error(message: string, error?: any): void {
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}] ERROR: ${message}`, error || '');
    }
}

const logger = new LoggingService();

export const requestLogger = (req: Request, _res: Response, next: NextFunction) => {
    logger.log(`${req.method} ${req.path}`);
    next();
};

// ============================================================
// Rate Limit Middleware
// ============================================================
export class RateLimitService {
    private requests: Map<string, number[]> = new Map();

    isAllowed(clientId: string, limit: number = 100, windowMs: number = 60000): boolean {
        const now = Date.now();
        const requests = this.requests.get(clientId) || [];
        const recentRequests = requests.filter((time) => now - time < windowMs);

        if (recentRequests.length >= limit) {
            return false;
        }

        recentRequests.push(now);
        this.requests.set(clientId, recentRequests);
        return true;
    }
}

const rateLimiter = new RateLimitService();

export const rateLimitMiddleware = (limit: number = 100, windowMs: number = 60000) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const clientId = req.ip || 'unknown';
        if (!rateLimiter.isAllowed(clientId, limit, windowMs)) {
            res.status(429).json({ error: 'Too many requests, please try again later.' });
            return;
        }
        next();
    };
};

// ============================================================
// Error Handling Middleware
// ============================================================
export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
    logger.error('Unhandled Exception:', err);
    
    if (err.status) {
        return res.status(err.status).json({
            error: err.message,
            status: err.status,
            details: process.env.NODE_ENV === 'development' ? err : undefined,
        });
    }

    return res.status(500).json({
        error: 'Internal Server Error',
        status: 500,
        details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
};
