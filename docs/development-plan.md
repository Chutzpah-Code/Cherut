# 🚀 Plano de Desenvolvimento - Cherut

## Estratégia: Backend-First Approach

Baseado nas suas respostas, vamos seguir uma abordagem **backend-first**, construindo feature por feature com explicações detalhadas.

---

## 📋 Fase 0: Fundação do Projeto (Dias 1-2)

### Objetivo
Criar a estrutura base do monorepo e configurar o backend (NestJS).

### Tarefas

#### 0.1 - Estrutura do Monorepo
```
cherut/
├── apps/
│   ├── api/          # Backend NestJS (COMEÇAREMOS AQUI)
│   ├── web/          # Frontend Next.js (depois)
│   └── mobile/       # Mobile Expo (depois)
├── packages/         # Código compartilhado
│   └── types/        # TypeScript types compartilhados
├── docs/             # Documentação (já existe)
├── README.md         # Documentação principal (já existe)
└── package.json      # Root package.json
```

**O que você vai aprender:**
- O que é um monorepo e por que usar
- Como estruturar um projeto grande em módulos
- Gerenciamento de dependências compartilhadas

#### 0.2 - Setup do Backend (NestJS)
- Inicializar projeto NestJS
- Configurar TypeScript
- Configurar ESLint e Prettier
- Estrutura de módulos

**O que você vai aprender:**
- Arquitetura do NestJS (Controllers, Services, Modules)
- Por que TypeScript é importante
- Boas práticas de formatação de código

#### 0.3 - Configurar Firebase Admin SDK
- Instalar Firebase Admin
- Configurar credenciais
- Testar conexão com Firestore

**O que você vai aprender:**
- Como funciona Firebase Admin (server-side)
- Diferença entre Firebase Client SDK e Admin SDK
- Variáveis de ambiente (.env)

---

## 📋 Fase 1: Sistema de Autenticação (Dias 3-5)

### Objetivo
Implementar autenticação completa com Firebase Auth + JWT.

### Tarefas

#### 1.1 - Auth Module (NestJS)
```typescript
apps/api/src/modules/auth/
├── auth.controller.ts   // Endpoints de login/register
├── auth.service.ts      // Lógica de autenticação
├── auth.module.ts       // Módulo NestJS
├── dto/                 // Data Transfer Objects
│   ├── register.dto.ts
│   └── login.dto.ts
└── guards/              // Proteção de rotas
    └── jwt-auth.guard.ts
```

**Endpoints a criar:**
- `POST /auth/register` - Registrar novo usuário
- `POST /auth/login` - Login
- `POST /auth/logout` - Logout
- `GET /auth/me` - Obter usuário atual

**O que você vai aprender:**
- Como funciona JWT (JSON Web Token)
- Autenticação vs Autorização
- Firebase Authentication (Email/Password, Google OAuth)
- Guards e Middleware no NestJS
- Validação de dados com class-validator

#### 1.2 - User Module
```typescript
apps/api/src/modules/users/
├── users.controller.ts
├── users.service.ts
├── users.module.ts
├── entities/
│   └── user.entity.ts
└── dto/
    └── update-user.dto.ts
```

**Endpoints a criar:**
- `GET /users/profile` - Ver perfil
- `PATCH /users/profile` - Atualizar perfil
- `GET /users/:id` - Ver usuário (admin only)

**O que você vai aprender:**
- Como modelar entidades no Firestore
- CRUD operations (Create, Read, Update, Delete)
- Role-based access control (admin, tester, paid_user)

---

## 📋 Fase 2: Life Areas System (Dias 6-8)

### Objetivo
Implementar o sistema de 12 Life Areas.

### Tarefas

#### 2.1 - Life Areas Module
```typescript
apps/api/src/modules/life-areas/
├── life-areas.controller.ts
├── life-areas.service.ts
├── life-areas.module.ts
├── entities/
│   └── life-area.entity.ts
└── dto/
    ├── create-life-area.dto.ts
    └── update-life-area.dto.ts
```

**Endpoints a criar:**
- `GET /life-areas` - Listar todas as Life Areas do usuário
- `GET /life-areas/:id` - Ver uma Life Area específica
- `POST /life-areas` - Criar Life Area customizada
- `PATCH /life-areas/:id` - Atualizar satisfação (0-10)
- `DELETE /life-areas/:id` - Deletar Life Area customizada

