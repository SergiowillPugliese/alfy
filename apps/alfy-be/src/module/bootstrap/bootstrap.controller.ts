import { Controller, Post, Body, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BootstrapService } from './bootstrap.service';
import { BootstrapSysadminDto } from './dto/bootstrap-sysadmin.dto';
import { BaseResponseDto } from '../../common/dto/baseResponce.dto';

@ApiTags('Bootstrap')
@Controller('bootstrap')
export class BootstrapController {
  constructor(private readonly bootstrapService: BootstrapService) {}

  @Post('sysadmin')
  @ApiOperation({ 
    summary: 'Bootstrap the first sysadmin user',
    description: 'Creates the first sysadmin user. Can only be called once - when no sysadmin exists.'
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Sysadmin successfully created',
    type: BaseResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Sysadmin already exists or email already in use',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  async bootstrapSysadmin(@Body() bootstrapDto: BootstrapSysadminDto) {
    const result = await this.bootstrapService.bootstrapSysadmin(bootstrapDto);

    return BaseResponseDto.success(
      result,
      'Sysadmin successfully created. System is now ready for use.',
    );
  }
}
