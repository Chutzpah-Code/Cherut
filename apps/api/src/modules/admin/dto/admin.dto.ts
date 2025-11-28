import { IsEmail, IsOptional, IsString, IsEnum } from 'class-validator';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export enum SubscriptionPlan {
  FREE = 'free',
  CORE = 'core',
  PRO = 'pro',
  ELITE = 'elite',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  CANCELLED = 'cancelled',
}

/**
 * DTO for creating new admin
 */
export class CreateAdminDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  displayName?: string;
}

/**
 * DTO for promoting existing user to admin
 */
export class PromoteUserDto {
  @IsEmail()
  email: string;
}

/**
 * DTO for user search filters
 */
export class UserFiltersDto {
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsEnum(SubscriptionPlan)
  plan?: SubscriptionPlan;

  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;

  @IsOptional()
  @IsString()
  search?: string; // Search by name or email

  @IsOptional()
  @IsString()
  limit?: string; // Results limit

  @IsOptional()
  @IsString()
  offset?: string; // For pagination
}