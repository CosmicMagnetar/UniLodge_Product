/**
 * UniLodge AI Engine — Public API
 * 
 * Design Patterns:
 * - Façade: Provides a simplified interface to the complex domain AI service
 * - Adapter: Wraps OpenRouter API behind a standardized interface
 * - Factory: createAIService() builds the service with proper configuration
 * 
 * This module is the public API consumed by @unilodge/backend.
 * It delegates to the domain layer's AIService for complex operations
 * and provides a simpler interface for direct use.
 */

import axios from 'axios';

// ========================================
// Types (re-exported from domain layer)
// ========================================

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface PriceSuggestion {
  suggested: number;
  min: number;
  max: number;
  confidence: number;
  reasoning: string;
}

export interface RoomRecommendation {
  id: string;
  name: string;
  matchScore: number;
  reason: string;
  price: number;
}

// ========================================
// OpenRouter API Client (Adapter Pattern)
// ========================================

/**
 * Adapter: Wraps the OpenRouter REST API behind a clean internal interface.
 * Principle: DIP — AIService depends on this abstraction, not on axios directly.
 */
class OpenRouterClient {
  private readonly apiKey: string;
  private readonly endpoint: string;
  private readonly model: string;

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || '';
    this.endpoint = process.env.OPENROUTER_ENDPOINT || 'https://openrouter.ai/api/v1';
    this.model = process.env.OPENROUTER_MODEL || 'openai/gpt-3.5-turbo';

    if (!this.apiKey) {
      console.warn(
        '[AI-ENGINE] Warning: OPENROUTER_API_KEY not configured. AI features will be limited.'
      );
    }
  }

  get isConfigured(): boolean {
    return !!this.apiKey;
  }

  async chat(messages: Array<{ role: string; content: string }>): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    try {
      const response = await axios.post(
        `${this.endpoint}/chat/completions`,
        {
          model: this.model,
          messages,
          temperature: parseFloat(process.env.OPENROUTER_TEMPERATURE || '0.7'),
          max_tokens: 1000,
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
    } catch (error: any) {
      console.error('[AI-ENGINE] OpenRouter API error:', error.message);
      throw error;
    }
  }
}

// ========================================
// AI Service (Façade Pattern)
// ========================================

/**
 * AIService — Façade over the OpenRouter client.
 * 
 * Provides domain-specific methods (chat, price suggestion, recommendations)
 * while hiding the complexity of prompt engineering and API communication.
 * 
 * SRP: This class is responsible ONLY for orchestrating AI operations.
 * The OpenRouterClient handles HTTP communication separately.
 */
export class AIService {
  private readonly client: OpenRouterClient;
  private readonly enabled: boolean;

  constructor(client: OpenRouterClient) {
    this.client = client;
    this.enabled = process.env.AI_CHATBOT_ENABLED === 'true';
  }

