import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AuthModule } from '../auth/auth.module';
import { User, UserSchema } from '../auth/entities/user.entity';
import { FamilyMember, FamilyMemberSchema } from '../family/entities/family-member.entity';
import { FamilyModule } from '../family/family.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: FamilyMember.name, schema: FamilyMemberSchema },
    ]),
    AuthModule,
    FamilyModule, // Needed for FamilyAdminGuard
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
