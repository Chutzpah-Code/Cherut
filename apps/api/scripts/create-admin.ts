#!/usr/bin/env ts-node
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { FirebaseService } from '../src/config/firebase.service';

/**
 * Script para criar usuário administrador inicial
 *
 * USO:
 * npm run script:create-admin
 *
 * VARIÁVEIS NECESSÁRIAS:
 * INITIAL_ADMIN_EMAIL=admin@exemplo.com
 * INITIAL_ADMIN_PASSWORD=senhaSegura123
 */

async function createInitialAdmin() {
  console.log('🚀 Iniciando criação do usuário administrador...');

  try {
    // Inicializar aplicação NestJS para acessar services
    const app = await NestFactory.createApplicationContext(AppModule);
    const firebaseService = app.get(FirebaseService);

    const adminEmail = process.env.INITIAL_ADMIN_EMAIL;
    const adminPassword = process.env.INITIAL_ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      throw new Error('❌ Variáveis INITIAL_ADMIN_EMAIL e INITIAL_ADMIN_PASSWORD são obrigatórias');
    }

    console.log(`📧 Email do admin: ${adminEmail}`);

    // 1. Verificar se admin já existe
    const auth = firebaseService.getAuth();
    const db = firebaseService.getFirestore();

    let existingUser: import('firebase-admin/auth').UserRecord | null = null;
    try {
      existingUser = await auth.getUserByEmail(adminEmail);
    } catch (lookupError: any) {
      if (lookupError?.code !== 'auth/user-not-found') {
        // Erro real (ex: rede, credenciais, emulador inacessível) — não assumir que o usuário não existe
        throw lookupError;
      }
      console.log('👤 Usuário não existe, criando novo...');
    }

    if (existingUser) {
      console.log(`⚠️  Usuário já existe no Firebase Auth: ${existingUser.uid}`);

      // Verificar se já é admin no Firestore + custom claim
      const userDoc = await db.collection('users').doc(existingUser.uid).get();
      const existingClaims = (await auth.getUser(existingUser.uid)).customClaims;
      if (userDoc.exists && userDoc.data()?.role === 'admin' && existingClaims?.role === 'admin') {
        console.log('✅ Usuário já é administrador (Firestore + custom claim)');
        process.exit(0);
      }

      // Promover usuário existente para admin
      await db.collection('users').doc(existingUser.uid).update({
        role: 'admin',
        isSystemAdmin: true,
        promotedToAdminAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Custom claim — é isto que o frontend lê (getIdTokenResult().claims.role),
      // não o campo role do Firestore. Sem isto o usuário nunca é reconhecido como admin.
      await auth.setCustomUserClaims(existingUser.uid, { role: 'admin' });

      console.log('✅ Usuário existente promovido para administrador (Firestore + custom claim)');
      console.log('⚠️  O usuário precisa deslogar e logar novamente para o novo token refletir a claim.');
      process.exit(0);
    }

    // 2. Criar usuário no Firebase Auth
    console.log('🔐 Criando usuário no Firebase Auth...');
    const userRecord = await auth.createUser({
      email: adminEmail,
      password: adminPassword,
      displayName: 'System Administrator',
      emailVerified: true, // Admin já vem verificado
    });

    console.log(`✅ Usuário criado no Firebase Auth: ${userRecord.uid}`);

    // 3. Criar documento no Firestore com role admin
    console.log('📄 Criando documento no Firestore...');
    const userData = {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      role: 'admin', // 🎯 CAMPO PRINCIPAL
      isSystemAdmin: true, // Admin inicial do sistema
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),

      // Dados padrão do sistema Cherut
      onboardingCompleted: true, // Admin não precisa de onboarding
      lifePurpose: 'System Administration',
      subscription: {
        plan: 'enterprise', // Admin tem acesso total
        status: 'active',
        startDate: new Date().toISOString(),
        isSystemAccount: true,
      },

      // Metadados do admin
      adminCreatedAt: new Date().toISOString(),
      lastLoginAt: null,
      permissions: ['all'], // Todas as permissões
    };

    await db.collection('users').doc(userRecord.uid).set(userData);

    console.log('✅ Documento criado no Firestore com role admin');

    // Custom claim — é isto que o frontend lê (getIdTokenResult().claims.role),
    // não o campo role do Firestore. Sem isto o usuário nunca é reconhecido como admin.
    await auth.setCustomUserClaims(userRecord.uid, { role: 'admin' });
    console.log('✅ Custom claim role=admin definida no Firebase Auth');

    // 4. Resumo final
    console.log('\n🎉 ADMINISTRADOR CRIADO COM SUCESSO!');
    console.log('─'.repeat(50));
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🆔 UID: ${userRecord.uid}`);
    console.log(`👑 Role: admin`);
    console.log(`🌐 Acesso: https://seuapp.com (login normal)`);
    console.log('─'.repeat(50));
    console.log('💡 O usuário será redirecionado automaticamente para /admin após login');

    await app.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Erro ao criar administrador:', error);
    process.exit(1);
  }
}

// Executar script
createInitialAdmin();