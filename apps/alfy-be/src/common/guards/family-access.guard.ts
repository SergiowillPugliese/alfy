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

    if (!user) {
      throw new ForbiddenException('Access denied: authentication required');
    }

    // Get user's family where they are admin
    const adminMemberships = await this.familyService.getUserFamilies(user.sub);
    const adminFamily = adminMemberships.find(membership => membership.role === UserRole.ADMIN);

    if (!adminFamily) {
      throw new ForbiddenException('Access denied: admin role required in a family');
    }

    // Add admin's family info to request for use in controllers
    request.adminFamilyId = adminFamily.familyId.toString();
    request.userFamilyRole = UserRole.ADMIN;

    return true;
  }
}

@Injectable()
export class SysAdminGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Access denied: authentication required');
    }

    if (user.globalRole !== UserRole.SYSADMIN) {
      throw new ForbiddenException('Access denied: sysadmin role required');
    }

    return true;
  }
}
