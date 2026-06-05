import { PromotionsService } from '../src/promotions/promotions.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('PromotionsService', () => {
  it('should return favorite true when no existing favorite', async () => {
    const service = new PromotionsService({
      promotionFavorite: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({}),
      },
    } as unknown as PrismaService);

    const result = await service.toggleFavorite('u1', 'p1');
    expect(result.favorite).toBe(true);
  });
});
