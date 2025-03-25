import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { PrismaModule } from '../prisma/prisma.module'; // ✅ Add this

@Module({
  imports: [
    PrismaModule, // ✅ Fix: This gives AuthModule access to PrismaService
    PassportModule,
    JwtModule.register({
      secret: 'super-secret-key', // move to env later
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
