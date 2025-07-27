import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ShoppingListModule } from '../module/shopping-list/shopping-list.module';
import { env } from '../environment/environments';

@Module({
  imports: [
    MongooseModule.forRoot(env.CONNECTION_STRING),
    ShoppingListModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
