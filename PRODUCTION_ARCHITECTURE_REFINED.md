# STEP 10: AS-IS vs TO-BE ARCHITECTURE

## 10.1 AS-IS Architecture (Current State - Code Evidence)

### AS-IS System Overview

```mermaid
graph TB
    subgraph "🔴 AS-IS: Frontend (Mostly shells)"
        FE["Next.js App Port 3000"]
        Pages["Pages (8 files)<br/>- LoginPage<br/>- GuestDashboard<br/>- AdminDashboard<br/>- WardenDashboard<br/>❌ No real logic"]
        APIClient["API Client (api.ts)<br/>✅ Complete<br/>Expects 30+ endpoints<br/>❌ Backend has only /ai/*"]
        Components["Components (20+)<br/>⚠️ Shells only<br/>No state management<br/>No real data fetching"]
    end

    subgraph "🔴 AS-IS: Backend (Mostly stubs)"
        Express["Express App Port 5000<br/>❌ Wrong port<br/>Frontend expects 3001"]
        AIRoutes["AI Routes<br/>✅ WORKS<br/>- /chat<br/>- /price-suggestion<br/>- /recommendations<br/>- /analyze<br/>- /respond"]
        PropertyRoutes["Property Routes<br/>❌ STUB<br/>Returns 2 hardcoded rooms"]
        Services["Services Layer<br/>❌ ALL STUBS<br/>- RoomService TODO<br/>- BookingService TODO<br/>- AuthService TODO"]
        DBConnection["DB Connection<br/>✅ Pool created<br/>❌ Never called<br/>Services don't use it"]
    end

    subgraph "🟢 AS-IS: AI Engine (COMPLETE)"
        AIEngine["AIService<br/>✅ 316 lines<br/>Fully implemented<br/>- processChat()<br/>- suggestPrice()<br/>- recommendRooms()<br/>- analyzeDescription()"]
        OpenRouterClient["OpenRouterClient<br/>✅ Ready<br/>axios to OpenRouter"]
    end

    subgraph "🔴 AS-IS: Database"
        DockerCompose["docker-compose.yml<br/>MongoDB 7.0<br/>❌ CONFLICT"]
        CodeUsesPostgres["Code imports 'pg'<br/>PostgreSQL Pool<br/>✅ CORRECT"]
        Schema["Schema<br/>❌ NOT in code<br/>Needs to be created"]
    end

    subgraph "🟡 AS-IS: Dead Code"
        DeadCode["/src/domains/* (400+ lines)<br/>mock-api.js<br/>rewrite.py<br/>geminiService.ts<br/>❌ NOT USED"]
    end

    FE --> Pages
    FE --> APIClient
    FE --> Components
    Express --> AIRoutes
    Express --> PropertyRoutes
    Express --> Services
    Services --> DBConnection
    Express --> AIEngine
    AIEngine --> OpenRouterClient
    
    APIClient -.->|expects| Express
    PropertyRoutes -.->|should use| DBConnection
    DockerCompose -.->|CONFLICTS| CodeUsesPostgres

    style FE fill:#ffcdd2
    style Express fill:#ffcdd2
    style Services fill:#ffcdd2
    style DBConnection fill:#ffcdd2
    style PropertyRoutes fill:#ffcdd2
    style AIEngine fill:#c8e6c9
    style OpenRouterClient fill:#c8e6c9
    style DeadCode fill:#fff9c4
    style DockerCompose fill:#ffcdd2
```

**AS-IS Summary:**
- ✅ AI Engine: Production-ready
- ⚠️ Frontend: Shells exist, no real data
- ❌ Backend: 95% stubs
- ❌ Database: Not integrated
- ❌ Configuration: Conflicts

---

## 10.2 TO-BE Architecture (Production-Ready Design)

### TO-BE System Overview

