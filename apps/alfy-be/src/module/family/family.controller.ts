import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FamilyService } from './family.service';
import { ResourceSharingService } from '../../common/services/resource-sharing.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateFamilyDto, AddFamilyMemberDto, UpdateFamilyMemberDto } from './dto/create-family.dto';
import { UpdateSharingDto } from './dto/update-sharing.dto';
import { BaseResponseDto } from '../../common/dto/baseResponce.dto';
import { UserRole } from '../../common/enums/roles.enum';

@ApiTags('family')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('family')
export class FamilyController {
  constructor(
    private readonly familyService: FamilyService,
    private readonly resourceSharingService: ResourceSharingService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new family' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Family created successfully',
    type: BaseResponseDto,
  })
  async createFamily(@Body() createFamilyDto: CreateFamilyDto, @Request() req) {
    const family = await this.familyService.createFamily(
      req.user.sub,
      createFamilyDto.name,
      createFamilyDto.description,
    );

    return new BaseResponseDto(
      'Family created successfully',
      family,
      HttpStatus.CREATED,
    );
  }

  @Get('my-families')
  @ApiOperation({ summary: 'Get user families' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User families retrieved successfully',
    type: BaseResponseDto,
  })
  async getUserFamilies(@Request() req) {
    const families = await this.familyService.getUserFamilies(req.user.sub);

    return new BaseResponseDto(
      'User families retrieved successfully',
      families,
      HttpStatus.OK,
    );
  }

  @Get(':familyId/members')
  @ApiOperation({ summary: 'Get family members' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Family members retrieved successfully',
    type: BaseResponseDto,
  })
  async getFamilyMembers(@Param('familyId') familyId: string, @Request() req) {
    // Check if user is member of the family
    const isMember = await this.familyService.isUserFamilyMember(req.user.sub, familyId);
    if (!isMember) {
      return new BaseResponseDto(
        'Access denied',
        null,
        HttpStatus.FORBIDDEN,
      );
    }

    const members = await this.familyService.getFamilyMembers(familyId);

    return new BaseResponseDto(
      'Family members retrieved successfully',
      members,
      HttpStatus.OK,
    );
  }

  @Post(':familyId/members')
  @ApiOperation({ summary: 'Add a member to the family' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Family member added successfully',
    type: BaseResponseDto,
  })
  async addFamilyMember(
    @Param('familyId') familyId: string,
    @Body() addMemberDto: AddFamilyMemberDto,
    @Request() req,
  ) {
    // Check if requester is admin
    const requesterRole = await this.familyService.getUserRoleInFamily(req.user.sub, familyId);
    if (requesterRole !== UserRole.ADMIN) {
      return new BaseResponseDto(
        'Only family admin can add members',
        null,
        HttpStatus.FORBIDDEN,
      );
    }

    // Find user by email
    // This would need to be implemented in the user service
    // For now, we'll assume the email is actually a userId
    const member = await this.familyService.addFamilyMember(familyId, addMemberDto.email);

    return new BaseResponseDto(
      'Family member added successfully',
      member,
      HttpStatus.CREATED,
    );
  }

  @Put(':familyId/members/:userId/deactivate')
  @ApiOperation({ summary: 'Deactivate a family member' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Family member deactivated successfully',
    type: BaseResponseDto,
  })
  async deactivateFamilyMember(
    @Param('familyId') familyId: string,
    @Param('userId') userId: string,
    @Request() req,
  ) {
    await this.familyService.deactivateFamilyMember(familyId, userId, req.user.sub);

    return new BaseResponseDto(
      'Family member deactivated successfully',
      null,
      HttpStatus.OK,
    );
  }

  @Put(':familyId/members/:userId/activate')
  @ApiOperation({ summary: 'Activate a family member' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Family member activated successfully',
    type: BaseResponseDto,
  })
  async activateFamilyMember(
    @Param('familyId') familyId: string,
    @Param('userId') userId: string,
    @Request() req,
  ) {
    await this.familyService.activateFamilyMember(familyId, userId, req.user.sub);

    return new BaseResponseDto(
      'Family member activated successfully',
      null,
      HttpStatus.OK,
    );
  }

  @Delete(':familyId/members/:userId')
  @ApiOperation({ summary: 'Permanently delete a family member (sysadmin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Family member deleted successfully',
    type: BaseResponseDto,
  })
  async deleteFamilyMember(
    @Param('familyId') familyId: string,
    @Param('userId') userId: string,
    @Request() req,
  ) {
    await this.familyService.deleteFamilyMember(familyId, userId, req.user.sub);

    return new BaseResponseDto(
      'Family member deleted successfully',
      null,
      HttpStatus.OK,
    );
  }

  @Put('resources/:resourceType/:resourceId/sharing')
  @ApiOperation({ summary: 'Update resource sharing settings' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Resource sharing updated successfully',
    type: BaseResponseDto,
  })
  async updateResourceSharing(
    @Param('resourceType') resourceType: string,
    @Param('resourceId') resourceId: string,
    @Body() updateSharingDto: UpdateSharingDto,
    @Request() req,
  ) {
    const resourceSharing = await this.resourceSharingService.updateResourceSharing(
      resourceId,
      resourceType,
      updateSharingDto.sharingLevel,
      updateSharingDto.sharedWithUsers || [],
      req.user.sub,
    );

    return new BaseResponseDto(
      'Resource sharing updated successfully',
      resourceSharing,
      HttpStatus.OK,
    );
  }

  @Get('resources/:resourceType/:resourceId/sharing')
  @ApiOperation({ summary: 'Get resource sharing settings' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Resource sharing retrieved successfully',
    type: BaseResponseDto,
  })
  async getResourceSharing(
    @Param('resourceType') resourceType: string,
    @Param('resourceId') resourceId: string,
    @Request() req,
  ) {
    // Check if user can access the resource
    const canAccess = await this.resourceSharingService.canUserAccessResource(
      req.user.sub,
      resourceId,
      resourceType,
    );

    if (!canAccess) {
      return new BaseResponseDto(
        'Access denied',
        null,
        HttpStatus.FORBIDDEN,
      );
    }

    const resourceSharing = await this.resourceSharingService.getResourceSharing(
      resourceId,
      resourceType,
    );

    return new BaseResponseDto(
      'Resource sharing retrieved successfully',
      resourceSharing,
      HttpStatus.OK,
    );
  }
}
