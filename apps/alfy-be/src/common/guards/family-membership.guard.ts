import { Injectable, CanActivate, ExecutionContext, ForbiddenException, BadRequestException } from '@nestjs/common';
import { FamilyService } from '../../module/family/family.service';
import { UserRole } from '../enums/roles.enum';

@Injectable()
export class FamilyMembershipGuard implements CanActivate {
  constructor(private familyService: FamilyService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const targetUserId = request.params.userId || request.params.id;
    const familyId = request.params.familyId;

    if (!user) {
      throw new ForbiddenException('Access denied: authentication required');
    }

    // Allow sysadmin to do anything
    if (user.globalRole === UserRole.SYSADMIN) {
      return true;
    }

    // For family operations, ensure user belongs to the family
    if (familyId) {
      const isMember = await this.familyService.isUserFamilyMember(user.sub, familyId);
      if (!isMember) {
        throw new ForbiddenException('Access denied: not a member of this family');
      }

      // If targeting another user, ensure they're in the same family
      if (targetUserId && targetUserId !== user.sub) {
        const isTargetMember = await this.familyService.isUserFamilyMember(targetUserId, familyId);
        if (!isTargetMember) {
          throw new ForbiddenException('Access denied: target user is not a member of this family');
        }
      }
    }

    return true;
  }
}

@Injectable()
export class PreventSelfActionGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const targetUserId = request.params.userId || request.params.id;

    if (!user) {
      throw new ForbiddenException('Access denied: authentication required');
    }

    // Allow sysadmin to do anything
    if (user.globalRole === UserRole.SYSADMIN) {
      return true;
    }

    // Prevent users from performing actions on themselves
    if (targetUserId === user.sub) {
      throw new BadRequestException('Cannot perform this action on yourself');
    }

    return true;
  }
}