```mermaid
graph TB
    subgraph "🟢 TO-BE: Frontend (Production)"
        Client["🌐 Client Browser"]
        FEApp["Next.js 14 (SSR)<br/>Port 3000<br/>✅ Production build"]
        Auth["Auth Context<br/>✅ JWT tokens<br/>localStorage"]
        Pages_prod["Pages<br/>✅ Real implementations<br/>- LoginPage → auth.login()<br/>- GuestDashboard → api.getRooms()<br/>- MyBookings → api.getBookings()<br/>- AdminDashboard → api.getAdmin()"]
        State["State Management<br/>✅ React Query / SWR<br/>Caching layer"]
        Real_Components["Components<br/>✅ Connected to API<br/>Real data flow"]
    end

    subgraph "🟢 TO-BE: Backend (Production)"
        BE["Express.js<br/>Port 3001<br/>✅ Correct port<br/>env: PORT=3001"]
        Auth_Route["Auth Routes<br/>✅ Implemented<br/>- /auth/login<br/>- /auth/register<br/>- /auth/logout<br/>- /auth/me<br/>+ JWT middleware"]
        Room_Route["Room Routes<br/>✅ Implemented<br/>- GET /rooms<br/>- GET /rooms/:id<br/>- POST /rooms (warden)<br/>- PATCH /rooms/:id"]
        Booking_Route["Booking Routes<br/>✅ Implemented<br/>- POST /bookings<br/>- GET /bookings<br/>- PATCH /bookings/:id/status<br/>- POST /bookings/:id/checkin"]
        Middleware["Middleware<br/>✅ Auth guards<br/>✅ Input validation (Zod)<br/>✅ Error handling<br/>✅ Rate limiting<br/>✅ Logging"]
        Services_prod["Services Layer<br/>✅ Implemented<br/>- RoomService<br/>- BookingService<br/>- AuthService<br/>- NotificationService"]
        Repository["Repository Pattern<br/>✅ Data access<br/>- UserRepository<br/>- RoomRepository<br/>- BookingRepository"]
        Error_Handler["Error Handler<br/>✅ Centralized<br/>Try-catch all routes<br/>Consistent responses"]
    end

    subgraph "🟢 TO-BE: AI Engine (Enhanced)"
        AIEngine_prod["AIService<br/>✅ Existing + enhancements<br/>- Request retries<br/>- Fallback responses<br/>- Cost control<br/>- Caching"]
        Observability["Observability<br/>✅ Logging<br/>✅ Metrics<br/>✅ Error tracking"]
        RateLimit_AI["Rate Limiting<br/>✅ Per-user quota<br/>✅ Cost tracking"]
    end

    subgraph "🟢 TO-BE: Database (Production)"
        PG["PostgreSQL 15+<br/>ssl: true<br/>poolSize: 20<br/>env: DATABASE_URL"]
        Migrations["Migrations<br/>✅ Schema versioning<br/>✅ Rollback support"]
        Schema_prod["Schema<br/>✅ 6 tables<br/>- users<br/>- rooms<br/>- bookings<br/>- payments<br/>- price_history<br/>- chat_messages"]
    end

    subgraph "🟢 TO-BE: Infrastructure"
        Docker["Docker Compose<br/>✅ 4 services<br/>- frontend (port 3000)<br/>- backend (port 3001)<br/>- postgres (port 5432)<br/>- redis (port 6379)"]
        Redis["Redis Cache<br/>✅ Session store<br/>✅ Rate limit counter"]
        Config["Configuration<br/>✅ .env validated<br/>✅ Secrets in Vault"]
    end

    subgraph "🟢 TO-BE: Observability"
        Logs["Logging<br/>✅ Winston<br/>✅ Structured JSON"]
        Metrics["Metrics<br/>✅ Prometheus<br/>✅ Response times<br/>✅ Error rates<br/>✅ AI costs"]
        Traces["Distributed Tracing<br/>✅ Request correlation"]
        Monitoring["Monitoring<br/>✅ Alerts on errors<br/>✅ Cost warnings"]
    end

    Client -->|HTTPS| FEApp
    FEApp --> Auth
    FEApp --> Pages_prod
    FEApp --> State
    FEApp --> Real_Components
    Real_Components -->|fetch /api/*| BE
    
    BE --> Auth_Route
    BE --> Room_Route
    BE --> Booking_Route
    BE --> Middleware
    Middleware --> Services_prod
    Services_prod --> Repository
    Repository -->|pg query| PG
    BE --> Error_Handler
    
    BE -->|import| AIEngine_prod
    AIEngine_prod --> Observability
    AIEngine_prod --> RateLimit_AI
    
    Docker --> PG
    Docker --> Redis
    Docker --> BE
    Docker --> FEApp
    
    BE --> Logs
    AIEngine_prod --> Logs
    BE --> Metrics
    Logs --> Monitoring
    Metrics --> Monitoring

    style FEApp fill:#c8e6c9
    style Pages_prod fill:#c8e6c9
    style BE fill:#c8e6c9
    style Auth_Route fill:#c8e6c9
    style Services_prod fill:#c8e6c9
    style Repository fill:#c8e6c9
    style PG fill:#c8e6c9
    style Docker fill:#c8e6c9
    style Observability fill:#c8e6c9
```

**TO-BE Summary:**
- ✅ All layers implemented
- ✅ Proper middleware & error handling
- ✅ Database fully integrated
- ✅ Configuration managed
- ✅ Observability built-in
- ✅ Cost control mechanisms

---

## 10.3 Gap Analysis Table

| Component | AS-IS | TO-BE | Gap | Effort |
|-----------|-------|-------|-----|--------|
| **Frontend** | Shell pages | Connected pages | Implement state + API calls | 3 days |
| **Backend Routes** | Stubs | Full CRUD | Auth, Room, Booking endpoints | 4 days |
| **Backend Services** | TODO | Implemented | Business logic | 4 days |
| **Database** | Pool only | Integrated + migrations | Schema + queries | 2 days |
| **Middleware** | Basic | Full stack | Auth, validation, error, rate limit | 2 days |
| **AI System** | Basic | Production-ready | Retries, caching, logging, metrics | 2 days |
| **Configuration** | Partial | Complete | .env, secrets, validation | 1 day |
| **Testing** | Mock-only | Real + integration | Add real API tests, E2E | 3 days |
| **Observability** | Logging only | Full stack | Metrics, tracing, alerts | 2 days |
| **Documentation** | Incomplete | Production-grade | API docs, architecture, runbooks | 2 days |

**Total Gap Effort: 25-27 days (~4-5 weeks)**

---

# STEP 11: DEPLOYMENT ARCHITECTURE

## 11.1 Docker Compose Deployment

### Current vs Proposed

**AS-IS (docker-compose.yml - BROKEN):**
```yaml
# ISSUES:
# 1. MongoDB used (but code uses PostgreSQL)
# 2. Backend port 3001 exposed but app defaults to 5000
# 3. No Redis
# 4. No health checks
# 5. No networks defined
```

**TO-BE (Production-Ready):**

```mermaid
graph TB
    subgraph "Docker Host (localhost or cloud)"
        subgraph "Docker Network: unilodge-net"
            FE_Container["Frontend Container<br/>Image: node:20-alpine<br/>Port: 3000:3000<br/>Env:<br/>  NEXT_PUBLIC_API_URL=http://backend:3001/api<br/>Volume: /app/node_modules<br/>✅ Health check"]
            
            BE_Container["Backend Container<br/>Image: node:20-alpine<br/>Port: 3001:3001<br/>Env:<br/>  DATABASE_URL=postgresql://...<br/>  OPENROUTER_API_KEY=...<br/>  PORT=3001<br/>  REDIS_URL=redis://redis:6379<br/>✅ Health check<br/>✅ Depends on: postgres, redis"]
            
            PG_Container["PostgreSQL Container<br/>Image: postgres:15-alpine<br/>Port: 5432:5432<br/>Env:<br/>  POSTGRES_DB=unilodge<br/>  POSTGRES_USER=postgres<br/>  POSTGRES_PASSWORD=...<br/>Volume: postgres_data:/var/lib/postgresql/data<br/>✅ Health check"]
            
            Redis_Container["Redis Container<br/>Image: redis:7-alpine<br/>Port: 6379:6379<br/>Volume: redis_data:/data<br/>✅ Health check<br/>Purpose:<br/>  - Session store<br/>  - Rate limiting<br/>  - Cache"]
        end
    end

    FE_Container -->|http://backend:3001/api| BE_Container
    BE_Container -->|postgres://postgres:5432| PG_Container
    BE_Container -->|redis://redis:6379| Redis_Container

    style FE_Container fill:#e3f2fd
    style BE_Container fill:#f3e5f5
    style PG_Container fill:#e8f5e9
    style Redis_Container fill:#fff3e0
```

