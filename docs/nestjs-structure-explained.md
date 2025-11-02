# 📚 Entendendo a Estrutura do NestJS - Guia Didático

## 🗂️ Estrutura de Pastas Criada

```
apps/api/
├── src/                          # Código-fonte
│   ├── main.ts                   # Ponto de entrada da aplicação
│   ├── app.module.ts             # Módulo raiz
│   ├── app.controller.ts         # Controller principal
│   ├── app.service.ts            # Service principal
│   └── app.controller.spec.ts    # Testes do controller
├── test/                         # Testes end-to-end (E2E)
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
├── node_modules/                 # Dependências instaladas
├── package.json                  # Configuração do projeto
├── tsconfig.json                 # Configuração do TypeScript
├── tsconfig.build.json           # TypeScript para build
├── eslint.config.mjs             # Configuração do ESLint
├── .prettierrc                   # Configuração do Prettier
├── nest-cli.json                 # Configuração do NestJS CLI
└── README.md                     # Documentação do projeto
```

---

## 📄 Arquivo por Arquivo - Explicação Detalhada

### **1. src/main.ts** - Ponto de Entrada

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

**O que este arquivo faz:**
- É o **primeiro arquivo executado** quando você roda `npm run start`
- `NestFactory.create(AppModule)` → Cria a aplicação NestJS
- `app.listen(3000)` → Inicia o servidor HTTP na porta 3000
- `bootstrap()` → Função assíncrona que inicializa tudo

**Por que "bootstrap"?**
- Nome comum para função de inicialização
- "Bootstrap" = "dar o pontapé inicial"

**Por que `async/await`?**
- Criar a aplicação NestJS é uma operação assíncrona
- Precisamos esperar ela terminar antes de iniciar o servidor

---

### **2. src/app.module.ts** - Módulo Raiz

