import { Request as ExpressRequest } from 'express';

export interface JwtPayload {
  sub: string;
  phone?: string;
  email?: string;
  role?: string;
}

export interface AuthRequest extends ExpressRequest {
  user: JwtPayload;
}
