# PRODUCTION AUDIT: STEP 1 - DEEP STRUCTURE ANALYSIS

**Date:** 2026-04-26 | **Scope:** unilodge-new folder ONLY | **Status:** Evidence-Based Analysis

---

## 1. CODEBASE STRUCTURE AUDIT

### 1.1 File Inventory & Purpose (Code-Backed)

#### Frontend (`apps/frontend`)
| File | Purpose | Status | Evidence |
|------|---------|--------|----------|
| `app/layout.tsx` | Next.js root layout | ✅ Active | Wraps page content, Next.js App Router |
| `app/page.tsx` | Homepage entry point | ✅ Active | Landing page component |
| `lib/pages/*.tsx` | Role-specific dashboards | ⚠️ Partial | 9 page files: LoginPage, GuestDashboard, AdminDashboard, etc. |
| `lib/services/api.ts` | API client wrapper | ✅ Active | ~180 lines, defines `api` object with 30+ endpoints |
| `lib/services/geminiService.ts` | Google Gemini integration | ⚠️ Unused | Imported but never called in components |
| `components/` | 20+ UI components | ⚠️ Mixed state | Most are shells; e.g., ChatWidget, BookingRequestModal |
| `contexts/ThemeContext.tsx` | Theme provider | ✅ Active | Provides dark/light mode |
| `hooks/useToast.ts` | Toast notifications | ✅ Active | Single hook for toast state |
| `public/config.ts` | Frontend config | ✅ Active | Exports config object (not used) |
| `types.ts` | Type definitions | ⚠️ Minimal | Only 10 lines, empty interface definitions |

**Finding:** 40+ component files exist but most are non-functional shells. Only ~10% are production-ready.

---

#### Backend (`apps/backend`)
| File | Purpose | Status | Evidence |
|------|---------|--------|----------|
| `src/server.ts` | Express app entry | ✅ Active | Initializes Express, mounts routes, sets up middleware |
| `src/routes/ai.ts` | AI endpoints | ✅ Complete | 6 endpoints: `/health`, `/chat`, `/price-suggestion`, `/recommendations`, `/analyze`, `/respond` |
| `src/routes/property.ts` | Property endpoints | ❌ Stub | 1 endpoint returning mock data (2 rooms hardcoded) |
| `src/services/index.ts` | Business logic | ❌ Stub | 3 classes with TODO comments: RoomService, BookingService, AuthService |
| `src/db/index.ts` | Database connection | ✅ Active | PostgreSQL Pool setup |

**Critical Issue:** Backend services are **completely stubbed**:
- `RoomService.searchRooms()` → returns empty array (TODO)
- `BookingService.createBooking()` → returns null (TODO)
- `AuthService.login()` → returns null (TODO)

---

#### AI Engine (`apps/ai-engine`)
| File | Purpose | Status | Evidence |
|------|---------|--------|----------|
| `src/index.ts` | AIService class | ✅ Complete | 316 lines, fully implemented with OpenRouter integration |

**Strengths:**
- Full implementation of 5 methods:
  - `processChat()` - lines 104-195
  - `suggestPrice()` - lines 135-169
  - `recommendRooms()` - lines 174-213
  - `analyzeDescription()` - lines 219-251
  - `generateResponse()` - lines 256-262

---

#### Alternative Architecture (`/src`)
| Path | Purpose | Status | Evidence |
|------|---------|--------|----------|
| `src/domains/ai/services/ai.service.ts` | **Production AI Service** | ✅ Advanced | 412 lines, DDD pattern with dependency injection |
| `src/domains/ai/repositories.ts` | Repository interfaces | ✅ Interfaces | Defines: IPropertyRepository, IAIMemoryRepository, IHuggingFaceLLMRepository, INotificationRepository |
| `src/domains/ai/types.ts` | Type definitions with Zod | ⚠️ Partial | Defines branded types for type safety |