**O que você vai aprender:**
- Como trabalhar com dados hierárquicos no Firestore
- Filtros e queries (ver apenas dados do usuário logado)
- Validação de dados numéricos (satisfação 0-10)
- Soft delete vs Hard delete

#### 2.2 - Seed das 12 Life Areas Padrão
- Script para criar as 12 áreas padrão ao registrar usuário
- Personal Power (4 áreas)
- Professional Drive (4 áreas)
- Relational Strength (4 áreas)

**O que você vai aprender:**
- Database seeding
- Transações no Firestore
- Hooks e eventos (criar áreas automaticamente ao registrar)

---

## 📋 Fase 3: Life Purpose & Master Goals (Dias 9-10)

### Objetivo
Implementar a camada de fundação (Life Purpose e Master Goals).

### Tarefas

#### 3.1 - Profile Module Extension
```typescript
apps/api/src/modules/profile/
├── profile.controller.ts
├── profile.service.ts
├── profile.module.ts
└── dto/
    ├── update-life-purpose.dto.ts
    └── update-master-goals.dto.ts
```

**Endpoints a criar:**
- `GET /profile/life-purpose` - Ver Life Purpose
- `PATCH /profile/life-purpose` - Atualizar Life Purpose
- `GET /profile/master-goals` - Ver Master Goals
- `PATCH /profile/master-goals` - Atualizar Master Goals

**O que você vai aprender:**
- Como estruturar dados complexos no perfil do usuário
- Validação de texto (Life Purpose = 1 sentença)
- Estruturação de dados JSON no Firestore

---

## 📋 Fase 4: OKR System - Objectives (Dias 11-14)

### Objetivo
Implementar o sistema de Objectives (OKR).

### Tarefas

#### 4.1 - Objectives Module
```typescript
apps/api/src/modules/objectives/
├── objectives.controller.ts
├── objectives.service.ts
├── objectives.module.ts
├── entities/
│   └── objective.entity.ts
└── dto/
    ├── create-objective.dto.ts
    └── update-objective.dto.ts
```

**Modelo de Dados:**
```typescript
interface Objective {
  id: string;
  userId: string;
  lifeAreaId: string;
  title: string;
  description: string;
  cycle: number; // em meses (padrão: 3)
  startDate: Date;
  endDate: Date;
  status: 'on_track' | 'at_risk' | 'behind' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}
```

**Endpoints a criar:**
- `GET /objectives` - Listar objectives do usuário
- `GET /objectives/:id` - Ver objective específico
- `POST /objectives` - Criar novo objective
- `PATCH /objectives/:id` - Atualizar objective
- `DELETE /objectives/:id` - Deletar objective (cascata para KRs)

**O que você vai aprender:**
- Como trabalhar com datas no TypeScript
- Cálculo de ciclos (start date + cycle months = end date)
- Status tracking e business logic
- Relacionamentos entre entidades (Objective → Life Area)

---

## 📋 Fase 5: OKR System - Key Results (Dias 15-17)

### Objetivo
Implementar Key Results vinculados aos Objectives.

### Tarefas

#### 5.1 - Key Results Module
```typescript
apps/api/src/modules/key-results/
├── key-results.controller.ts
├── key-results.service.ts
├── key-results.module.ts
├── entities/
│   └── key-result.entity.ts
└── dto/
    ├── create-key-result.dto.ts
    └── update-key-result.dto.ts
```

**Modelo de Dados:**
```typescript
interface KeyResult {
  id: string;
  userId: string;
  objectiveId: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string; // 'users', 'dollars', 'percentage', etc.
  progress: number; // calculado: (current / target) * 100
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

**Endpoints a criar:**
- `GET /objectives/:objectiveId/key-results` - Listar KRs de um objective
- `POST /objectives/:objectiveId/key-results` - Criar KR (mínimo 3)
- `PATCH /key-results/:id` - Atualizar progresso
- `DELETE /key-results/:id` - Deletar KR

**O que você vai aprender:**
- Relacionamentos nested (Objective → Key Result)
- Validação complexa (mínimo 3 KRs por Objective)
- Cálculo de progresso automático
- Atualização em cascata (mudar KR atualiza status do Objective)

---

## 📋 Fase 6: Action Plans (Dias 18-20)

### Objetivo
Implementar Action Plans vinculados aos Key Results.

### Tarefas

#### 6.1 - Action Plans Module
```typescript
apps/api/src/modules/action-plans/
├── action-plans.controller.ts
├── action-plans.service.ts
├── action-plans.module.ts
├── entities/
│   └── action-plan.entity.ts
└── dto/
    ├── create-action-plan.dto.ts
    └── update-action-plan.dto.ts
