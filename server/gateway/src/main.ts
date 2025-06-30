import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:3000', // Your React frontend URL
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    credentials: true, // If you want to allow cookies/auth headers
  });
  await app.listen(3004);
  console.log('Api gateway running on port 3004');
}
bootstrap();
