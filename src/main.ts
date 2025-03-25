import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Stripe webhook requires raw body
  app.use(
    '/payment/webhook/stripe',
    bodyParser.raw({ type: 'application/json' }),
  );

  // ✅ Use regular JSON body for everything else
  app.use(bodyParser.json());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
