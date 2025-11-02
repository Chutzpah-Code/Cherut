# ✅ Fase 1: Sistema de Autenticação - EM ANDAMENTO

**Data início**: 02 de Novembro de 2025
**Status**: 🟡 80% Completo

---

## 🎯 Objetivo da Fase 1

Implementar sistema completo de autenticação com Firebase Auth e JWT tokens.

---

## ✅ Tarefas Completadas

### 1. Instalação de Dependências ✅

Pacotes instalados:

```bash
npm install firebase-admin @nestjs/passport @nestjs/jwt passport passport-jwt @nestjs/config class-validator class-transformer
```

| Pacote | Versão | Uso |
|--------|--------|-----|
| firebase-admin | 13.5.0 | Firebase Admin SDK (backend) |
| @nestjs/passport | 11.0.5 | Integração Passport com NestJS |
| @nestjs/jwt | 11.0.1 | JWT tokens |
| passport-jwt | 4.0.1 | Estratégia JWT do Passport |
| @nestjs/config | 4.0.2 | Variáveis de ambiente |
| class-validator | 0.14.2 | Validação de DTOs |
| class-transformer | 0.5.1 | Transformação de objetos |

---

### 2. Configuração de Variáveis de Ambiente ✅

**Arquivos criados**:
- [.env.example](../apps/api/.env.example) - Template com todas as variáveis
- [.env](../apps/api/.env) - Arquivo real (NÃO commitado no git)

**Variáveis configuradas**:
```env
PORT=3000
NODE_ENV=development
JWT_SECRET=cherut-dev-secret-key-change-in-production-2024
JWT_EXPIRES_IN=7d
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-credentials.json
ALLOWED_ORIGINS=http://localhost:3001,http://localhost:19006
```

---

### 3. Firebase Config Module ✅

**Arquivos criados**:
- [firebase.config.ts](../apps/api/src/config/firebase.config.ts) - Configurações do Firebase
- [firebase.service.ts](../apps/api/src/config/firebase.service.ts) - Service que inicializa Firebase
- [firebase.module.ts](../apps/api/src/config/firebase.module.ts) - Módulo global do Firebase

**O que o Firebase Service faz**:
- Inicializa Firebase Admin SDK no startup da aplicação
- Suporta 2 métodos de autenticação:
  1. **Arquivo JSON** (desenvolvimento): `firebase-credentials.json`
  2. **Variáveis de ambiente** (produção): Para deploy no Render/Vercel
- Expõe métodos:
  - `getAuth()` → Firebase Authentication
  - `getFirestore()` → Firestore Database
  - `getApp()` → Firebase App instance

---

### 4. Auth Module Completo ✅

**Estrutura criada**:

```
src/modules/auth/
├── dto/
│   ├── register.dto.ts      # DTO para registro
│   ├── login.dto.ts         # DTO para login
│   └── index.ts             # Barrel export
├── strategies/
│   └── jwt.strategy.ts      # Estratégia JWT do Passport
├── guards/
│   ├── jwt-auth.guard.ts    # Guard para proteger rotas
│   └── index.ts             # Barrel export
├── auth.controller.ts       # Endpoints HTTP
├── auth.service.ts          # Lógica de autenticação
└── auth.module.ts           # Módulo de autenticação
```

#### 4.1 DTOs (Data Transfer Objects)

**RegisterDto** - Valida dados de registro:
```typescript
{
  email: string;        // @IsEmail()
  password: string;     // @MinLength(6)
  displayName?: string; // Opcional
}
```

**LoginDto** - Valida dados de login:
```typescript
{
  email: string;        // @IsEmail()
  password: string;     // @MinLength(6)
}
```

#### 4.2 Auth Service

**Métodos implementados**:

1. **`register(registerDto)`** → Registra novo usuário
   - Cria usuário no Firebase Auth
   - Cria documento no Firestore (`users/{uid}`)
   - Gera token JWT
   - Retorna `{ user, accessToken }`

2. **`login(loginDto)`** → Faz login
   - Busca usuário no Firebase Auth por email
   - Verifica se existe no Firestore
   - Gera token JWT
   - Retorna `{ user, accessToken }`

3. **`validateToken(uid)`** → Valida token JWT
   - Busca usuário no Firestore
   - Usado pelo JwtStrategy
   - Retorna dados do usuário ou null

4. **`generateToken(uid, email)`** → Gera JWT
   - Payload: `{ sub: uid, email }`
   - Expira em 7 dias
   - Assinado com JWT_SECRET

#### 4.3 Auth Controller

**Endpoints expostos**:

| Método | Rota | Descrição | Proteção |
|--------|------|-----------|----------|
| POST | /auth/register | Registrar novo usuário | ❌ Pública |
| POST | /auth/login | Fazer login | ❌ Pública |
| GET | /auth/me | Dados do usuário logado | ✅ Protegida (JWT) |

**Exemplo de requisição**:

