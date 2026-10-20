/**
 * Genera (o fuerza) las noticias del día y adjunta portadas.
 * Uso: npx ts-node -r tsconfig-paths/register scripts/generate-today-news.ts
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { BackofficeService } from '../src/backoffice/backoffice.service';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  try {
    const backoffice = app.get(BackofficeService);
    const result = await backoffice.generateTodayNews(true);
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(result, null, 2));
  } finally {
    await app.close();
  }
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
