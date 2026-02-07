import {
  Injectable,
  UnauthorizedException,
  Inject,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { AuthJwtPayload } from '../auth/types/auth-jwtPayload';
import refreshJwtConfig from '../auth/config/refresh-jwt.config';
import type { ConfigType } from '@nestjs/config';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { CreateUserDto } from 'src/user/dto/createUser.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(refreshJwtConfig.KEY)
    private refresJwtCofiguration: ConfigType<typeof refreshJwtConfig>,
    private userService: UserService,
    private jwtService: JwtService,
    private mailService: MailService,
    private prisma: PrismaService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userService.findUserByEmail(email);
    if (!user) throw new UnauthorizedException('User not found');
    const isPasswordMatch = await argon2.verify(user.password, password);
    if (!isPasswordMatch)
      throw new UnauthorizedException('Invalid credentials');

    return {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
    };
  }

  async validateGoogleUser(googleUser: CreateUserDto) {
    const user = await this.userService.findUserByEmail(googleUser.email);

    if (user) {
      return user;
    }

    return await this.userService.createUser(googleUser);
  }

  async generateToken(userId: string) {
    const payload: AuthJwtPayload = { sub: userId };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.sign(payload),
      this.jwtService.sign(payload, this.refresJwtCofiguration),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async login(user: { id: string; name: string; email: string }) {
    const { accessToken, refreshToken } = await this.generateToken(user.id);
    const hashedRefreshToken = await argon2.hash(refreshToken);
    await this.userService.updateHashingRefreshToken(
      user.id,
      hashedRefreshToken,
    );
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      accessToken,
      refreshToken,
    };
  }

  async register(userDto: CreateUserDto) {
    const isMatchEmail = await this.userService.findUserByEmail(userDto.email);
    if (isMatchEmail) {
      throw new ConflictException('This email already exist');
    }

    return await this.userService.createUser(userDto);
  }

  async refreshToken(userId: string) {
    const { accessToken, refreshToken } = await this.generateToken(userId);
    const hashedRefreshToken = await argon2.hash(refreshToken);
    await this.userService.updateHashingRefreshToken(
      userId,
      hashedRefreshToken,
    );
    return {
      id: userId,
      accessToken,
      refreshToken,
    };
  }

  async validateRefreshToken(userId: string, refreshToken: string) {
    const user = await this.userService.findOneUser(userId);
    if (!user || !user.hashedRefreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const isMatch = await argon2.verify(user.hashedRefreshToken, refreshToken);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return { id: userId };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const email = dto.email;

    const user = await this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      return { message: 'User does not exist' };
    }

    const otp = crypto.randomInt(100000, 999999).toString();

    const expireAt = new Date(Date.now() + 5 * 60 * 1000);

    await this.prisma.passwordResetToken.upsert({
      where: {
        email,
      },
      update: {
        token: otp,
        expiresAt: expireAt,
      },
      create: {
        email,
        token: otp,
        expiresAt: expireAt,
      },
    });

    this.mailService.sendOtpEmail(email, otp);

    return { message: 'If this email exists, an OTP has been sent.' };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const record = await this.prisma.passwordResetToken.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!record || record.token !== dto.otp) {
      throw new BadRequestException('Invalid OTP');
    }

    if (new Date() > record.expiresAt) {
      throw new BadRequestException('OTP has been expired');
    }

    const tempToken = this.jwtService.sign(
      { email: dto.email, purpose: 'reset-password' },
      { secret: process.env.JWT_SECRET, expiresIn: '5m' },
    );

    await this.prisma.passwordResetToken.delete({
      where: {
        email: dto.email,
      },
    });

    return {
      success: true,
      token: tempToken,
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    try {
      const payload = this.jwtService.verify(dto.token, {
        secret: process.env.JWT_SECRET,
      });

      if (payload.purpose !== 'reset-password') {
        throw new BadRequestException('Invalid token ');
      }

      const email = payload.email;

      const hashedPassword = await argon2.hash(dto.password);

      await this.prisma.user.update({
        where: {
          email: email,
        },
        data: {
          password: hashedPassword,
        },
      });

      return { success: true, message: 'Password updated successfully' };
    } catch (err) {
      console.error(err);
      throw new BadRequestException(
        'Token invalid or expired. Please start over.',
      );
    }
  }

  async signout(userId: string) {
    await this.userService.updateHashingRefreshToken(userId, null);
  }
}
