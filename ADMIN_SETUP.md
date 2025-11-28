# 🛡️ Sistema Admin - Guia de Setup

Este documento explica como configurar e testar o sistema administrativo independente do Cherut.

## 🚀 Como Implementamos

### 1. **Backend (NestJS)**
- ✅ **AdminGuard**: Verifica se `user.role === 'admin'`
- ✅ **AdminModule**: Endpoints exclusivos (`/admin/*`)
- ✅ **AdminController**: Dashboard, usuários, vendas, analytics
- ✅ **Script Seed**: Criar primeiro admin via comando

### 2. **Frontend (Next.js)**
- ✅ **Middleware**: Proteção de rotas `/admin/*`
- ✅ **AdminLayout**: Interface exclusiva para admins
- ✅ **Dashboard Pages**: Overview, usuários, analytics
- ✅ **Redirecionamento**: Automático baseado em role

### 3. **Segurança**
- ✅ **Verificação Dupla**: Frontend + Backend
- ✅ **Logs de Acesso**: Auditoria de tentativas
- ✅ **Token Validation**: Firebase Admin SDK

## 🔧 Setup do Admin

### Passo 1: Criar Admin Inicial
```bash
# Configurar variáveis de ambiente
cd apps/api
echo "INITIAL_ADMIN_EMAIL=admin@seu-dominio.com" >> .env
echo "INITIAL_ADMIN_PASSWORD=senhaSegura123" >> .env

# Criar primeiro administrador
npm run script:create-admin
```

### Passo 2: Testar Acesso
```bash
# 1. Abra o app: http://localhost:3000
# 2. Faça login com: admin@seu-dominio.com
# 3. Deve redirecionar automaticamente para: /admin
```

### Passo 3: Verificar Funcionalidades

#### 📊 Dashboard Admin (`/admin`)
- [x] Métricas gerais (usuários, revenue, conversão)
- [x] Distribuição de planos
- [x] Gráficos e estatísticas
- [x] Dados em tempo real

#### 👥 Gestão de Usuários (`/admin/users`)
- [x] Lista todos os usuários
- [x] Filtros (role, plano, status)
- [x] Busca por email/nome
- [x] Criar novo admin
- [x] Promover usuário existente

#### 🔐 Proteções de Segurança
- [x] Middleware bloqueia não-admins em `/admin/*`
- [x] Backend valida role em todos os endpoints
- [x] Redirecionamento automático por role
- [x] Logs de tentativas de acesso

## 🎯 Endpoints do Admin

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/admin/overview` | Dashboard com métricas |
| `GET` | `/admin/users` | Lista usuários (filtros) |
| `GET` | `/admin/sales` | Relatório de vendas |
| `POST` | `/admin/users/create` | Criar novo admin |
| `POST` | `/admin/users/promote` | Promover usuário |
| `GET` | `/admin/health` | Status do sistema admin |

## 🔍 Como Testar

### 1. **Teste de Admin**
```bash
# Login como admin
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"firebaseIdToken": "SEU_TOKEN_FIREBASE"}'

# Acessar dashboard admin
curl -X GET http://localhost:4000/admin/overview \
  -H "Authorization: Bearer SEU_TOKEN"
```

### 2. **Teste de Usuário Normal**
```bash
# Mesmo token de usuário normal
curl -X GET http://localhost:4000/admin/overview \
  -H "Authorization: Bearer TOKEN_DE_USUARIO"

# Deve retornar: 403 Forbidden
```

### 3. **Teste no Frontend**
```
1. Login como admin → Redireciona para /admin
2. Login como usuário → Redireciona para /dashboard
3. Usuário tenta /admin → Volta para /dashboard
4. Admin visita /dashboard → Redireciona para /admin
```

## 📈 Dados do Dashboard

### Métricas Principais
- **Total de Usuários**: Quantidade total
- **Usuários Ativos**: Com assinatura ativa
- **Revenue Mensal**: Estimativa baseada nos planos
- **Taxa de Conversão**: % de usuários pagantes

### Distribuição de Planos
- **Free**: Plano gratuito
- **Premium**: $29.99/mês
- **Enterprise**: $99.99/mês

### Analytics
- Novos usuários (últimos 30 dias)
- Taxa de onboarding
- Usuários por status de assinatura

## 🚨 Resolução de Problemas

### Admin não consegue acessar
```bash
# Verificar role no Firestore
# Documento: users/{uid}
# Campo: role = "admin"

# Recriar admin se necessário
npm run script:create-admin
```

### Redirecionamento não funciona
```bash
# Verificar console do browser
# Logs: [Auth] e [AdminRedirect]

# Verificar AuthContext
# Campos: userData.role, isAdmin
```

### Middleware bloqueando
```bash
# Verificar middleware.ts
# Console: "Admin route protection"

# Verificar token Firebase no browser
# Storage: localStorage/sessionStorage
```

## 🎉 Sistema Funcionando

Após o setup, você terá:

1. **🛡️ Admin independente**: Acesso via login normal
2. **📊 Dashboard completo**: Métricas de negócio
3. **👥 Gestão de usuários**: Criar/promover admins
4. **🔐 Segurança robusta**: Proteção dupla
5. **🔄 Redirecionamento automático**: Por role
6. **📈 Analytics em tempo real**: Vendas e conversão

O admin entra pela URL normal, faz login, e é automaticamente direcionado para o painel administrativo!

---

## 🛠️ Comandos Úteis

```bash
# Criar admin inicial
npm run script:create-admin

# Verificar logs do admin
tail -f logs/admin-access.log

# Reset admin (se necessário)
# Deletar documento no Firestore: users/{admin-uid}
# Recriar com script acima
```