### Proposed docker-compose.yml

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: docker/Dockerfile.frontend
    container_name: unilodge-frontend
    ports:
      - "${FRONTEND_PORT:-3000}:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://backend:3001/api
      NODE_ENV: ${NODE_ENV:-development}
    depends_on:
      backend:
        condition: service_healthy
    networks:
      - unilodge-net
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped

  backend:
    build:
      context: .
      dockerfile: docker/Dockerfile.backend
    container_name: unilodge-backend
    ports:
      - "${BACKEND_PORT:-3001}:3001"
    environment:
      PORT: 3001
      NODE_ENV: ${NODE_ENV:-development}
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}
      OPENROUTER_API_KEY: ${OPENROUTER_API_KEY}
      OPENROUTER_MODEL: ${OPENROUTER_MODEL:-openai/gpt-3.5-turbo}
      REDIS_URL: redis://redis:6379
      CORS_ORIGIN: http://localhost:3000
      JWT_SECRET: ${JWT_SECRET}
      AI_CHATBOT_ENABLED: true
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - unilodge-net
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped
    volumes:
      - ./apps/backend/src:/app/src

  postgres:
    image: postgres:15-alpine
    container_name: unilodge-postgres
    ports:
      - "${DB_PORT:-5432}:5432"
    environment:
      POSTGRES_DB: ${DB_NAME:-unilodge}
      POSTGRES_USER: ${DB_USER:-postgres}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-postgres}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./migrations:/docker-entrypoint-initdb.d
    networks:
      - unilodge-net
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-postgres}"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: unilodge-redis
    ports:
      - "${REDIS_PORT:-6379}:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    networks:
      - unilodge-net
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

networks:
  unilodge-net:
    driver: bridge

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
```

---

## 11.2 Service Communication Diagram

```mermaid
sequenceDiagram
    participant Client as Client Browser
    participant FE as Frontend:3000
    participant BE as Backend:3001
    participant Cache as Redis:6379
    participant DB as PostgreSQL:5432
    participant AI as OpenRouter API

    Client->>FE: User action
    FE->>BE: HTTP POST /api/rooms
    
    alt Cache hit
        BE->>Cache: GET rooms_*
        Cache-->>BE: Cached rooms
    else Cache miss
        BE->>DB: SELECT * FROM rooms
        DB-->>BE: Room data
        BE->>Cache: SET rooms_* (5min TTL)
    end
    
    BE-->>FE: JSON response
    FE-->>Client: Render rooms
    
    Note over BE,AI: For AI requests
    FE->>BE: POST /api/ai/chat
    BE->>Cache: GET rate_limit:user_123
    alt Rate limit exceeded
        BE-->>FE: 429 Too Many Requests
    else OK
        BE->>AI: OpenRouter API call
        AI-->>BE: LLM response
        BE->>Cache: SET rate_limit:user_123
        BE->>DB: INSERT INTO chat_messages
        BE-->>FE: Response
    end
```

---

## 11.3 Environment Configuration

### .env.local (Development)

```bash
# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NODE_ENV=development

# Backend
PORT=3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/unilodge
REDIS_URL=redis://localhost:6379
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_MODEL=openai/gpt-3.5-turbo
OPENROUTER_ENDPOINT=https://openrouter.ai/api/v1

# Auth
JWT_SECRET=dev-secret-key-change-in-production

# API
CORS_ORIGIN=http://localhost:3000
AI_CHATBOT_ENABLED=true

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### .env.production (Docker)

```bash
# Frontend
NEXT_PUBLIC_API_URL=https://api.unilodge.com/api
NODE_ENV=production

# Backend
PORT=3001
DATABASE_URL=postgresql://prod_user:${SECURE_PASSWORD}@postgres-prod.example.com:5432/unilodge
REDIS_URL=redis://redis-prod.example.com:6379
OPENROUTER_API_KEY=${VAULT_OPENROUTER_KEY}
OPENROUTER_MODEL=openai/gpt-4

# Auth
JWT_SECRET=${VAULT_JWT_SECRET}

# API
CORS_ORIGIN=https://unilodge.com
AI_CHATBOT_ENABLED=true

# Security
NODE_TLS_REJECT_UNAUTHORIZED=true

# Observability
LOG_LEVEL=info
SENTRY_DSN=${VAULT_SENTRY_DSN}
```

---

## 11.4 Network Architecture (Production)

```mermaid
graph TB
    subgraph "Internet"
        Users["👥 Users<br/>Browser clients"]
        CDN["📦 CDN<br/>Static assets<br/>(Vercel/Cloudflare)"]
    end

    subgraph "Load Balancer / Reverse Proxy"
        LB["nginx/HAProxy<br/>Port 443 HTTPS<br/>SSL termination<br/>Rate limiting"]
    end

    subgraph "Container Orchestration (Kubernetes / Docker Swarm)"
        subgraph "Frontend Replicas"
            FE1["Frontend Pod #1<br/>unilodge.com/"]
            FE2["Frontend Pod #2<br/>unilodge.com/"]
            FE3["Frontend Pod #3<br/>unilodge.com/"]
        end

        subgraph "Backend Replicas"
            BE1["Backend Pod #1<br/>/api/*"]
            BE2["Backend Pod #2<br/>/api/*"]
            BE3["Backend Pod #3<br/>/api/*"]
        end

        subgraph "Data Layer"
            PG_Primary["PostgreSQL Primary<br/>Write"]
            PG_Replica["PostgreSQL Replica<br/>Read-only"]
            Redis_Master["Redis Master<br/>Sessions"]
            Redis_Slave["Redis Slave<br/>Replication"]
        end
    end

    subgraph "External Services"
        OpenRouter["🚀 OpenRouter API<br/>LLM requests"]
        Sentry["📊 Sentry<br/>Error tracking"]
        DataDog["📈 Datadog<br/>Monitoring"]
    end

    Users -->|HTTPS| CDN
    Users -->|HTTPS| LB
    CDN --> LB
    LB --> FE1
    LB --> FE2
    LB --> FE3
    
    FE1 --> LB2["API Load Balancer"]
    FE2 --> LB2
    FE3 --> LB2
    
    LB2 --> BE1
    LB2 --> BE2
    LB2 --> BE3
    
    BE1 --> PG_Primary
    BE2 --> PG_Primary
    BE3 --> PG_Primary
    PG_Primary --> PG_Replica
    
    BE1 --> Redis_Master
    BE2 --> Redis_Master
    BE3 --> Redis_Master
    Redis_Master --> Redis_Slave
    
    BE1 --> OpenRouter
    BE2 --> OpenRouter
    BE3 --> OpenRouter
    
    BE1 --> Sentry
    BE2 --> Sentry
    FE1 --> Sentry
    
    BE1 --> DataDog
    BE2 --> DataDog
    PG_Primary --> DataDog

    style Users fill:#bbdefb
    style CDN fill:#c8e6c9
    style LB fill:#fff3e0
    style FE1 fill:#e1f5fe
    style BE1 fill:#f3e5f5
    style PG_Primary fill:#e8f5e9
    style Redis_Master fill:#fff9c4
    style OpenRouter fill:#ffe0b2
```

