import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SysadminController } from './sysadmin.controller';
import { SysadminService } from './sysadmin.service';
import { AuthModule } from '../auth/auth.module';
import { User, UserSchema } from '../auth/entities/user.entity';
import { Family, FamilySchema } from '../family/entities/family.entity';
import { FamilyMember, FamilyMemberSchema } from '../family/entities/family-member.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Family.name, schema: FamilySchema },
      { name: FamilyMember.name, schema: FamilyMemberSchema },
    ]),
    AuthModule,
  ],
  controllers: [SysadminController],
  providers: [SysadminService],
  exports: [SysadminService],
})
export class SysadminModule {}
