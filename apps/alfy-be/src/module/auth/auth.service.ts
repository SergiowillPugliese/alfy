import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './entities/user.entity';
import { LoginDto, RefreshTokenDto } from './dto/create-auth.dto';
import { AuthResponse, UserProfile, JwtPayload } from '@alfy/alfy-shared-lib';

@Injectable()
export class AuthService {
  private readonly TEMP_PASSWORD = '4lf1M3mb3r';

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}


  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user);
    await this.updateRefreshToken(user._id.toString(), tokens.refresh_token);

    return {
      ...tokens,
      user: this.mapToUserProfile(user),
    };
  }

  async validateUser(email: string, password: string): Promise<UserDocument | null> {
    const user = await this.userModel.findOne({ email, isActive: true });
    if (user && await bcrypt.compare(password, user.password)) {
      return user;
    }
    return null;
  }

  async findUserById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).select('-password -refreshToken');
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto): Promise<AuthResponse> {
    try {
      const payload = this.jwtService.verify(refreshTokenDto.refresh_token, {
        secret: process.env['JWT_REFRESH_SECRET'] || 'your-refresh-secret-key',
      });

      const user = await this.userModel.findById(payload.sub);
      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const refreshTokenMatches = await bcrypt.compare(
        refreshTokenDto.refresh_token,
        user.refreshToken,
      );

      if (!refreshTokenMatches) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const tokens = await this.generateTokens(user);
      await this.updateRefreshToken(user._id.toString(), tokens.refresh_token);

      return {
        ...tokens,
        user: this.mapToUserProfile(user),
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { refreshToken: null });
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<UserDocument> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verify old password
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password and mark as reset
    user.password = hashedNewPassword;
    user.isPasswordReset = true;

    // Clear refresh token to force re-login with new password
    user.refreshToken = null;

    return await user.save();
  }

  private async generateTokens(user: UserDocument) {
    const payload: JwtPayload = {
      sub: user._id.toString(),
      email: user.email,
      globalRole: user.globalRole,
      isPasswordReset: user.isPasswordReset,
    };

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env['JWT_SECRET'] || 'your-secret-key',
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env['JWT_REFRESH_SECRET'] || 'your-refresh-secret-key',
        expiresIn: '7d',
      }),
    ]);

    return { access_token, refresh_token };
  }

  private async updateRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 12);
    await this.userModel.findByIdAndUpdate(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  private mapToUserProfile(user: UserDocument): UserProfile {
    return {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      globalRole: user.globalRole || undefined,
      isPasswordReset: user.isPasswordReset,
      createdAt: user.createdAt || new Date(),
      updatedAt: user.updatedAt || new Date(),
    };
  }

  /**
   * Create a user with temporary password (for sysadmin/admin use)
   */
  async createUserWithTempPassword(userData: {
    email: string;
    firstName: string;
    lastName: string;
    globalRole?: string;
  }): Promise<UserDocument> {
    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email: userData.email });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash temporary password
    const hashedPassword = await bcrypt.hash(this.TEMP_PASSWORD, 12);

    // Create user with temporary password
    const user = new this.userModel({
      email: userData.email,
      password: hashedPassword,
      firstName: userData.firstName,
      lastName: userData.lastName,
      globalRole: userData.globalRole || null,
      isPasswordReset: false, // User must reset password on first login
    });

    return await user.save();
  }

  /**
   * Get temporary password (for display purposes)
   */
  getTempPassword(): string {
    return this.TEMP_PASSWORD;
  }
}
