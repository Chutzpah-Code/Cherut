#!/usr/bin/env ts-node
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { FirebaseService } from '../src/config/firebase.service';

/**
 * Script para popular dados de exemplo para um usuário
 * Usage: npm run script:populate-sample-data
 */

const USER_ID = 'n96dVZZ8CPJabWz7oVSQFEHclDpc'; // victorhanielbusiness@gmail.com

async function populateSampleData() {
  console.log('🚀 Iniciando população de dados de exemplo...');

  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    const firebaseService = app.get(FirebaseService);
    const db = firebaseService.getFirestore();

    // 1. Criar perfil do usuário
    console.log('👤 Criando perfil...');
    await db.collection('users').doc(USER_ID).set({
      uid: USER_ID,
      email: 'victorhanielbusiness@gmail.com',
      displayName: 'Haniel Victor',
      bio: 'Empreendedor e entusiasta de produtividade. Acredito que organização e propósito levam ao sucesso.',
      location: 'São Paulo, Brasil',
      timezone: 'America/Sao_Paulo',
      language: 'pt-BR',
      onboardingCompleted: true,
      lifePurpose: 'Construir negócios que impactem positivamente a vida das pessoas',
      preferences: {
        theme: 'dark',
        notifications: true,
        weekStartsOn: 1, // Monday
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // 2. Criar Values (Valores)
    console.log('💎 Criando valores...');
    const values = [
      {
        title: 'Excelência',
        shortDescription: 'Buscar sempre a melhor versão em tudo que faço',
        behaviors: 'Dedicar tempo para aperfeiçoamento contínuo, aceitar feedback construtivo, estabelecer padrões altos para mim mesmo',
        priority: 1,
      },
      {
        title: 'Integridade',
        shortDescription: 'Agir com honestidade e transparência em todas as situações',
        behaviors: 'Ser honesto mesmo quando é difícil, cumprir promessas, agir de acordo com meus valores',
        priority: 2,
      },
      {
        title: 'Crescimento',
        shortDescription: 'Estar sempre aprendendo e evoluindo como pessoa',
        behaviors: 'Ler regularmente, buscar novos desafios, refletir sobre experiências e aprendizados',
        priority: 3,
      },
      {
        title: 'Família',
        shortDescription: 'Valorizar e dedicar tempo de qualidade à família',
        behaviors: 'Estar presente durante momentos familiares, demonstrar afeto, apoiar membros da família',
        priority: 4,
      },
      {
        title: 'Impacto',
        shortDescription: 'Fazer diferença positiva na vida das pessoas',
        behaviors: 'Ajudar outros sempre que possível, contribuir para a comunidade, compartilhar conhecimento',
        priority: 5,
      },
    ];

    for (const value of values) {
      await db.collection('values').add({
        ...value,
        userId: USER_ID,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // 3. Criar Life Areas (Áreas da Vida)
    console.log('🎯 Criando áreas da vida...');
    const lifeAreas = [
      {
        name: 'Carreira & Negócios',
        description: 'Desenvolvimento profissional e empreendimentos',
        icon: '💼',
        color: '#3b82f6',
      },
      {
        name: 'Saúde & Bem-estar',
        description: 'Cuidar do corpo e da mente',
        icon: '🏃‍♂️',
        color: '#10b981',
      },
      {
        name: 'Relacionamentos',
        description: 'Família, amigos e relacionamentos significativos',
        icon: '❤️',
        color: '#ef4444',
      },
      {
        name: 'Crescimento Pessoal',
        description: 'Aprendizado contínuo e desenvolvimento pessoal',
        icon: '📚',
        color: '#f59e0b',
      },
      {
        name: 'Finanças',
        description: 'Gestão financeira e construção de patrimônio',
        icon: '💰',
        color: '#8b5cf6',
      },
    ];

    const lifeAreaIds: Array<{ id: string; name: string }> = [];
    for (const lifeArea of lifeAreas) {
      const docRef = await db.collection('lifeAreas').add({
        ...lifeArea,
        userId: USER_ID,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      lifeAreaIds.push({ id: docRef.id, name: lifeArea.name });
    }

    // 4. Criar Objectives (Objetivos)
    console.log('🎯 Criando objetivos...');
    const objectives = [
      {
        lifeAreaName: 'Carreira & Negócios',
        title: 'Lançar produto digital',
        description: 'Desenvolver e lançar um curso online sobre produtividade',
        targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 3 months
        priority: 'high',
        keyResults: [
          { title: 'Criar conteúdo programático completo', targetValue: 1, currentValue: 0, unit: 'programa' },
          { title: 'Produzir 20 vídeo-aulas', targetValue: 20, currentValue: 5, unit: 'vídeos' },
          { title: 'Conseguir 100 pré-vendas', targetValue: 100, currentValue: 15, unit: 'vendas' },
        ]
      },
      {
        lifeAreaName: 'Saúde & Bem-estar',
        title: 'Estabelecer rotina de exercícios',
        description: 'Criar uma rotina consistente de exercícios físicos',
        targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 2 months
        priority: 'high',
        keyResults: [
          { title: 'Treinar 4x por semana', targetValue: 4, currentValue: 2, unit: 'treinos/semana' },
          { title: 'Perder 8kg', targetValue: 8, currentValue: 2, unit: 'kg' },
        ]
      },
      {
        lifeAreaName: 'Crescimento Pessoal',
        title: 'Ler 12 livros este ano',
        description: 'Desenvolver hábito de leitura consistente',
        targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
        priority: 'medium',
        keyResults: [
          { title: 'Livros lidos', targetValue: 12, currentValue: 3, unit: 'livros' },
          { title: 'Páginas por dia', targetValue: 30, currentValue: 15, unit: 'páginas/dia' },
        ]
      },
    ];

    for (const objective of objectives) {
      const lifeAreaId = lifeAreaIds.find(la => la.name === objective.lifeAreaName)?.id;
      if (!lifeAreaId) continue;

      const objDocRef = await db.collection('objectives').add({
        title: objective.title,
        description: objective.description,
        targetDate: objective.targetDate,
        priority: objective.priority,
        status: 'active',
        progress: 25,
        userId: USER_ID,
        lifeAreaId: lifeAreaId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Criar key results para cada objetivo
      for (const kr of objective.keyResults) {
        await db.collection('keyResults').add({
          ...kr,
          isCompleted: false,
          objectiveId: objDocRef.id,
          userId: USER_ID,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }

    // 5. Criar Tasks (Tarefas)
    console.log('✅ Criando tarefas...');
    const tasks = [
      {
        title: 'Definir estrutura do curso',
        description: 'Criar outline detalhado com módulos e aulas',
        status: 'todo',
        priority: 'high',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['curso', 'planejamento'],
      },
      {
        title: 'Gravar primeira aula',
        description: 'Produzir e editar o vídeo de introdução',
        status: 'in_progress',
        priority: 'high',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['curso', 'produção'],
      },
      {
        title: 'Pesquisar academia próxima',
        description: 'Visitar 3 academias e comparar preços e estrutura',
        status: 'todo',
        priority: 'medium',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['saúde', 'exercícios'],
      },
      {
        title: 'Ler "Hábitos Atômicos"',
        description: 'Finalizar a leitura do livro sobre formação de hábitos',
        status: 'in_progress',
        priority: 'medium',
        tags: ['leitura', 'desenvolvimento'],
      },
      {
        title: 'Revisar orçamento mensal',
        description: 'Analisar gastos do mês e ajustar planejamento financeiro',
        status: 'completed',
        priority: 'high',
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['finanças', 'planejamento'],
      },
    ];

    for (const task of tasks) {
      await db.collection('tasks').add({
        ...task,
        userId: USER_ID,
        order: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // 6. Criar Habits (Hábitos)
    console.log('🔄 Criando hábitos...');
    const habits = [
      {
        name: 'Meditação matinal',
        description: 'Meditar por 10 minutos ao acordar',
        frequency: 'daily',
        targetCount: 1,
        icon: '🧘‍♂️',
        color: '#3b82f6',
        category: 'Bem-estar',
        isActive: true,
      },
      {
        name: 'Exercício físico',
        description: 'Fazer pelo menos 30min de exercícios',
        frequency: 'daily',
        targetCount: 1,
        icon: '💪',
        color: '#10b981',
        category: 'Saúde',
        isActive: true,
      },
      {
        name: 'Leitura diária',
        description: 'Ler pelo menos 20 páginas por dia',
        frequency: 'daily',
        targetCount: 20,
        icon: '📖',
        color: '#f59e0b',
        category: 'Crescimento',
        isActive: true,
      },
      {
        name: 'Planejamento semanal',
        description: 'Revisar e planejar a semana seguinte',
        frequency: 'weekly',
        targetCount: 1,
        icon: '📅',
        color: '#8b5cf6',
        category: 'Produtividade',
        isActive: true,
      },
    ];

    for (const habit of habits) {
      const habitDocRef = await db.collection('habits').add({
        ...habit,
        userId: USER_ID,
        currentStreak: Math.floor(Math.random() * 10) + 1,
        longestStreak: Math.floor(Math.random() * 20) + 5,
        totalCompletions: Math.floor(Math.random() * 50) + 10,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Adicionar alguns logs de hábitos (histórico)
      for (let i = 0; i < 7; i++) {
        const logDate = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const completed = Math.random() > 0.3; // 70% chance de ter sido completado

        if (completed) {
          await db.collection('habitLogs').add({
            habitId: habitDocRef.id,
            userId: USER_ID,
            date: logDate.toISOString().split('T')[0],
            completed: true,
            value: habit.targetCount,
            notes: i === 0 ? 'Excelente sessão hoje!' : '',
            createdAt: logDate.toISOString(),
          });
        }
      }
    }

    // 7. Criar Journal Entries (Entradas de Diário)
    console.log('📔 Criando entradas de diário...');
    const journalEntries = [
      {
        title: 'Reflexão sobre progresso',
        content: 'Hoje foi um dia produtivo. Consegui avançar bastante no planejamento do curso e me sinto motivado com o progresso. O exercício matinal fez toda diferença na disposição.',
        mood: 'happy',
        date: new Date().toISOString(),
        tags: ['reflexão', 'progresso'],
      },
      {
        title: 'Desafios da semana',
        content: 'Esta semana foi desafiadora. Tive que lidar com alguns obstáculos no projeto, mas aprendi muito no processo. É importante manter o foco nos objetivos.',
        mood: 'neutral',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['desafios', 'aprendizado'],
      },
      {
        title: 'Gratidão',
        content: 'Sou grato pela oportunidade de trabalhar em algo que amo. Hoje recebi um feedback muito positivo de um cliente e isso me motivou ainda mais.',
        mood: 'grateful',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['gratidão', 'motivação'],
      },
    ];

    for (const entry of journalEntries) {
      await db.collection('journalEntries').add({
        ...entry,
        userId: USER_ID,
        isArchived: false,
        createdAt: entry.date,
        updatedAt: entry.date,
      });
    }

    console.log('\n🎉 DADOS DE EXEMPLO CRIADOS COM SUCESSO!');
    console.log('─'.repeat(60));
    console.log(`👤 Usuário: victorhanielbusiness@gmail.com`);
    console.log(`🆔 UID: ${USER_ID}`);
    console.log('📊 Dados criados:');
    console.log(`   💎 ${values.length} valores`);
    console.log(`   🎯 ${lifeAreas.length} áreas da vida`);
    console.log(`   🏆 ${objectives.length} objetivos`);
    console.log(`   ✅ ${tasks.length} tarefas`);
    console.log(`   🔄 ${habits.length} hábitos`);
    console.log(`   📔 ${journalEntries.length} entradas de diário`);
    console.log('─'.repeat(60));
    console.log('💡 Acesse http://localhost:3000 para ver os dados');

    await app.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Erro ao popular dados:', error);
    process.exit(1);
  }
}

// Executar script
populateSampleData();