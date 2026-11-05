import { Test } from '@nestjs/testing';
import { AuthService } from '../src/auth/auth.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { UsersService } from '../src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { NotificationsService } from '../src/notifications/notifications.service';
import { ProAccessService } from '../src/common/pro-access/pro-access.service';

describe('AuthService', () => {
  it('should be defined', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {},
        },
        {
          provide: UsersService,
          useValue: {},
        },
        {
          provide: JwtService,
          useValue: {},
        },
        {
          provide: ConfigService,
          useValue: {},
        },
        {
          provide: NotificationsService,
          useValue: {},
        },
        {
          provide: ProAccessService,
          useValue: {},
        },
      ],
    }).compile();

    expect(moduleRef.get(AuthService)).toBeDefined();
  });
});
