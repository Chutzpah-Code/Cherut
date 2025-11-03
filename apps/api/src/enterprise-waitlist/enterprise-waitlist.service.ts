import { Injectable, BadRequestException } from '@nestjs/common';
import { FirebaseService } from '../config/firebase.service';
import { CreateEnterpriseWaitlistDto } from './dto/create-enterprise-waitlist.dto';

@Injectable()
export class EnterpriseWaitlistService {
  private readonly collectionName = 'enterprise_waitlist';

  constructor(private readonly firebaseService: FirebaseService) {}

  async create(createDto: CreateEnterpriseWaitlistDto) {
    try {
      const db = this.firebaseService.getFirestore();

      // Sanitiza os dados para prevenir XSS
      const sanitizedData = {
        contactName: this.sanitizeString(createDto.contactName),
        phoneNumber: this.sanitizeString(createDto.phoneNumber),
        companyName: this.sanitizeString(createDto.companyName),
        numberOfEmployees: createDto.numberOfEmployees
          ? this.sanitizeString(createDto.numberOfEmployees)
          : null,
        companyRevenue: createDto.companyRevenue
          ? this.sanitizeString(createDto.companyRevenue)
          : null,
        intendedUse: createDto.intendedUse
          ? this.sanitizeString(createDto.intendedUse)
          : null,
        desiredFeatures: createDto.desiredFeatures
          ? this.sanitizeString(createDto.desiredFeatures)
          : null,
        createdAt: new Date().toISOString(),
        status: 'pending',
        ipAddress: null, // Você pode adicionar o IP se quiser rastrear
      };

      const docRef = await db.collection(this.collectionName).add(sanitizedData);

      return {
        id: docRef.id,
        message: 'Solicitação enviada com sucesso!',
      };
    } catch (error) {
      console.error('Error creating enterprise waitlist entry:', error);
      throw new BadRequestException('Erro ao processar solicitação');
    }
  }

  // Função para sanitizar strings e prevenir XSS
  private sanitizeString(input: string): string {
    if (!input) return '';

    return input
      .replace(/[<>]/g, '') // Remove < e >
      .replace(/javascript:/gi, '') // Remove javascript:
      .replace(/on\w+=/gi, '') // Remove event handlers (onclick=, onload=, etc)
      .trim();
  }
}
