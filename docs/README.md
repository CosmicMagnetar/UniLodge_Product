# UniLodge — Documentation

This directory is the single source of truth for all technical documentation covering architecture, API contracts, developer setup, and system diagrams for the UniLodge v2 platform.

---

## Table of Contents

- [Documentation Index](#documentation-index)
- [Architecture Overview](#architecture-overview)
- [Visual Diagrams](#visual-diagrams)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Contributing to Docs](#contributing-to-docs)

---

## Documentation Index

| Document | Description |
|---|---|
| [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md) | Full architecture analysis — layers, design patterns, component interactions, and deployment strategy |
| [API_REFERENCE.md](./API_REFERENCE.md) | REST API endpoint reference — request/response schemas, authentication, and error formats |
| [SETUP_GUIDE.md](./SETUP_GUIDE.md) | Local development environment setup, environment variables, and troubleshooting |
| [AI_ENGINE_SETUP.md](./AI_ENGINE_SETUP.md) | AI engine configuration — LLM integration, RAG pipeline, and OpenRouter API setup |

---

## Architecture Overview

UniLodge v2 follows a **layered monorepo architecture** with a decoupled AI engine. All three applications communicate over HTTP/REST and share a common TypeScript type package.

```
Client (Browser)
    │
    │  HTTPS
    ▼
Frontend — Next.js 14                    (port 3000)
    │
    │  REST API  ·  JWT Bearer Token
    ▼
Backend API — Express.js                 (port 5000)
    ├── MongoDB        (document storage)
    └── PostgreSQL     (analytics & transactional data)

AI Engine — Express.js                   (port 3002)
    └── OpenRouter API (LLM inference — chat, pricing, recommendations)
```

### Core Capabilities

| Feature | Description |
|---|---|
| **Authentication** | JWT-based login and registration with role enforcement |
| **Room Management** | Search, availability tracking, warden-managed listings |
| **Booking Workflow** | Request → Approval → Payment → Check-in → Check-out |
| **Payment Processing** | Stripe-integrated payment and refund handling |
| **AI Chat** | RAG-enabled assistant for students, wardens, and admins |
| **Price Suggestions** | ML-driven pricing recommendations with market analysis |
| **Notifications** | In-app alerts and transactional email via SendGrid |
| **Reviews** | Post-stay room ratings and written feedback |

### User Roles

| Role | Responsibilities |
|---|---|
| **Guest / Student** | Browse rooms, submit bookings, make payments, chat with AI |
| **Warden** | Manage room listings, approve bookings, process check-ins |
| **Administrator** | Platform oversight, analytics, warden management, room approvals |

---

## Visual Diagrams

All diagrams are located in [`diagrams/diagram-images/`](./diagrams/diagram-images/) and are organized by category.

### Use Case Diagrams

Illustrate what each actor can do within the system.

| File | Description |
|---|---|
| `usecase/01-student-usecases.png` | Student portal — room discovery, bookings, AI chat |
| `usecase/02-warden-usecases.png` | Warden operations — guest management, check-ins |
| `usecase/03-admin-usecases.png` | Admin dashboard — analytics, approvals, user management |
| `usecase/04-system-overview.png` | All actors and external service integrations |

### Class Diagrams

Show the structure of domain services and their relationships.

| File | Description |
|---|---|
| `class/01-core-entities.png` | Core domain model — User, Room, Booking, Payment |
| `class/02-auth-service.png` | Authentication service architecture |
| `class/03-room-service.png` | Room management service layer |
| `class/04-booking-service.png` | Booking lifecycle and state transitions |
| `class/05-notification-chat-service.png` | Notification and messaging services |

### Entity-Relationship Diagrams

Represent the database schema across both MongoDB and PostgreSQL.

| File | Description |
|---|---|
| `er/01-core-identity.png` | User authentication and profile schema |
| `er/02-rooms.png` | Room listings and availability schema |
| `er/03-bookings.png` | Booking records and payment schema |
| `er/04-messaging.png` | Chat messages and notifications schema |

### Sequence Diagrams

Trace end-to-end flows through the system for each key operation.

| File | Description |
|---|---|
| `sequence/01-auth-register.png` | New user registration flow |
| `sequence/02-auth-login.png` | User login and token issuance |
| `sequence/03-booking-search.png` | Room search with AI-assisted recommendations |
| `sequence/04-booking-create.png` | Booking creation and warden notification |
| `sequence/05-booking-payment.png` | Stripe payment processing and status update |
| `sequence/06-ai-chat.png` | RAG-powered AI chat interaction |
| `sequence/07-admin-approval.png` | Room listing approval workflow |

---

## Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Next.js 14, React, TypeScript | Web application with App Router |
| Backend | Express.js, Node.js, TypeScript | REST API and business logic |
| Validation | Zod | Runtime schema validation and type inference |
| Databases | MongoDB, PostgreSQL | Document storage and structured analytics |
| Authentication | JWT | Stateless token-based auth with RBAC |
| Payments | Stripe | Payment processing and refunds |
| Email | SendGrid | Transactional email delivery |
| AI | OpenRouter API | Multi-model LLM inference |
| Testing | Jest, Cypress | Unit and end-to-end test coverage |
| Hosting | Vercel (Frontend), Railway (Backend) | Cloud deployment |

---

## Project Structure

```
unilodge/
├── apps/
│   ├── frontend/              # Next.js 14 web application
│   ├── backend/               # Express.js REST API server
│   └── ai-engine/             # AI microservice (RAG pipeline)
├── packages/
│   └── shared/                # Shared Zod schemas and TypeScript types
├── docs/                      # This directory
│   ├── diagrams/              # PlantUML sources and rendered diagram images
│   ├── migration/             # Database migration guides
│   ├── SYSTEM_DESIGN.md       # Architecture and design pattern analysis
│   ├── API_REFERENCE.md       # Endpoint reference documentation
│   ├── SETUP_GUIDE.md         # Developer environment setup
│   ├── AI_ENGINE_SETUP.md     # AI engine configuration
│   └── README.md              # This file
└── docker-compose.yml         # Local development stack
```

---

## Getting Started

### New Developer

1. Follow [SETUP_GUIDE.md](./SETUP_GUIDE.md) to configure your local environment.
2. Read [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md) for an architectural overview.
3. Consult [API_REFERENCE.md](./API_REFERENCE.md) before writing any API integration code.

### System Architect

1. Start with the [Architecture Overview](#architecture-overview) section above.
2. Review the [Class Diagrams](#class-diagrams) to understand service boundaries.
3. Read the design patterns section in [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md).

### AI / ML Engineer

1. Configure the LLM integration via [AI_ENGINE_SETUP.md](./AI_ENGINE_SETUP.md).
2. Review the RAG pipeline and `AIService` documentation in [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md).
3. See the AI endpoint specifications in [API_REFERENCE.md](./API_REFERENCE.md).

---

## Contributing to Docs

When submitting changes that affect documented behaviour:

- **Architecture changes** → Update [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md) and regenerate relevant diagrams.
- **New or modified endpoints** → Update [API_REFERENCE.md](./API_REFERENCE.md) with the full request/response schema.
- **Environment or setup changes** → Reflect updates in [SETUP_GUIDE.md](./SETUP_GUIDE.md).
- **AI configuration changes** → Update [AI_ENGINE_SETUP.md](./AI_ENGINE_SETUP.md).
- **New user flows** → Add a sequence diagram to `diagrams/` and link it in [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md).

All documentation is written in Markdown and rendered by GitHub. Keep line lengths reasonable and prefer tables over long bullet lists where structure aids readability.
