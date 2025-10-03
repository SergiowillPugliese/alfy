import { 
  Controller, 
  Post, 
  Put,
  Body, 
  UseGuards, 
  Request,
  Get,
  HttpCode,
  HttpStatus 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RefreshTokenDto } from './dto/create-auth.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuthResponseDto, UserProfileResponseDto, LogoutResponseDto } from './dto/auth-response.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { BaseResponseDto } from '../../common/dto/baseResponce.dto';

@ApiTags('Authentication (Login Only)')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}


  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ 
    status: 200, 
    description: 'User successfully logged in',
    type: AuthResponseDto 
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    const authData = await this.authService.login(loginDto);
    return BaseResponseDto.success(authData, 'User successfully logged in');
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ 
    status: 200, 
    description: 'Token successfully refreshed',
    type: AuthResponseDto 
  })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto): Promise<AuthResponseDto> {
    const authData = await this.authService.refreshTokens(refreshTokenDto);
    return BaseResponseDto.success(authData, 'Token successfully refreshed');
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ 
    status: 200, 
    description: 'User successfully logged out',
    type: LogoutResponseDto 
  })
  async logout(@Request() req: { user: { id: string } }): Promise<LogoutResponseDto> {
    await this.authService.logout(req.user.id);
    return BaseResponseDto.success({ message: 'Successfully logged out' }, 'User successfully logged out');
  }

  @UseGuards(JwtAuthGuard)
  @Put('change-password')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Change user password',
    description: 'Change password from temporary to secure password. Required for users with isPasswordReset=false.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Password changed successfully',
    type: BaseResponseDto 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Current password is incorrect' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'New password does not meet security requirements' 
  })
  async changePassword(@Body() changePasswordDto: ChangePasswordDto, @Request() req: { user: { sub: string } }) {
    await this.authService.changePassword(
      req.user.sub,
      changePasswordDto.oldPassword,
      changePasswordDto.newPassword,
    );

    return BaseResponseDto.success(
      null,
      'Password changed successfully. Please login again with your new password.',
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ 
    status: 200, 
    description: 'User profile retrieved',
    type: UserProfileResponseDto 
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Request() req: { user: { id: string } }): Promise<UserProfileResponseDto> {
    const user = await this.authService.findUserById(req.user.id);
    if (!user) {
      throw new Error('User not found');
    }
    const userProfile = {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      globalRole: user.globalRole,
      isPasswordReset: user.isPasswordReset,
      createdAt: user.createdAt || new Date(),
      updatedAt: user.updatedAt || new Date(),
    };
    return BaseResponseDto.success(userProfile, 'User profile retrieved successfully');
  }
}