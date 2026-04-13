import { z } from 'zod';

// ============ Type Branding for Type Safety ============

/** Price prediction branded type - ensures type-safe price values */
export type PricePrediction = number & { readonly __brand: 'PricePrediction' };

/** Confidence score (0-1) - ensures valid confidence ranges */
export type ConfidenceScore = number & { readonly __brand: 'ConfidenceScore' };

/** Chat message ID - ensures unique message identification */
export type ChatMessageId = string & { readonly __brand: 'ChatMessageId' };

// ============ Type Guards and Constructors ============

export const createPricePrediction = (price: number): PricePrediction => {
    if (price < 0) throw new Error('Price cannot be negative');
    if (!isFinite(price)) throw new Error('Price must be a finite number');
    return price as PricePrediction;
};

export const createConfidenceScore = (score: number): ConfidenceScore => {
    if (score < 0 || score > 1) throw new Error('Confidence score must be between 0 and 1');
    return score as ConfidenceScore;
};

export const createChatMessageId = (id: string): ChatMessageId => {
    if (!id || typeof id !== 'string') throw new Error('Invalid message ID');
    return id as ChatMessageId;
};

// ============ Zod Validation Schemas ============

/** Room metadata for price suggestions */
export const RoomMetadataSchema = z.object({
    id: z.string().uuid(),
    type: z.enum(['SINGLE', 'DOUBLE', 'SUITE']),
    amenities: z.array(z.string()).min(1),
    basePrice: z.number().positive(),
    occupancyRate: z.number().min(0).max(1),
    nearbyDemand: z.enum(['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH']),
    lastUpdated: z.date(),
});

export type RoomMetadata = z.infer<typeof RoomMetadataSchema>;

/** Price suggestion response from AI */
export const PriceSuggestionSchema = z.object({
    suggestedPrice: z.number().positive(),
    confidence: z.number().min(0).max(1),
    reasoning: z.string(),
    factors: z.array(z.object({
        name: z.string(),
        impact: z.enum(['POSITIVE', 'NEGATIVE', 'NEUTRAL']),
        description: z.string(),
    })),
    recommendedStrategy: z.enum(['INCREASE', 'MAINTAIN', 'DECREASE', 'DYNAMIC']),
    priceRange: z.object({
        min: z.number().positive(),
        max: z.number().positive(),
    }),
});

export type PriceSuggestion = z.infer<typeof PriceSuggestionSchema>;

/** Chat message request/response */
export const ChatMessageSchema = z.object({
    id: z.string().optional(),
    userId: z.string().uuid(),
    content: z.string().min(1).max(5000),
    role: z.enum(['USER', 'ASSISTANT']),
    timestamp: z.date().optional(),
    context: z.object({
        roomId: z.string().uuid().optional(),
        bookingId: z.string().uuid().optional(),
        conversation: z.array(z.object({
            role: z.enum(['USER', 'ASSISTANT']),
            content: z.string(),
        })).optional(),
    }).optional(),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;

/** Room recommendation */
export const RoomRecommendationSchema = z.object({
    roomId: z.string().uuid(),
    score: z.number().min(0).max(1),
    reason: z.string(),
    estimatedPrice: z.number().positive(),
    matchingAmenities: z.array(z.string()),
});

export type RoomRecommendation = z.infer<typeof RoomRecommendationSchema>;

/** AI Service configuration */
export const AIConfigSchema = z.object({
    apiKey: z.string().min(1),
    model: z.enum(['zephyr-7b-beta', 'mistral-7b', 'gpt2']),
    embeddingModel: z.enum(['all-MiniLM-L6-v2', 'all-mpnet-base-v2']),
    maxTokens: z.number().positive().default(500),
    temperature: z.number().min(0).max(2).default(0.7),
    topP: z.number().min(0).max(1).default(0.95),
    rateLimit: z.object({
        requestsPerMinute: z.number().positive().default(60),
        tokensPerDay: z.number().positive().default(100000),
    }).optional(),
});

export type AIConfig = z.infer<typeof AIConfigSchema>;

/** API Response wrapper */
export const APIResponseSchema = z.object({
    success: z.boolean(),
    data: z.unknown().optional(),
    error: z.object({
        message: z.string(),
        code: z.string(),
    }).optional(),
    metadata: z.object({
        timestamp: z.date(),
        processingTime: z.number(),
    }).optional(),
});

export type APIResponse<T = unknown> = z.infer<typeof APIResponseSchema> & { data?: T };
