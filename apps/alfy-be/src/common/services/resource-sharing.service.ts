import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ResourceSharing, ResourceSharingDocument } from '../entities/resource-sharing.entity';
import { SharingLevel, UserRole } from '../enums/roles.enum';
import { FamilyService } from '../../module/family/family.service';

@Injectable()
export class ResourceSharingService {
  constructor(
    @InjectModel(ResourceSharing.name) private resourceSharingModel: Model<ResourceSharingDocument>,
    private familyService: FamilyService,
  ) {}

  async createResourceSharing(
    resourceId: string,
    resourceType: string,
    ownerId: string,
    familyId: string,
    sharingLevel: SharingLevel = SharingLevel.PRIVATE,
    sharedWithUsers: string[] = []
  ): Promise<ResourceSharingDocument> {
    // Check if resource sharing already exists
    const existing = await this.resourceSharingModel.findOne({
      resourceId,
      resourceType,
    });

    if (existing) {
      // Update existing
      existing.sharingLevel = sharingLevel;
      existing.sharedWithUsers = sharedWithUsers.map(id => new Types.ObjectId(id));
      return await existing.save();
    }

    // Create new resource sharing
    const resourceSharing = new this.resourceSharingModel({
      resourceId,
      resourceType,
      ownerId: new Types.ObjectId(ownerId),
      familyId: new Types.ObjectId(familyId),
      sharingLevel,
      sharedWithUsers: sharedWithUsers.map(id => new Types.ObjectId(id)),
    });

    return await resourceSharing.save();
  }

  async updateResourceSharing(
    resourceId: string,
    resourceType: string,
    sharingLevel: SharingLevel,
    sharedWithUsers: string[] = [],
    requesterId: string
  ): Promise<ResourceSharingDocument> {
    const resourceSharing = await this.resourceSharingModel.findOne({
      resourceId,
      resourceType,
    });

    if (!resourceSharing) {
      throw new NotFoundException('Resource sharing not found');
    }

    // Check if requester is the owner
    if (resourceSharing.ownerId.toString() !== requesterId) {
      throw new ForbiddenException('Only resource owner can update sharing settings');
    }

    // Validate that shared users are family members
    if (sharingLevel === SharingLevel.SELECTED_MEMBERS && sharedWithUsers.length > 0) {
      for (const userId of sharedWithUsers) {
        const isMember = await this.familyService.isUserFamilyMember(userId, resourceSharing.familyId.toString());
        if (!isMember) {
          throw new ForbiddenException(`User ${userId} is not a member of the family`);
        }
      }
    }

    resourceSharing.sharingLevel = sharingLevel;
    resourceSharing.sharedWithUsers = sharedWithUsers.map(id => new Types.ObjectId(id));

    return await resourceSharing.save();
  }

  async canUserAccessResource(
    userId: string,
    resourceId: string,
    resourceType: string
  ): Promise<boolean> {
    const resourceSharing = await this.resourceSharingModel.findOne({
      resourceId,
      resourceType,
    });

    if (!resourceSharing) {
      return false;
    }

    // Owner can always access
    if (resourceSharing.ownerId.toString() === userId) {
      return true;
    }

    // Check if user is family member
    const isFamilyMember = await this.familyService.isUserFamilyMember(
      userId,
      resourceSharing.familyId.toString()
    );

    if (!isFamilyMember) {
      return false;
    }

    // Check sharing level
    switch (resourceSharing.sharingLevel) {
      case SharingLevel.PRIVATE:
        return false;
      
      case SharingLevel.FAMILY:
        return true;
      
      case SharingLevel.SELECTED_MEMBERS:
        return resourceSharing.sharedWithUsers.some(
          sharedUserId => sharedUserId.toString() === userId
        );
      
      default:
        return false;
    }
  }

  async getAccessibleResources(
    userId: string,
    familyId: string,
    resourceType: string
  ): Promise<string[]> {
    // Get all resources in the family of the specified type
    const allResources = await this.resourceSharingModel.find({
      familyId: new Types.ObjectId(familyId),
      resourceType,
    });

    const accessibleResourceIds: string[] = [];

    for (const resource of allResources) {
      const canAccess = await this.canUserAccessResource(
        userId,
        resource.resourceId,
        resourceType
      );
      
      if (canAccess) {
        accessibleResourceIds.push(resource.resourceId);
      }
    }

    return accessibleResourceIds;
  }

  async getResourceSharing(
    resourceId: string,
    resourceType: string
  ): Promise<ResourceSharingDocument | null> {
    return await this.resourceSharingModel.findOne({
      resourceId,
      resourceType,
    }).populate('sharedWithUsers', 'firstName lastName email');
  }

  async deleteResourceSharing(
    resourceId: string,
    resourceType: string,
    requesterId: string
  ): Promise<void> {
    const resourceSharing = await this.resourceSharingModel.findOne({
      resourceId,
      resourceType,
    });

    if (!resourceSharing) {
      throw new NotFoundException('Resource sharing not found');
    }

    // Check if requester is the owner
    if (resourceSharing.ownerId.toString() !== requesterId) {
      throw new ForbiddenException('Only resource owner can delete sharing settings');
    }

    await this.resourceSharingModel.deleteOne({ _id: resourceSharing._id });
  }

  async getUserOwnedResources(
    userId: string,
    familyId: string,
    resourceType: string
  ): Promise<string[]> {
    const resources = await this.resourceSharingModel.find({
      ownerId: new Types.ObjectId(userId),
      familyId: new Types.ObjectId(familyId),
      resourceType,
    });

    return resources.map(resource => resource.resourceId);
  }
}
