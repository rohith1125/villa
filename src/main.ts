import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Allow requests from the frontend dev server
  app.enableCors();

  // ✅ Stripe webhook requires raw body - this is handled by NestJS middleware
  app.use('/payment/webhook/stripe', (req, res, next) => {
    if (req.headers['content-type'] === 'application/json') {
      req.body = JSON.stringify(req.body);
    }
    next();
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
