import { RoomMetadata, RoomRecommendation } from './types';

/**
 * PropertyRepository Interface
 * Defines the contract for property/room data access
 */
export interface IPropertyRepository {
    /**
     * Get a room by ID with full metadata
     */
    getRoomById(roomId: string): Promise<RoomMetadata | null>;

    /**
     * Get multiple rooms with filters
     */
    getRooms(filters?: {
        type?: string;
        priceRange?: { min: number; max: number };
        amenities?: string[];
        limit?: number;
    }): Promise<RoomMetadata[]>;

    /**
     * Get room occupancy rate
     */
    getOccupancyRate(roomId: string): Promise<number>;

    /**
     * Get nearby room prices for market analysis
     */
    getNearbyPrices(roomId: string, radiusKm: number): Promise<RoomMetadata[]>;

    /**
     * Get historical price data for trend analysis
     */
    getPriceHistory(roomId: string, days: number): Promise<Array<{
        date: Date;
        price: number;
        occupancy: number;
    }>>;

    /**
     * Update room price (with validation)
     */
    updateRoomPrice(roomId: string, newPrice: number): Promise<void>;

    /**
     * Get bookings for a room
     */
    getBookings(roomId: string, fromDate: Date, toDate: Date): Promise<Array<{
        id: string;
        userId: string;
        checkIn: Date;
        checkOut: Date;
        status: 'CONFIRMED' | 'CANCELLED' | 'PENDING';
    }>>;
}

/**
 * AIMemoryRepository Interface
 * Manages chat histories and RAG context
 */
export interface IAIMemoryRepository {
    /**
     * Store chat message with context
     */
    storeChatMessage(userId: string, message: {
        content: string;
        role: 'USER' | 'ASSISTANT';
        context?: {
            roomId?: string;
            bookingId?: string;
        };
    }): Promise<string>;

    /**
     * Retrieve conversation history
     */
    getConversationHistory(
        userId: string,
        limit?: number,
        offset?: number
    ): Promise<Array<{
        id: string;
        content: string;
        role: 'USER' | 'ASSISTANT';
        timestamp: Date;
    }>>;

    /**
     * Clear conversation history (for privacy)
     */
    clearConversationHistory(userId: string): Promise<void>;

    /**
     * Store embeddings for RAG
     */
    storeEmbedding(content: string, embedding: number[], metadata?: Record<string, unknown>): Promise<string>;

    /**
     * Retrieve similar embeddings (vector search)
     */
    similaritySearch(
        queryEmbedding: number[],
        limit?: number,
        threshold?: number
    ): Promise<Array<{
        id: string;
        content: string;
        similarity: number;
    }>>;
}

/**
 * HuggingFaceLLMRepository Interface
 * Manages interactions with Hugging Face API
 */
export interface IHuggingFaceLLMRepository {
    /**
     * Generate text completion (chat)
     */
    generateCompletion(
        messages: Array<{ role: 'USER' | 'ASSISTANT'; content: string }>,
        options?: {
            maxTokens?: number;
            temperature?: number;
            topP?: number;
        }
    ): Promise<string>;

    /**
     * Generate embeddings for a text
     */
    generateEmbeddings(text: string): Promise<number[]>;

    /**
     * Rate limit check
     */
    checkRateLimit(): Promise<{
        available: boolean;
        tokensRemaining: number;
        resetTime: Date;
    }>;

    /**
     * Track token usage
     */
    getTokenUsage(): Promise<{
        used: number;
        limit: number;
        resetDate: Date;
    }>;
}

/**
 * NotificationRepository Interface
 * Manages AI-generated notifications
 */
export interface INotificationRepository {
    /**
     * Send notification to user
     */
    sendNotification(userId: string, notification: {
        type: 'PRICE_SUGGESTION' | 'BOOKING_RECOMMENDATION' | 'CHAT_RESPONSE';
        title: string;
        message: string;
        actionUrl?: string;
    }): Promise<string>;

    /**
     * Get notifications for user
     */
    getNotifications(userId: string, limit?: number): Promise<Array<{
        id: string;
        type: string;
        title: string;
        message: string;
        read: boolean;
        timestamp: Date;
    }>>;

    /**
     * Mark notification as read
     */
    markAsRead(notificationId: string): Promise<void>;
}
