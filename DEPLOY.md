# Guia de Deploy - Cherut

Este guia te ajudará a fazer o deploy da aplicação Cherut em produção.

## Stack de Deploy Recomendada

- **Frontend (Next.js)**: Vercel
- **Backend (NestJS)**: Railway ou Render
- **Banco de Dados**: Firebase Firestore (já configurado)
- **Armazenamento**: Cloudinary (já configurado)

---

## 1. Deploy do Backend (NestJS) - Railway

### Passo 1: Criar conta no Railway
1. Acesse https://railway.app/
2. Faça login com GitHub
3. Crie um novo projeto

### Passo 2: Deploy via GitHub
1. Conecte seu repositório GitHub
2. Selecione a pasta `apps/api`
3. Configure as variáveis de ambiente (veja seção abaixo)

### Variáveis de Ambiente do Backend (Railway)
```bash
# Firebase Admin
FIREBASE_PROJECT_ID=seu_project_id
FIREBASE_PRIVATE_KEY=sua_private_key
FIREBASE_CLIENT_EMAIL=seu_client_email

# Cloudinary
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=seu_api_secret

# JWT
JWT_SECRET=seu_jwt_secret_super_seguro

# Porta
PORT=3000

# Node Environment
NODE_ENV=production
```

### Passo 3: Configurar Build Settings
- **Build Command**: `npm run build`
- **Start Command**: `npm run start:prod`
- **Root Directory**: `apps/api`

### Railway Deploy Command (alternativa via CLI)
```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login
railway login

# Criar projeto
railway init

# Deploy
cd apps/api
railway up
```

---

## 2. Deploy do Frontend (Next.js) - Vercel

### Passo 1: Criar conta na Vercel
1. Acesse https://vercel.com/
2. Faça login com GitHub
3. Crie um novo projeto

### Passo 2: Import do Repositório
1. Click em "Import Project"
2. Selecione seu repositório GitHub
3. Configure o Root Directory: `apps/web`

### Variáveis de Ambiente do Frontend (Vercel)
```bash
# Firebase (Frontend)
NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id

# API URL (URL do backend no Railway)
NEXT_PUBLIC_API_URL=https://seu-backend.railway.app
```

### Passo 3: Build Settings
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Root Directory**: `apps/web`

### Vercel Deploy Command (alternativa via CLI)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd apps/web
vercel

# Deploy para produção
vercel --prod
```

---

## 3. Configuração do Firebase

### Firestore Rules
No Firebase Console, vá em Firestore Database > Rules e configure:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Life Areas
    match /lifeAreas/{lifeAreaId} {
      allow read, write: if request.auth != null &&
        resource.data.userId == request.auth.uid;
    }

    // Objectives
    match /objectives/{objectiveId} {
      allow read, write: if request.auth != null &&
        resource.data.userId == request.auth.uid;
    }

    // Key Results
    match /keyResults/{keyResultId} {
      allow read, write: if request.auth != null &&
        resource.data.userId == request.auth.uid;
    }

    // Tasks
    match /tasks/{taskId} {
      allow read, write: if request.auth != null &&
        resource.data.userId == request.auth.uid;
    }

    // Habits
    match /habits/{habitId} {
      allow read, write: if request.auth != null &&
        resource.data.userId == request.auth.uid;
    }

    // Vision Boards
    match /visionBoards/{visionBoardId} {
      allow read, write: if request.auth != null &&
        resource.data.userId == request.auth.uid;
    }

    // Enterprise Waitlist
    match /enterprise-waitlist/{entryId} {
      allow create: if request.auth == null;
      allow read, update, delete: if false;
    }
  }
}
```

### Authentication Settings
1. Vá em Authentication > Settings
2. Adicione os domínios autorizados:
   - `seu-dominio.vercel.app`
   - `seu-dominio-custom.com` (se tiver)

---

## 4. Checklist Pré-Deploy

- [ ] Testar build local do backend: `cd apps/api && npm run build`
- [ ] Testar build local do frontend: `cd apps/web && npm run build`
- [ ] Verificar se todas as variáveis de ambiente estão configuradas
- [ ] Fazer commit e push de todas as mudanças
- [ ] Firebase rules configuradas corretamente
- [ ] Cloudinary configurado
- [ ] Domínios adicionados no Firebase Auth

---

## 5. Deploy Automatizado (GitHub Actions) - Opcional

Você pode configurar CI/CD automático. Quer que eu crie os workflows do GitHub Actions?

---

## 6. Após o Deploy

### Testar a aplicação
1. Acesse o frontend: `https://seu-app.vercel.app`
2. Teste registro de usuário
3. Teste login
4. Teste funcionalidades principais

### Monitoramento
- **Vercel**: Analytics automático
- **Railway**: Logs em tempo real no dashboard

---

## 7. Comandos Úteis

```bash
# Ver logs do Railway
railway logs

# Ver deployment da Vercel
vercel logs

# Rollback Vercel (se necessário)
vercel rollback [deployment-url]
```

---

## 8. Troubleshooting

### Erro de CORS
Se tiver erro de CORS, adicione no backend (`apps/api/src/main.ts`):
```typescript
app.enableCors({
  origin: ['https://seu-frontend.vercel.app'],
  credentials: true,
});
```

### Erro de variável de ambiente
- Vercel: Settings > Environment Variables
- Railway: Variables tab no dashboard

---

## Precisa de Ajuda?

Me avise qual plataforma você quer usar e posso te ajudar com os passos específicos!
