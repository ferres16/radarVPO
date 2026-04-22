import { PrismaClient } from '@prisma/client';
import type { PrismaService } from '../src/prisma/prisma.service';
import { RegistreScraperService } from '../src/jobs/registre-scraper.service';

async function main() {
  const prisma = new PrismaClient();

  try {
    await prisma.$connect();
    const scraper = new RegistreScraperService(prisma as unknown as PrismaService);

    const beforeCount = await prisma.promotion.count();
    await prisma.promotion.deleteMany({});

    const scrape = await scraper.scrapeLatestAnnouncements();

    const latest = await prisma.promotion.findMany({
      orderBy: [{ alertDetectedAt: 'desc' }, { createdAt: 'desc' }],
      select: { id: true },
      take: 10,
    });

    const keepIds = latest.map((item) => item.id);
    if (keepIds.length > 0) {
      await prisma.promotion.deleteMany({
        where: {
          id: {
            notIn: keepIds,
          },
        },
      });
    }

    const afterCount = await prisma.promotion.count();

    console.log(
      JSON.stringify(
        {
          deletedBefore: beforeCount,
          scrape,
          kept: keepIds.length,
          finalCount: afterCount,
        },
        null,
        2,
      ),
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
