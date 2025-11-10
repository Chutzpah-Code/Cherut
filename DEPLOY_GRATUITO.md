# 🚀 Deploy Gratuito - Cherut

Este guia te ajudará a fazer deploy 100% GRATUITO da aplicação Cherut.

## 📦 Stack Gratuita

- **Backend (NestJS)**: Render.com (Plano Free)
- **Frontend (Next.js)**: Vercel (Plano Free)
- **Banco de Dados**: Firebase Firestore (Plano Free - Spark)
- **Armazenamento**: Cloudinary (Plano Free)

---

## 🎯 Passo 1: Preparar o Repositório

### 1.1 Fazer commit de todas as mudanças
```bash
git add .
git commit -m "feat: prepare for deployment"
git push origin main
```

**O que isso faz:** Envia todo o código para o GitHub para que as plataformas de deploy possam acessá-lo.

---

## 🔧 Passo 2: Deploy do Backend no Render (GRATUITO)

### 2.1 Criar conta no Render
1. Acesse https://render.com/
2. Clique em "Get Started for Free"
3. Faça login com sua conta do GitHub

### 2.2 Criar Web Service
1. No Dashboard do Render, clique em "New +"
2. Selecione "Web Service"
3. Conecte seu repositório GitHub "Cherut"
4. Clique em "Connect" ao lado do repositório

### 2.3 Configurar o Serviço

**Nome:**
```
cherut-api
```

**Region:**
```
Oregon (US West)
```

**Branch:**
```
main
```

**Root Directory:**
```
apps/api
```

**Runtime:**
```
Node
```

**Build Command:**
```
npm install && npm run build
```

**Start Command:**
```
npm run start:prod
```

**Plan:**
```
Free
```

### 2.4 Adicionar Variáveis de Ambiente

Clique em "Advanced" e adicione as seguintes variáveis de ambiente:

```bash
NODE_ENV=production
PORT=10000

# Firebase Admin (copie do seu .env)
FIREBASE_PROJECT_ID=seu_project_id_aqui
FIREBASE_CLIENT_EMAIL=seu_client_email_aqui
FIREBASE_PRIVATE_KEY="sua_private_key_aqui_com_aspas"

# Cloudinary (copie do seu .env)
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=seu_api_secret

# JWT Secret (crie um secret forte)
JWT_SECRET=sua_chave_secreta_jwt_aqui_minimo_32_caracteres
```

**⚠️ IMPORTANTE:**
- A `FIREBASE_PRIVATE_KEY` deve estar entre aspas duplas
- Copie os valores do seu arquivo `.env` local

### 2.5 Deploy
1. Clique em "Create Web Service"
2. Aguarde o deploy (3-5 minutos)
3. Quando terminar, você verá "Live" com um check verde ✅

**URL do Backend:** `https://cherut-api.onrender.com`

---

## 🎨 Passo 3: Deploy do Frontend na Vercel (GRATUITO)

### 3.1 Criar conta na Vercel
1. Acesse https://vercel.com/
2. Clique em "Sign Up"
3. Faça login com sua conta do GitHub

### 3.2 Import Project
1. No Dashboard da Vercel, clique em "Add New..."
2. Selecione "Project"
3. Encontre e selecione o repositório "Cherut"
4. Clique em "Import"

### 3.3 Configurar o Projeto

**Framework Preset:**
```
Next.js
```

**Root Directory:**
```
apps/web
```

Clique em "Edit" ao lado de "Build and Output Settings":

**Build Command:**
```
npm run build
```

**Output Directory:**
```
.next
```

**Install Command:**
```
npm install
```

### 3.4 Adicionar Variáveis de Ambiente

Clique em "Environment Variables" e adicione:

```bash
# Firebase (Frontend) - copie do seu .env.local
NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_domain.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_bucket.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id

# URL do Backend no Render (substitua pela URL real que você recebeu no Passo 2)
NEXT_PUBLIC_API_URL=https://cherut-api.onrender.com
```

### 3.5 Deploy
1. Clique em "Deploy"
2. Aguarde o deploy (2-3 minutos)
3. Quando terminar, clique em "Visit" para ver seu site! 🎉

**URL do Frontend:** `https://seu-projeto.vercel.app`

---

## ⚙️ Passo 4: Configurar CORS no Backend

Precisamos atualizar o código do backend para aceitar requisições do frontend.

### 4.1 Atualizar main.ts

Vou fazer essa alteração para você agora...

---

## 🔐 Passo 5: Atualizar Firebase

### 5.1 Adicionar domínios autorizados
1. Vá em Firebase Console: https://console.firebase.google.com/
2. Selecione seu projeto
3. Vá em "Authentication" > "Settings" > "Authorized domains"
4. Adicione:
   - `seu-projeto.vercel.app` (substitua pelo domínio real)
   - `cherut-api.onrender.com`

### 5.2 Configurar Firestore Rules
1. Vá em "Firestore Database" > "Rules"
2. Copie e cole as rules do arquivo `DEPLOY.md`
3. Clique em "Publish"

---

## ✅ Passo 6: Testar a Aplicação

1. Acesse `https://seu-projeto.vercel.app`
2. Clique em "Start Free" para criar uma conta
3. Teste:
   - ✅ Registro de usuário
   - ✅ Login
   - ✅ Criar Life Area
   - ✅ Criar Objective
   - ✅ Criar Task
   - ✅ Vision Board (upload de imagem)

---

## 📊 Limites do Plano Gratuito

### Render (Backend)
- ✅ 750 horas/mês grátis
- ⚠️ O serviço "dorme" após 15min sem uso (primeira requisição leva ~30s)
- ✅ 100GB bandwidth/mês

### Vercel (Frontend)
- ✅ Bandwidth ilimitado
- ✅ Builds ilimitados
- ✅ Deploy automático no push

### Firebase
- ✅ 1GB armazenamento
- ✅ 10GB/mês transfer
- ✅ 50,000 reads/dia
- ✅ 20,000 writes/dia

### Cloudinary
- ✅ 25GB armazenamento
- ✅ 25GB bandwidth/mês

---

## 🔄 Deploy Automático

Agora, toda vez que você fizer `git push`:
- ✅ Vercel faz deploy automático do frontend
- ✅ Render faz deploy automático do backend

---

## 🆘 Troubleshooting

### Backend não responde
- Espere 30s na primeira requisição (cold start)
- Veja logs no Render Dashboard

### Erro de CORS
- Verifique se adicionou o domínio Vercel no backend

### Erro 500 no backend
- Veja os logs no Render
- Verifique variáveis de ambiente

---

## 📝 Próximos Passos

Quer que eu:
1. ✅ Atualize o código do backend para aceitar o domínio Vercel?
2. ✅ Crie um domínio customizado?
3. ✅ Configure CI/CD mais avançado?

Diga o que você precisa!
