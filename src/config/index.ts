/**
 * Application Configuration
 * Environment-based configuration for the UniLodge application
 */

export const config = {
    // Server
    server: {
        port: process.env.PORT ? parseInt(process.env.PORT) : 5000,
        nodeEnv: process.env.NODE_ENV || 'development',
        apiVersion: 'v1',
    },

    // Database
    database: {
        url: process.env.DATABASE_URL || 'mongodb://localhost:27017/unilodge',
        poolSize: 10,
        timeout: 30000,
    },

    // Authentication
    auth: {
        jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
        jwtExpiration: '7d',
        refreshTokenExpiration: '30d',
    },

    // AI Service
    aiService: {
        endpoint: process.env.AI_SERVICE_URL || 'http://localhost:8000',
        apiKey: process.env.AI_API_KEY || '',
        timeout: 30000,
    },

    // API Configuration
    api: {
        cors: {
            origin: process.env.CORS_ORIGIN || '*',
            credentials: true,
        },
        rateLimit: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100, // limit each IP to 100 requests per windowMs
        },
    },

    // Features
    features: {
        enableAI: process.env.ENABLE_AI !== 'false',
        enableNotifications: process.env.ENABLE_NOTIFICATIONS !== 'false',
        enableAnalytics: process.env.ENABLE_ANALYTICS !== 'false',
    },

    // Logging
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        format: process.env.LOG_FORMAT || 'json',
    },

    // URLs
    urls: {
        frontend: process.env.FRONTEND_URL || 'http://localhost:3000',
        backend: process.env.BACKEND_URL || 'http://localhost:5000',
        aiEngine: process.env.AI_ENGINE_URL || 'http://localhost:8000',
    },
};

// Validation
export function validateConfig(): string[] {
    const errors: string[] = [];

    if (!config.auth.jwtSecret || config.auth.jwtSecret === 'your-secret-key') {
        errors.push('JWT_SECRET environment variable is not set');
    }

    if (config.server.nodeEnv === 'production' && !config.database.url) {
        errors.push('DATABASE_URL must be set in production');
    }

    return errors;
}

// Get config value with type safety
export function getConfig<T>(path: string, defaultValue?: T): T {
    const keys = path.split('.');
    let value: any = config;

    for (const key of keys) {
        if (value == null) return defaultValue as T;
        value = value[key];
    }

    return value as T;
}
