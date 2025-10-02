import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { ResourceSharingService } from '../services/resource-sharing.service';

@Injectable()
export class ResourceAccessGuard implements CanActivate {
  constructor(private resourceSharingService: ResourceSharingService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const resourceId = request.params.resourceId || request.params.id;
    const resourceType = request.params.resourceType || this.getResourceTypeFromPath(request.path);

    if (!resourceId || !resourceType) {
      throw new ForbiddenException('Resource ID and type are required');
    }

    const canAccess = await this.resourceSharingService.canUserAccessResource(
      user.sub,
      resourceId,
      resourceType,
    );

    if (!canAccess) {
      throw new ForbiddenException('Access denied: insufficient permissions for this resource');
    }

    return true;
  }

  private getResourceTypeFromPath(path: string): string {
    // Extract resource type from path
    // e.g., /shopping-list/123 -> shopping-list
    const segments = path.split('/').filter(segment => segment);
    return segments[0] || '';
  }
}
