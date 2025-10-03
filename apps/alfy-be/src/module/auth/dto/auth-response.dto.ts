import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from '../../../common/dto/baseResponce.dto';

export class UserProfileDto {
  @ApiProperty({ description: 'User ID' })
  id: string;

  @ApiProperty({ description: 'User email' })
  email: string;

  @ApiProperty({ description: 'User first name' })
  firstName: string;

  @ApiProperty({ description: 'User last name' })
  lastName: string;

  @ApiProperty({ 
    description: 'User global role (only for sysadmin)', 
    required: false,
    example: null 
  })
  globalRole?: string;

  @ApiProperty({ 
    description: 'Whether the user has reset their temporary password',
    example: false 
  })
  isPasswordReset: boolean;

  @ApiProperty({ description: 'User creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'User last update date' })
  updatedAt: Date;
}

export class AuthTokensDto {
  @ApiProperty({ description: 'JWT access token' })
  access_token: string;

  @ApiProperty({ description: 'JWT refresh token' })
  refresh_token: string;

  @ApiProperty({ description: 'User profile information', type: UserProfileDto })
  user: UserProfileDto;
}

export class AuthResponseDto extends BaseResponseDto<AuthTokensDto> {
  @ApiProperty({ type: AuthTokensDto, required: false })
  data?: AuthTokensDto;
}

export class UserProfileResponseDto extends BaseResponseDto<UserProfileDto> {
  @ApiProperty({ type: UserProfileDto, required: false })
  data?: UserProfileDto;
}

export class LogoutMessageDto {
  @ApiProperty({ description: 'Logout message' })
  message: string;
}

export class LogoutResponseDto extends BaseResponseDto<LogoutMessageDto> {
  @ApiProperty({ type: LogoutMessageDto, required: false })
  data?: LogoutMessageDto;
}
