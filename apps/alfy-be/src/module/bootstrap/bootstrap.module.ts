import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BootstrapController } from './bootstrap.controller';
import { BootstrapService } from './bootstrap.service';
import { User, UserSchema } from '../auth/entities/user.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [BootstrapController],
  providers: [BootstrapService],
})
export class BootstrapModule {}
