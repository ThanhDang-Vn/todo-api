import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Request() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return this.authService.login(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  async logout(@Request() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return await this.authService.signout(req.user.id);
  }

  @UseGuards(AuthGuard('refresh-jwt'))
  @Post('refresh')
  refreshToken(@Request() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return this.authService.refreshToken(req.user.id);
  }

  @UseGuards(AuthGuard('google'))
  @Get('google/login')
  googleLogin() {}

  @UseGuards(AuthGuard('google'))
  @Get('google/callback')
  async callBack(@Request() req) {
    const response = await this.authService.login(req.user.id);
  }
}