**Critical Finding:** There are **TWO separate implementations** of AIService:
1. **Simple:** `apps/ai-engine/src/index.ts` (316 lines)
2. **Advanced:** `src/domains/ai/services/ai.service.ts` (412 lines, DDD pattern)

The advanced version is **NOT being used** because it's in `/src` (monorepo root), not in `apps/ai-engine`.

---

#### Shared Package (`packages/shared`)
| File | Purpose | Status | Evidence |
|------|---------|--------|----------|
| `src/types.ts` | Shared interfaces | ⚠️ Minimal | 49 lines, defines: User, Room, Booking, ChatMessage, APIResponse |
| `src/index.ts` | Barrel export | ✅ Active | Re-exports types |

---

#### Test Suite (`tests/`)
| File | Purpose | Status | Evidence |
|------|---------|--------|----------|
| `unit/services.test.ts` | Service unit tests | ✅ Complete | 230 lines, 21 test cases |
| `integration/api.test.ts` | API integration tests | ✅ Complete | 358 lines, 26 test cases |
| `e2e/workflows.test.ts` | User journey tests | ✅ Complete | 392 lines, 16 test cases |
| `frontend/components.test.ts` | Component tests | ✅ Complete | 313 lines, 20 test cases |
| `ai-engine/services.test.ts` | AI engine tests | ⚠️ Empty | File exists but no meaningful tests |

---

### 1.2 Root-Level Files (Cleanup Candidates)

| File | Purpose | Size | Status | Issue |
|------|---------|------|--------|-------|
| `mock-api.js` | Development mock server | ~400 lines | ⚠️ Unused | Parallel implementation to Express backend |
| `rewrite.py` | Git history rewriter | 46 lines | ⚠️ Dangerous | Modifies commit metadata (non-production) |
| `test-api.sh` | Manual API testing | ~50 lines | ⚠️ Unused | Ad-hoc testing script |
| `verify-setup.sh` | Environment verification | ~50 lines | ⚠️ Unused | Duplicates npm scripts |
| `docker-compose.yml` | Service orchestration | ✅ Active | References MongoDB (conflict: /docs says PostgreSQL) |

**Critical**: `docker-compose.yml` specifies **MongoDB** (line 23), but `apps/backend/src/db/index.ts` uses **PostgreSQL**. This is an **architectural conflict**.

---

### 1.3 Configuration Files

| File | Content | Status | Issue |
|------|---------|--------|-------|
| `tsconfig.base.json` | Base TypeScript config | ✅ OK | Properly configured |
| `apps/*/tsconfig.json` | App-specific configs | ✅ OK | Extends base config |
| `apps/backend/.eslintrc.json` | Backend lint rules | ✅ OK | Standard setup |
| `package.json` | Root monorepo config | ✅ OK | 4 workspaces defined correctly |
| `.env.example` | Environment template | ⚠️ Minimal | Only 2 variables defined |

---

## 2. INCOMPLETE IMPLEMENTATIONS (Code References)

### 2.1 Backend Services - All Stubs

**File:** `apps/backend/src/services/index.ts`

```typescript
export class RoomService {
  async searchRooms(_query: any) {
    // TODO: Implement room search logic
    return [];  // ← Returns empty array, always fails
  }
  async getRoomById(_id: string) {
    // TODO: Implement get room by ID
    return null;  // ← Returns null, always fails
  }
}
```

**Impact:** No core business logic in backend. Frontend cannot function with real data.

---

### 2.2 Property Routes - Mock Data Only

**File:** `apps/backend/src/routes/property.ts` (14 lines)

```typescript
const properties = [
  { id: 1, name: 'Skyline Residency', price: 1200, location: 'Near Campus' },
  { id: 2, name: 'Green Valley', price: 950, location: 'Downtown' }
];

router.get('/', (_req, res) => {
  res.json(properties);  // ← Returns 2 hardcoded rooms, no DB query
});
```

