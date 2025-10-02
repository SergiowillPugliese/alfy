import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type FamilyDocument = Family & Document;

@Schema({ timestamps: true })
export class Family {
  @ApiProperty({
    description: 'The unique identifier of the family',
    example: '507f1f77bcf86cd799439011',
  })
  _id: Types.ObjectId;

  @ApiProperty({
    description: 'The name of the family',
    example: 'Rossi Family',
  })
  @Prop({ required: true })
  name: string;

  @ApiProperty({
    description: 'The description of the family',
    example: 'The Rossi family household',
  })
  @Prop({ required: false })
  description?: string;

  @ApiProperty({
    description: 'The admin user ID of the family',
    example: '507f1f77bcf86cd799439012',
  })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  adminId: Types.ObjectId;

  @ApiProperty({
    description: 'Whether the family is active',
    example: true,
  })
  @Prop({ default: true })
  isActive: boolean;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2023-07-26T18:30:00.000Z',
  })
  createdAt?: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2023-07-26T18:30:00.000Z',
  })
  updatedAt?: Date;
}

export const FamilySchema = SchemaFactory.createForClass(Family);
