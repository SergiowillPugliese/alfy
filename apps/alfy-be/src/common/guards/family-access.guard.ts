import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FamilyService } from '../../module/family/family.service';
import { UserRole } from '../enums/roles.enum';

@Injectable()
export class FamilyAccessGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private familyService: FamilyService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const familyId = request.params.familyId;

    if (!familyId) {
      throw new ForbiddenException('Family ID is required');
    }

    // Check if user is member of the family
    const isMember = await this.familyService.isUserFamilyMember(user.sub, familyId);
    if (!isMember) {
      throw new ForbiddenException('Access denied: not a family member');
    }

    // Add family role to request for further use
    const userRole = await this.familyService.getUserRoleInFamily(user.sub, familyId);
    request.userFamilyRole = userRole;

    return true;
  }
}

@Injectable()
export class FamilyAdminGuard implements CanActivate {
  constructor(private familyService: FamilyService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const familyId = request.params.familyId;

    if (!familyId) {
      throw new ForbiddenException('Family ID is required');
    }

    const userRole = await this.familyService.getUserRoleInFamily(user.sub, familyId);
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Access denied: admin role required');
    }

    return true;
  }
}

@Injectable()
export class SysAdminGuard implements CanActivate {
  constructor() {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // This would need to be implemented to check global role
    // For now, we'll assume it's checked elsewhere
    if (user.globalRole !== UserRole.SYSADMIN) {
      throw new ForbiddenException('Access denied: sysadmin role required');
    }

    return true;
  }
}
