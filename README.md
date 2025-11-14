<div align="center">

# Cherut

**Master Your Life System**

A premium personal excellence platform for systematic self-mastery. Build discipline, break limits, and dominate every aspect of your life.

[Overview](#overview) • [MVP Scope](#mvp-scope) • [Tech Stack](#tech-stack) • [Getting Started](#getting-started)

---

</div>

## Overview

Cherut is a **premium personal excellence platform** for high-performers, entrepreneurs, and those committed to systematic self-mastery. This isn't another productivity app—it's your command center for total life optimization.

**English-First Platform** - Designed for global high-achievers.

### Core Philosophy

From **Life Purpose** to **Daily Tasks** - a complete hierarchical system:

```
Life Purpose (your "why")
    ↓
Master Goals (vision across life areas)
    ↓
Objectives (OKR methodology)
    ↓
Key Results (measurable outcomes)
    ↓
Action Plans (structured execution)
    ↓
Tasks (daily actions)
```

### Why Cherut?

- **Premium Experience** - Built for those who demand excellence
- **Holistic System** - All modules interconnect seamlessly
- **Data-Driven** - Strategic planning meets daily execution
- **Privacy-First** - Bitcoin payments, no data selling

---

## 🎯 MVP Scope (Core Plan)

### What We're Building (Phase 1)

**✅ Included in MVP:**

**1. Profile & Foundation**
- User Profile (basic info, settings)
- Life Purpose (one sentence - editable)
- Master Goals (vision across life areas - editable)

**2. Core Planning System**
- Mission Control Dashboard (12 Life Areas)
- Objectives (OKR methodology, up to 5 active)
- Key Results (min 3 per objective, measurable progress)
- Action Plans (6-field structure per KR: What, Why, Where, How, How Much, Who)

**3. Task Management (Trello-like)**
- Linked Tasks (from Action Plans)
- Standalone Tasks (ad-hoc work)
- Limit: 50 active tasks total
- Features: Subtasks, Checklists, Recurring, Parent/Child, Priority, Labels, Attachments
- Views: Today, Kanban, Calendar, List, Hierarchy, GTD Inbox

**4. Habits & Tracking**
- Habits (up to 10 active with streak tracking)
- Vision Board (up to 10 items)
- Daily Reflection (mood, energy, gratitude)
- Manual Time Tracker

**5. Payment Integration**
- BTCPay Server (Bitcoin payments)
- Subscription management
- Invoice handling

**❌ Post-MVP (Future):**
- Analytics & Reports
- Social Sharing
- Admin Dashboard
- Mobile App (Expo)
- Pro/Master Plans (AI features)
- Community Features
- Integrations (Trello, Calendar, etc.)

---

## 💎 Future Pricing Tiers

| Plan | Price | Features |
|------|-------|----------|
| **Core** | $10/month (Bitcoin) | All MVP features |
| **Pro** | $20/month | + AI suggestions, Analytics, Integrations |
| **Master** | $30/month | + Adaptive AI, Predictive insights, Automations |

**MVP Focus:** Core plan only (Web app only)

---

## Architecture

### MVP: Modular Monolith

```
┌─────────────────────────────────────────────────┐
│          Landing Page (Next.js)                 │
│  - Pricing presentation                         │
│  - Feature showcase                             │
│  - BTCPay integration                           │
└─────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────┐
│        BTCPay Server (Bitcoin Payments)         │
│  - Invoice creation                             │
│  - Payment verification                         │
│  - Webhook handling                             │
└─────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────┐
│     Authentication (Firebase Auth)              │
│  - Email/Password + Google OAuth                │
│  - JWT token generation                         │
└─────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────┐
│      Web Dashboard (Next.js)                    │
│  - User profile & settings                      │
│  - Life Areas, Goals, Tasks, Habits             │
└─────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────┐
│      Modular Monolith API (NestJS)              │
│  ├── Auth Module                                │
│  ├── Users Module (Profile, Life Purpose)       │
│  ├── Life Areas Module                          │
│  ├── Objectives Module (OKRs)                   │
│  ├── Key Results Module                         │
│  ├── Action Plans Module                        │
│  ├── Tasks Module (Linked + Standalone)         │
│  ├── Habits Module                              │
│  ├── Vision Board Module                        │
│  ├── Reflection Module                          │
│  ├── Time Tracker Module                        │
│  └── Payments Module (BTCPay)                   │
└─────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────┐
│       Firebase Firestore (Database)             │
│  - Real-time sync                               │
│  - Offline support                              │
│  - User data isolation                          │
└─────────────────────────────────────────────────┘
```

### Future: Microservices (Post-MVP)

When launching Pro/Master plans:
- AI Service (Python/FastAPI) - Goal suggestions, predictions
- Analytics Service (NestJS) - Advanced metrics, reports
- Notification Service - Smart reminders

---

## Tech Stack

### Frontend (Web Only - MVP)

```
Framework        Next.js 14+ (App Router)
Language         TypeScript
UI Library       Tailwind CSS + Headless UI
Components       Radix UI Primitives
Icons            Lucide React
Charts           Recharts
State            React Hooks + TanStack Query
Forms            React Hook Form + Zod
```

### Backend (Modular Monolith)

```
Framework        NestJS
Language         TypeScript
Architecture     Modular Monolith
API              RESTful
Validation       class-validator + class-transformer
Auth             Passport + JWT
Payments         BTCPay Server API
```

### Infrastructure

```
Database         Firebase Firestore (Free tier → Blaze)
Storage          Firebase Storage
Authentication   Firebase Auth
Payments         BTCPay Server (self-hosted or managed)
Hosting (Web)    Vercel (Free → Pro $20)
Hosting (API)    Render (750h free → $7)
Email            Resend (3K/month free)
Monitoring       Sentry (5K errors free)
CI/CD            GitHub Actions (2000 min free)

Development Cost: $0/month
Production Cost:  ~$30-50/month (scales with users)
```

---

## Data Model

### Complete Hierarchy

```
User
 ├── Profile
 │    ├── Basic info (name, email, photo, birth date)
 │    ├── Life Purpose (one sentence)
 │    └── Master Goals (vision per life area)
 │
 ├── Subscription (BTCPay)
 │    ├── Status: active / canceled / expired
 │    └── Plan: core (MVP only)
 │
 ├── LifeArea (12 default domains)
 │    │
 │    ├── Objective (up to 5 active)
 │    │    ├── Cycle: configurable (default 3 months)
 │    │    ├── Status: On Track / At Risk / Behind / Completed
 │    │    │
 │    │    └── KeyResult (min 3 per objective)
 │    │         ├── Target & Current progress
 │    │         ├── Completion %
 │    │         │
 │    │         └── ActionPlan (one per KR)
 │    │              ├── What, Why, Where, How, How Much, Who
 │    │              │
 │    │              └── Task (Linked - from action plan)
 │    │                   ├── Title, Description, Due Date
 │    │                   ├── Recurring, Priority, Status, Labels
 │    │                   ├── Parent/Child relationships
 │    │                   ├── Subtasks (unlimited nesting)
 │    │                   └── Checklists, Attachments
 │    │
 │    ├── Standalone Tasks (independent)
 │    │    └── Same structure as linked tasks
 │    │
 │    └── Habit (up to 10 active)
 │         ├── Frequency, Time slots, Streaks
 │         └── HabitLog (completion tracking)
 │
 ├── VisionBoardItem (up to 10 items)
 ├── DailyReflection (mood, energy, gratitude)
 └── TimeLog (manual time tracking)
```

---

## Getting Started

### Prerequisites

**For Development:**
- Node.js 18+ and npm
- Firebase account
- BTCPay Server instance (or test server)
- Vercel account (deployment)
- Git

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/cherut.git
cd cherut

# Install dependencies
cd apps/api && npm install
cd ../web && npm install
```

### Firebase Setup

1. Create Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication (Email/Password, Google)
3. Create Firestore database
4. Enable Firebase Storage
5. Download service account credentials
6. Copy config to environment files

### BTCPay Server Setup

1. Set up BTCPay Server instance (self-hosted or managed)
2. Create store and API key
3. Configure webhook URL for payment notifications
4. Add credentials to environment variables

### Running Locally

```bash
# Terminal 1 - API
cd apps/api
npm run start:dev

# Terminal 2 - Web
cd apps/web
npm run dev
```

Access:
- Web: http://localhost:3000
- API: http://localhost:3002

---

## Development Progress


# Future Roadmap


# Cherut Web – Generic Feature Roadmap

- Implement a complete notification system (web push, in-app notifications, notification center, user preferences).
- Add profile photo CRUD (upload, update, delete, preview, compression, validation).
- Implement a full LGPD-compliant account deletion flow, removing all user-related data and generating anonymized internal logs.
- Integrate task visualization with the Time Tracker, enabling time-per-task tracking and automatic synchronization.
- Integrate task visualization with the Calendar, enabling creation and manipulation of events based on tasks.
- Build the payment system (credit card, debit card, Pix, boleto) with external API integrations, plan management, billing, and webhooks.
- Develop the CherutOS module (modular workspace, internal apps, customizable dashboard, extensions system, customizable layout).
- Implement the Values module (personal values, alignment tracking, insights, metrics).
- Create the Journal module (text/audio/image entries, templates, AI insights, semantic search).
- Implement the Reports module (productivity, time tracking, calendar, values, journal, export formats).

## Post-MVP

- Analytics & Reports (advanced analytics, dashboards, user behavior insights).
- Mobile App (Expo – iOS/Android).
- Admin Dashboard (user management, metrics, billing control).
- Pro/Master Plans (advanced AI features, automation, predictive analytics).
- Community Features (groups, shared boards, accountability partners, comments).
- Integrations (Google Calendar, Notion, Slack, GitHub, Zapier, etc.).

## All Features (Complete List)

(MVP + Post-MVP)

- Notification system (web push + in-app + preferences).
- Profile photo CRUD.
- LGPD-compliant account deletion (full data wipe).
- Tasks integrated with Time Tracker.
- Tasks integrated with Calendar.
- Full payment system (cards, Pix, boleto, plans, billing, webhooks).
- CherutOS (workspace, apps, dashboard, extensions, customization).
- Values module (personal values, alignment scoring, insights).
- Journal module (text/audio/image, templates, AI insights, semantic search).
- Reports module (productivity, time tracking, values, journal, exports).
- Analytics & Reports (advanced).
- Mobile App (Expo).
- Admin Dashboard.
- Pro/Master Plans with advanced AI capabilities.
- Community features.
- Integrations with external platforms.

---

## License

This project is proprietary software. All rights reserved.

---

## Support

For questions or issues:
- Open an issue on GitHub
- Contact: [your-email]

---

<div align="center">

**Built with focus, designed for excellence**

Cherut - Your Personal Excellence Platform

</div>
