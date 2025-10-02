import { 
  Controller, 
  Post, 
  Body, 
  UseGuards, 
  Request,
  Get,
  HttpCode,
  HttpStatus 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dto/create-auth.dto';
import { AuthResponseDto, UserProfileResponseDto, LogoutResponseDto } from './dto/auth-response.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { BaseResponseDto } from '../../common/dto/baseResponce.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ 
    status: 201, 
    description: 'User successfully registered',
    type: AuthResponseDto 
  })
  @ApiResponse({ status: 409, description: 'User already exists' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    const authData = await this.authService.register(registerDto);
    return BaseResponseDto.success(authData, 'User successfully registered');
  }

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
      createdAt: user.createdAt || new Date(),
      updatedAt: user.updatedAt || new Date(),
    };
    return BaseResponseDto.success(userProfile, 'User profile retrieved successfully');
  }
}