import {
    PriceSuggestion,
    PriceSuggestionSchema,
    ChatMessage,
    ChatMessageSchema,
    RoomMetadata,
    AIConfig,
    createPricePrediction,
    createConfidenceScore,
    createChatMessageId,
    RoomRecommendation,
} from '../types.js';
import {
    IPropertyRepository,
    IAIMemoryRepository,
    IHuggingFaceLLMRepository,
    INotificationRepository,
} from '../repositories.js';

/**
 * AIService - Production-ready AI Engine for UniLodge
 *
 * Implements:
 * - Price suggestions using AI analysis
 * - Chat-based customer support
 * - Room recommendations
 * - RAG (Retrieval-Augmented Generation) with context
 *
 * Uses Repository Pattern for clean dependency injection
 * and async/await for non-blocking operations.
 */
export class AIService {
    private config: AIConfig;
    private propertyRepo: IPropertyRepository;
    private llmRepo: IHuggingFaceLLMRepository;
    private memoryRepo: IAIMemoryRepository;
    // @ts-expect-error notification repo stored for future use
    private _notificationRepo: INotificationRepository;

    constructor(
        config: AIConfig,
        propertyRepo: IPropertyRepository,
        llmRepo: IHuggingFaceLLMRepository,
        memoryRepo: IAIMemoryRepository,
        notificationRepo: INotificationRepository,
    ) {
        this.config = config;
        this.propertyRepo = propertyRepo;
        this.llmRepo = llmRepo;
        this.memoryRepo = memoryRepo;
        this._notificationRepo = notificationRepo;
    }

