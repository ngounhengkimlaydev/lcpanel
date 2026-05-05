import { NestFactory } from '@nestjs/core';
import { ModuleService } from '../src/modules/module/module.service';
import { AppModule } from '../src/app.module';
import { ModuleModule } from '../src/modules/module/module.module';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(ModuleModule);

    const moduleService = await app.resolve(ModuleService);

    await moduleService.sync();

    await app.close();
    process.exit(0);
}

bootstrap();