```

**Modelo de Dados:**
```typescript
interface ActionPlan {
  id: string;
  userId: string;
  keyResultId: string;
  what: string;      // O que será feito
  why: string;       // Por que fazer
  where: string;     // Onde será feito
  how: string;       // Como será executado
  howMuch: string;   // Custo/orçamento
  who: string;       // Responsável
  createdAt: Date;
  updatedAt: Date;
}
```

**Endpoints a criar:**
- `GET /key-results/:krId/action-plan` - Ver action plan de um KR
- `POST /key-results/:krId/action-plan` - Criar action plan (1 por KR)
- `PATCH /action-plans/:id` - Atualizar action plan
- `DELETE /action-plans/:id` - Deletar action plan

**O que você vai aprender:**
- Estruturação de dados complexos (6 campos obrigatórios)
- Relacionamento 1:1 (1 KR → 1 Action Plan)
- Validação de campos obrigatórios

---

## 📋 Fase 7: Tasks System (Dias 21-28)

### Objetivo
Implementar sistema completo de tasks estilo Trello.

### Tarefas

#### 7.1 - Tasks Module (Básico)
```typescript
apps/api/src/modules/tasks/
├── tasks.controller.ts
├── tasks.service.ts
├── tasks.module.ts
├── entities/
│   ├── task.entity.ts
│   ├── subtask.entity.ts
│   └── checklist.entity.ts
└── dto/
    ├── create-task.dto.ts
    ├── update-task.dto.ts
    ├── create-subtask.dto.ts
    └── create-checklist.dto.ts
```

**Modelo de Dados - Task:**
```typescript
interface Task {
  id: string;
  userId: string;

  // Linking (opcional)
  actionPlanId?: string;  // Linked task
  keyResultId?: string;   // Referência para navegação
  objectiveId?: string;   // Referência para navegação
  lifeAreaId?: string;    // Pode ser standalone vinculada a Life Area

  // Task info
  title: string;
  description: string;

  // Dates
  dueDate?: Date;
  recurrence?: {
    pattern: 'daily' | 'weekly' | 'monthly' | 'custom';
    interval: number;
    daysOfWeek?: number[]; // Para weekly
    dayOfMonth?: number;   // Para monthly
  };

  // Organization
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'done' | 'blocked';
  labels: string[];

  // Hierarchy
  parentTaskId?: string;  // Se for subtask

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}
```

**Modelo de Dados - Subtask:**
```typescript
interface Subtask {
  id: string;
  taskId: string;
  title: string;
  completed: boolean;
  order: number;
  createdAt: Date;
}
```

**Modelo de Dados - Checklist:**
```typescript
interface Checklist {
  id: string;
  taskId: string;
  title: string;
  items: ChecklistItem[];
  createdAt: Date;
}

interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
  order: number;
}
```

**Endpoints a criar:**

**Tasks:**
- `GET /tasks` - Listar tasks (com filtros: status, priority, lifeArea, etc.)
- `GET /tasks/:id` - Ver task específica (com subtasks e checklists)
- `POST /tasks` - Criar task (linked ou standalone)
- `PATCH /tasks/:id` - Atualizar task
- `DELETE /tasks/:id` - Deletar task
- `POST /tasks/:id/complete` - Marcar como completa
- `GET /tasks/today` - Tasks do dia (Today View)
- `GET /tasks/hierarchy` - Tasks em estrutura de árvore

**Subtasks:**
- `POST /tasks/:taskId/subtasks` - Criar subtask
- `PATCH /subtasks/:id` - Atualizar subtask
- `DELETE /subtasks/:id` - Deletar subtask

**Checklists:**
- `POST /tasks/:taskId/checklists` - Criar checklist
- `PATCH /checklists/:id` - Atualizar checklist
- `PATCH /checklists/:id/items/:itemId` - Marcar item como checked
- `DELETE /checklists/:id` - Deletar checklist

**O que você vai aprender:**
- Hierarquias complexas (Task → Subtask, Task → Checklist)
- Queries avançadas (filtros múltiplos)
- Recurrence patterns (cron-like scheduling)
- Parent-child relationships com unlimited nesting
- Soft delete e hard delete
- Cálculo de progresso (% de subtasks/checklists completos)

---

## 📋 Fase 8: Habits System (Dias 29-32)

### Objetivo
Implementar sistema de hábitos com tracking e streaks.

### Tarefas

#### 8.1 - Habits Module
```typescript
apps/api/src/modules/habits/
├── habits.controller.ts
├── habits.service.ts
├── habits.module.ts
├── entities/
│   ├── habit.entity.ts
│   └── habit-log.entity.ts
└── dto/
    ├── create-habit.dto.ts
    ├── update-habit.dto.ts
    └── log-habit.dto.ts
```

**Modelo de Dados - Habit:**
```typescript
interface Habit {
  id: string;
  userId: string;
  lifeAreaId?: string;
  objectiveId?: string;

  title: string;
  description: string;

  frequency: {
    type: 'daily' | 'weekly' | 'custom';
    timesPerWeek?: number; // Para custom
    daysOfWeek?: number[]; // Para weekly
  };

  timeSlots?: string[]; // ['06:00', '18:00']

  streak: number;        // Dias consecutivos
  longestStreak: number;
  skipProtection: boolean; // 1 falha permitida

