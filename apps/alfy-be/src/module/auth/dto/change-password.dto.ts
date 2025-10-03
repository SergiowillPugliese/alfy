import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, Matches } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ 
    example: '4lf1M3mb3r',
    description: 'Current password (temporary or existing)' 
  })
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @ApiProperty({ 
    example: 'NewSecurePassword123!',
    description: 'New password - must contain uppercase, lowercase, number and special character',
    minLength: 8 
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    {
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character (@$!%*?&)',
    },
  )
  newPassword: string;
}
