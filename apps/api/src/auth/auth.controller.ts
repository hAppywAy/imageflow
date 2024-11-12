import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { routesV1 } from 'src/config/app.routes';
import { AuthService } from './auth.service';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { getCookiesOptions } from 'src/shared/utils/cookies';

@Controller(routesV1.version)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post(routesV1.auth.register)
  async register(@Body() registerDto: RegisterDto, @Res() res: Response) {
    const result = await this.authService.register(registerDto);

    this.setCookie(res, result.sessionId);

    res.status(HttpStatus.OK).json({
      data: result.user,
    });
  }

  @Post(routesV1.auth.login)
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    const result = await this.authService.login(loginDto);

    this.setCookie(res, result.sessionId);

    res.status(HttpStatus.OK).json({
      data: result.user,
    });
  }

  @Post(routesV1.auth.logout)
  async logout(@Req() req: Request, @Res() res: Response) {
    if (!req.session) {
      throw new BadRequestException('No session found');
    }

    await this.authService.logout(req.session.id);

    res.clearCookie('sessionId');

    res.status(HttpStatus.NO_CONTENT).send();
  }

  @Get(routesV1.auth.me)
  async me(@Req() request: Request) {
    if (!request.session) {
      return { data: null };
    }
    const user = await this.authService.getUser(request.session.id);

    return { data: user };
  }

  private setCookie(res: Response, sessionId: string) {
    res.cookie('sessionId', sessionId, getCookiesOptions(this.configService));
  }
}
