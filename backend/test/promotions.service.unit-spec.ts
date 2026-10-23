import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PromotionsService } from '../src/promotions/promotions.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { FileStorageService } from '../src/storage/file-storage.service';
import { MetricsService } from '../src/metrics/metrics.service';

type FavoriteOptions = {
  existing?: { id: string } | null;
  promotionExists?: boolean;
  plan?: 'free' | 'pro';
  proSubscriptions?: number;
  saved?: number;
};

function buildService(options: FavoriteOptions = {}) {
  const favorite = {
    findUnique: jest.fn().mockResolvedValue(options.existing ?? null),
    create: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue({}),
    count: jest.fn().mockResolvedValue(options.saved ?? 0),
    update: jest.fn().mockResolvedValue({}),
  };
  const prisma = {
    promotionFavorite: favorite,
    promotion: {
      findUnique: jest
        .fn()
        .mockResolvedValue(
          options.promotionExists === false ? null : { id: 'p1' },
        ),
    },
    user: {
      findUnique: jest.fn().mockResolvedValue({
        plan: options.plan ?? 'free',
        subscriptions: Array.from(
          { length: options.proSubscriptions ?? 0 },
          () => ({
            id: 's',
          }),
        ),
      }),
    },
  } as unknown as PrismaService;

  return {
    favorite,
    service: new PromotionsService(
      prisma,
      {} as FileStorageService,
      {
        getVisitorCount: jest.fn().mockResolvedValue(0),
      } as unknown as MetricsService,
    ),
  };
}

describe('PromotionsService list', () => {
  it('orders published promotions by publication date', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const prisma = {
      promotion: { findMany },
    } as unknown as PrismaService;
    const service = new PromotionsService(
      prisma,
      {} as FileStorageService,
      {
        getVisitorCount: jest.fn().mockResolvedValue(0),
      } as unknown as MetricsService,
    );

    await service.list({ limit: 10 });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [
          { publishedAt: { sort: 'desc', nulls: 'last' } },
          { createdAt: 'desc' },
        ],
      }),
    );
  });
});

describe('PromotionsService favorites', () => {
  it('saves a promotion for a free user under the limit', async () => {
    const { service, favorite } = buildService({ saved: 2 });
    const result = await service.toggleFavorite('u1', 'p1');
    expect(result.favorite).toBe(true);
    expect(favorite.create).toHaveBeenCalled();
  });

  it('blocks free users above the saved limit', async () => {
    const { service, favorite } = buildService({ saved: 3 });
    await expect(service.toggleFavorite('u1', 'p1')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(favorite.create).not.toHaveBeenCalled();
  });

  it('does not limit PRO users', async () => {
    const { service, favorite } = buildService({ plan: 'pro', saved: 40 });
    const result = await service.toggleFavorite('u1', 'p1');
    expect(result.favorite).toBe(true);
    expect(favorite.count).not.toHaveBeenCalled();
  });

  it('does not limit users with an active PRO subscription', async () => {
    const { service } = buildService({ proSubscriptions: 1, saved: 40 });
    await expect(service.toggleFavorite('u1', 'p1')).resolves.toEqual({
      favorite: true,
    });
  });

  it('removes an existing favorite without checking limits', async () => {
    const { service, favorite } = buildService({
      existing: { id: 'f1' },
      saved: 99,
    });
    const result = await service.toggleFavorite('u1', 'p1');
    expect(result.favorite).toBe(false);
    expect(favorite.delete).toHaveBeenCalledWith({ where: { id: 'f1' } });
  });

  it('rejects saving a promotion that does not exist', async () => {
    const { service } = buildService({ promotionExists: false });
    await expect(
      service.toggleFavorite('u1', 'missing'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('only edits favorites the user already saved', async () => {
    const { service } = buildService({ existing: null });
    await expect(
      service.updateFavorite('u1', 'p1', { stage: 'applied' } as never),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('normalizes the checklist and trims notes when editing', async () => {
    const { service, favorite } = buildService({ existing: { id: 'f1' } });
    await service.updateFavorite('u1', 'p1', {
      notes: '  mis notas  ',
      checklistDone: ['keep_receipt', 'read_bases'],
    });
    expect(favorite.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          notes: 'mis notas',
          checklistDone: ['read_bases', 'keep_receipt'],
        },
      }),
    );
  });
});
