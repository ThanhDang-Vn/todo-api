import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
  Body,
  Res,
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
    return this.authService.login(req.user);
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
  async callBack(@Request() req, @Res() res) {
    const id = req.user.userId;
    const name = req.user.firstName + req.user.lastName;
    const email = req.user.email;
    const response = await this.authService.login({ id, name, email });
    res.redirect(
      `http://localhost:3000/api/auth/google/callback?userId=${id}&firstName=${req.user.firstName}&lastName=${req.user.lastName}&email=${email}&accessToken=${response.accessToken}&refreshToken=${response.refreshToken}`,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('protected')
  getAll(@Request() request) {
    return { message: `message, ${request.user.id}` };
  }
}