```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

**O que este arquivo faz:**
- Define o **módulo raiz** da aplicação
- Um módulo organiza código relacionado
- Registra controllers e services

**Anatomia do decorador `@Module`:**
- `imports: []` → Outros módulos que este módulo usa
- `controllers: [AppController]` → Controllers deste módulo
- `providers: [AppService]` → Services (lógica de negócio)

**📚 O que é um decorador (@)?**
- Decorators são funções que "decoram" classes/métodos
- `@Module` adiciona metadados à classe AppModule
- NestJS usa esses metadados para configurar a aplicação
- Similar a annotations em Java ou attributes em C#

**📚 O que é um Module no NestJS?**
- Unidade organizacional básica
- Agrupa controllers, services, e outros recursos relacionados
- Exemplo futuro: `AuthModule`, `UsersModule`, `GoalsModule`

---

### **3. src/app.controller.ts** - Controller

```typescript
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
```

**O que este arquivo faz:**
- Define **rotas HTTP** (endpoints)
- Recebe requisições do cliente
- Chama services para processar lógica
- Retorna respostas

**Anatomia:**

1. **`@Controller()`**
   - Marca a classe como um controller
   - Pode receber prefixo: `@Controller('users')` → `/users/*`

2. **`constructor(private readonly appService: AppService)`**
   - **Dependency Injection** (Injeção de Dependência)
   - NestJS automaticamente cria e injeta AppService
   - `private readonly` → Cria propriedade privada e imutável

3. **`@Get()`**
   - Define rota HTTP GET
   - Sem parâmetro = rota raiz `/`
   - `@Get('profile')` seria `/profile`

4. **`getHello(): string`**
   - Método que responde à requisição GET /
   - Retorna string "Hello World!"
   - Chama `appService.getHello()`

**📚 Por que separar Controller e Service?**
- **Controller** = Camada de apresentação (HTTP)
  - Recebe requisição
  - Valida dados
  - Retorna resposta
- **Service** = Camada de lógica de negócio
  - Processa dados
  - Faz cálculos
  - Acessa banco de dados

**Analogia:**
- Controller = Garçom (pega pedido, entrega comida)
- Service = Cozinheiro (prepara a comida)

---

### **4. src/app.service.ts** - Service

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
```

**O que este arquivo faz:**
- Contém **lógica de negócio**
- Pode ser injetado em controllers
- Reutilizável

**Anatomia:**

1. **`@Injectable()`**
   - Marca a classe como "injetável"
   - Permite que NestJS use Dependency Injection
   - Pode ser injetada em outros lugares

2. **`getHello(): string`**
   - Método simples que retorna string
   - Em apps reais, aqui você faria:
     - Consultas ao banco de dados
     - Cálculos complexos
     - Chamadas a APIs externas
     - Validações de negócio

**Exemplo futuro (GoalsService):**
```typescript
@Injectable()
export class GoalsService {
  async findAll(userId: string): Promise<Goal[]> {
    // Buscar goals do usuário no Firestore
    return await this.firestore.collection('goals')
      .where('userId', '==', userId)
      .get();
  }

  async create(goalDto: CreateGoalDto): Promise<Goal> {
    // Criar novo goal no Firestore
    return await this.firestore.collection('goals').add(goalDto);
  }
}
```

---

### **5. src/app.controller.spec.ts** - Testes

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
```

**O que este arquivo faz:**
- Testes unitários do AppController
- Usa Jest (framework de testes)
- Verifica se código funciona como esperado

**📚 Por que testar?**
- Garantir que código funciona
- Evitar bugs em produção
- Documentação viva (testes mostram como usar o código)
- Facilita refatoração (se quebrar, testes avisam)

**Não se preocupe com testes agora:**
- Vamos focar em construir features primeiro
- Depois adicionamos testes gradualmente

---

## 🏗️ Arquitetura NestJS - Os 3 Pilares

```
┌─────────────────────────────────────────────────┐
│                    CLIENT                       │
│              (Browser, Mobile App)              │
└─────────────────────────────────────────────────┘
                       ↓ HTTP Request
┌─────────────────────────────────────────────────┐
│                  CONTROLLER                     │
│  - Recebe requisição HTTP                       │
│  - Valida dados                                 │
│  - Chama Service                                │
│  - Retorna resposta HTTP                        │
└─────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────┐
│                   SERVICE                       │
│  - Lógica de negócio                            │
│  - Acessa banco de dados                        │
│  - Processa dados                               │
│  - Retorna resultado                            │
└─────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────┐
│                 DATABASE                        │
│            (Firebase Firestore)                 │
└─────────────────────────────────────────────────┘
```

**Fluxo de uma requisição:**

1. **Cliente** faz requisição: `GET http://localhost:3000/`
2. **Controller** recebe: método `getHello()` é chamado
3. **Service** processa: retorna "Hello World!"
4. **Controller** retorna: resposta HTTP 200 com "Hello World!"

---

## 📦 Arquivos de Configuração

### **package.json**
- Lista de dependências do projeto
- Scripts para rodar/testar/buildar
- Metadados do projeto (nome, versão, autor)

### **tsconfig.json**
- Configuração do TypeScript
- Define como TypeScript compila para JavaScript
- Opções de tipo, módulos, paths, etc.

### **nest-cli.json**
- Configuração do NestJS CLI
- Onde fica o código-fonte (`src/`)
- Configurações de build

### **eslint.config.mjs**
- Regras de formatação e estilo de código
- Ajuda a manter código consistente
- Previne erros comuns

### **.prettierrc**
- Formatador automático de código
- Garante estilo consistente (espaços, quebras de linha, etc.)

---

## 🎯 Próximos Passos

Agora que você entende a estrutura básica, vamos:

1. ✅ Testar o servidor NestJS rodando
2. ✅ Instalar Firebase Admin SDK
3. ✅ Criar primeiro endpoint customizado
4. ✅ Começar a construir o sistema de autenticação

---

## 💡 Conceitos-Chave para Lembrar

| Conceito | O que é | Analogia |
|----------|---------|----------|
| **Module** | Organiza código relacionado | Gaveta de arquivo (agrupa documentos relacionados) |
| **Controller** | Lida com requisições HTTP | Garçom (recebe pedidos) |
| **Service** | Lógica de negócio | Cozinheiro (prepara comida) |
| **Decorator** | Adiciona metadados | Etiqueta em uma caixa (diz o que tem dentro) |
| **Dependency Injection** | NestJS cria e injeta objetos automaticamente | Assistente que traz ferramentas quando você precisa |

---

## 🤔 Perguntas Frequentes

**Q: Por que usar NestJS em vez de Express puro?**
A: NestJS tem estrutura organizada, TypeScript nativo, Dependency Injection, e é mais fácil manter em projetos grandes.

**Q: O que é TypeScript?**
A: JavaScript com tipos. Previne erros, melhora autocomplete na IDE, e facilita refatoração.

**Q: Por que separar em Controller e Service?**
A: Separação de responsabilidades. Controller cuida de HTTP, Service de lógica. Facilita testes e reutilização.

**Q: Preciso aprender todos os decorators agora?**
A: Não! Vamos aprender conforme usamos. Por enquanto: `@Module`, `@Controller`, `@Injectable`, `@Get`, `@Post`.

---

Quando estiver pronto, vamos rodar o servidor pela primeira vez! 🚀
