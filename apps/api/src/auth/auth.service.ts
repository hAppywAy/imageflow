import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/shared/infrastructure/prisma.service';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import bcrypt from 'bcrypt';
import { SESSION_TTL_MS, getSessionStorageKey } from './config/storage';
import { v4 as uuidv4 } from 'uuid';
import { CacheStorage } from 'src/shared/ports/cache-storage';

const SALT_ROUNDS = 10;

export interface User {
  id: string;
  username: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheStorage,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { username: registerDto.username },
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await this.hashPassword(registerDto.password);
    await this.prisma.user.create({
      data: {
        username: registerDto.username,
        password: hashedPassword,
      },
    });

    return this.login({
      username: registerDto.username,
      password: registerDto.password,
    });
  }

  async getUser(sessionId: string): Promise<User> {
    const user = await this.cache.get<User>(getSessionStorageKey(sessionId));
    if (!user) {
      return null;
    }
    return user;
  }

  async logout(sessionId: string) {
    await this.cache.del(getSessionStorageKey(sessionId));
  }

  async refreshSession(sessionId: string) {
    const sessionKey = getSessionStorageKey(sessionId);
    const user = await this.cache.get(sessionKey);
    if (!user) {
      throw new BadRequestException('Invalid session');
    }

    await this.cache.del(sessionKey);
    await this.cache.set(sessionKey, user, SESSION_TTL_MS);

    return { sessionId, user };
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { username: loginDto.username },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const passwordMatch = await this.comparePasswords(
      loginDto.password,
      user.password,
    );

    if (!passwordMatch) {
      throw new BadGatewayException('Invalid password');
    }

    const sessionId = this.generateSessionId();

    const session = {
      id: user.id,
      username: user.username,
    };

    await this.createSession(sessionId, session);

    return { sessionId, user: session };
  }

  private async createSession(sessionId: string, user: User) {
    await this.cache.set(getSessionStorageKey(sessionId), user, SESSION_TTL_MS);
  }

  private generateSessionId() {
    return uuidv4();
  }

  private hashPassword(password: string) {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  private comparePasswords(password: string, hash: string) {
    return bcrypt.compare(password, hash);
  }
}