---

# STEP 12: AI SYSTEM DEEP DESIGN

## 12.1 AI Request Flow (Production)

```mermaid
sequenceDiagram
    participant Client as Frontend
    participant BE as Backend<br/>/api/ai/*
    participant RateLimit as Rate Limiter<br/>Redis
    participant Cache as Cache<br/>Redis
    participant Retry as Retry Handler
    participant AIService as AIService
    participant OpenRouter as OpenRouter API
    participant Metrics as Metrics
    participant Logger as Logger
    participant ErrorHandler as Error Handler

    Client->>BE: POST /api/ai/chat

    BE->>Logger: Request received
    Logger->>Logger: {timestamp, user_id, endpoint}

    BE->>RateLimit: Check user quota
    alt Rate limit exceeded
        RateLimit-->>BE: 429 error
        BE->>Metrics: increment rate_limit_exceeded
        BE-->>Client: 429 Too Many Requests
    end

    BE->>Cache: GET chat_history:user_123
    alt Cache hit
        Cache-->>BE: Cached context
        BE->>Logger: Using cached context
    else Cache miss
        BE->>BE: Query from DB
        BE->>Cache: SET (5 min TTL)
    end

    BE->>AIService: processChat(message, context)
    
    AIService->>Logger: Building prompt
    AIService->>Metrics: increment ai_request_count
    
    loop Retry up to 3 times
        AIService->>OpenRouter: axios.post(/chat/completions)
        
        alt Success
            OpenRouter-->>AIService: {choices[0].message.content}
            AIService->>Logger: Response received
            AIService->>Metrics: increment ai_success
            break
        else Timeout (>30s)
            AIService->>Logger: Timeout, attempt N/3
            alt Retry N < 3
                Note over AIService: Wait 1s exponential backoff
            else Final attempt
                AIService->>ErrorHandler: Max retries exceeded
                AIService->>Metrics: increment ai_timeout
            end
        else Rate limit from OpenRouter
            OpenRouter-->>AIService: 429 error
            AIService->>Metrics: increment openrouter_rate_limit
            alt Fallback available
                AIService->>AIService: Use cached response
            else No fallback
                AIService->>ErrorHandler: Fallback failed
            end
        else Authentication error
            OpenRouter-->>AIService: 401/403
            AIService->>ErrorHandler: Auth failed
            AIService->>Metrics: increment ai_auth_error
            AIService->>Logger: Check OPENROUTER_API_KEY
        end
    end

    alt Success
        AIService->>Cache: SET chat_response (1h TTL)
        AIService->>BE: ChatMessage {id, role, content, timestamp}
        BE->>Cache: UPDATE rate_limit:user_123
        BE->>Logger: Request successful
        BE->>Metrics: increment ai_latency (timing)
        BE-->>Client: 200 OK + response
    else All retries failed
        ErrorHandler->>Logger: All retries exhausted
        ErrorHandler->>Metrics: increment ai_failure
        ErrorHandler-->>Client: 503 Service Unavailable
        ErrorHandler->>ErrorHandler: Alert team if critical
    end
```

---

## 12.2 AI System Failure Scenarios & Handling

```mermaid
graph TD
    Start["User sends chat<br/>message"]
    
    Start -->|Rate limit check| RateLimitCheck{User quota<br/>exceeded?}
    RateLimitCheck -->|Yes| RateLimitFail["Return 429<br/>Retry-After header<br/>Log to metrics"]
    RateLimitFail --> Client_Error["Send to Client:<br/>429 Too Many Requests<br/>Wait X seconds"]
    
    RateLimitCheck -->|No| CacheCheck{Response in<br/>cache?}
    CacheCheck -->|Yes| CacheHit["Return cached<br/>response<br/>Log cache_hit"]
    CacheHit --> Client_OK
    
    CacheCheck -->|No| RateLimitOpenRouter{OpenRouter API<br/>rate limited?}
    RateLimitOpenRouter -->|Yes, retries left| Backoff1["Wait 2^N seconds<br/>Log retry"]
    Backoff1 --> RateLimitOpenRouter
    RateLimitOpenRouter -->|Yes, no retries| OpenRouterQuotaExhausted["Return fallback:<br/>'Service busy'<br/>Alert team"]
    OpenRouterQuotaExhausted --> Client_Fallback["Send to Client:<br/>503 Fallback response"]
    
    RateLimitOpenRouter -->|No| TimeoutCheck{Request<br/>timeout<br/>30s?}
    TimeoutCheck -->|Yes, retries left| Backoff2["Wait 1s * attempt<br/>Retry"]
    Backoff2 --> RateLimitOpenRouter
    TimeoutCheck -->|Yes, no retries| TimeoutFail["Max retries exceeded<br/>Log timeout error<br/>Alert on 3 failures"]
    TimeoutFail --> Client_Error
    
    TimeoutCheck -->|No| AuthCheck{API key<br/>valid?}
    AuthCheck -->|No: 401| AuthError["Check OPENROUTER_API_KEY<br/>Log critical<br/>Page on-call"]
    AuthError --> Client_Error
    AuthCheck -->|Yes| ParseCheck{Response<br/>parseable?}
    
    ParseCheck -->|No: Invalid JSON| ParseError["Fallback to<br/>generic message<br/>Log parse error"]
    ParseError --> Client_Fallback
    ParseCheck -->|Yes| Success["Store in DB<br/>Update cache<br/>Log metrics"]
    Success --> Client_OK["Return 200<br/>+ response"]
    
    Client_OK --> Metrics["Log:<br/>- latency<br/>- tokens used<br/>- cost"]
    Client_Fallback --> Metrics
    Client_Error --> Metrics

    style Start fill:#e3f2fd
    style Client_OK fill:#c8e6c9
    style Client_Fallback fill:#fff3e0
    style Client_Error fill:#ffcdd2
    style Metrics fill:#f3e5f5
```

