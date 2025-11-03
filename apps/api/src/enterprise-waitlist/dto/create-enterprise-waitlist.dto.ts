import { IsString, IsNotEmpty, IsEmail, IsOptional, MaxLength, Matches } from 'class-validator';

export class CreateEnterpriseWaitlistDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  contactName: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[\d\s\-\(\)]+$/, {
    message: 'Número de telefone inválido',
  })
  @MaxLength(20)
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  companyName: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  numberOfEmployees?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  companyRevenue?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  intendedUse?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  desiredFeatures?: string;
}