  createdAt: Date;
  updatedAt: Date;
}
```

**Modelo de Dados - Habit Log:**
```typescript
interface HabitLog {
  id: string;
  habitId: string;
  userId: string;
  completedAt: Date;
  intensity?: number;    // 1-10 scale
  notes?: string;
}
```

**Endpoints a criar:**
- `GET /habits` - Listar hábitos
- `POST /habits` - Criar hábito
- `PATCH /habits/:id` - Atualizar hábito
- `DELETE /habits/:id` - Deletar hábito
- `POST /habits/:id/log` - Marcar hábito como completo hoje
- `GET /habits/:id/logs` - Ver histórico de logs
- `GET /habits/:id/streak` - Ver streak atual

**O que você vai aprender:**
- Cálculo de streaks (dias consecutivos)
- Tracking temporal (logs por data)
- Frequency patterns
- Agregações (contar dias consecutivos)

---

## 📋 Fase 9: Vision Board & Reflection (Dias 33-35)

### Objetivo
Implementar Vision Board e Daily Reflection.

### Tarefas

#### 9.1 - Vision Board Module
```typescript
apps/api/src/modules/vision-board/
├── vision-board.controller.ts
├── vision-board.service.ts
└── vision-board.module.ts
```

**Endpoints:**
- `GET /vision-board` - Listar items
- `POST /vision-board` - Adicionar item (imagem, PDF, link)
- `DELETE /vision-board/:id` - Remover item

#### 9.2 - Reflection Module
```typescript
apps/api/src/modules/reflections/
├── reflections.controller.ts
├── reflections.service.ts
└── reflections.module.ts
```

**Endpoints:**
- `GET /reflections` - Listar reflexões
- `POST /reflections` - Criar reflexão diária
- `GET /reflections/today` - Reflexão de hoje

**O que você vai aprender:**
- Upload de arquivos (Firebase Storage)
- Daily entries (uma reflexão por dia)
- Time-based queries

---

## 📋 Fase 10: Analytics & Dashboard (Dias 36-40)

### Objetivo
Criar endpoints de analytics para o dashboard.

### Tarefas

#### 10.1 - Analytics Module
```typescript
apps/api/src/modules/analytics/
├── analytics.controller.ts
├── analytics.service.ts
└── analytics.module.ts
```

**Endpoints:**
- `GET /analytics/overview` - Overview geral
- `GET /analytics/life-areas` - Pulse score das Life Areas
- `GET /analytics/objectives` - Progresso dos Objectives
- `GET /analytics/habits` - Estatísticas de hábitos

**O que você vai aprender:**
- Agregações complexas
- Cálculos de métricas
- Performance optimization

---

## 📋 Fase 11: Admin Dashboard (Dias 41-43)

### Objetivo
Criar endpoints para administração do sistema.

### Tarefas

#### 11.1 - Admin Module
```typescript
apps/api/src/modules/admin/
├── admin.controller.ts
├── admin.service.ts
└── admin.module.ts
```

**Endpoints:**
- `GET /admin/users` - Listar todos usuários
- `GET /admin/users/:id` - Ver usuário específico
- `PATCH /admin/users/:id/role` - Alterar role
- `GET /admin/stats` - Estatísticas do sistema

**O que você vai aprender:**
- Role-based authorization
- Admin-only guards
- System-wide queries

---

## 📋 Fase 12: Stripe Integration (Dias 44-47)

### Objetivo
Integrar Stripe para pagamentos.

### Tarefas

#### 12.1 - Payments Module
```typescript
apps/api/src/modules/payments/
├── payments.controller.ts
├── payments.service.ts
└── payments.module.ts
```

**Endpoints:**
- `POST /payments/create-checkout-session` - Criar sessão de pagamento
- `POST /payments/webhook` - Webhook do Stripe
- `GET /payments/subscription` - Ver assinatura atual
- `POST /payments/cancel-subscription` - Cancelar assinatura

**O que você vai aprender:**
- Stripe SDK
- Webhooks
- Subscription management
- Payment security

---

## 🎯 Resumo das Fases

| Fase | Dias | Módulos | Complexidade |
|------|------|---------|--------------|
| 0 | 1-2 | Setup | ⭐ |
| 1 | 3-5 | Auth + Users | ⭐⭐ |
| 2 | 6-8 | Life Areas | ⭐⭐ |
| 3 | 9-10 | Life Purpose + Master Goals | ⭐ |
| 4 | 11-14 | Objectives | ⭐⭐⭐ |
| 5 | 15-17 | Key Results | ⭐⭐⭐ |
| 6 | 18-20 | Action Plans | ⭐⭐ |
| 7 | 21-28 | Tasks (completo) | ⭐⭐⭐⭐⭐ |
| 8 | 29-32 | Habits | ⭐⭐⭐ |
| 9 | 33-35 | Vision Board + Reflection | ⭐⭐ |
| 10 | 36-40 | Analytics | ⭐⭐⭐⭐ |
| 11 | 41-43 | Admin | ⭐⭐ |
| 12 | 44-47 | Stripe | ⭐⭐⭐⭐ |

**Total estimado: 47 dias (~2 meses trabalhando consistentemente)**

---

## 🎓 O que você vai dominar ao final

### Conceitos Técnicos:
- ✅ Arquitetura NestJS (Modules, Controllers, Services)
- ✅ TypeScript avançado (Interfaces, Types, Generics)
- ✅ Firebase Admin SDK (Firestore, Auth, Storage)
- ✅ Autenticação JWT
- ✅ Role-based access control (RBAC)
- ✅ Validação de dados (class-validator)
- ✅ Relacionamentos de dados (1:1, 1:N, N:N)
- ✅ Queries complexas e agregações
- ✅ Upload de arquivos
- ✅ Webhooks e integração externa (Stripe)
- ✅ RESTful API design
- ✅ Error handling
- ✅ Testing (unit + integration)

### Soft Skills:
- ✅ Planejamento de features
- ✅ Modelagem de dados
- ✅ Documentação de API
- ✅ Code organization
- ✅ Git workflow

---

## ❓ Próximos Passos

Agora você precisa decidir:

1. **Começamos pela Fase 0 (Setup)?**
   - Vou te guiar passo a passo na criação da estrutura
   - Explicando cada decisão técnica

2. **Quer ver primeiro um exemplo de código de um módulo completo?**
   - Posso mostrar como será um módulo (ex: Life Areas)
   - Para você ter uma visão geral antes de começar

3. **Tem alguma dúvida sobre alguma fase específica?**
   - Posso detalhar mais qualquer parte

**O que você prefere fazer agora?** 🚀
