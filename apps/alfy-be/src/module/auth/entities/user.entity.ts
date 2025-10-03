import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../common/enums/roles.enum';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @ApiProperty({
    description: 'The email address of the user',
    example: 'user@example.com',
  })
  @Prop({ required: true, unique: true })
  email: string;

  @ApiProperty({
    description: 'The hashed password of the user',
  })
  @Prop({ required: true })
  password: string;

  @ApiProperty({
    description: 'The first name of the user',
    example: 'Mario',
  })
  @Prop({ required: true })
  firstName: string;

  @ApiProperty({
    description: 'The last name of the user',
    example: 'Rossi',
  })
  @Prop({ required: true })
  lastName: string;

  @ApiProperty({
    description: 'Global role - only for sysadmin, otherwise null',
    example: null,
    enum: UserRole,
    required: false,
  })
  @Prop({ 
    type: String,
    required: false, 
    enum: Object.values(UserRole),
    default: null 
  })
  globalRole?: UserRole;

  @ApiProperty({
    description: 'Refresh token for JWT authentication',
  })
  @Prop({ default: null })
  refreshToken?: string;

  @ApiProperty({
    description: 'Whether the user account is active',
    example: true,
  })
  @Prop({ default: true })
  isActive: boolean;

  @ApiProperty({
    description: 'Whether the user has reset their temporary password',
    example: false,
  })
  @Prop({ default: false })
  isPasswordReset: boolean;

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

export const UserSchema = SchemaFactory.createForClass(User);
