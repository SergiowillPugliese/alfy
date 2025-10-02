import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateFamilyDto {
  @ApiProperty({
    description: 'The name of the family',
    example: 'Rossi Family',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'The description of the family',
    example: 'The Rossi family household',
    required: false,
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}

export class AddFamilyMemberDto {
  @ApiProperty({
    description: 'The email of the user to add to the family',
    example: 'user@example.com',
  })
  @IsString()
  @IsNotEmpty()
  email: string;
}

export class UpdateFamilyMemberDto {
  @ApiProperty({
    description: 'Whether the family member should be active',
    example: true,
  })
  @IsOptional()
  isActive?: boolean;
}
