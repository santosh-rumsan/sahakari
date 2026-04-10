import { existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from '@nestjs/platform-fastify';
import multipart from '@fastify/multipart';
import staticFiles from '@fastify/static';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WinstonModule } from 'nest-winston';
import { format, transports } from 'winston';
import { AppModule } from './app.module';

const envFiles = [
  resolve(__dirname, '../.env'),
  resolve(__dirname, '../../../.env'),
];

for (const envFile of envFiles) {
  if (existsSync(envFile)) {
    process.loadEnvFile(envFile);
  }
}

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    {
      // logger: WinstonModule.createLogger({
      //   transports: [
      //     new transports.Console({
      //       format: format.combine(
      //         format.timestamp(),
      //         format.ms(),
      //         format.errors({ stack: true }),
      //         format.printf(
      //           ({ level, message, timestamp, context, stack, ms }) => {
      //             const contextPart = context ? ` [${String(context)}]` : '';
      //             const stackPart = stack ? `\n${String(stack)}` : '';
      //             return `${String(timestamp)} ${level.toUpperCase()}${contextPart} ${String(message)} ${String(ms)}${stackPart}`;
      //           },
      //         ),
      //       ),
      //     }),
      //   ],
      // }),
    },
  );
  const globalPrefix = 'v1';
  const allowedOrigins = (process.env.FRONTEND_URL ?? 'http://localhost:3000')
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean);
  const port = process.env.PORT ?? 4000;

  // Check if wildcard origin is allowed
  const allowAllOrigins = allowedOrigins.includes('*');

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      // Allow all origins if wildcard is configured
      if (allowAllOrigins) {
        callback(null, true);
        return;
      }

      const isConfiguredOrigin = allowedOrigins.includes(origin);
      const isLocalhostOrigin =
        /^https?:\/\/localhost(?::\d+)?$/.test(origin) ||
        /^https?:\/\/127\.0\.0\.1(?::\d+)?$/.test(origin);

      callback(null, isConfiguredOrigin || isLocalhostOrigin);
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  const maxUploadBytes = parseInt(process.env.MAX_UPLOAD_SIZE_BYTES ?? String(1 * 1024 * 1024), 10);
  await app.register(multipart, {
    limits: {
      fileSize: maxUploadBytes,
    },
  });

  const localUploadPath = process.env.UPLOAD_LOCAL_PATH;
  if (localUploadPath) {
    mkdirSync(localUploadPath, { recursive: true });
    await app.register(staticFiles, {
      root: localUploadPath,
      prefix: `/${globalPrefix}/uploads/`,
    });
  }

  app.setGlobalPrefix(globalPrefix);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Rumsan Craft API')
    .setDescription('API service for Rumsan Craft')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT',
    )
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('swagger', app, document);

  await app.listen(port, '0.0.0.0');
  Logger.log(
    `Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
  Logger.log(`Swagger UI: http://localhost:${port}/swagger`);
}

void bootstrap();
