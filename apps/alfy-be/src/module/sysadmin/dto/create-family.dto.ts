import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateFamilyDto {
  @ApiProperty({
    description: 'The name of the family',
    example: 'Famiglia Rossi',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'The description of the family',
    example: 'La famiglia di Mario Rossi',
    required: false,
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}

export class UpdateFamilyDto {
  @ApiProperty({
    description: 'The name of the family',
    example: 'Famiglia Rossi',
    required: false,
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @ApiProperty({
    description: 'The description of the family',
    example: 'La famiglia di Mario Rossi',
    required: false,
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}

export class UpdateUserStatusDto {
  @ApiProperty({
    description: 'Whether the user should be active',
    example: true,
  })
  @IsOptional()
  isActive?: boolean;
}

export class ChangeFamilyAdminDto {
  @ApiProperty({
    description: 'User ID of the new admin',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  @IsNotEmpty()
  newAdminId: string;
}
