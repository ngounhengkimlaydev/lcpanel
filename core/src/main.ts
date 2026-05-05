import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { FileService } from './common/utils/file/file.service';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const origins = process.env.CORE_ORIGIN
    ? process.env.CORE_ORIGIN.split(',').map((o) => o.trim())
    : [];

  app.setGlobalPrefix('api');
  app.enableShutdownHooks();
  const writeFileService = app.get(FileService);
  // increase JSON body size
  app.use(bodyParser.json({ limit: '50mb' })); // for JSON (Base64)
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true })); // for URL-encoded

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );
  app.enableCors({
    origin: (origin: any, callback: any) => {
      // writeFileService.logFile(origin);

      if (!origin) return callback(null, true);

      const allowedOrigins = origins;

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS not allowed for origin ${origin}`));
      }
    },
    methods: '*',
    allowedHeaders: '*',
    credentials: true,
  });

  app.useGlobalInterceptors(new ResponseInterceptor());

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`Server running on port ${port}`);
}
bootstrap();
