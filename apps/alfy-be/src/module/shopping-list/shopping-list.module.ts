import { Module } from '@nestjs/common';
import { ShoppingListService } from './shopping-list.service';
import { ShoppingListController } from './shopping-list.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ShoppingList,
  ShoppingListSchema,
} from './entities/shopping-list.entity';
import { ResourceSharing, ResourceSharingSchema } from '../../common/entities/resource-sharing.entity';
import { ResourceSharingService } from '../../common/services/resource-sharing.service';
import { FamilyModule } from '../family/family.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ShoppingList.name, schema: ShoppingListSchema },
      { name: ResourceSharing.name, schema: ResourceSharingSchema },
    ]),
    FamilyModule,
  ],
  controllers: [ShoppingListController],
  providers: [ShoppingListService, ResourceSharingService],
})
export class ShoppingListModule {}
