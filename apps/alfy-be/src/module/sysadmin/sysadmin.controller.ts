import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SysadminService } from './sysadmin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SysAdminGuard } from '../../common/guards/family-access.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateFamilyDto, UpdateFamilyDto, UpdateUserStatusDto, ChangeFamilyAdminDto } from './dto/create-family.dto';
import { BaseResponseDto } from '../../common/dto/baseResponce.dto';

@ApiTags('Sysadmin Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, SysAdminGuard)
@Controller('sysadmin')
export class SysadminController {
  constructor(private readonly sysadminService: SysadminService) {}

  // FAMILY MANAGEMENT
  @Post('families')
  @ApiOperation({ summary: 'Create a new family (sysadmin only)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Family created successfully',
    type: BaseResponseDto,
  })
  async createFamily(@Body() createFamilyDto: CreateFamilyDto) {
    const family = await this.sysadminService.createFamily(createFamilyDto);

    return BaseResponseDto.success(
      family,
      'Family created successfully',
    );
  }

  @Get('families')
  @ApiOperation({ summary: 'Get all families (sysadmin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Families retrieved successfully',
    type: BaseResponseDto,
  })
  async getAllFamilies() {
    const families = await this.sysadminService.getAllFamilies();

    return BaseResponseDto.success(
      families,
      'Families retrieved successfully',
    );
  }

  @Get('families/:id')
  @ApiOperation({ summary: 'Get family with members (sysadmin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Family with members retrieved successfully',
    type: BaseResponseDto,
  })
  async getFamilyWithMembers(@Param('id') familyId: string) {
    const family = await this.sysadminService.getFamilyWithMembers(familyId);

    return BaseResponseDto.success(
      family,
      'Family with members retrieved successfully',
    );
  }

  @Put('families/:id')
  @ApiOperation({ summary: 'Update family (sysadmin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Family updated successfully',
    type: BaseResponseDto,
  })
  async updateFamily(
    @Param('id') familyId: string,
    @Body() updateFamilyDto: UpdateFamilyDto,
  ) {
    const family = await this.sysadminService.updateFamily(familyId, updateFamilyDto);

    return BaseResponseDto.success(
      family,
      'Family updated successfully',
    );
  }

  @Put('families/:id/admin')
  @ApiOperation({ summary: 'Change family admin (sysadmin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Family admin changed successfully',
    type: BaseResponseDto,
  })
  async changeFamilyAdmin(
    @Param('id') familyId: string,
    @Body() changeFamilyAdminDto: ChangeFamilyAdminDto,
  ) {
    const family = await this.sysadminService.changeFamilyAdmin(familyId, changeFamilyAdminDto);

    return BaseResponseDto.success(
      family,
      'Family admin changed successfully',
    );
  }

  // USER MANAGEMENT
  @Post('users')
  @ApiOperation({ summary: 'Create a new user (sysadmin only)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User created successfully',
    type: BaseResponseDto,
  })
  async createUser(@Body() createUserDto: CreateUserDto) {
    const result = await this.sysadminService.createUser(createUserDto);

    return BaseResponseDto.success(
      result,
      `User created successfully with temporary password: ${this.sysadminService.getTempPassword()}`,
    );
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users (sysadmin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Users retrieved successfully',
    type: BaseResponseDto,
  })
  async getAllUsers() {
    const users = await this.sysadminService.getAllUsers();

    return BaseResponseDto.success(
      users,
      'Users retrieved successfully',
    );
  }

  @Put('users/:id/status')
  @ApiOperation({ summary: 'Update user status (sysadmin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User status updated successfully',
    type: BaseResponseDto,
  })
  async updateUserStatus(
    @Param('id') userId: string,
    @Body() updateUserStatusDto: UpdateUserStatusDto,
  ) {
    const user = await this.sysadminService.updateUserStatus(
      userId,
      updateUserStatusDto.isActive ?? true,
    );

    return BaseResponseDto.success(
      user,
      'User status updated successfully',
    );
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete user permanently (sysadmin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User deleted successfully',
    type: BaseResponseDto,
  })
  async deleteUser(@Param('id') userId: string) {
    await this.sysadminService.deleteUser(userId);

    return BaseResponseDto.success(
      null,
      'User deleted permanently',
    );
  }
}
