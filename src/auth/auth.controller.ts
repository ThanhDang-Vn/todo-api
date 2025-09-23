import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Redirect,
  Req,
  Request,
  UseGuards,
  Body,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDto } from 'src/user/dto/createUser.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() signUpData: CreateUserDto) {
    return await this.authService.register(signUpData);
  }

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
  googleLogin() {
    console.log('completed');
  }

  @UseGuards(AuthGuard('google'))
  @Get('google/callback')
  @Redirect()
  async callBack(@Req() req) {
    const response = await this.authService.login(req.user.id);
    return { url: `http://localhost:3000/inbox?token=${response.accessToken}` };
  }
}
