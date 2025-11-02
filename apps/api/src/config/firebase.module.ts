import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FirebaseService } from './firebase.service';
import firebaseConfig from './firebase.config';

/**
 * 📚 EXPLICAÇÃO: Firebase Module
 *
 * O QUE É UM @Global MODULE:
 * - Normalmente, você precisa importar um módulo em cada módulo que usa
 * - Com @Global(), o módulo fica disponível em TODA a aplicação
 * - Você só precisa importar FirebaseModule uma vez no AppModule
 *
 * POR QUE USAR @Global AQUI:
 * - Firebase será usado em vários módulos (Auth, Users, Goals, etc.)
 * - Evita repetir `imports: [FirebaseModule]` em todo lugar
 * - FirebaseService ficará disponível para injeção em qualquer service
 *
 * ESTRUTURA:
 * - imports: [ConfigModule] → Para ler configs do .env
 * - providers: [FirebaseService] → Service que inicializa Firebase
 * - exports: [FirebaseService] → Permite outros módulos usarem
 */

@Global()
@Module({
  imports: [
    // Registra a configuração do Firebase
    ConfigModule.forFeature(firebaseConfig),
  ],
  providers: [FirebaseService],
  exports: [FirebaseService],
})
export class FirebaseModule {}
