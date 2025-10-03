import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Family, FamilyDocument } from './entities/family.entity';
import { FamilyMember, FamilyMemberDocument } from './entities/family-member.entity';
import { User, UserDocument } from '../auth/entities/user.entity';
import { UserRole } from '../../common/enums/roles.enum';

@Injectable()
export class FamilyService {
  constructor(
    @InjectModel(Family.name) private familyModel: Model<FamilyDocument>,
    @InjectModel(FamilyMember.name) private familyMemberModel: Model<FamilyMemberDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async createFamily(adminId: string, name: string, description?: string): Promise<FamilyDocument> {
    // Check if user is already admin of a family
    const existingAdminMembership = await this.familyMemberModel.findOne({
      userId: new Types.ObjectId(adminId),
      role: UserRole.ADMIN,
      isActive: true,
    });

    if (existingAdminMembership) {
      throw new ConflictException('User is already admin of a family');
    }

    // Create family
    const family = new this.familyModel({
      name,
      description,
      adminId: new Types.ObjectId(adminId),
    });

    const savedFamily = await family.save();

    // Add admin as family member
    await this.addFamilyMember(savedFamily._id.toString(), adminId, UserRole.ADMIN);

    return savedFamily;
  }

  async addFamilyMember(familyId: string, userId: string, role: UserRole = UserRole.USER): Promise<FamilyMemberDocument> {
    // Check if user exists
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user is already a member of this family
    const existingMembership = await this.familyMemberModel.findOne({
      familyId: new Types.ObjectId(familyId),
      userId: new Types.ObjectId(userId),
    });

    if (existingMembership) {
      if (existingMembership.isActive) {
        throw new ConflictException('User is already a member of this family');
      } else {
        // Reactivate existing membership
        existingMembership.isActive = true;
        existingMembership.role = role;
        return await existingMembership.save();
      }
    }

    // Create new family member
    const familyMember = new this.familyMemberModel({
      familyId: new Types.ObjectId(familyId),
      userId: new Types.ObjectId(userId),
      role,
    });

    return await familyMember.save();
  }

  async getFamilyMembers(familyId: string, includeInactive = false): Promise<FamilyMemberDocument[]> {
    const query: { familyId: Types.ObjectId; isActive?: boolean } = { familyId: new Types.ObjectId(familyId) };
    if (!includeInactive) {
      query.isActive = true;
    }

    return await this.familyMemberModel
      .find(query)
      .populate('userId', 'firstName lastName email')
      .exec();
  }

  async getUserFamilies(userId: string): Promise<FamilyMemberDocument[]> {
    return await this.familyMemberModel
      .find({
        userId: new Types.ObjectId(userId),
        isActive: true,
      })
      .populate('familyId', 'name description')
      .exec();
  }

  async getUserFamilyId(userId: string): Promise<string | null> {
    const membership = await this.familyMemberModel.findOne({
      userId: new Types.ObjectId(userId),
      isActive: true,
    });

    return membership ? membership.familyId.toString() : null;
  }

  async getUserRoleInFamily(userId: string, familyId: string): Promise<UserRole | null> {
    const membership = await this.familyMemberModel.findOne({
      userId: new Types.ObjectId(userId),
      familyId: new Types.ObjectId(familyId),
      isActive: true,
    });

    return membership ? membership.role : null;
  }

  async isUserFamilyMember(userId: string, familyId: string): Promise<boolean> {
    const membership = await this.familyMemberModel.findOne({
      userId: new Types.ObjectId(userId),
      familyId: new Types.ObjectId(familyId),
      isActive: true,
    });

    return !!membership;
  }

  async deactivateFamilyMember(familyId: string, userId: string, requesterId: string): Promise<void> {
    // Check if requester is admin of the family
    const requesterRole = await this.getUserRoleInFamily(requesterId, familyId);
    if (requesterRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Only family admin can deactivate members');
    }

    // Cannot deactivate yourself as admin
    if (userId === requesterId) {
      throw new ForbiddenException('Admin cannot deactivate themselves');
    }

    const membership = await this.familyMemberModel.findOne({
      familyId: new Types.ObjectId(familyId),
      userId: new Types.ObjectId(userId),
      isActive: true,
    });

    if (!membership) {
      throw new NotFoundException('Family member not found');
    }

    membership.isActive = false;
    await membership.save();
  }

  async activateFamilyMember(familyId: string, userId: string, requesterId: string): Promise<void> {
    // Check if requester is admin of the family
    const requesterRole = await this.getUserRoleInFamily(requesterId, familyId);
    if (requesterRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Only family admin can activate members');
    }

    const membership = await this.familyMemberModel.findOne({
      familyId: new Types.ObjectId(familyId),
      userId: new Types.ObjectId(userId),
      isActive: false,
    });

    if (!membership) {
      throw new NotFoundException('Inactive family member not found');
    }

    membership.isActive = true;
    await membership.save();
  }

  async updateFamilyMemberRole(familyId: string, userId: string, newRole: UserRole, requesterId: string): Promise<void> {
    // Check if requester is admin of the family
    const requesterRole = await this.getUserRoleInFamily(requesterId, familyId);
    if (requesterRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Only family admin can update member roles');
    }

    // Cannot change your own role as admin
    if (userId === requesterId) {
      throw new ForbiddenException('Admin cannot change their own role');
    }

    // Cannot assign admin role to others
    if (newRole === UserRole.ADMIN) {
      throw new ForbiddenException('Cannot assign admin role to other members');
    }

    const membership = await this.familyMemberModel.findOne({
      familyId: new Types.ObjectId(familyId),
      userId: new Types.ObjectId(userId),
      isActive: true,
    });

    if (!membership) {
      throw new NotFoundException('Family member not found');
    }

    membership.role = newRole;
    await membership.save();
  }

  async deleteFamilyMember(familyId: string, userId: string, requesterId: string): Promise<void> {
    // Check if requester is sysadmin
    const requester = await this.userModel.findById(requesterId);
    if (!requester || requester.globalRole !== UserRole.SYSADMIN) {
      throw new ForbiddenException('Only sysadmin can permanently delete family members');
    }

    const membership = await this.familyMemberModel.findOne({
      familyId: new Types.ObjectId(familyId),
      userId: new Types.ObjectId(userId),
    });

    if (!membership) {
      throw new NotFoundException('Family member not found');
    }

    await this.familyMemberModel.deleteOne({ _id: membership._id });
  }

  async getFamilyById(familyId: string): Promise<FamilyDocument | null> {
    return await this.familyModel.findById(familyId).exec();
  }

  async updateFamily(familyId: string, updates: Partial<Family>, requesterId: string): Promise<FamilyDocument> {
    // Check if requester is admin of the family
    const requesterRole = await this.getUserRoleInFamily(requesterId, familyId);
    if (requesterRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Only family admin can update family details');
    }

    const family = await this.familyModel.findByIdAndUpdate(
      familyId,
      updates,
      { new: true }
    );

    if (!family) {
      throw new NotFoundException('Family not found');
    }

    return family;
  }
}
