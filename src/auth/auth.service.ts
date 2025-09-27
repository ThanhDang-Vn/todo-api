import {
  Injectable,
  UnauthorizedException,
  Inject,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { AuthJwtPayload } from '../auth/types/auth-jwtPayload';
import refreshJwtConfig from '../auth/config/refresh-jwt.config';
import type { ConfigType } from '@nestjs/config';
import * as argon2 from 'argon2';
import { CreateUserDto } from 'src/user/dto/createUser.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(refreshJwtConfig.KEY)
    private refresJwtCofiguration: ConfigType<typeof refreshJwtConfig>,
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userService.findUserByEmail(email);
    if (!user) throw new UnauthorizedException('User not found');
    const isPasswordMatch = await argon2.verify(user.password, password);
    if (!isPasswordMatch)
      throw new UnauthorizedException('Invalid credentials');

    return {
      id: user.userId,
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

  async generateToken(userId: number) {
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

  async login(user: { id: number; name: string; email: string }) {
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

  async refreshToken(userId: number) {
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

  async validateRefreshToken(userId: number, refreshToken: string) {
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

  async signout(userId: number) {
    await this.userService.updateHashingRefreshToken(userId, null);
  }
}
