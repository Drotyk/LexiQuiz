import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponse } from '@wordforge/shared-types';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async register(
    @Body() registerDto: RegisterDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponse> {
    const userAgent = request.headers['user-agent'];
    const ipAddress = request.ip;

    const { accessToken, refreshToken, user } =
      await this.authService.register(registerDto, userAgent, ipAddress);

    this.setRefreshTokenCookie(response, refreshToken);

    return { accessToken, user };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in to an existing account' })
  @ApiResponse({ status: 200, description: 'Authenticated successfully' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() loginDto: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponse> {
    const userAgent = request.headers['user-agent'];
    const ipAddress = request.ip;

    const { accessToken, refreshToken, user } =
      await this.authService.login(loginDto, userAgent, ipAddress);

    this.setRefreshTokenCookie(response, refreshToken);

    return { accessToken, user };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using httpOnly refresh token cookie' })
  @ApiResponse({ status: 200, description: 'New access token generated' })
  @ApiResponse({ status: 401, description: 'Invalid or missing refresh token' })
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponse> {
    const refreshToken = request.cookies?.refreshToken;
    const userAgent = request.headers['user-agent'];
    const ipAddress = request.ip;

    const { accessToken, refreshToken: newRefreshToken, user } =
      await this.authService.refreshTokens(refreshToken, userAgent, ipAddress);

    this.setRefreshTokenCookie(response, newRefreshToken);

    return { accessToken, user };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log out user and clear refresh token cookie' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ message: string }> {
    const refreshToken = request.cookies?.refreshToken;

    await this.authService.logout('', refreshToken);

    response.clearCookie('refreshToken', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    });

    return { message: 'Successfully logged out' };
  }

  private setRefreshTokenCookie(response: Response, refreshToken: string) {
    const isProduction = this.configService.get('NODE_ENV') === 'production';

    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });
  }
}
