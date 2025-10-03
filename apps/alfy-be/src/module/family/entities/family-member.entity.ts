import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../common/enums/roles.enum';

export type FamilyMemberDocument = FamilyMember & Document;

@Schema({ timestamps: true })
export class FamilyMember {
  @ApiProperty({
    description: 'The unique identifier of the family member relationship',
    example: '507f1f77bcf86cd799439011',
  })
  _id: Types.ObjectId;

  @ApiProperty({
    description: 'The family ID',
    example: '507f1f77bcf86cd799439012',
  })
  @Prop({ type: Types.ObjectId, ref: 'Family', required: true })
  familyId: Types.ObjectId;

  @ApiProperty({
    description: 'The user ID',
    example: '507f1f77bcf86cd799439013',
  })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @ApiProperty({
    description: 'The role of the user in the family',
    example: 'user',
    enum: UserRole,
  })
  @Prop({ 
    type: String,
    required: true, 
    enum: Object.values(UserRole),
    default: UserRole.USER 
  })
  role: UserRole;

  @ApiProperty({
    description: 'Whether the family member is active',
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

export const FamilyMemberSchema = SchemaFactory.createForClass(FamilyMember);

// Ensure unique combination of familyId and userId
FamilyMemberSchema.index({ familyId: 1, userId: 1 }, { unique: true });
