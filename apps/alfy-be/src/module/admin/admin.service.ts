import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../auth/entities/user.entity';
import { FamilyMember, FamilyMemberDocument } from '../family/entities/family-member.entity';
import { AuthService } from '../auth/auth.service';
import { UserRole } from '../../common/enums/roles.enum';
import { CreateFamilyMemberDto } from './dto/create-family-member.dto';

export interface FamilyStats {
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  adminCount: number;
  userCount: number;
}

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(FamilyMember.name) private familyMemberModel: Model<FamilyMemberDocument>,
    private authService: AuthService,
  ) {}

  async createFamilyMember(
    adminFamilyId: string,
    createFamilyMemberDto: CreateFamilyMemberDto,
  ): Promise<{ user: UserDocument; familyMember: FamilyMemberDocument }> {
    // Create user with temporary password using centralized method
    const savedUser = await this.authService.createUserWithTempPassword({
      email: createFamilyMemberDto.email,
      firstName: createFamilyMemberDto.firstName,
      lastName: createFamilyMemberDto.lastName,
      globalRole: null, // Family members don't have global roles
    });

    // Create family member relationship
    const familyMember = new this.familyMemberModel({
      familyId: new Types.ObjectId(adminFamilyId),
      userId: savedUser._id,
      role: UserRole.USER, // Admin can only create users, not other admins
      isActive: true,
    });

    const savedFamilyMember = await familyMember.save();

    return { user: savedUser, familyMember: savedFamilyMember };
  }

  async getFamilyMembers(adminFamilyId: string): Promise<FamilyMemberDocument[]> {
    return await this.familyMemberModel
      .find({ 
        familyId: new Types.ObjectId(adminFamilyId),
      })
      .populate('userId', 'firstName lastName email isActive')
      .exec();
  }

  async updateFamilyMemberStatus(
    adminFamilyId: string,
    memberId: string,
    isActive: boolean,
    adminUserId: string,
  ): Promise<FamilyMemberDocument> {
    // Find the family member
    const familyMember = await this.familyMemberModel.findOne({
      _id: new Types.ObjectId(memberId),
      familyId: new Types.ObjectId(adminFamilyId),
    });

    if (!familyMember) {
      throw new NotFoundException('Family member not found');
    }

    // Prevent admin from deactivating themselves
    if (familyMember.userId.toString() === adminUserId) {
      throw new ForbiddenException('Admin cannot deactivate themselves');
    }

    // Prevent admin from deactivating other admins
    if (familyMember.role === UserRole.ADMIN && familyMember.userId.toString() !== adminUserId) {
      throw new ForbiddenException('Admin cannot deactivate other admins');
    }

    // Update family member status
    familyMember.isActive = isActive;
    await familyMember.save();

    // Also update user status
    await this.userModel.findByIdAndUpdate(familyMember.userId, { isActive });

    return familyMember;
  }

  async getFamilyMemberById(
    adminFamilyId: string,
    memberId: string,
  ): Promise<FamilyMemberDocument> {
    const familyMember = await this.familyMemberModel
      .findOne({
        _id: new Types.ObjectId(memberId),
        familyId: new Types.ObjectId(adminFamilyId),
      })
      .populate('userId', 'firstName lastName email isActive')
      .exec();

    if (!familyMember) {
      throw new NotFoundException('Family member not found');
    }

    return familyMember;
  }

  async getFamilyStats(adminFamilyId: string): Promise<FamilyStats> {
    const totalMembers = await this.familyMemberModel.countDocuments({
      familyId: new Types.ObjectId(adminFamilyId),
    });

    const activeMembers = await this.familyMemberModel.countDocuments({
      familyId: new Types.ObjectId(adminFamilyId),
      isActive: true,
    });

    const adminCount = await this.familyMemberModel.countDocuments({
      familyId: new Types.ObjectId(adminFamilyId),
      role: UserRole.ADMIN,
      isActive: true,
    });

    const userCount = await this.familyMemberModel.countDocuments({
      familyId: new Types.ObjectId(adminFamilyId),
      role: UserRole.USER,
      isActive: true,
    });

    return {
      totalMembers,
      activeMembers,
      inactiveMembers: totalMembers - activeMembers,
      adminCount,
      userCount,
    };
  }

  /**
   * Get temporary password (for display purposes)
   */
  getTempPassword(): string {
    return this.authService.getTempPassword();
  }
}