  /** Process chat message using OpenRouter LLM */
  async processChat(userMessage: string, context: string = ''): Promise<ChatMessage> {
    if (!this.enabled) {
      throw new Error('AI chatbot is disabled');
    }

    const systemPrompt = `You are a helpful assistant for UniLodge, an accommodation booking platform. 
Help users find accommodations, answer questions about bookings, and provide recommendations.
Be conversational, friendly, and helpful.
${context ? `Context: ${context}` : ''}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ];

    try {
      const responseContent = await this.client.chat(messages);
      return {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
      };
    } catch (error) {
      throw new Error('Failed to process chat message');
    }
  }

  /** Generate price suggestion using AI */
  async suggestPrice(roomData: any): Promise<PriceSuggestion> {
    const prompt = `Based on the following room details, suggest a nightly price range:
Name: ${roomData.name}
Location: ${roomData.location}
Amenities: ${roomData.amenities?.join(', ') || 'Basic'}
Size: ${roomData.size || 'Not specified'} sqft
Type: ${roomData.type || 'Standard room'}

Provide a JSON response with: suggested (number), min (number), max (number), confidence (0-1), reasoning (string)`;

    try {
      const response = await this.client.chat([
        { role: 'user', content: prompt },
      ]);

      const parsed = JSON.parse(response);
      return {
        suggested: parsed.suggested || 500,
        min: parsed.min || 400,
        max: parsed.max || 800,
        confidence: parsed.confidence || 0.8,
        reasoning: parsed.reasoning || 'AI pricing analysis',
      };
    } catch (error) {
      // Fallback — Graceful degradation (Strategy Pattern)
      return {
        suggested: 500,
        min: 400,
        max: 800,
        confidence: 0.5,
        reasoning: 'Default pricing (AI analysis unavailable)',
      };
    }
  }

  /** Generate room recommendations */
  async recommendRooms(
    userPreferences: any,
    availableRooms: any[]
  ): Promise<RoomRecommendation[]> {
    if (!availableRooms || availableRooms.length === 0) {
      return [];
    }

    const prompt = `Given user preferences and available rooms, rank the top recommendations:
User Preferences:
- Budget: ${userPreferences.budget || 'Any'}
- Location: ${userPreferences.location || 'Any'}
- Amenities: ${userPreferences.amenities?.join(', ') || 'Any'}
- Type: ${userPreferences.type || 'Any'}

Available Rooms:
${availableRooms.map((r) => `- ${r.name} (${r.price}/night) at ${r.location}`).join('\n')}

Return JSON array with: id, name, matchScore (0-1), reason`;

    try {
      const response = await this.client.chat([
        { role: 'user', content: prompt },
      ]);

      const parsed = JSON.parse(response);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      // Fallback — score-based recommendations
      return availableRooms
        .map((room) => ({
          id: room.id,
          name: room.name,
          matchScore: Math.random() * 0.3 + 0.7,
          reason: 'Available accommodation',
          price: room.price,
        }))
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 5);
    }
  }

  /** Analyze apartment description using AI */
  async analyzeDescription(description: string): Promise<{
    sentiment: string;
    highlights: string[];
    summary: string;
  }> {
    const prompt = `Analyze this room description and provide:
1. Overall sentiment (positive/neutral/negative)
2. Top 3 highlights
3. One-sentence summary

Description: "${description}"

Return JSON with: sentiment, highlights (array), summary`;

    try {
      const response = await this.client.chat([
        { role: 'user', content: prompt },
      ]);

      const parsed = JSON.parse(response);
      return {
        sentiment: parsed.sentiment || 'neutral',
        highlights: parsed.highlights || [],
        summary: parsed.summary || 'Room description analyzed',
      };
    } catch (error) {
      return {
        sentiment: 'neutral',
        highlights: ['Accommodations', 'Amenities'],
        summary: 'Room description available',
      };
    }
  }

  /** Generate conversational response */
  async generateResponse(prompt: string): Promise<string> {
    try {
      return await this.client.chat([{ role: 'user', content: prompt }]);
    } catch (error) {
      return 'I apologize, but I am currently unable to process your request. Please try again later.';
    }
  }

  /** Check if AI service is healthy */
  async healthCheck(): Promise<{ healthy: boolean; message: string }> {
    if (!this.enabled) {
      return { healthy: false, message: 'AI chatbot is disabled' };
    }

    if (!this.client.isConfigured) {
      return { healthy: false, message: 'OpenRouter API key not configured' };
    }

    return { healthy: true, message: 'AI service is ready' };
  }
}

// ========================================
// Factory Function (Factory Pattern)
// ========================================

/**
 * Factory: Creates AIService with its OpenRouterClient dependency.
 * This is the public API consumed by @unilodge/backend routes.
 */
export const createAIService = (): AIService => {
  const client = new OpenRouterClient();
  return new AIService(client);
};

// Module-level singleton (implicit Singleton via module cache)
const aiService = createAIService();

// Log initialization status
aiService.healthCheck()
  .then((status) => {
    console.log(
      `[AI-ENGINE] Service Status: ${status.healthy ? '✓ Ready' : '✗ Disabled'}`
    );
    console.log(
      `[AI-ENGINE] Model: ${process.env.OPENROUTER_MODEL || 'openai/gpt-3.5-turbo'}`
    );
  })
  .catch((err) => {
    console.error('[AI-ENGINE] Initialization error:', err.message);
  });

export default aiService;
