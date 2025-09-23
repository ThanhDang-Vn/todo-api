import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserService } from 'src/user/user.service';
import { LocalAuth } from './strategy/local.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from './config/jwt.config';
import { ConfigModule } from '@nestjs/config';
import { JwtAuth } from './strategy/jwt.strategy';
import refreshJwtConfig from './config/refresh-jwt.config';
import { RefreshJwtAuth } from './strategy/refresh.strategy';
import googleOauthConfig from './config/google-oauth.config';
import { GoogleAuth } from './strategy/google.strategy';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(refreshJwtConfig),
    ConfigModule.forFeature(googleOauthConfig),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserService,
    LocalAuth,
    JwtAuth,
    RefreshJwtAuth,
    GoogleAuth,
    PrismaService,
  ],
})
export class AuthModule {}
