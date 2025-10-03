export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: UserProfile;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  globalRole?: string;
  isPasswordReset: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  globalRole?: string;
  isPasswordReset?: boolean;
  iat?: number;
  exp?: number;
}