**Impact:** Cannot manage real properties. Routes don't connect to database.

---

### 2.3 Database Connection - No Queries

**File:** `apps/backend/src/db/index.ts` (11 lines)

```typescript
export const query = (text: string, params?: any[]) => pool.query(text, params);
```

**Finding:** Connection pool exists but **never used in any service**. Services don't import this.

---

### 2.4 Two Conflicting AI Implementations

**Location 1:** `apps/ai-engine/src/index.ts` (316 lines)
- Simple implementation
- Uses OpenRouter directly
- NOT using Repository Pattern

**Location 2:** `src/domains/ai/services/ai.service.ts` (412 lines)
- DDD pattern with dependency injection
- Uses Repository interfaces
- **NOT being loaded by the application**

**Finding:** The advanced version in `/src` is dead code. The backend loads from `apps/ai-engine/src/index.ts` only.

---

## 3. ARCHITECTURAL INCONSISTENCIES

### 3.1 Database Conflict

| Component | Database | Evidence |
|-----------|----------|----------|
| `docker-compose.yml` | MongoDB | Line 23: `mongo:7.0` image |
| `apps/backend/src/db/index.ts` | PostgreSQL | Line 1: `import { Pool } from 'pg'` |
| `README.md` | PostgreSQL | Mentions "PostgreSQL 15+" |
| `package.json` (backend) | Both | `"mongodb": "^6.0.0"` AND `"pg": "^8.20.0"` |

**Critical:** The system is configured for **both** MongoDB AND PostgreSQL with no clear strategy.

---

### 3.2 Frontend API Configuration

**File:** `apps/frontend/lib/services/api.ts` (line 1)

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
  typeof window !== 'undefined' ? 'http://localhost:3001/api' : 'http://localhost:3001/api';
```

**Issue:** API client expects `http://localhost:3001/api` but `docker-compose.yml` runs backend on port 5001.

---

### 3.3 Two Service Initialization Patterns

**Pattern 1 - Backend (Simple):**
```typescript
// apps/backend/src/server.ts
const app = express();
const PORT = process.env.PORT || 5000;
app.use('/api/ai', aiRouter);
```

**Pattern 2 - `/src` (Advanced DDD):**
```typescript
// src/domains/ai/services/ai.service.ts
export async function createAIService(
  config: AIConfig,
  propertyRepo: IPropertyRepository,
  ...
): Promise<AIService>
```

**Finding:** Two initialization patterns but only the simple one is loaded.

---

## 4. UNUSED/DEAD CODE

### 4.1 Files Not Imported Anywhere

| File | Lines | Evidence | Risk |
|------|-------|----------|------|
| `/src/domains/*` | 400+ | In root `/src`, not imported by apps | HIGH - Dead code |
| `apps/frontend/lib/services/geminiService.ts` | ~200 | Never imported | MEDIUM - Can delete |
| `apps/frontend/public/config.ts` | ~20 | Exported but not used | LOW - Can delete |
| `apps/frontend/types.ts` | ~10 | Duplicate of `/packages/shared/types.ts` | MEDIUM - Redundant |

---

### 4.2 Development/Utility Scripts

| File | Purpose | Used? | Risk |
|------|---------|-------|------|
| `mock-api.js` | Mock server (dev only) | ❌ No | Can delete (use Vitest mocks instead) |
| `rewrite.py` | Git rewriter | ❌ No | **DANGEROUS** - Remove immediately |
| `test-api.sh` | Manual testing | ❌ No | Obsolete - use npm test |
| `verify-setup.sh` | Setup verification | ❌ No | Obsolete - use npm scripts |
| `scripts/start-dev.sh` | Dev startup | ⚠️ Maybe | Unclear if used |

---

## 5. TEST ANALYSIS

### 5.1 Test Coverage Overview

