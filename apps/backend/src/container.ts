/**
 * Dependency Injection Container
 * 
 * Design Pattern: Service Locator / Composition Root
 * Principle: Dependency Inversion (DIP) — high-level modules depend on abstractions
 * 
 * This container wires all repository implementations to domain services,
 * acting as the single composition root for the application.
 */

import {
  IPropertyRepository,
  IAIMemoryRepository,
  IHuggingFaceLLMRepository,
  INotificationRepository,
} from './domains/ai/repositories';
import { AIService, createAIService } from './domains/ai/services/ai.service';

// ============================================================
// Concrete Repository Implementations
// ============================================================

/**
 * OpenRouter LLM Repository
 * Adapter Pattern: Wraps OpenRouter API behind the IHuggingFaceLLMRepository interface
 */
class OpenRouterLLMRepository implements IHuggingFaceLLMRepository {
  private apiKey: string;
  private endpoint: string;
  private model: string;

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || '';
    this.endpoint = process.env.OPENROUTER_ENDPOINT || 'https://openrouter.ai/api/v1';
    this.model = process.env.OPENROUTER_MODEL || 'inclusionai/ling-2.6-1t:free';
  }

  async generateCompletion(
    messages: Array<{ role: 'USER' | 'ASSISTANT'; content: string }>,
    options?: { maxTokens?: number; temperature?: number; topP?: number }
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    const axios = (await import('axios')).default;
    const response = await axios.post(
      `${this.endpoint}/chat/completions`,
      {
        model: this.model,
        messages: messages.map(m => ({
          role: m.role.toLowerCase(),
          content: m.content,
        })),
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 1000,
        top_p: options?.topP ?? 0.95,
      },
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    return response.data.choices[0].message.content;
  }

  async generateEmbeddings(_text: string): Promise<number[]> {
    // Stub: return zero vector — would integrate with an embedding model
    return new Array(384).fill(0);
  }

  async checkRateLimit(): Promise<{
    available: boolean;
    tokensRemaining: number;
    resetTime: Date;
  }> {
    return {
      available: !!this.apiKey,
      tokensRemaining: 100000,
      resetTime: new Date(Date.now() + 86400000),
    };
  }

  async getTokenUsage(): Promise<{
    used: number;
    limit: number;
    resetDate: Date;
  }> {
    return {
      used: 0,
      limit: 100000,
      resetDate: new Date(Date.now() + 86400000),
    };
  }
}

/**
 * In-Memory AI Memory Repository
 * Stores chat histories and embeddings in memory (swap for Redis/DB in production)
 */
class InMemoryAIMemoryRepository implements IAIMemoryRepository {
  private conversations: Map<string, Array<{
    id: string;
    content: string;
    role: 'USER' | 'ASSISTANT';
    timestamp: Date;
  }>> = new Map();

  private embeddings: Array<{
    id: string;
    content: string;
    embedding: number[];
    metadata?: Record<string, unknown>;
  }> = [];

  async storeChatMessage(userId: string, message: {
    content: string;
    role: 'USER' | 'ASSISTANT';
    context?: { roomId?: string; bookingId?: string };
  }): Promise<string> {
    const id = `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const history = this.conversations.get(userId) || [];
    history.push({
      id,
      content: message.content,
      role: message.role,
      timestamp: new Date(),
    });
    this.conversations.set(userId, history);
    return id;
  }

  async getConversationHistory(
    userId: string,
    limit: number = 10,
    _offset: number = 0
  ): Promise<Array<{
    id: string;
    content: string;
    role: 'USER' | 'ASSISTANT';
    timestamp: Date;
  }>> {
    const history = this.conversations.get(userId) || [];
    return history.slice(-limit);
  }

  async clearConversationHistory(userId: string): Promise<void> {
    this.conversations.delete(userId);
  }

  async storeEmbedding(
    content: string,
    embedding: number[],
    metadata?: Record<string, unknown>
  ): Promise<string> {
    const id = `emb_${Date.now()}`;
    this.embeddings.push({ id, content, embedding, metadata });
    return id;
  }

  async similaritySearch(
    _queryEmbedding: number[],
    limit: number = 5,
    _threshold: number = 0.7
  ): Promise<Array<{ id: string; content: string; similarity: number }>> {
    // Simplified: return most recent embeddings
    return this.embeddings
      .slice(-limit)
      .map(e => ({ id: e.id, content: e.content, similarity: 0.8 }));
  }
}

/**
 * In-Memory Property Repository
 * Stub implementation — would be replaced with MongoDB/PostgreSQL in production
 */
class InMemoryPropertyRepository implements IPropertyRepository {
  async getRoomById(_roomId: string) { return null; }
  async getRooms(_filters?: any) { return []; }
  async getOccupancyRate(_roomId: string) { return 0.75; }
  async getNearbyPrices(_roomId: string, _radiusKm: number) { return []; }
  async getPriceHistory(_roomId: string, _days: number) { return []; }
  async updateRoomPrice(_roomId: string, _newPrice: number) { }
  async getBookings(_roomId: string, _fromDate: Date, _toDate: Date) { return []; }
}

/**
 * In-Memory Notification Repository
 */
class InMemoryNotificationRepository implements INotificationRepository {
  private notifications: Map<string, Array<any>> = new Map();

  async sendNotification(userId: string, notification: any): Promise<string> {
    const id = `notif_${Date.now()}`;
    const userNotifs = this.notifications.get(userId) || [];
    userNotifs.push({ id, ...notification, read: false, timestamp: new Date() });
    this.notifications.set(userId, userNotifs);
    return id;
  }

  async getNotifications(userId: string, limit: number = 10) {
    const notifs = this.notifications.get(userId) || [];
    return notifs.slice(-limit);
  }

  async markAsRead(_notificationId: string) { }
}

// ============================================================
// Container — Singleton Instance
// ============================================================

/**
 * Application Container
 * 
 * Singleton Pattern: Single container instance manages all service lifecycles.
 * Factory Pattern: createContainer() builds and wires all dependencies.
 */
class Container {
  private static instance: Container | null = null;

  // Repositories (abstractions)
  public readonly propertyRepo: IPropertyRepository;
  public readonly llmRepo: IHuggingFaceLLMRepository;
  public readonly memoryRepo: IAIMemoryRepository;
  public readonly notificationRepo: INotificationRepository;

  // Services
  private _aiService: AIService | null = null;

  private constructor() {
    this.propertyRepo = new InMemoryPropertyRepository();
    this.llmRepo = new OpenRouterLLMRepository();
    this.memoryRepo = new InMemoryAIMemoryRepository();
    this.notificationRepo = new InMemoryNotificationRepository();
  }

  /** Singleton accessor */
  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  /** Get AI Service (lazy initialization) */
  async getAIService(): Promise<AIService> {
    if (!this._aiService) {
      this._aiService = await createAIService(
        {
          apiKey: process.env.OPENROUTER_API_KEY || '',
          model: 'zephyr-7b-beta' as const,
          embeddingModel: 'all-MiniLM-L6-v2' as const,
          maxTokens: 500,
          temperature: 0.7,
          topP: 0.95,
        },
        this.propertyRepo,
        this.llmRepo,
        this.memoryRepo,
        this.notificationRepo,
      );
    }
    return this._aiService;
  }

  /** Reset container (for testing) */
  static reset(): void {
    Container.instance = null;
  }
}

export { Container };
export default Container;
