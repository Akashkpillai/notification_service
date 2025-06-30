import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaClientExceptionFilter } from './filters/prisma-exception.filter';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import { ResponseStatusInterceptor } from './interceptor/response.intercept';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { RpcExceptionFilter } from './filters/rpc-exception.filter';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Connect the microservice transport (e.g., Redis)
    app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.REDIS,
        options: {
            host: 'localhost', // Your Redis host
            port: 6379, // Your Redis port
        },
    });

    const { httpAdapter } = app.get(HttpAdapterHost);

    app.useGlobalFilters(
        new PrismaClientExceptionFilter(httpAdapter),
        new HttpExceptionFilter(),
        new RpcExceptionFilter()
    );

    app.useGlobalInterceptors(new ResponseStatusInterceptor());

    app.useGlobalPipes(new ValidationPipe());

    await app.startAllMicroservices();
    await app.listen(3005);
    console.log('User service is running on 3005');
}
bootstrap();
