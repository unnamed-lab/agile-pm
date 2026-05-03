import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../src/auth/auth.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { createUser } from './factories/user.factory';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn(() => 'mock-token') },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should register new user', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
    jest.spyOn(prisma.user, 'create').mockResolvedValue({
      id: '1',
      email: '[email protected]',
      name: 'Test',
      role: 'STUDENT',
    });

    const result = await service.register({
      name: 'Test',
      email: '[email protected]',
      password: '12345678',
    });

    expect(result.user).toBeDefined();
    expect(result.access_token).toBe('mock-token');
  });

  it('should throw on duplicate email', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({ id: '1' });

    await expect(
      service.register({
        name: 'Test',
        email: '[email protected]',
        password: '12345678',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('should login with valid credentials', async () => {
    const mockUser = {
      id: '1',
      email: '[email protected]',
      passwordHash: 'hash',
      name: 'Test',
      role: 'STUDENT',
    };

    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

    const result = await service.login({
      email: '[email protected]',
      password: '12345678',
    });

    expect(result.user).toBeDefined();
    expect(result.access_token).toBe('mock-token');
  });

  it('should throw on invalid password', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({
      passwordHash: 'hash',
    });
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

    await expect(
      service.login({ email: '[email protected]', password: 'wrong' }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
