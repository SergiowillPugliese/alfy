import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ShoppingListModule } from '../module/shopping-list/shopping-list.module';
import { AuthModule } from '../module/auth/auth.module';
import { FamilyModule } from '../module/family/family.module';
import { BootstrapModule } from '../module/bootstrap/bootstrap.module';
import { SysadminModule } from '../module/sysadmin/sysadmin.module';
import { AdminModule } from '../module/admin/admin.module';
import { PasswordResetMiddleware } from '../common/middleware/password-reset.middleware';
import { User, UserSchema } from '../module/auth/entities/user.entity';
import { env } from '../environment/environments';

@Module({
  imports: [
    MongooseModule.forRoot(env.CONNECTION_STRING),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
    ]),
    JwtModule.register({
      secret: process.env['JWT_SECRET'] || 'your-secret-key',
      signOptions: { expiresIn: '15m' },
    }),
    BootstrapModule,
    AuthModule,
    FamilyModule,
    SysadminModule,
    AdminModule,
    ShoppingListModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(PasswordResetMiddleware)
      .forRoutes('*'); // Apply to all routes
  }
}
