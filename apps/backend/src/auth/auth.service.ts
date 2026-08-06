import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { UserSession } from './entities/user-session.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';
import { UserDto } from '@wordforge/shared-types';

export interface TokensAndUser {
  accessToken: string;
  refreshToken: string;
  user: UserDto;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(UserSession)
    private readonly sessionRepository: Repository<UserSession>,
  ) {}

  async register(
    registerDto: RegisterDto,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<TokensAndUser> {
    const user = await this.usersService.create({
      email: registerDto.email,
      password: registerDto.password,
      name: registerDto.name,
      dailyGoal: registerDto.dailyGoal,
      timezone: registerDto.timezone,
    });

    const tokens = await this.generateTokens(user, userAgent, ipAddress);

    return {
      ...tokens,
      user: this.usersService.toUserDto(user),
    };
  }

  async login(
    loginDto: LoginDto,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<TokensAndUser> {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.generateTokens(user, userAgent, ipAddress);

    return {
      ...tokens,
      user: this.usersService.toUserDto(user),
    };
  }

  async refreshTokens(
    refreshToken: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<TokensAndUser> {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
    if (!refreshSecret) {
      throw new Error('JWT_REFRESH_SECRET environment variable is missing');
    }

    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: refreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verify refresh token against active stored sessions in database
    const activeSessions = await this.sessionRepository.find({
      where: {
        userId: user.id,
        isRevoked: false,
        expiresAt: MoreThan(new Date()),
      },
    });

    let matchedSession: UserSession | null = null;
    for (const session of activeSessions) {
      const isMatch = await bcrypt.compare(
        refreshToken,
        session.refreshTokenHash,
      );
      if (isMatch) {
        matchedSession = session;
        break;
      }
    }

    if (!matchedSession) {
      throw new UnauthorizedException('Session is invalid or has been revoked');
    }

    // Revoke old session during rotation
    matchedSession.isRevoked = true;
    await this.sessionRepository.save(matchedSession);

    // Issue new token pair and create new session
    const tokens = await this.generateTokens(user, userAgent, ipAddress);

    return {
      ...tokens,
      user: this.usersService.toUserDto(user),
    };
  }

  async logout(userId: string, refreshToken?: string): Promise<{ message: string }> {
    if (refreshToken) {
      const activeSessions = await this.sessionRepository.find({
        where: { userId, isRevoked: false },
      });

      for (const session of activeSessions) {
        const isMatch = await bcrypt.compare(refreshToken, session.refreshTokenHash);
        if (isMatch) {
          session.isRevoked = true;
          await this.sessionRepository.save(session);
          break;
        }
      }
    } else {
      // Revoke all active sessions for user
      await this.sessionRepository.update({ userId }, { isRevoked: true });
    }

    return { message: 'Logged out successfully' };
  }

  private async generateTokens(
    user: User,
    userAgent?: string,
    ipAddress?: string,
  ) {
    const payload = { sub: user.id, email: user.email };

    const accessSecret = this.configService.get<string>('JWT_ACCESS_SECRET');
    if (!accessSecret) {
      throw new Error('JWT_ACCESS_SECRET environment variable is missing');
    }
    const accessExpiresIn = this.configService.get<string>(
      'JWT_ACCESS_EXPIRES_IN',
      '15m',
    );

    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
    if (!refreshSecret) {
      throw new Error('JWT_REFRESH_SECRET environment variable is missing');
    }
    const refreshExpiresIn = this.configService.get<string>(
      'JWT_REFRESH_EXPIRES_IN',
      '7d',
    );

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: accessSecret,
        expiresIn: accessExpiresIn,
      }),
      this.jwtService.signAsync(payload, {
        secret: refreshSecret,
        expiresIn: refreshExpiresIn,
      }),
    ]);

    // Store hashed refresh token in UserSession table
    const saltRounds = 10;
    const refreshTokenHash = await bcrypt.hash(refreshToken, saltRounds);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

    const session = this.sessionRepository.create({
      userId: user.id,
      refreshTokenHash,
      userAgent: userAgent || null,
      ipAddress: ipAddress || null,
      isRevoked: false,
      expiresAt,
    });

    await this.sessionRepository.save(session);

    return { accessToken, refreshToken };
  }
}
