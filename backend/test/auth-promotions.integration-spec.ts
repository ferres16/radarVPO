import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';
import { PromotionsController } from '../src/promotions/promotions.controller';
import { PromotionsService } from '../src/promotions/promotions.service';

describe('Auth + Promotions Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController, PromotionsController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn().mockResolvedValue({
              accessToken: 'a',
              refreshToken: 'r',
              sessionId: 's',
              user: {
                id: '1',
                email: 'u@test.com',
                role: 'user',
                plan: 'free',
              },
            }),
            register: jest.fn(),
            refresh: jest.fn(),
            logout: jest.fn(),
          },
        },
        {
          provide: PromotionsService,
          useValue: {
            list: jest.fn().mockResolvedValue([]),
            getById: jest.fn(),
            toggleFavorite: jest.fn(),
            listFavorites: jest.fn(),
          },
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();
  });

  it('GET /promotions returns 200', async () => {
    await request(app.getHttpServer()).get('/promotions').expect(200);
  });

  afterAll(async () => {
    await app.close();
  });
});