| Test Suite | File | Lines | Test Count | Coverage | Status |
|-----------|------|-------|-----------|----------|--------|
| Unit | `tests/unit/services.test.ts` | 230 | 21 | Services only | ✅ Good |
| Integration | `tests/integration/api.test.ts` | 358 | 26 | API endpoints | ✅ Good |
| E2E | `tests/e2e/workflows.test.ts` | 392 | 16 | User journeys | ✅ Good |
| Component | `tests/frontend/components.test.ts` | 313 | 20 | Component logic | ✅ Good |
| AI Engine | `tests/ai-engine/services.test.ts` | Empty | 0 | None | ❌ Missing |

**Finding:** E2E and integration tests use **mocks**, not real services. No tests hit actual backend because services are stubs.

---

### 5.2 Test Quality Issues

1. **Mock-Only Tests** - All tests use in-memory simulators, not real backend
2. **No AI Engine Tests** - File exists but empty
3. **No Frontend E2E** - No Playwright/Cypress tests
4. **No Database Tests** - No migration or schema validation tests

---

## 6. DEPENDENCY ISSUES

### 6.1 Unused Dependencies

**Backend `package.json`:**
```json
"mongodb": "^6.0.0"        // ← Installed but not used
"pg": "^8.20.0"            // ← Used but version mismatch with Docker
```

**Frontend `package.json`:**
```json
"@google/genai": "^1.28.0"              // ← Installed, not used
"@google/generative-ai": "^0.24.1"      // ← Installed, not used
"mongodb": "^6.20.0"                    // ← Installed, not used in frontend
```

---

## 7. CONFIGURATION GAPS

### 7.1 `.env.example` is Incomplete

Current:
```env
# Only 2 variables
DATABASE_URL=...
JWT_SECRET=...
```

Missing (from code):
```env
OPENROUTER_API_KEY=
OPENROUTER_MODEL=
OPENROUTER_ENDPOINT=
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_SUPABASE_URL=
CORS_ORIGIN=
AI_CHATBOT_ENABLED=
NODE_ENV=
PORT=
```

---

## 8. SUMMARY OF CRITICAL FINDINGS

| Issue | Severity | Count | Evidence |
|-------|----------|-------|----------|
| **Stub Services** | CRITICAL | 3 classes | `apps/backend/src/services/index.ts` |
| **Database Conflict** | CRITICAL | 1 conflict | MongoDB vs PostgreSQL |
| **Dead Code (`/src`)** | HIGH | 400+ lines | Not loaded by app |
| **Unused Files** | MEDIUM | 5 files | mock-api.js, rewrite.py, etc. |
| **Unused Dependencies** | MEDIUM | 3+ packages | MongoDB, Google APIs |
| **Test Gaps** | MEDIUM | 2 suites missing | AI Engine, Frontend E2E |
| **Config Mismatch** | MEDIUM | 3 conflicts | Port, DB, API URL |

---

## 9. ARCHITECTURAL STATE ASSESSMENT

### ✅ What's Working
- AI Engine implementation (complete)
- Route definitions (express configured)
- Test framework (vitest set up)
- Frontend components (shells exist)
- TypeScript configuration (proper)

### ❌ What's Broken/Incomplete
- Backend services (stubs only)
- Database setup (conflicting configs)
- Property routes (mock data only)
- Frontend integration (no real API calls)
- Documentation (outdated)

### ⚠️ What's Ambiguous
- Which database to use (MongoDB or PostgreSQL?)
- Why are there two AI implementations?
- Is `/src` folder dead code?
- Which PORT should backend use (5000 or 5001)?

---

## READY FOR STEP 2?

This audit establishes the **evidence base** for architecture decisions. Before proceeding to diagram generation, confirm:

1. ✅ Database selection (MongoDB OR PostgreSQL, not both)
2. ✅ Resolution of `/src` vs `apps/` split
3. ✅ Port configuration (backend port)
4. ✅ Decision on mock-api.js and utility scripts

**Proceed to Step 2: Real Architecture Mapping** when ready.