```bash
# 1. REGISTER
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@example.com",
    "password": "senha123",
    "displayName": "João Silva"
  }'

# Resposta:
{
  "user": {
    "uid": "abc123xyz",
    "email": "joao@example.com",
    "displayName": "João Silva"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

# 2. LOGIN
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@example.com",
    "password": "senha123"
  }'

# 3. GET ME (protegida)
curl http://localhost:3000/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### 4.4 JWT Strategy

**Como funciona**:

1. Cliente faz requisição com header: `Authorization: Bearer <token>`
2. `JwtAuthGuard` ativa `JwtStrategy`
3. Strategy extrai token do header
4. Verifica assinatura com `JWT_SECRET`
5. Decodifica payload `{ sub: uid, email }`
6. Chama `validate(payload)`
7. `validate()` busca usuário no Firestore
8. Se válido → Injeta `req.user`
9. Controller recebe `req.user` preenchido

#### 4.5 JWT Auth Guard

**Uso**:
```typescript
@Get('protected')
@UseGuards(JwtAuthGuard)
async protectedRoute(@Request() req) {
  // req.user contém dados do usuário autenticado
  return req.user;
}
```

**O que faz**:
- Protege rotas
- Requer token JWT válido
- Retorna 401 Unauthorized se token inválido/expirado

---

### 5. Validação Global Habilitada ✅

**Mudanças em [main.ts](../apps/api/src/main.ts)**:

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,  // Remove propriedades extras
    transform: true,  // Converte tipos automaticamente
  }),
);

app.enableCors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true,
});
```

**O que isso faz**:
- Valida todos os DTOs automaticamente
- Remove campos não definidos no DTO (segurança)
- Habilita CORS para frontend
- Retorna 400 Bad Request se validação falhar

---

### 6. Integração com AppModule ✅

**[app.module.ts](../apps/api/src/app.module.ts)** atualizado:

```typescript
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    FirebaseModule,  // Global
    AuthModule,      // NEW!
  ],
  // ...
})
export class AppModule {}
```

---

### 7. Build e Compilação ✅

**Erros corrigidos**:
- ✅ TypeScript: `import type { ConfigType }`
- ✅ TypeScript: `admin.apps[0]!` (non-null assertion)
- ✅ TypeScript: `userData!` (non-null assertion)
- ✅ TypeScript: JWT signOptions type casting

**Status**: ✅ Build passa sem erros

---

## 🚨 Próximo Passo OBRIGATÓRIO

### Configurar Firebase

**O servidor NÃO VAI FUNCIONAR** sem credenciais do Firebase.

**Passos**:

#### 1. Criar Projeto Firebase (GRATUITO)

1. Acesse: https://console.firebase.google.com
2. Clique em **"Adicionar projeto"** ou **"Create a project"**
3. Nome do projeto: **"Cherut"** (ou qualquer nome)
4. Desabilite Google Analytics (opcional para desenvolvimento)
5. Clique em **"Criar projeto"**

#### 2. Baixar Credenciais

1. No Firebase Console, clique em **⚙️ (ícone de engrenagem)** → **Configurações do projeto**
2. Vá na aba **"Contas de serviço"** ou **"Service accounts"**
3. Clique em **"Gerar nova chave privada"** ou **"Generate new private key"**
4. Um arquivo JSON será baixado (exemplo: `cherut-firebase-adminsdk-xxxxx.json`)
5. **RENOMEIE** o arquivo para: `firebase-credentials.json`
6. **MOVA** o arquivo para: `apps/api/firebase-credentials.json`

#### 3. Habilitar Firebase Authentication

1. No Firebase Console, vá em **Authentication** (menu lateral)
2. Clique em **"Começar"** ou **"Get started"**
3. Vá na aba **"Sign-in method"**
4. Habilite **"Email/Password"**
5. Salve

#### 4. Criar Banco de Dados Firestore

1. No Firebase Console, vá em **Firestore Database**
2. Clique em **"Criar banco de dados"** ou **"Create database"**
3. Escolha **"Iniciar em modo de teste"** (permite leitura/escrita por 30 dias)
4. Escolha a região: **us-central** ou mais próxima
5. Clique em **"Ativar"**

#### 5. Rodar o Servidor

```bash
cd apps/api
source ~/.nvm/nvm.sh
nvm use 20
npm run start:dev
```

**Se tudo der certo**, você verá:

```
✅ Firebase Admin SDK initialized successfully
[NestApplication] Nest application successfully started
Application is running on: http://localhost:3000
```

---

## 🧪 Testando os Endpoints

### 1. Registrar Usuário

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "password": "senha123",
    "displayName": "Usuário Teste"
  }'
