import { NestFactory } from '@nestjs/core';
import { SeedModule } from './database/seed/seed.module';
import { SeedService } from './database/seed/seed.service';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(SeedModule);

    const seedService = app.get(SeedService);
    await seedService.seed();

    await app.close();
    process.exit(0);
}

bootstrap();
