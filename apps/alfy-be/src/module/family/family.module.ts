import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FamilyController } from './family.controller';
import { FamilyService } from './family.service';
import { Family, FamilySchema } from './entities/family.entity';
import { FamilyMember, FamilyMemberSchema } from './entities/family-member.entity';
import { User, UserSchema } from '../auth/entities/user.entity';
import { ResourceSharing, ResourceSharingSchema } from '../../common/entities/resource-sharing.entity';
import { ResourceSharingService } from '../../common/services/resource-sharing.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Family.name, schema: FamilySchema },
      { name: FamilyMember.name, schema: FamilyMemberSchema },
      { name: User.name, schema: UserSchema },
      { name: ResourceSharing.name, schema: ResourceSharingSchema },
    ]),
  ],
  controllers: [FamilyController],
  providers: [FamilyService, ResourceSharingService],
  exports: [FamilyService, ResourceSharingService],
})
export class FamilyModule {}
