import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsArray, IsOptional, IsString } from 'class-validator';
import { SharingLevel } from '../../../common/enums/roles.enum';

export class UpdateSharingDto {
  @ApiProperty({
    description: 'The sharing level for the resource',
    example: 'family',
    enum: SharingLevel,
  })
  @IsEnum(SharingLevel)
  sharingLevel: SharingLevel;

  @ApiProperty({
    description: 'Array of user IDs to share with (only used when sharingLevel is selected_members)',
    example: ['507f1f77bcf86cd799439015', '507f1f77bcf86cd799439016'],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  sharedWithUsers?: string[];
}
