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

  // Enable CORS before applying middleware
  app.enableCors();

  // Stripe webhook requires raw body - configure raw body middleware
  app.use('/payment/webhook/stripe', (req, res, next) => {
    if (req.headers['content-type'] === 'application/json') {
      let data = '';
      req.setEncoding('utf8');
      req.on('data', (chunk) => {
        data += chunk;
      });
      req.on('end', () => {
        (req as any).rawBody = Buffer.from(data, 'utf8');
        next();
      });
    } else {
      next();
    }
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
