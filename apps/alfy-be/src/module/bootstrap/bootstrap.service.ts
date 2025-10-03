import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from '../auth/entities/user.entity';
import { UserRole } from '../../common/enums/roles.enum';
import { BootstrapSysadminDto } from './dto/bootstrap-sysadmin.dto';
import { AuthResponse, UserProfile } from '@alfy/alfy-shared-lib';

@Injectable()
export class BootstrapService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async bootstrapSysadmin(bootstrapDto: BootstrapSysadminDto): Promise<{ user: UserProfile }> {
    // Check if any sysadmin already exists
    const existingSysadmin = await this.userModel.findOne({ 
      globalRole: UserRole.SYSADMIN 
    });

    if (existingSysadmin) {
      throw new ConflictException('Sysadmin already exists. Bootstrap can only be run once.');
    }

    // Check if user with this email already exists
    const existingUser = await this.userModel.findOne({ 
      email: bootstrapDto.email 
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(bootstrapDto.password, 12);

    // Create sysadmin user
    const sysadminUser = new this.userModel({
      email: bootstrapDto.email,
      password: hashedPassword,
      firstName: bootstrapDto.firstName,
      lastName: bootstrapDto.lastName,
      globalRole: UserRole.SYSADMIN,
      isPasswordReset: true, // Sysadmin sets their own password, so it's already "reset"
      isActive: true,
    });

    const savedUser = await sysadminUser.save();

    return {
      user: this.mapToUserProfile(savedUser),
    };
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
}
