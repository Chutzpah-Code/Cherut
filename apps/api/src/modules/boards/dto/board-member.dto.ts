import { IsEmail, IsNotEmpty, IsIn, IsString } from 'class-validator';

export class AddMemberDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsIn(['editor', 'collaborator'])
  role: 'editor' | 'collaborator';
}

export class UpdateMemberRoleDto {
  @IsIn(['editor', 'collaborator'])
  role: 'editor' | 'collaborator';
}

export class TransferOwnershipDto {
  @IsString()
  @IsNotEmpty()
  newOwnerUid: string;
}
