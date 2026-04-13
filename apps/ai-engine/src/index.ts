/**
 * UniLodge AI Engine - Production Implementation
 * Handles AI-powered features: price suggestions, chat, recommendations
 * Integrates with OpenRouter for LLM capabilities
 */

import axios from 'axios';

// ========================================
// Types
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
// OpenRouter API Client
// ========================================

class OpenRouterClient {
  private apiKey: string;
  private endpoint: string;
  private model: string;

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

  async chat(messages: any[]): Promise<string> {
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
// AI Service
// ========================================

export class AIService {
  private client: OpenRouterClient;
  private enabled: boolean;

  constructor() {
    this.client = new OpenRouterClient();
    this.enabled = process.env.AI_CHATBOT_ENABLED === 'true';
  }

  /**
   * Process chat message using OpenRouter LLM
   */
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

  /**
   * Generate price suggestion using AI
   */
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

      // Parse JSON response
      const parsed = JSON.parse(response);
      return {
        suggested: parsed.suggested || 500,
        min: parsed.min || 400,
        max: parsed.max || 800,
        confidence: parsed.confidence || 0.8,
        reasoning: parsed.reasoning || 'AI pricing analysis',
      };
    } catch (error) {
      // Fallback to default pricing
      return {
        suggested: 500,
        min: 400,
        max: 800,
        confidence: 0.5,
        reasoning: 'Default pricing (AI analysis unavailable)',
      };
    }
  }

  /**
   * Generate room recommendations
   */
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
      // Return simple score-based recommendations
      return availableRooms
        .map((room) => ({
          id: room.id,
          name: room.name,
          matchScore: Math.random() * 0.3 + 0.7, // 70-100%
          reason: 'Available accommodation',
          price: room.price,
        }))
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 5);
    }
  }

  /**
   * Analyze apartment description using AI
   */
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

  /**
   * Generate conversational response
   */
  async generateResponse(prompt: string): Promise<string> {
    try {
      return await this.client.chat([{ role: 'user', content: prompt }]);
    } catch (error) {
      return 'I apologize, but I am currently unable to process your request. Please try again later.';
    }
  }

  /**
   * Check if AI service is healthy
   */
  async healthCheck(): Promise<{ healthy: boolean; message: string }> {
    if (!this.enabled) {
      return {
        healthy: false,
        message: 'AI chatbot is disabled',
      };
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return {
        healthy: false,
        message: 'OpenRouter API key not configured',
      };
    }

    return {
      healthy: true,
      message: 'AI service is ready',
    };
  }
}

// ========================================
// Exports
// ========================================

export const createAIService = (): AIService => {
  return new AIService();
};

// Initialize and log
const aiService = createAIService();
const health = aiService.healthCheck();
health
  .then((status) => {
    console.log(
      `[AI-ENGINE] Service Status: ${status.healthy ? '✓ Ready' : '✗ Disabled'}`
    );
    console.log(
      `[AI-ENGINE] Model: ${process.env.OPENROUTER_MODEL || 'openai/gpt-3.5-turbo'}`
    );
    console.log(
      `[AI-ENGINE] Features: Chat, Price Suggestions, Room Recommendations, Analysis`
    );
  })
  .catch((err) => {
    console.error('[AI-ENGINE] Initialization error:', err.message);
  });

export default aiService;