---

## 12.3 Cost Control Strategy

### Per-Request Cost Calculation

```typescript
// Example: OpenRouter API costs

interface AIRequestCost {
  model: string;
  promptTokens: number;
  completionTokens: number;
  costUSD: number;
  timestamp: Date;
}

// Pricing (example from openai/gpt-3.5-turbo)
const PRICING = {
  'openai/gpt-3.5-turbo': {
    input: 0.0005,    // $0.0005 per 1K tokens
    output: 0.0015    // $0.0015 per 1K tokens
  },
  'openai/gpt-4': {
    input: 0.03,      // $0.03 per 1K tokens
    output: 0.06      // $0.06 per 1K tokens
  }
};

// Cost tracking per user
Cost = (promptTokens / 1000) * inputPrice + 
       (completionTokens / 1000) * outputPrice

// Example: 1000 prompt + 500 completion tokens on GPT-3.5
= (1000/1000) * 0.0005 + (500/1000) * 0.0015
= $0.0005 + $0.00075
= $0.00125 per request
```

### Rate Limiting Strategy

```mermaid
graph TB
    User["User<br/>user_123"]
    
    DailyLimit["Daily Limit<br/>100 requests"]
    HourlyLimit["Hourly Limit<br/>20 requests"]
    PerMinute["Per-Minute Limit<br/>5 requests"]
    TokenQuota["Monthly Token<br/>Quota<br/>1M tokens"]
    CostQuota["Monthly Cost<br/>Quota<br/>$50"]
    
    Check{"Can make<br/>request?"}
    
    User -->|every request| Check
    DailyLimit --> Check
    HourlyLimit --> Check
    PerMinute --> Check
    TokenQuota --> Check
    CostQuota --> Check
    
    Check -->|All pass| Allow["✅ Allow<br/>Log usage"]
    Check -->|Any fail| Deny["❌ Deny<br/>429 or custom msg"]
    
    Allow --> Track["Track:<br/>- tokens used<br/>- cost<br/>- quota remaining"]
    Deny --> Alert["Alert if:<br/>- Cost > $40<br/>- Quota > 90%"]
    
    Track --> Redis["Store in Redis<br/>Key: quota:user_123<br/>TTL: varies"]
    Alert --> Metrics["Alert system"]

    style Allow fill:#c8e6c9
    style Deny fill:#ffcdd2
    style Redis fill:#fff9c4
```

---

## 12.4 AI System Observability

### Logging Strategy

```typescript
// Winston logger configuration
{
  "timestamp": "2026-04-26T10:30:45.123Z",
  "level": "info",
  "service": "backend",
  "request_id": "req_abc123xyz",
  "user_id": "user_123",
  "endpoint": "/api/ai/chat",
  "method": "POST",
  "event": "ai_request_started",
  "message_length": 45,
  "context_type": "room_inquiry",
  
  // AI-specific fields
  "ai_engine": "openrouter",
  "model": "openai/gpt-3.5-turbo",
  "system_prompt_hash": "sha256_abc...",
  
  // Latency tracking
  "latency_ms": 2340,
  "api_call_latency_ms": 2100,
  "cache_latency_ms": 10,
  "db_latency_ms": 50,
  
  // Cost tracking
  "prompt_tokens": 245,
  "completion_tokens": 89,
  "total_tokens": 334,
  "estimated_cost_usd": 0.00234,
  
  // Success/failure
  "status": "success",
  "response_tokens_generated": 89,
  
  // Error details (if failed)
  "error": null,
  "retry_count": 0,
  "fallback_used": false,
  
  // Metrics
  "rate_limit_remaining": 95,
  "monthly_cost_so_far": 23.45,
  "monthly_quota_percent": 46.9
}
```

### Metrics to Track (Prometheus)

```
# Request metrics
ai_requests_total{endpoint="/api/ai/chat", status="success"} 1523
ai_requests_total{endpoint="/api/ai/chat", status="error"} 12
ai_request_duration_seconds{endpoint="/api/ai/chat", quantile="0.95"} 2.34

# Token metrics
ai_tokens_used_total{model="gpt-3.5-turbo", type="input"} 425000
ai_tokens_used_total{model="gpt-3.5-turbo", type="output"} 145000

# Cost metrics
ai_cost_usd_total{model="gpt-3.5-turbo"} 0.7245
ai_cost_usd_per_user{user_id="user_123"} 0.0456

# Error metrics
ai_errors_total{error_type="timeout", retry="yes"} 5
ai_errors_total{error_type="rate_limit", retry="yes"} 2
ai_errors_total{error_type="auth_failed", retry="no"} 1

# Cache metrics
ai_cache_hits_total 342
ai_cache_misses_total 58
ai_cache_hit_ratio 0.855

# Fallback metrics
ai_fallback_responses_total 3
ai_fallback_response_ratio 0.00197
```

---

## 12.5 AI Configuration (Production)