    /**
     * Generate price suggestion for a room
     * Analyzes market conditions, occupancy, and amenities
     */
    async suggestPrice(roomId: string): Promise<PriceSuggestion> {
        try {
            // 1. Fetch room metadata
            const room = await this.propertyRepo.getRoomById(roomId);
            if (!room) throw new Error(`Room ${roomId} not found`);

            // 2. Get market context (nearby prices, occupancy)
            const [nearbyRooms, priceHistory, occupancy] = await Promise.all([
                this.propertyRepo.getNearbyPrices(roomId, 5),
                this.propertyRepo.getPriceHistory(roomId, 30),
                this.propertyRepo.getOccupancyRate(roomId),
            ]);

            // 3. Prepare prompt with context
            const prompt = this.buildPriceSuggestionPrompt({
                room,
                nearbyRooms,
                priceHistory,
                occupancy,
            });

            // 4. Call LLM for analysis
            const aiResponse = await this.llmRepo.generateCompletion(
                [{ role: 'USER', content: prompt }],
                {
                    maxTokens: this.config.maxTokens,
                    temperature: 0.5, // Lower temperature for deterministic pricing
                }
            );

            // 5. Parse and validate response
            const suggestion = this.parsePriceSuggestion(aiResponse, room.basePrice);

            // 6. Validate with Zod
            const validated = PriceSuggestionSchema.parse(suggestion);

            // 7. Store in memory for future reference
            await this.memoryRepo.storeEmbedding(
                `Price suggestion for room ${roomId}: ${validated.suggestedPrice}`,
                await this.llmRepo.generateEmbeddings(validated.reasoning)
            );

            return validated;
        } catch (error) {
            throw new Error(`Failed to suggest price: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Process chat message with RAG context
     * Retrieves relevant information and generates response
     */
    async processChat(message: ChatMessage): Promise<ChatMessage> {
        try {
            // 1. Validate input
            const validatedInput = ChatMessageSchema.parse(message);

            // 2. Get conversation history
            const history = await this.memoryRepo.getConversationHistory(
                validatedInput.userId,
                10 // Last 10 messages for context
            );

            // 3. Retrieve RAG context if room or booking is mentioned
            let ragContext = '';
            if (validatedInput.context?.roomId) {
                const room = await this.propertyRepo.getRoomById(validatedInput.context.roomId);
                if (room) {
                    ragContext = this.formatRoomContext(room);
                }
            }

            // 4. Generate embeddings for similarity search
            const messageEmbedding = await this.llmRepo.generateEmbeddings(validatedInput.content);
            const similarContent = await this.memoryRepo.similaritySearch(messageEmbedding, 5, 0.7);

            // 5. Format messages for LLM
            const messages = [
                {
                    role: 'ASSISTANT' as const,
                    content: this.buildSystemPrompt(),
                },
                ...history.map(h => ({
                    role: h.role,
                    content: h.content,
                })),
                {
                    role: 'USER' as const,
                    content: validatedInput.content,
                },
            ];

            // 6. Add RAG context to prompt if available
            if (ragContext || similarContent.length > 0) {
                messages.push({
                    role: 'ASSISTANT' as const,
                    content: `Context: ${ragContext}\nRelated information: ${similarContent.map(s => s.content).join('; ')}`,
                });
            }

            // 7. Generate response
            const responseText = await this.llmRepo.generateCompletion(messages, {
                maxTokens: 800,
                temperature: 0.7, // Higher temperature for natural conversation
            });

            // 8. Create response message
            const responseMessage: ChatMessage = {
                id: createChatMessageId(`msg_${Date.now()}_${Math.random().toString(36)}`),
                userId: validatedInput.userId,
                content: responseText,
                role: 'ASSISTANT',
                timestamp: new Date(),
            };

            // 9. Validate response
            const validatedResponse = ChatMessageSchema.parse(responseMessage);

            // 10. Store both messages in memory
            await Promise.all([
                this.memoryRepo.storeChatMessage(validatedInput.userId, {
                    content: validatedInput.content,
                    role: 'USER',
                    context: validatedInput.context,
                }),
                this.memoryRepo.storeChatMessage(validatedInput.userId, {
                    content: validatedResponse.content,
                    role: 'ASSISTANT',
                    context: validatedInput.context,
                }),
            ]);

            return validatedResponse;
        } catch (error) {
            throw new Error(`Failed to process chat: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Recommend rooms based on user preferences
     */
    async recommendRooms(
        _userId: string,
        preferences: {
            budget: number;
            amenities: string[];
            roomType?: string;
        }
    ): Promise<RoomRecommendation[]> {
        try {
            // 1. Get similar user preferences from memory
            const preferenceEmbedding = await this.llmRepo.generateEmbeddings(
                JSON.stringify(preferences)
            );
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const similarPreferences = await this.memoryRepo.similaritySearch(
                preferenceEmbedding,
                3,
                0.75
            );
            void similarPreferences;

            // 2. Get matching rooms
            const rooms = await this.propertyRepo.getRooms({
                priceRange: {
                    min: preferences.budget * 0.8,
                    max: preferences.budget * 1.2,
                },
                amenities: preferences.amenities,
                type: preferences.roomType,
                limit: 20,
            });

            // 3. Score rooms using AI analysis
            const recommendations = await Promise.all(
                rooms.map(async (room) => {
                    const score = await this.scoreRoom(room, preferences);
                    return {
                        roomId: room.id,
                        score: createConfidenceScore(score),
                        reason: `Matches ${preferences.amenities.length} of your preferred amenities`,
                        estimatedPrice: createPricePrediction(room.basePrice),
                        matchingAmenities: room.amenities.filter(a => preferences.amenities.includes(a)),
                    };
                })
            );

            // 4. Sort by score and return top 5
            return recommendations
                .sort((a, b) => b.score - a.score)
                .slice(0, 5);
        } catch (error) {
            throw new Error(
                `Failed to recommend rooms: ${error instanceof Error ? error.message : String(error)}`
            );
        }
    }

    /**
     * Clear user conversation history (GDPR compliance)
     */
    async deleteUserData(userId: string): Promise<void> {
        try {
            await this.memoryRepo.clearConversationHistory(userId);
        } catch (error) {
            throw new Error(
                `Failed to delete user data: ${error instanceof Error ? error.message : String(error)}`
            );
        }
    }

    /**
     * Check API rate limits and health
     */
    async getServiceStatus(): Promise<{
        available: boolean;
        tokensRemaining: number;
        rateLimitResetTime: Date;
    }> {
        try {
            const rateLimit = await this.llmRepo.checkRateLimit();
            return {
                available: rateLimit.available,
                tokensRemaining: rateLimit.tokensRemaining,
                rateLimitResetTime: rateLimit.resetTime,
            };
        } catch (error) {
            throw new Error(
                `Failed to get service status: ${error instanceof Error ? error.message : String(error)}`
            );
        }
    }

    // ============ Private Helper Methods ============

    private buildSystemPrompt(): string {
        return `You are UniLodge AI, a helpful assistant for campus accommodation booking.
You have access to real-time room data, pricing information, and booking management.
Always be helpful, honest, and provide accurate information about available rooms.
When users ask about prices, availability, or amenities, provide specific details.
For booking-related questions, guide users to the booking system.
Keep responses concise and friendly.`;
    }

    private buildPriceSuggestionPrompt(context: {
        room: RoomMetadata;
        nearbyRooms: RoomMetadata[];
        priceHistory: Array<{ date: Date; price: number; occupancy: number }>;
        occupancy: number;
    }): string {
        const avgNearbyPrice =
            context.nearbyRooms.reduce((sum, r) => sum + r.basePrice, 0) / (context.nearbyRooms.length || 1);
        const priceChange = context.priceHistory.length >= 2
            ? ((context.priceHistory[context.priceHistory.length - 1].price - context.priceHistory[0].price)
                / context.priceHistory[0].price * 100).toFixed(2)
            : '0';

        return `Analyze and suggest an optimal nightly price for a ${context.room.type} room.

Current data:
- Room ID: ${context.room.id}
- Base Price: $${context.room.basePrice}
- Amenities: ${context.room.amenities.join(', ')}
- Current Occupancy: ${(context.occupancy * 100).toFixed(1)}%
- Nearby Average Price: $${avgNearbyPrice.toFixed(2)}
- 30-day Price Change: ${priceChange}%
- Market Demand: ${context.room.nearbyDemand}

Provide your analysis in this JSON format:
{
  "suggestedPrice": <number>,
  "confidence": <0-1>,
  "reasoning": "<200 chars>",
  "factors": [
    { "name": "Occupancy", "impact": "POSITIVE|NEGATIVE|NEUTRAL", "description": "..." },
    ...
  ],
  "recommendedStrategy": "INCREASE|MAINTAIN|DECREASE|DYNAMIC",
  "priceRange": { "min": <number>, "max": <number> }
}`;
    }

    private parsePriceSuggestion(aiResponse: string, basePrice: number): PriceSuggestion {
        try {
            // Extract JSON from response
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error('No JSON found in response');

            const parsed = JSON.parse(jsonMatch[0]);
            return {
                suggestedPrice: parsed.suggestedPrice || basePrice,
                confidence: parsed.confidence || 0.5,
                reasoning: parsed.reasoning || 'AI analysis complete',
                factors: parsed.factors || [],
                recommendedStrategy: parsed.recommendedStrategy || 'MAINTAIN',
                priceRange: parsed.priceRange || { min: basePrice * 0.8, max: basePrice * 1.2 },
            };
        } catch {
            // Fallback if parsing fails
            return {
                suggestedPrice: basePrice,
                confidence: 0.3,
                reasoning: 'Unable to analyze. Please try again.',
                factors: [],
                recommendedStrategy: 'MAINTAIN',
                priceRange: { min: basePrice * 0.8, max: basePrice * 1.2 },
            };
        }
    }

    private formatRoomContext(room: RoomMetadata): string {
        return `Room: ${room.type} | Type: ${room.type} | Price: $${room.basePrice} | Amenities: ${room.amenities.join(', ')}`;
    }

    private async scoreRoom(
        room: RoomMetadata,
        preferences: { budget: number; amenities: string[] }
    ): Promise<number> {
        let score = 0;

        // Price match (0-40 points)
        const priceRatio = room.basePrice / preferences.budget;
        if (priceRatio <= 1.2) score += 40;
        else if (priceRatio <= 1.5) score += 30;
        else score += 10;

        // Amenity match (0-40 points)
        const matchingAmenities = room.amenities.filter(a => preferences.amenities.includes(a));
        score += (matchingAmenities.length / preferences.amenities.length) * 40;

        // Occupancy (0-20 points)
        score += Math.min(20, (1 - room.occupancyRate) * 20);

        return Math.min(1, score / 100);
    }
}

/**
 * Factory function to create AIService with dependencies
 */
export async function createAIService(
    config: AIConfig,
    propertyRepo: IPropertyRepository,
    llmRepo: IHuggingFaceLLMRepository,
    memoryRepo: IAIMemoryRepository,
    notificationRepo: INotificationRepository,
): Promise<AIService> {
    return new AIService(
        config,
        propertyRepo,
        llmRepo,
        memoryRepo,
        notificationRepo,
    );
}
