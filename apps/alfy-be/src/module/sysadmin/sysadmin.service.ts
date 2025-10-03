import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../auth/entities/user.entity';
import { Family, FamilyDocument } from '../family/entities/family.entity';
import { FamilyMember, FamilyMemberDocument } from '../family/entities/family-member.entity';
import { AuthService } from '../auth/auth.service';
import { UserRole } from '../../common/enums/roles.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateFamilyDto, UpdateFamilyDto, ChangeFamilyAdminDto } from './dto/create-family.dto';

@Injectable()
export class SysadminService {

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Family.name) private familyModel: Model<FamilyDocument>,
    @InjectModel(FamilyMember.name) private familyMemberModel: Model<FamilyMemberDocument>,
    private authService: AuthService,
  ) {}

  // FAMILY MANAGEMENT
  async createFamily(createFamilyDto: CreateFamilyDto): Promise<FamilyDocument> {
    const family = new this.familyModel({
      name: createFamilyDto.name,
      description: createFamilyDto.description,
      adminId: null, // Will be set when admin is assigned
    });

    return await family.save();
  }

  async getAllFamilies(): Promise<FamilyDocument[]> {
    return await this.familyModel
      .find()
      .populate('adminId', 'firstName lastName email')
      .exec();
  }

  async updateFamily(familyId: string, updateFamilyDto: UpdateFamilyDto): Promise<FamilyDocument> {
    const family = await this.familyModel.findByIdAndUpdate(
      familyId,
      updateFamilyDto,
      { new: true }
    );

    if (!family) {
      throw new NotFoundException('Family not found');
    }

    return family;
  }

  // USER MANAGEMENT
  async createUser(createUserDto: CreateUserDto): Promise<{ user: UserDocument; family: FamilyDocument }> {
    let family: FamilyDocument;

    // Handle family assignment
    if (createUserDto.familyAction === 'existing') {
      family = await this.familyModel.findById(createUserDto.familyId);
      if (!family) {
        throw new NotFoundException('Family not found');
      }
    } else {
      // Create new family
      family = await this.createFamily({
        name: createUserDto.familyName!,
        description: createUserDto.familyDescription,
      });
    }

    // Create user with temporary password using centralized method
    const savedUser = await this.authService.createUserWithTempPassword({
      email: createUserDto.email,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      globalRole: createUserDto.role === UserRole.ADMIN ? null : null, // Only sysadmin has globalRole
    });

    // Create family member relationship
    const familyMember = new this.familyMemberModel({
      familyId: family._id,
      userId: savedUser._id,
      role: createUserDto.role,
      isActive: true,
    });

    await familyMember.save();

    // If this is an admin and the family doesn't have an admin yet, set as admin
    if (createUserDto.role === UserRole.ADMIN && !family.adminId) {
      family.adminId = savedUser._id as Types.ObjectId;
      await family.save();
    }

    return { user: savedUser, family };
  }

  async getAllUsers(): Promise<UserDocument[]> {
    return await this.userModel
      .find({ globalRole: { $ne: UserRole.SYSADMIN } }) // Exclude sysadmin from list
      .select('-password -refreshToken')
      .exec();
  }

  async updateUserStatus(userId: string, isActive: boolean): Promise<UserDocument> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.globalRole === UserRole.SYSADMIN) {
      throw new ForbiddenException('Cannot modify sysadmin user');
    }

    user.isActive = isActive;
    await user.save();

    // Also update family member status
    await this.familyMemberModel.updateMany(
      { userId: new Types.ObjectId(userId) },
      { isActive }
    );

    return user;
  }

  async deleteUser(userId: string): Promise<void> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.globalRole === UserRole.SYSADMIN) {
      throw new ForbiddenException('Cannot delete sysadmin user');
    }

    // Check if user is admin of any family
    const adminMemberships = await this.familyMemberModel.find({
      userId: new Types.ObjectId(userId),
      role: UserRole.ADMIN,
    });

    if (adminMemberships.length > 0) {
      throw new ForbiddenException('Cannot delete user who is admin of a family. Change admin first.');
    }

    // Delete family memberships
    await this.familyMemberModel.deleteMany({ userId: new Types.ObjectId(userId) });

    // Delete user
    await this.userModel.findByIdAndDelete(userId);
  }

  async changeFamilyAdmin(familyId: string, changeFamilyAdminDto: ChangeFamilyAdminDto): Promise<FamilyDocument> {
    const family = await this.familyModel.findById(familyId);
    if (!family) {
      throw new NotFoundException('Family not found');
    }

    const newAdmin = await this.userModel.findById(changeFamilyAdminDto.newAdminId);
    if (!newAdmin) {
      throw new NotFoundException('New admin user not found');
    }

    // Check if new admin is member of this family
    const membership = await this.familyMemberModel.findOne({
      familyId: new Types.ObjectId(familyId),
      userId: new Types.ObjectId(changeFamilyAdminDto.newAdminId),
      isActive: true,
    });

    if (!membership) {
      throw new ForbiddenException('User is not an active member of this family');
    }

    // Update old admin to user role (if exists)
    if (family.adminId) {
      await this.familyMemberModel.findOneAndUpdate(
        { familyId: new Types.ObjectId(familyId), userId: family.adminId },
        { role: UserRole.USER }
      );
    }

    // Update new admin role
    membership.role = UserRole.ADMIN;
    await membership.save();

    // Update family admin
    family.adminId = new Types.ObjectId(changeFamilyAdminDto.newAdminId);
    await family.save();

    return family;
  }

  async getFamilyWithMembers(familyId: string): Promise<any> {
    const family = await this.familyModel
      .findById(familyId)
      .populate('adminId', 'firstName lastName email')
      .exec();

    if (!family) {
      throw new NotFoundException('Family not found');
    }

    const members = await this.familyMemberModel
      .find({ familyId: new Types.ObjectId(familyId) })
      .populate('userId', 'firstName lastName email isActive')
      .exec();

    return {
      ...family.toObject(),
      members,
    };
  }

  /**
   * Get temporary password (for display purposes)
   */
  getTempPassword(): string {
    return this.authService.getTempPassword();
  }
}
