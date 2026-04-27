import express, { Router, Request, Response } from 'express';
import { z } from 'zod';
import { validateRequest } from '../middleware/validate.js';
import { Container } from '../container.js';

const aiRouter: Router = express.Router();

// ============================================================
// Zod Validation Schemas
// ============================================================

const ChatRequestSchema = z.object({
    message: z.string().min(1, 'Message is required'),
    context: z.string().optional(),
});

const PriceRequestSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    location: z.string().min(1, 'Location is required'),
    amenities: z.array(z.string()).optional(),
    size: z.number().positive().optional(),
    type: z.string().optional(),
});

const RecommendationRequestSchema = z.object({
    preferences: z.record(z.any()),
    rooms: z.array(z.any()).min(1, 'At least one room is required'),
});

const AnalysisRequestSchema = z.object({
    description: z.string().min(10, 'Description must be at least 10 characters'),
});

const ResponseRequestSchema = z.object({
    prompt: z.string().min(1, 'Prompt is required'),
});

// ============================================================
// Helper to get AI Service from Container
// ============================================================

const getAIService = async () => {
    const container = Container.getInstance();
    return await container.getAIService();
};

// ============================================================
// Routes
// ============================================================

/**
 * Health check endpoint
 */
aiRouter.get('/health', async (_req: Request, res: Response) => {
    try {
        const aiService = await getAIService();
        const status = await aiService.getServiceStatus();
        res.status(status.available ? 200 : 503).json({
            healthy: status.available,
            tokensRemaining: status.tokensRemaining,
        });
    } catch (error: any) {
        res.status(500).json({
            healthy: false,
            message: error.message,
        });
    }
});

/**
 * Chat endpoint
 */
aiRouter.post('/chat', validateRequest(ChatRequestSchema), async (req: Request, res: Response): Promise<void> => {
    try {
        const { message, context } = req.body;
        const aiService = await getAIService();
        const chatMessage = {
            id: `msg_${Date.now()}`,
            userId: 'anonymous',
            content: message,
            role: 'USER' as const,
            timestamp: new Date(),
            context: context ? { roomId: context } : undefined,
        };
        const response = await aiService.processChat(chatMessage);
        res.status(200).json(response);
    } catch (error: any) {
        console.error('[AI-ROUTES] Chat error:', error);
        res.status(500).json({
            error: 'Failed to process chat message',
            message: error.message,
        });
    }
});

/**
 * Price suggestion endpoint
 */
aiRouter.post('/price-suggestion', validateRequest(PriceRequestSchema), async (req: Request, res: Response): Promise<void> => {
    try {
        const { name } = req.body;
        const aiService = await getAIService();
        const suggestion = await aiService.suggestPrice(name);
        res.status(200).json(suggestion);
    } catch (error: any) {
        console.error('[AI-ROUTES] Price suggestion error:', error);
        res.status(500).json({
            error: 'Failed to generate price suggestion',
            message: error.message,
        });
    }
});

/**
 * Room recommendations endpoint
 */
aiRouter.post('/recommendations', validateRequest(RecommendationRequestSchema), async (req: Request, res: Response): Promise<void> => {
    try {
        const { preferences } = req.body;
        const aiService = await getAIService();
        const recommendations = await aiService.recommendRooms('anonymous', preferences);
        res.status(200).json(recommendations);
    } catch (error: any) {
        console.error('[AI-ROUTES] Recommendations error:', error);
        res.status(500).json({
            error: 'Failed to generate recommendations',
            message: error.message,
        });
    }
});

/**
 * Description analysis endpoint - delegates to chat
 */
aiRouter.post('/analyze', validateRequest(AnalysisRequestSchema), async (req: Request, res: Response): Promise<void> => {
    try {
        const { description } = req.body;
        const aiService = await getAIService();
        const chatMessage = {
            id: `msg_${Date.now()}`,
            userId: 'anonymous',
            content: `Analyze this accommodation description and provide insights: ${description}`,
            role: 'USER' as const,
            timestamp: new Date(),
        };
        const analysis = await aiService.processChat(chatMessage);
        res.status(200).json(analysis);
    } catch (error: any) {
        console.error('[AI-ROUTES] Analysis error:', error);
        res.status(500).json({
            error: 'Failed to analyze description',
            message: error.message,
        });
    }
});

/**
 * General response endpoint - delegates to chat
 */
aiRouter.post('/respond', validateRequest(ResponseRequestSchema), async (req: Request, res: Response): Promise<void> => {
    try {
        const { prompt } = req.body;
        const aiService = await getAIService();
        const chatMessage = {
            id: `msg_${Date.now()}`,
            userId: 'anonymous',
            content: prompt,
            role: 'USER' as const,
            timestamp: new Date(),
        };
        const response = await aiService.processChat(chatMessage);
        res.status(200).json({ response: response.content });
    } catch (error: any) {
        console.error('[AI-ROUTES] Response error:', error);
        res.status(500).json({
            error: 'Failed to generate response',
            message: error.message,
        });
    }
});

export default aiRouter;