```typescript
// apps/ai-engine/config.ts

export const AI_CONFIG = {
  // Model selection
  model: process.env.OPENROUTER_MODEL || 'openai/gpt-3.5-turbo',
  endpoint: process.env.OPENROUTER_ENDPOINT || 'https://openrouter.ai/api/v1',
  
  // Request configuration
  maxTokens: 1000,
  temperature: 0.7,  // 0=deterministic, 1=creative
  topP: 0.9,
  frequencyPenalty: 0.2,  // Reduce repetition
  presencePenalty: 0.2,   // Reduce topic narrowing
  
  // Retry strategy
  retries: {
    maxAttempts: 3,
    initialDelayMs: 1000,
    maxDelayMs: 10000,
    backoffMultiplier: 2,  // Exponential: 1s, 2s, 4s
  },
  
  // Timeout configuration
  requestTimeoutMs: 30000,  // 30s max
  
  // Rate limiting (per user)
  rateLimit: {
    dailyLimit: 100,
    hourlyLimit: 20,
    perMinuteLimit: 5,
    monthlyTokenQuota: 1000000,
    monthlyBudgetUSD: 50,
  },
  
  // Cache configuration
  cache: {
    ttlSeconds: {
      chatResponse: 3600,      // 1 hour
      priceAnalysis: 86400,    // 24 hours
      roomRecommendation: 1800, // 30 min
    },
  },
  
  // Cost control
  costTracking: {
    enableCostTracking: true,
    alertThresholdPercent: 80,  // Alert at 80% monthly budget
    maxCostPerRequest: 0.05,    // Reject if > $0.05
  },
  
  // Observability
  logging: {
    logRequests: true,
    logResponses: true,  // Be careful with PII
    logFullPrompt: process.env.NODE_ENV === 'development',
  },
  
  // Fallback responses
  fallbacks: {
    chatFallback: 'I apologize, but I cannot process your request right now. Please try again later.',
    priceFallback: {
      suggested: 500,
      min: 400,
      max: 800,
      confidence: 0.3,
      reasoning: 'Using default pricing due to service limitation',
    },
  },
};
```

---

# STEP 13: EXECUTION ROADMAP

## 13.1 Critical Path - Production Launch Timeline

```mermaid
gantt
    title UniLodge Production Readiness - 25 Days Total
    dateFormat YYYY-MM-DD
    
    section Phase 1: Foundation (Days 1-8)
    Auth Service & Routes (2d) :auth, 2026-05-01, 2d
    DB Schema & Migrations (1d) :db, 2026-05-03, 1d
    PostgreSQL Integration (1d) :pg, 2026-05-04, 1d
    Redis Setup (1d) :redis, 2026-05-05, 1d
    Middleware Stack (2d) :mw, 2026-05-06, 2d
    Testing Foundation (1d) :test1, 2026-05-08, 1d
    
    section Phase 2: Core Features (Days 9-16)
    Room Service & Routes (2d) :rooms, 2026-05-09, 2d
    Booking Service & Routes (2.5d) :book, 2026-05-11, 2.5d
    Repository Pattern (1.5d) :repo, 2026-05-13, 1.5d
    Error Handling (1d) :errors, 2026-05-14, 1d
    Rate Limiting (1d) :rate, 2026-05-15, 1d
    
    section Phase 3: AI & Frontend (Days 17-22)
    AI System Enhancement (1.5d) :ai, 2026-05-16, 1.5d
    Cache Layer (1d) :cache, 2026-05-17, 1d
    Frontend Integration (2d) :fe, 2026-05-18, 2d
    State Management (1d) :state, 2026-05-19, 1d
    Real API Testing (1d) :apitest, 2026-05-20, 1d
    
    section Phase 4: Production Hardening (Days 23-25)
    E2E Tests & CI/CD (1.5d) :e2e, 2026-05-21, 1.5d
    Observability & Monitoring (1d) :obs, 2026-05-22, 1d
    Load Testing (0.5d) :load, 2026-05-23, 0.5d
    Documentation (1d) :docs, 2026-05-23, 1d
    Deployment Prep (1d) :deploy, 2026-05-24, 1d
```

---

## 13.2 Detailed Task Breakdown

### Phase 1: Foundation (Days 1-8)

#### Week 1, Day 1-2: Authentication Service

**Task:** Implement JWT-based authentication

**Subtasks:**
1. Create `AuthService` class (replace TODO stub)
   - `login(email, password)` → hash & verify
   - `register(name, email, password)` → create user
   - `verifyToken(token)` → decode & validate
   - `generateToken(user)` → create JWT

2. Create Auth routes
   - `POST /api/auth/login`
   - `POST /api/auth/register`
   - `POST /api/auth/logout`
   - `GET /api/auth/me` (protected)

