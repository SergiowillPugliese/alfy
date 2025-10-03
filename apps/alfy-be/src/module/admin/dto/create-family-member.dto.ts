import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class CreateFamilyMemberDto {
  @ApiProperty({ 
    example: 'lucia.rossi@email.com',
    description: 'Email for the new family member' 
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ 
    example: 'Lucia',
    description: 'First name of the family member' 
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ 
    example: 'Rossi',
    description: 'Last name of the family member' 
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;
}

export class UpdateFamilyMemberStatusDto {
  @ApiProperty({
    description: 'Whether the family member should be active',
    example: true,
  })
  isActive: boolean;
}
