import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../module/auth/entities/user.entity';
import { JwtService } from '@nestjs/jwt';

interface AuthenticatedRequest extends Request {
  user?: {
    sub: string;
    email: string;
    globalRole?: string;
  };
}

@Injectable()
export class PasswordResetMiddleware implements NestMiddleware {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    // Skip middleware for certain routes
    const skipRoutes = [
      '/auth/login',
      '/auth/refresh',
      '/auth/logout',
      '/auth/change-password',
      '/bootstrap/sysadmin',
    ];

    // Check if current route should be skipped
    const shouldSkip = skipRoutes.some(route => req.path.includes(route));
    if (shouldSkip) {
      return next();
    }

    // Check if user is authenticated
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Let JWT guard handle authentication
    }

    try {
      // Extract and verify token
      const token = authHeader.substring(7);
      const payload = this.jwtService.verify(token, {
        secret: process.env['JWT_SECRET'] || 'your-secret-key',
      });

      // Get user from database
      const user = await this.userModel.findById(payload.sub);
      if (!user) {
        return next(); // Let JWT guard handle this
      }

      // Check if password reset is required
      if (!user.isPasswordReset) {
        throw new ForbiddenException({
          message: 'Password change required',
          code: 'PASSWORD_RESET_REQUIRED',
          details: 'You must change your temporary password before accessing this resource.',
        });
      }

      // Add user info to request
      req.user = {
        sub: user._id.toString(),
        email: user.email,
        globalRole: user.globalRole,
      };

      next();
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      // For JWT errors, let the JWT guard handle them
      next();
    }
  }
}
