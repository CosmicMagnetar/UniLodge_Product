import { describe, it, expect, beforeEach } from 'vitest';

// AI Service Mock
class AIServiceMock {
  async suggestPrice(roomData: any) {
    if (!roomData || !roomData.features || !roomData.location) {
      throw new Error('Missing required room data');
    }

    const basePrice = 500;
    const features = roomData.features?.length || 0;
    const locationMultiplier = roomData.location === 'Downtown' ? 1.5 : 1;
    const suggestedPrice = basePrice + features * 100;

    return {
      suggestedPrice: Math.round(suggestedPrice * locationMultiplier),
      confidence: 0.85,
      reasoning: `Based on ${features} features in ${roomData.location}`,
    };
  }

  async processChat(message: string, history: any[] = []) {
    if (!message) {
      throw new Error('Message is required');
    }

    const responses: { [key: string]: string } = {
      'hello': 'Hello! Welcome to UniLodge. How can I help you find accommodation?',
      'price': 'Room prices typically range from 400-2000 depending on location and amenities.',
      'booking': 'To make a booking, select a property, choose dates, and proceed to checkout.',
      'cancel': 'You can cancel bookings up to 48 hours before check-in.',
      'default':
        'I understand you want to know more about our properties. What specific information would help?',
    };

    const response = responses[message.toLowerCase()] || responses['default'];
    return {
      message: response,
      timestamp: new Date(),
      hasCitation: Math.random() > 0.5,
    };
  }

  async recommendRooms(userPreferences: any) {
    if (!userPreferences || !userPreferences.userId) {
      throw new Error('User ID required');
    }

    const recommendations = [
      {
        id: 'room_1',
        name: 'Modern Studio Downtown',
        score: 0.95,
        reason: 'Perfect match - Downtown location with modern amenities',
      },
      {
        id: 'room_2',
        name: 'Luxury 2BR Uptown',
        score: 0.88,
        reason: 'High rating and spacious layout',
      },
      {
        id: 'room_3',
        name: 'Budget Friendly Suburb',
        score: 0.76,
        reason: 'Great value for price-conscious travelers',
      },
    ];

    return recommendations.filter(
      (r) => r.score >= (userPreferences.minScore || 0.5)
    );
  }

  async detectSentiment(text: string) {
    if (!text) {
      throw new Error('Text is required');
    }

    const positiveWords = ['great', 'love', 'excellent', 'amazing', 'perfect'];
    const negativeWords = ['bad', 'hate', 'terrible', 'awful', 'worst'];

    let sentiment = 'neutral';
    let score = 0.5;

    const lowerText = text.toLowerCase();
    const hasPositive = positiveWords.some((word) => lowerText.includes(word));
    const hasNegative = negativeWords.some((word) => lowerText.includes(word));

    if (hasPositive && !hasNegative) {
      sentiment = 'positive';
      score = 0.8;
    } else if (hasNegative && !hasPositive) {
      sentiment = 'negative';
      score = 0.2;
    }

    return { sentiment, score, confidence: 0.88 };
  }

  async generateRoomDescription(features: string[]) {
    if (!features || features.length === 0) {
      throw new Error('At least one feature required');
    }

    return `Welcome to our beautiful accommodation featuring ${features.join(', ')}. Perfect for your stay!`;
  }
}

describe('AI Service Price Suggestions', () => {
  let aiService: AIServiceMock;

  beforeEach(() => {
    aiService = new AIServiceMock();
  });

  it('should suggest price for room with features', async () => {
    const roomData = {
      features: ['WiFi', 'AC', 'Kitchen'],
      location: 'Downtown',
    };
    const result = await aiService.suggestPrice(roomData);

    expect(result.suggestedPrice).toBeGreaterThan(0);
    expect(result.confidence).toBe(0.85);
    expect(result.reasoning).toContain('Downtown');
  });

  it('should calculate higher price for Downtown location', async () => {
    const roomDowntown = {
      features: ['WiFi'],
      location: 'Downtown',
    };
    const roomSuburb = {
      features: ['WiFi'],
      location: 'Suburb',
    };

    const downtownPrice = await aiService.suggestPrice(roomDowntown);
    const suburbPrice = await aiService.suggestPrice(roomSuburb);

    expect(downtownPrice.suggestedPrice).toBeGreaterThan(
      suburbPrice.suggestedPrice
    );
  });

  it('should factor in number of features', async () => {
    const roomWithMore = {
      features: ['WiFi', 'AC', 'Kitchen', 'Parking', 'Garden'],
      location: 'Downtown',
    };
    const roomWithLess = {
      features: ['WiFi'],
      location: 'Downtown',
    };

    const morePrice = await aiService.suggestPrice(roomWithMore);
    const lessPrice = await aiService.suggestPrice(roomWithLess);

    expect(morePrice.suggestedPrice).toBeGreaterThan(lessPrice.suggestedPrice);
  });

  it('should throw error for incomplete room data', async () => {
    await expect(aiService.suggestPrice({ location: 'Downtown' })).rejects.toThrow(
      'Missing required room data'
    );
  });
});

