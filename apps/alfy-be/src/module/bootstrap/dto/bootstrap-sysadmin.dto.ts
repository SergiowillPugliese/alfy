import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty, MinLength } from 'class-validator';

export class BootstrapSysadminDto {
  @ApiProperty({ 
    example: 'pugliese.sergio87@gotmail.it',
    description: 'Email for the sysadmin account' 
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ 
    example: 'securePassword123!',
    description: 'Password for the sysadmin account',
    minLength: 8 
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ 
    example: 'Sergio',
    description: 'First name of the sysadmin' 
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ 
    example: 'Pugliese',
    description: 'Last name of the sysadmin' 
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;
}
