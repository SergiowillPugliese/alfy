import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty, IsEnum, IsOptional, ValidateIf } from 'class-validator';
import { UserRole } from '../../../common/enums/roles.enum';

export class CreateUserDto {
  @ApiProperty({ 
    example: 'mario.rossi@email.com',
    description: 'Email for the new user' 
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ 
    example: 'Mario',
    description: 'First name of the user' 
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ 
    example: 'Rossi',
    description: 'Last name of the user' 
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ 
    example: 'admin',
    description: 'Role for the new user',
    enum: [UserRole.ADMIN, UserRole.USER]
  })
  @IsEnum([UserRole.ADMIN, UserRole.USER])
  role: UserRole;

  @ApiProperty({ 
    example: 'existing',
    description: 'Whether to use existing family or create new one',
    enum: ['existing', 'new']
  })
  @IsString()
  @IsNotEmpty()
  familyAction: 'existing' | 'new';

  @ApiProperty({ 
    example: '507f1f77bcf86cd799439011',
    description: 'Family ID if using existing family',
    required: false
  })
  @ValidateIf(o => o.familyAction === 'existing')
  @IsString()
  @IsNotEmpty()
  familyId?: string;

  @ApiProperty({ 
    example: 'Famiglia Rossi',
    description: 'Family name if creating new family',
    required: false
  })
  @ValidateIf(o => o.familyAction === 'new')
  @IsString()
  @IsNotEmpty()
  familyName?: string;

  @ApiProperty({ 
    example: 'La famiglia di Mario Rossi',
    description: 'Family description if creating new family',
    required: false
  })
  @IsOptional()
  @IsString()
  familyDescription?: string;
}
