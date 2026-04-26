# UniLodge Documentation

Welcome to the UniLodge platform documentation. This folder contains comprehensive guides for understanding, developing, and deploying the system.

## 📚 Documentation Index

### Core Documentation

- **[SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md)** - Complete system architecture, component design, data flows, and deployment strategy with visual diagrams
- **[API_REFERENCE.md](./API_REFERENCE.md)** - Complete REST API endpoint documentation
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Local development environment setup and configuration
- **[AI_ENGINE_SETUP.md](./AI_ENGINE_SETUP.md)** - AI engine configuration and LLM integration

### Visual Diagrams

All diagrams are located in `diagrams/diagram-images/` and organized by type:

#### Class Diagrams (Architecture)
- `class/01-core-entities.png` - Domain model entities
- `class/02-auth-service.png` - Authentication service architecture
- `class/03-room-service.png` - Room management service
- `class/04-booking-service.png` - Booking lifecycle service
- `class/05-notification-chat-service.png` - Notifications and messaging

#### Entity-Relationship Diagrams (Database Schema)
- `er/01-core-identity.png` - User authentication schema
- `er/02-rooms.png` - Room listings schema
- `er/03-bookings.png` - Booking and payment schema
- `er/04-messaging.png` - Chat and notifications schema

#### Sequence Diagrams (User Flows)
- `sequence/01-auth-register.png` - User registration flow
- `sequence/02-auth-login.png` - User login flow
- `sequence/03-booking-search.png` - Room search and discovery
- `sequence/04-booking-create.png` - Booking creation process
- `sequence/05-booking-payment.png` - Payment processing
- `sequence/06-ai-chat.png` - AI-powered chat interaction
- `sequence/07-admin-approval.png` - Room approval workflow

---

## 🚀 Quick Start

### For New Developers
1. Read [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Get your environment ready
2. Review [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md) - Understand the architecture
3. Check [API_REFERENCE.md](./API_REFERENCE.md) - Learn the API endpoints

### For System Architects
1. Start with [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md) overview
2. Review the diagram sections to visualize components
3. Check deployment architecture at the end

### For AI/ML Integration
1. See [AI_ENGINE_SETUP.md](./AI_ENGINE_SETUP.md) - Configure LLM services
2. Review AI service diagrams in [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md)
3. Check API endpoints for AI features

---

## 📋 Project Structure

```
unilodge-new/
├── apps/
│   ├── frontend/          # Next.js web application
│   ├── backend/           # Express API server
│   └── ai-engine/         # AI microservice
├── packages/
│   └── shared/            # Shared TypeScript types & utilities
├── docs/                  # This directory
│   ├── diagrams/          # Visual diagrams
│   ├── migration/         # Database migration guides
│   ├── SYSTEM_DESIGN.md   # System architecture & design
│   ├── API_REFERENCE.md   # API documentation
│   ├── SETUP_GUIDE.md     # Developer setup
│   ├── AI_ENGINE_SETUP.md # AI configuration
│   └── README.md          # This file
└── docker-compose.yml     # Local development stack
```

---

## 🏗️ System Architecture at a Glance

```
Client Browser (Student/Warden/Admin Portal)
    ↓ HTTPS
Frontend (Next.js, port 3000)
    ↓ REST API
Backend API (Express, port 5001)
    ├── MongoDB (Documents)
    └── PostgreSQL (Analytics)
    
AI Engine (Express, port 3002)
    ↓ API
OpenRouter (LLM Inference)
```

**Key Features**:
- **Authentication**: JWT-based with email verification
- **Room Management**: Search, listing, availability tracking
- **Bookings**: Request approval workflow, payment processing
- **Reviews**: Room ratings and feedback
- **Notifications**: In-app alerts and email
- **Chat**: AI-assisted messaging between users

---

## 🔐 Technology Stack

| Component | Technology |
|-----------|-----------|
| Frontend | Next.js 14, React, TypeScript |
| Backend | Express.js, Node.js |
| Databases | MongoDB, PostgreSQL |
| Authentication | JWT |
| Payments | Stripe |
| Email | SendGrid |
| AI | OpenRouter API |
| Hosting | Vercel (Frontend), Railway (Backend) |

---

## 📖 How to Use This Documentation

- **Troubleshooting**: Check [SETUP_GUIDE.md](./SETUP_GUIDE.md) common issues section
- **Adding Features**: Review [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md) architecture first
- **API Integration**: Consult [API_REFERENCE.md](./API_REFERENCE.md) for exact endpoints
- **Visual Understanding**: Review the diagrams in `diagrams/diagram-images/`

---

## 🤝 Contributing

When adding new features or documentation:
1. Update [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md) if architecture changes
2. Update [API_REFERENCE.md](./API_REFERENCE.md) for new endpoints
3. Add or update diagrams in `diagrams/` if flows change
4. Keep this README current with changes

---

## 📞 Support

- **Setup Issues**: See SETUP_GUIDE.md
- **API Questions**: See API_REFERENCE.md
- **Architecture Understanding**: See SYSTEM_DESIGN.md with diagrams
- **AI Configuration**: See AI_ENGINE_SETUP.md
