import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Request,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FamilyAdminGuard } from '../../common/guards/family-access.guard';
import { PreventSelfActionGuard, FamilyMembershipGuard } from '../../common/guards/family-membership.guard';
import { CreateFamilyMemberDto, UpdateFamilyMemberStatusDto } from './dto/create-family-member.dto';
import { BaseResponseDto } from '../../common/dto/baseResponce.dto';

@ApiTags('Admin Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, FamilyAdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('family-members')
  @ApiOperation({ 
    summary: 'Create a new family member (admin only)',
    description: 'Admin can create new family members in their own family with USER role only.'
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Family member created successfully',
    type: BaseResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'User with this email already exists',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied: admin role required',
  })
  async createFamilyMember(
    @Body() createFamilyMemberDto: CreateFamilyMemberDto,
    @Request() req,
  ) {
    const result = await this.adminService.createFamilyMember(
      req.adminFamilyId,
      createFamilyMemberDto,
    );

    return BaseResponseDto.success(
      result,
      `Family member created successfully with temporary password: ${this.adminService.getTempPassword()}`,
    );
  }

  @Get('family-members')
  @ApiOperation({ 
    summary: 'Get all family members (admin only)',
    description: 'Admin can view all members of their own family.'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Family members retrieved successfully',
    type: BaseResponseDto,
  })
  async getFamilyMembers(@Request() req) {
    const members = await this.adminService.getFamilyMembers(req.adminFamilyId);

    return BaseResponseDto.success(
      members,
      'Family members retrieved successfully',
    );
  }

  @Get('family-members/:id')
  @ApiOperation({ 
    summary: 'Get family member details (admin only)',
    description: 'Admin can view details of a specific family member.'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Family member details retrieved successfully',
    type: BaseResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Family member not found',
  })
  async getFamilyMemberById(
    @Param('id') memberId: string,
    @Request() req,
  ) {
    const member = await this.adminService.getFamilyMemberById(
      req.adminFamilyId,
      memberId,
    );

    return BaseResponseDto.success(
      member,
      'Family member details retrieved successfully',
    );
  }

  @Put('family-members/:id/status')
  @UseGuards(PreventSelfActionGuard, FamilyMembershipGuard)
  @ApiOperation({ 
    summary: 'Update family member status (admin only)',
    description: 'Admin can activate/deactivate family members. Cannot deactivate themselves or other admins.'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Family member status updated successfully',
    type: BaseResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Cannot deactivate yourself or other admins',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Family member not found',
  })
  async updateFamilyMemberStatus(
    @Param('id') memberId: string,
    @Body() updateStatusDto: UpdateFamilyMemberStatusDto,
    @Request() req,
  ) {
    const member = await this.adminService.updateFamilyMemberStatus(
      req.adminFamilyId,
      memberId,
      updateStatusDto.isActive,
      req.user.sub,
    );

    const action = updateStatusDto.isActive ? 'activated' : 'deactivated';
    return BaseResponseDto.success(
      member,
      `Family member ${action} successfully`,
    );
  }

  @Get('family-stats')
  @ApiOperation({ 
    summary: 'Get family statistics (admin only)',
    description: 'Admin can view statistics about their family members.'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Family statistics retrieved successfully',
    type: BaseResponseDto,
  })
  async getFamilyStats(@Request() req) {
    const stats = await this.adminService.getFamilyStats(req.adminFamilyId);

    return BaseResponseDto.success(
      stats,
      'Family statistics retrieved successfully',
    );
  }
}
