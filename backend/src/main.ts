import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  console.log('[Main] Environment Check - NODE_ENV:', process.env.NODE_ENV);
  console.log('[Main] GROK_API_KEY from process.env:', process.env.GROK_API_KEY?.substring(0, 10) || 'NOT FOUND');
  console.log('[Main] GROK_API_KEY from ConfigService:', configService.get<string>('GROK_API_KEY')?.substring(0, 10) || 'NOT FOUND');
  console.log('[Main] DATABASE_URL exists:', !!configService.get<string>('DATABASE_URL'));
  console.log('[Main] PORT:', configService.get<string>('PORT') || 'NOT FOUND');
  
  // Set Versioning prefix
  app.setGlobalPrefix('api/v1');

  // Security headers (loose configuration in dev mode for IDE preview/iframe compatibility)
  app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: false,
    frameguard: false,
  }));

  // Parse HTTP Cookies
  app.use(cookieParser());

  // CORS config supporting cookie transport
  app.enableCors({
    origin: (origin, callback) => {
      // In development, allow any origin to match IDE webview/previews
      callback(null, true);
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // Global Validation rules
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
    errorHttpStatusCode: 422
  }));

  const port = configService.get<number>('PORT') || 3001;
  await app.listen(port);
  console.log(`FinPilot backend running on port: ${port}`);
}
bootstrap();
