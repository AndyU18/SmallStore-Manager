import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtSignOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const signOptions: JwtSignOptions = {
          expiresIn: (configService.get<string>('JWT_EXPIRES_IN') || '1d') as JwtSignOptions['expiresIn'],
        };

        return {
          secret: configService.get<string>('JWT_SECRET') || 'dev_secret',
          signOptions,
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