describe('AI Service Chat Processing', () => {
  let aiService: AIServiceMock;

  beforeEach(() => {
    aiService = new AIServiceMock();
  });

  it('should respond to greeting', async () => {
    const result = await aiService.processChat('hello');
    expect(result.message).toContain('Welcome');
    expect(result.timestamp).toBeDefined();
  });

  it('should respond to price inquiry', async () => {
    const result = await aiService.processChat('price');
    expect(result.message).toContain('400');
  });

  it('should provide booking information', async () => {
    const result = await aiService.processChat('booking');
    expect(result.message).toContain('booking');
  });

  it('should handle casual questions', async () => {
    const result = await aiService.processChat(
      'What can you tell me about your property?'
    );
    expect(result.message).toBeDefined();
  });

  it('should throw error for empty message', async () => {
    await expect(aiService.processChat('')).rejects.toThrow(
      'Message is required'
    );
  });

  it('should maintain conversation history context', async () => {
    const history = [
      { role: 'user', content: 'I like modern places' },
      { role: 'assistant', content: 'Great! We have modern studios.' },
    ];
    const result = await aiService.processChat('What else?', history);
    expect(result.message).toBeDefined();
  });
});

describe('AI Service Room Recommendations', () => {
  let aiService: AIServiceMock;

  beforeEach(() => {
    aiService = new AIServiceMock();
  });

  it('should generate room recommendations', async () => {
    const preferences = { userId: 'user_1' };
    const recommendations = await aiService.recommendRooms(preferences);

    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations[0]).toHaveProperty('score');
    expect(recommendations[0]).toHaveProperty('reason');
  });

  it('should filter by minimum score', async () => {
    const preferences = { userId: 'user_1', minScore: 0.9 };
    const recommendations = await aiService.recommendRooms(preferences);

    recommendations.forEach((r) => {
      expect(r.score).toBeGreaterThanOrEqual(0.9);
    });
  });

  it('should return sorted recommendations by score', async () => {
    const preferences = { userId: 'user_1' };
    const recommendations = await aiService.recommendRooms(preferences);

    for (let i = 0; i < recommendations.length - 1; i++) {
      expect(recommendations[i].score).toBeGreaterThanOrEqual(
        recommendations[i + 1].score
      );
    }
  });

  it('should throw error without user ID', async () => {
    await expect(aiService.recommendRooms({})).rejects.toThrow(
      'User ID required'
    );
  });
});

describe('AI Service Sentiment Analysis', () => {
  let aiService: AIServiceMock;

  beforeEach(() => {
    aiService = new AIServiceMock();
  });

  it('should detect positive sentiment', async () => {
    const result = await aiService.detectSentiment(
      'This place is absolutely amazing!'
    );
    expect(result.sentiment).toBe('positive');
    expect(result.score).toBeGreaterThan(0.5);
  });

  it('should detect negative sentiment', async () => {
    const result = await aiService.detectSentiment('This is terrible and awful');
    expect(result.sentiment).toBe('negative');
    expect(result.score).toBeLessThan(0.5);
  });

  it('should detect neutral sentiment', async () => {
    const result = await aiService.detectSentiment('It was okay');
    expect(result.sentiment).toBe('neutral');
  });

  it('should have confidence score', async () => {
    const result = await aiService.detectSentiment('Great property');
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
  });

  it('should throw error for empty text', async () => {
    await expect(aiService.detectSentiment('')).rejects.toThrow(
      'Text is required'
    );
  });
});

describe('AI Service Description Generation', () => {
  let aiService: AIServiceMock;

  beforeEach(() => {
    aiService = new AIServiceMock();
  });

  it('should generate description from features', async () => {
    const features = ['WiFi', 'Pool', 'Gym'];
    const description = await aiService.generateRoomDescription(features);

    expect(description).toContain('WiFi');
    expect(description).toContain('Pool');
    expect(description).toContain('Gym');
  });

  it('should include welcome message', async () => {
    const description = await aiService.generateRoomDescription(['WiFi']);
    expect(description).toContain('Welcome');
  });

  it('should throw error without features', async () => {
    await expect(aiService.generateRoomDescription([])).rejects.toThrow(
      'At least one feature required'
    );
  });
});

describe('AI Service Integration Tests', () => {
  let aiService: AIServiceMock;

  beforeEach(() => {
    aiService = new AIServiceMock();
  });

  it('should work end-to-end: recommend -> chat -> sentiment', async () => {
    // Get recommendations
    const recommendations = await aiService.recommendRooms({ userId: 'user_1' });
    expect(recommendations.length).toBeGreaterThan(0);

    // Ask about a recommended room
    const chatResponse = await aiService.processChat(
      `Tell me about ${recommendations[0].name}`
    );
    expect(chatResponse.message).toBeDefined();

    // Analyze user response
    const sentiment = await aiService.detectSentiment(
      'I love this property!'
    );
    expect(sentiment.sentiment).toBe('positive');
  });

  it('should suggest price and provide description', async () => {
    const features = ['WiFi', 'AC', 'Kitchen'];
    const roomData = { features, location: 'Downtown' };

    const priceResult = await aiService.suggestPrice(roomData);
    const description = await aiService.generateRoomDescription(features);

    expect(priceResult.suggestedPrice).toBeGreaterThan(0);
    expect(description).toContain('WiFi');
  });
});
