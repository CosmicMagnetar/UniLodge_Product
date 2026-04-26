import express, { Router, Request, Response } from 'express';
import { createAIService } from '@unilodge/ai-engine';

const aiRouter: Router = express.Router();
const aiService = createAIService();

// Interface for request body
interface ChatRequest {
    message: string;
    context?: string;
}

interface PriceRequest {
    name: string;
    location: string;
    amenities?: string[];
    size?: number;
    type?: string;
}

interface RecommendationRequest {
    preferences: any;
    rooms: any[];
}

interface AnalysisRequest {
    description: string;
}

/**
 * Health check endpoint
 */
aiRouter.get('/health', async (_req: Request, res: Response) => {
    try {
        const health = await aiService.healthCheck();
        res.status(health.healthy ? 200 : 503).json(health);
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
aiRouter.post('/chat', async (req: Request, res: Response) => {
    try {
        const { message, context } = req.body as ChatRequest;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const response = await aiService.processChat(message, context);
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
aiRouter.post('/price-suggestion', async (req: Request, res: Response) => {
    try {
        const roomData = req.body as PriceRequest;

        if (!roomData.name || !roomData.location) {
            return res.status(400).json({ error: 'Name and location are required' });
        }

        const suggestion = await aiService.suggestPrice(roomData);
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
aiRouter.post('/recommendations', async (req: Request, res: Response) => {
    try {
        const { preferences, rooms } = req.body as RecommendationRequest;

        if (!preferences || !rooms) {
            return res
                .status(400)
                .json({ error: 'Preferences and rooms are required' });
        }

        const recommendations = await aiService.recommendRooms(preferences, rooms);
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
 * Description analysis endpoint
 */
aiRouter.post('/analyze', async (req: Request, res: Response) => {
    try {
        const { description } = req.body as AnalysisRequest;

        if (!description) {
            return res.status(400).json({ error: 'Description is required' });
        }

        const analysis = await aiService.analyzeDescription(description);
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
 * General response endpoint
 */
aiRouter.post('/respond', async (req: Request, res: Response) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        const response = await aiService.generateResponse(prompt);
        res.status(200).json({ response });
    } catch (error: any) {
        console.error('[AI-ROUTES] Response error:', error);
        res.status(500).json({
            error: 'Failed to generate response',
            message: error.message,
        });
    }
});

export default aiRouter;
