import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/exception-filters/http-exception.filter';
import { APIResponseInterceptor } from './common/interceptors/api-response-interceptor';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const cookieSecret = process.env.COOKIE_SECRET;
  if (!cookieSecret) {
    throw new Error('COOKIE_SECRET is missing from .env');
  }

  app.use(cookieParser(cookieSecret))

  const config = new DocumentBuilder()
    .setTitle('AwoofHub API')
    .setDescription('API for discovering freebies, promotions, events, and volunteer opportunities')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(
    new APIResponseInterceptor(),
    new ClassSerializerInterceptor(app.get(Reflector)),
);
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
