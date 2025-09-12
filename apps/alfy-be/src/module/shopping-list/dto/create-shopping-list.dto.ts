import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class ShoppingListItemDTO {
  @ApiProperty({
    description: 'The name of the shopping item',
    example: 'Milk',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The quantity of the item',
    example: 2,
  })
  @IsOptional()
  quantity: number;

  @ApiProperty({
    description: 'The unit of measurement for the item',
    example: 'l',
    enum: ['pz', 'g', 'hg', 'kg', 'ml', 'cl', 'l'],
  })
  @IsOptional()
  @IsString()
  unit: string;

  @ApiProperty({
    description: 'Whether the item has been bought',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  bought: boolean;
}

export class CreateShoppingListDTO {
  get id(): string {
    return this._id.toString();
  }
  _id: string;

  @ApiProperty({
    description: 'The name of the shopping list',
    example: 'Shopping List 1',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The bought status of the shopping list',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  bought: boolean;

  @ApiProperty({
    description: 'The list of items in the shopping list',
    type: [ShoppingListItemDTO],
    example: [{ name: 'Item 1', bought: false, quantity: 1 }],
  })
  @IsArray()
  list: ShoppingListItemDTO[];
}