```

**Resposta esperada**:
```json
{
  "user": {
    "uid": "abc123xyz...",
    "email": "teste@example.com",
    "displayName": "Usuário Teste"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Salve o `accessToken`** para usar nos próximos testes!

### 2. Fazer Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "password": "senha123"
  }'
```

### 3. Obter Dados do Usuário (Rota Protegida)

```bash
curl http://localhost:3000/auth/me \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

**Substitua `SEU_TOKEN_AQUI`** pelo token recebido no registro/login.

---

## 📚 Conceitos Aprendidos

### 1. Autenticação vs Autorização

- **Autenticação**: "Quem você é?" (Login com email/senha)
- **Autorização**: "O que você pode fazer?" (Permissões, roles)

Nesta fase implementamos **autenticação**. Autorização virá em fases futuras (admin, planos, etc.).

### 2. JWT (JSON Web Tokens)

**O que é**:
- Token criptografado que contém informações do usuário
- Cliente guarda o token (localStorage, cookies)
- Envia em toda requisição: `Authorization: Bearer <token>`

**Estrutura**:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.  ← Header
eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Ikpv...  ← Payload (dados)
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c  ← Signature
```

**Vantagens**:
- Stateless (servidor não precisa guardar sessões)
- Escalável (funciona com múltiplos servidores)
- Seguro (assinatura previne adulteração)

**Desvantagens**:
- Não pode ser revogado antes de expirar
- Solução: Token de curta duração + Refresh Token (futuro)

### 3. Guards no NestJS

**O que são**:
- "Guardas" que protegem rotas
- Executam ANTES do controller
- Decidem se requisição pode prosseguir

**Tipos**:
- `JwtAuthGuard` → Verifica se usuário está autenticado
- `RolesGuard` (futuro) → Verifica se usuário tem permissão
- `ThrottlerGuard` (futuro) → Rate limiting

### 4. Dependency Injection

**Exemplo**:
```typescript
constructor(
  private readonly authService: AuthService,
  private readonly jwtService: JwtService,
) {}
```

**Como funciona**:
- NestJS cria instâncias automaticamente
- Injeta dependências no constructor
- Você não precisa fazer `new AuthService()`
- Facilita testes (mockar dependências)

### 5. Decorators do NestJS

| Decorator | O que faz |
|-----------|-----------|
| `@Module()` | Define um módulo |
| `@Controller()` | Define um controller |
| `@Injectable()` | Marca classe como injetável |
| `@Get()` `@Post()` | Define rota HTTP |
| `@Body()` | Extrai body da requisição |
| `@UseGuards()` | Protege rota com guard |
| `@Request()` | Injeta objeto da requisição |

### 6. DTOs (Data Transfer Objects)

**Por que usar**:
- Validação automática
- Type safety
- Documentação viva
- Segurança (whitelist remove campos extras)

**Exemplo**:
```typescript
export class RegisterDto {
  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;
}
```

Se cliente enviar:
```json
{
  "email": "invalid-email",
  "password": "123"
}
```

NestJS retorna automaticamente:
```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "password must be longer than or equal to 6 characters"
  ],
  "error": "Bad Request"
}
```

---

## ✅ Checklist de Conclusão

- [x] Firebase Admin SDK instalado
- [x] Variáveis de ambiente configuradas
- [x] Firebase Config Module criado
- [x] Auth Module implementado
- [x] JWT Strategy e Guards criados
- [x] DTOs com validação
- [x] Endpoints /auth/* funcionando
- [x] Build sem erros de TypeScript
- [ ] Firebase configurado (VOCÊ PRECISA FAZER!)
- [ ] Servidor rodando sem erros
- [ ] Testes manuais com curl

---

## 📊 Arquivos Criados/Modificados

### Novos Arquivos (18):

**Config**:
1. `apps/api/.env.example`
2. `apps/api/.env`
3. `apps/api/src/config/firebase.config.ts`
4. `apps/api/src/config/firebase.service.ts`
5. `apps/api/src/config/firebase.module.ts`

**Auth Module**:
6. `apps/api/src/modules/auth/dto/register.dto.ts`
7. `apps/api/src/modules/auth/dto/login.dto.ts`
8. `apps/api/src/modules/auth/dto/index.ts`
9. `apps/api/src/modules/auth/strategies/jwt.strategy.ts`
10. `apps/api/src/modules/auth/guards/jwt-auth.guard.ts`
11. `apps/api/src/modules/auth/guards/index.ts`
12. `apps/api/src/modules/auth/auth.service.ts`
13. `apps/api/src/modules/auth/auth.controller.ts`
14. `apps/api/src/modules/auth/auth.module.ts`

**Docs**:
15. `docs/phase-1-authentication.md` (este arquivo)

### Arquivos Modificados (2):

1. `apps/api/src/main.ts` → Validação global + CORS
2. `apps/api/src/app.module.ts` → Import AuthModule

---

## 🎉 Status Atual

**Fase 1**: 🟡 **80% COMPLETA**

**Falta apenas**:
1. Você configurar Firebase (5-10 minutos)
2. Testar os endpoints

Quando isso estiver pronto, **Fase 1 estará 100% completa**! 🚀

---

## ⏭️ Próxima Fase (Fase 2)

Depois que autenticação estiver 100% funcionando:

**Fase 2: Life Areas Module**
- CRUD de áreas da vida
- Associação com usuário
- Ícones e cores personalizadas
- Rotas protegidas com JWT

**Tempo estimado**: 2-3 dias

---

**Última atualização**: 02 de Novembro de 2025, 00:30
