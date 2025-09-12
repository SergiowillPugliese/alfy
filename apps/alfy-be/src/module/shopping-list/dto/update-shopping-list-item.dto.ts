import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateShoppingListItemDto {
  @ApiProperty({
    description: 'The name of the shopping item',
    example: 'Milk',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiProperty({
    description: 'The quantity of the item',
    example: 2,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @ApiProperty({
    description: 'The unit of measurement for the item',
    example: 'l',
    enum: ['pz', 'g', 'hg', 'kg', 'ml', 'cl', 'l'],
    required: false,
  })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiProperty({
    description: 'Whether the item has been bought',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  bought?: boolean;
}