3. Database schema
   ```sql
   CREATE TABLE users (
     id UUID PRIMARY KEY,
     email VARCHAR UNIQUE NOT NULL,
     password_hash VARCHAR NOT NULL,
     first_name VARCHAR,
     last_name VARCHAR,
     role ENUM('student', 'warden', 'admin'),
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

4. Middleware
   - `authMiddleware` → verify JWT on protected routes
   - `roleMiddleware` → check user role (admin, warden, etc.)

**Deliverables:**
- ✅ `AuthService` fully implemented
- ✅ 4 auth routes working
- ✅ Tests passing (auth.test.ts)
- ✅ Users table exists with data

**Dependencies:** None (can start immediately)

**Parallelizable with:** DB schema setup

---

#### Week 1, Day 3: Database Schema & Migrations

**Task:** Design and implement PostgreSQL schema

**Subtasks:**
1. Create migration framework (Knex or Raw SQL)
   ```bash
   migrations/
   ├── 001_create_users.sql
   ├── 002_create_rooms.sql
   ├── 003_create_bookings.sql
   ├── 004_create_payments.sql
   ├── 005_create_price_history.sql
   └── 006_create_chat_messages.sql
   ```

2. Write all 6 migration files

3. Test migrations
   ```bash
   npm run migrate:up   # Apply all
   npm run migrate:down # Rollback
   ```

4. Seed test data (50 rooms, 20 users for testing)

**Deliverables:**
- ✅ All 6 migration files
- ✅ Test data seeder
- ✅ Rollback tested

**Dependencies:** None

**Parallelizable with:** Auth Service

---

#### Week 1, Day 4: PostgreSQL Integration

**Task:** Connect services to database

**Subtasks:**
1. Replace mock queries with real DB calls
   - `UserRepository.createUser()` → INSERT
   - `UserRepository.getUserByEmail()` → SELECT
   - `UserRepository.getUserById()` → SELECT

2. Test all repository methods

3. Handle connection pooling & errors

**Deliverables:**
- ✅ All repositories connected to DB
- ✅ Connection pool working
- ✅ Tests passing with real DB

**Dependencies:** AuthService (Day 1-2), DB Schema (Day 3)

---

#### Week 1, Day 5: Redis Setup

**Task:** Set up Redis for caching & sessions

**Subtasks:**
1. Configure Redis connection
2. Create cache manager
3. Implement session store (JWT in Redis)
4. Add cache invalidation logic

**Deliverables:**
- ✅ Redis running in Docker
- ✅ Session store working
- ✅ Cache functions available

**Dependencies:** None

**Parallelizable with:** Middleware Stack

---

#### Week 1, Day 6-7: Middleware Stack

**Task:** Implement production-grade middleware

**Subtasks:**
1. Error handling middleware
   ```typescript
   app.use(errorHandler)
   // Catches all errors, returns proper responses
   ```

2. Input validation middleware (Zod)
   ```typescript
   validateBody(schemas.createBooking)
   ```

3. Rate limiting middleware (Redis-backed)
   ```typescript
   rateLimit({
     windowMs: 900000,      // 15 min
     maxRequests: 100,
     store: redisStore
   })
   ```

4. Request logging middleware (Winston)

5. CORS middleware (strict production rules)

**Deliverables:**
- ✅ 5 middleware functions implemented
- ✅ Error responses standardized
- ✅ Rate limiting active

**Dependencies:** Redis (Day 5)

**Parallelizable with:** Redis setup

---

#### Week 1, Day 8: Testing Foundation

**Task:** Set up real integration tests

**Subtasks:**
1. Create test database (separate from dev)
2. Add database fixtures
3. Implement test helpers
4. Write first 10 integration tests

**Deliverables:**
- ✅ Test DB running
- ✅ 10+ integration tests passing
- ✅ CI/CD ready

**Dependencies:** All Phase 1 tasks

---

### Phase 2: Core Features (Days 9-16)

#### Week 2, Day 1-2: Room Service & Routes

**Task:** Implement room management

**Subtasks:**
1. Create `RoomService` (replace TODO)
   - `getRooms(filters)` → with pagination
   - `getRoomById(id)`
   - `createRoom(data)` (warden only)
   - `updateRoom(id, data)`

2. Create Room routes
   - `GET /api/rooms` (search & filter)
   - `GET /api/rooms/:id`
   - `POST /api/rooms` (warden auth)
   - `PUT /api/rooms/:id` (warden auth)
   - `DELETE /api/rooms/:id` (admin only)

3. Implement `RoomRepository`
   - Query database with filters
   - Pagination support

**Deliverables:**
- ✅ Room CRUD working
- ✅ 8+ tests passing
- ✅ Filters (price, location, amenities) working

**Dependencies:** Auth (Phase 1), DB (Phase 1), Middleware (Phase 1)

**Parallelizable with:** Booking Service

---

#### Week 2, Day 3-4: Booking Service & Routes

**Task:** Implement booking workflow

**Subtasks:**
1. Create `BookingService` (replace TODO)
   - `createBooking(userId, roomId, dates)`
   - `getBookings(userId)`
   - `cancelBooking(id)`
   - `updateStatus(id, status)`
   - Validate: no overlapping bookings, room available

2. Create Booking routes
   - `POST /api/bookings` (create)
   - `GET /api/bookings` (user's bookings)
   - `PATCH /api/bookings/:id/status`
   - `POST /api/bookings/:id/checkin`
   - `POST /api/bookings/:id/checkout`

3. Business logic
   - Check room availability
   - Prevent double bookings
   - Calculate total price
   - Generate notifications

**Deliverables:**
- ✅ Booking CRUD working
- ✅ Availability checking working
- ✅ 12+ tests passing

**Dependencies:** Room Service, Auth, DB

**Parallelizable with:** Room Service

---

#### Week 2, Day 5: Repository Pattern

**Task:** Formalize data access layer

**Subtasks:**
1. Create repository interfaces
   - `IUserRepository`
   - `IRoomRepository`
   - `IBookingRepository`
   - `IPaymentRepository`

2. Implement all repositories
3. Remove duplicate DB logic
4. Test all methods

**Deliverables:**
- ✅ Clean repository pattern
- ✅ No SQL in services
- ✅ Testable design

**Dependencies:** All services (Day 1-4)

---

#### Week 2, Day 6: Error Handling

**Task:** Standardize error responses

**Subtasks:**
1. Create custom error classes
   - `ValidationError` (400)
   - `AuthenticationError` (401)
   - `AuthorizationError` (403)
   - `NotFoundError` (404)
   - `ConflictError` (409)
   - `ServerError` (500)

2. Update all endpoints to throw proper errors
3. Error handler middleware catches & responds

**Deliverables:**
- ✅ Consistent error format
- ✅ All endpoints updated
- ✅ Tests verify error handling

**Dependencies:** All routes (Phase 1-2)

---

#### Week 2, Day 7: Rate Limiting

**Task:** Implement API rate limiting

**Subtasks:**
1. Configure per-endpoint limits
   - `/api/ai/*`: 5 req/min (expensive)
   - `/api/bookings`: 10 req/min
   - `/api/rooms`: 30 req/min (cheap)

2. Per-user quota tracking
3. Return `Retry-After` headers

**Deliverables:**
- ✅ Rate limiting active
- ✅ Quotas enforced
- ✅ Tests verify limits

**Dependencies:** Redis (Phase 1), Middleware (Phase 1)

---

### Phase 3: AI & Frontend (Days 17-22)

#### Week 3, Day 1: AI System Enhancement

**Task:** Add production features to AI Engine

**Subtasks:**
1. Add retry logic with exponential backoff
2. Add fallback responses
3. Add cost tracking
4. Add request/response logging
5. Add cache integration

**Deliverables:**
- ✅ Retries working (3 attempts)
- ✅ Cost tracking active
- ✅ Fallbacks returning valid responses

**Dependencies:** Redis (Phase 1), AI Engine (existing)

---

#### Week 3, Day 2: Cache Layer

**Task:** Implement caching strategy

**Subtasks:**
1. Cache AI responses (1 hour)
2. Cache room listings (5 minutes)
3. Cache user data (10 minutes)
4. Cache invalidation on updates

**Deliverables:**
- ✅ Caching reducing API calls by 60%
- ✅ Invalidation working on updates

**Dependencies:** Redis (Phase 1)

---

#### Week 3, Day 3-4: Frontend Integration

**Task:** Connect frontend to real API

**Subtasks:**
1. Update `api.ts` to hit real endpoints
2. Test all 30+ API calls
3. Add error handling in frontend
4. Add loading states

**Deliverables:**
- ✅ Frontend displaying real data
- ✅ All pages working with real API
- ✅ No 404 errors

**Dependencies:** All backend routes (Phase 1-2)

---

#### Week 3, Day 5: State Management

**Task:** Implement proper state management

**Subtasks:**
1. Use React Query for server state
2. Context for auth state
3. Local storage for preferences

**Deliverables:**
- ✅ Data persists across page reloads
- ✅ Optimistic updates working
- ✅ No duplicate requests

**Dependencies:** Frontend (Day 3-4)

---

### Phase 4: Production Hardening (Days 23-25)

#### Week 4, Day 1: E2E Tests & CI/CD

**Task:** Add end-to-end tests

**Subtasks:**
1. Write Playwright tests for full user journeys
   - Login → Browse → Book → Confirm
   - Admin approve booking
   - AI chat flow

2. Set up GitHub Actions
3. Run tests on every PR

**Deliverables:**
- ✅ 5+ E2E test scenarios
- ✅ CI/CD pipeline ready

**Dependencies:** All features (Phase 1-3)

---

#### Week 4, Day 2: Observability & Monitoring

**Task:** Add logging, metrics, alerts

**Subtasks:**
1. Configure Winston logging
2. Export Prometheus metrics
3. Set up Sentry error tracking
4. Create dashboards

**Deliverables:**
- ✅ Logs aggregated
- ✅ Metrics collected
- ✅ Alerts configured

**Dependencies:** All services

---

#### Week 4, Day 3: Load Testing

**Task:** Verify performance under load

**Subtasks:**
1. Use k6 for load testing
2. Simulate 100 concurrent users
3. Verify < 500ms response times

**Deliverables:**
- ✅ Performance report
- ✅ Bottlenecks identified
- ✅ Caching verified

**Dependencies:** All features

---

#### Week 4, Day 4: Final Documentation

**Task:** Production-grade documentation

**Subtasks:**
1. API reference (OpenAPI spec)
2. Architecture diagrams (Mermaid)
3. Deployment runbooks
4. Troubleshooting guide

**Deliverables:**
- ✅ Complete API docs
- ✅ Deployment ready
- ✅ Team handoff ready

---

## 13.3 Dependency Graph

```mermaid
graph TD
    DB[DB Schema] --> Auth[Auth Service]
    DB --> Room[Room Service]
    DB --> Book[Booking Service]
    
    Auth --> AuthRoute[Auth Routes]
    Auth --> Middleware[Middleware Stack]
    
    Room --> RoomRoute[Room Routes]
    RoomRoute --> Repo[Repository Pattern]
    
    Book --> BookRoute[Booking Routes]
    BookRoute --> Repo
    
    Repo --> ErrorHandler[Error Handling]
    ErrorHandler --> RateLimit[Rate Limiting]
    
    Redis[Redis Setup] --> Cache[Cache Layer]
    Redis --> RateLimit
    
    Middleware --> FrontendInt[Frontend Integration]
    RoomRoute --> FrontendInt
    BookRoute --> FrontendInt
    AuthRoute --> FrontendInt
    
    FrontendInt --> State[State Management]
    State --> Tests[E2E Tests]
    
    AI[AI Enhancement] --> AICache[AI Caching]
    AICache --> Tests
    
    Tests --> Monitor[Observability]
    Monitor --> LoadTest[Load Testing]
    LoadTest --> Docs[Documentation]
```

---

## 13.4 Resource Allocation

### Team Composition (Recommended)

```
Backend Engineers (2):
├─ Engineer A: Days 1-8 (Auth, DB, Middleware)
└─ Engineer B: Days 9-16 (Room, Booking, Repositories)

Frontend Engineer (1):
└─ Days 17-22 (Integration, State Management)

DevOps Engineer (0.5):
├─ Days 1-8 (Docker, Redis setup)
└─ Days 23-25 (Monitoring, Load testing)

QA Engineer (0.5):
├─ Days 8+ (Test writing)
└─ Days 23-25 (E2E, Load testing)
```

### Parallelizable Workstreams

```
STREAM 1: Backend Core (16 days)
  Auth + DB → Room Service → Booking Service → Error Handling
  ↓
STREAM 2: Infrastructure (8 days, runs in parallel)
  Redis → Cache → Monitoring
  ↓
STREAM 3: Frontend (7 days, starts after backend routes ready)
  Integration → State Management → E2E Tests
  ↓
FINAL: Production Hardening (3 days)
  Load Testing → Documentation → Deployment
```

**Critical Path: 25 days** (not 25 person-days, can be done with 2-3 people)

---

## 13.5 Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| **Database schema conflicts** | High | High | Review schema with team Day 3 |
| **Auth implementation bugs** | Medium | High | Extensive testing Day 1-2 |
| **Performance issues discovered late** | Medium | High | Load test Day 23 |
| **API contract changes needed** | Medium | Medium | Frontend + Backend pair programming |
| **OpenRouter API issues** | Low | High | Implement fallbacks Day 17 |
| **Team availability** | Medium | High | Assign backups for each role |

---

## Summary Table

| Phase | Days | Focus | Deliverables |
|-------|------|-------|--------------|
| **1: Foundation** | 1-8 | Infrastructure | Auth, DB, Middleware, Logging |
| **2: Core Features** | 9-16 | Business Logic | Room CRUD, Booking workflow |
| **3: Integration** | 17-22 | User Experience | Frontend real data, AI features |
| **4: Hardening** | 23-25 | Production Ready | Tests, Monitoring, Docs |

**Total Timeline:** 25 business days (~5 weeks with 1 week buffer for debugging)

**Go-Live Date:** ~Mid-June 2026 (assuming start ~May 1st)

---

**END OF PRODUCTION AUDIT**

All 13 steps complete. System ready for implementation.
