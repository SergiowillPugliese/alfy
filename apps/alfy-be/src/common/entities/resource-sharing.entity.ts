import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { SharingLevel } from '../enums/roles.enum';

export type ResourceSharingDocument = ResourceSharing & Document;

@Schema({ timestamps: true })
export class ResourceSharing {
  @ApiProperty({
    description: 'The unique identifier of the resource sharing',
    example: '507f1f77bcf86cd799439011',
  })
  _id: Types.ObjectId;

  @ApiProperty({
    description: 'The ID of the resource being shared',
    example: '507f1f77bcf86cd799439012',
  })
  @Prop({ required: true })
  resourceId: string;

  @ApiProperty({
    description: 'The type of resource being shared',
    example: 'shopping-list',
  })
  @Prop({ required: true })
  resourceType: string;

  @ApiProperty({
    description: 'The ID of the user who owns the resource',
    example: '507f1f77bcf86cd799439013',
  })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ownerId: Types.ObjectId;

  @ApiProperty({
    description: 'The ID of the family the resource belongs to',
    example: '507f1f77bcf86cd799439014',
  })
  @Prop({ type: Types.ObjectId, ref: 'Family', required: true })
  familyId: Types.ObjectId;

  @ApiProperty({
    description: 'The sharing level of the resource',
    example: 'private',
    enum: SharingLevel,
  })
  @Prop({ 
    required: true, 
    enum: Object.values(SharingLevel),
    default: SharingLevel.PRIVATE 
  })
  sharingLevel: SharingLevel;

  @ApiProperty({
    description: 'Array of specific user IDs who have access (when sharingLevel is selected_members)',
    example: ['507f1f77bcf86cd799439015', '507f1f77bcf86cd799439016'],
  })
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  sharedWithUsers: Types.ObjectId[];

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

export const ResourceSharingSchema = SchemaFactory.createForClass(ResourceSharing);

// Create compound index for efficient queries
ResourceSharingSchema.index({ resourceId: 1, resourceType: 1 }, { unique: true });
ResourceSharingSchema.index({ familyId: 1, sharingLevel: 1 });
ResourceSharingSchema.index({ ownerId: 1 });
