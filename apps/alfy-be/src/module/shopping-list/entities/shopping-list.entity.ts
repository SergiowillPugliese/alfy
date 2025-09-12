import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export class ShoppingListItemEntity {
  @ApiProperty({
    description: 'The unique identifier of the item',
    example: '507f1f77bcf86cd799439011',
  })
  _id: string;

  @ApiProperty({
    description: 'The name of the shopping item',
    example: 'Milk',
  })
  name: string;

  @ApiProperty({
    description: 'The quantity of the item',
    example: 2,
  })
  quantity: number;

  @ApiProperty({
    description: 'The unit of measurement for the item',
    example: 'pz',
    enum: ['pz', 'g', 'hg', 'kg', 'ml', 'cl', 'l'],
  })
  unit: string;

  @ApiProperty({
    description: 'Whether the item has been bought',
    example: false,
  })
  bought: boolean;
}

export interface ShoppingListItem {
  _id: string;
  name: string;
  quantity: number;
  unit: string;
  bought: boolean;
}

@Schema()
export class ShoppingList extends Document {
  @ApiProperty({
    description: 'The unique identifier of the shopping list',
    example: '507f1f77bcf86cd799439011',
  })
  _id: string;

  @ApiProperty({
    description: 'The name of the shopping list',
    example: 'Weekly Shopping',
  })
  @Prop({ required: true })
  name: string;

  @ApiProperty({
    description: 'Whether the shopping list is completed',
    example: false,
  })
  @Prop({ default: false })
  bought: boolean;

  @ApiProperty({
    description: 'The list of items in the shopping list',
    type: [ShoppingListItemEntity],
    example: [
      {
        _id: '507f1f77bcf86cd799439012',
        name: 'Milk',
        quantity: 2,
        unit: 'l',
        bought: false,
      },
    ],
  })
  @Prop({
    required: false,
    type: [{ id: String, name: String, quantity: Number, unit: String, bought: Boolean }],
  })
  list: ShoppingListItem[];

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2023-07-26T18:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2023-07-26T18:30:00.000Z',
  })
  updatedAt: Date;
}

export const ShoppingListSchema = SchemaFactory.createForClass(ShoppingList);
ShoppingListSchema.set('timestamps', true);
