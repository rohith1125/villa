// src/auth/jwt.strategy.ts

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey:
        process.env.JWT_SECRET || 'fallback-secret-key-for-development',
    });
  }

  async validate(payload: any) {
    // You might want to fetch the user from database to get the current role
    // For now, we'll include the role from the JWT payload if it exists
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role || 'GUEST', // Fallback to GUEST if role not in payload
    };
  }
}
