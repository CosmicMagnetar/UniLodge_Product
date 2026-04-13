/**
 * UniLodge AI Engine - Production Implementation
 * Handles AI-powered features: price suggestions, chat, recommendations
 * 
 * Exports from the core AI domain in the monorepo
 */

export {
  AIService,
  createAIService,
  type PricePrediction,
  type ConfidenceScore,
  type ChatMessageId,
} from '../../../src/domains/ai/types';

export type {
  PriceSuggestion,
  ChatMessage,
  RoomRecommendation,
  AIConfig,
} from '../../../src/domains/ai/types';

console.log('[AI-ENGINE] Production service initialized');
console.log('[AI-ENGINE] Available: Price suggestions, Chat, Recommendations, Room analysis');
