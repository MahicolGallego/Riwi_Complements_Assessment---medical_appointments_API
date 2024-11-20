import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //Configure cors options
  // const corsOptionsDelegate = (req: Request, callback: any) => {
  //   const allowList = ['http://localhost:3000'];
  //   let corsOptions: { origin: boolean };
  //   //evalue origin of request
  //   if (allowList.indexOf(req.headers['origin']) !== -1) {
  //     //enable access
  //     corsOptions = { origin: true };
  //   } else {
  //     //access denied
  //     corsOptions = { origin: false };
  //   }
  //   callback(null, corsOptions);
  // };
  // //enable cors
  // app.enableCors(corsOptionsDelegate);

  app.enableCors();

  //for validating and transforming input data based on Dto's
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  //enable serialization of response objects (apply class-transformer)
  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));

  //Config Swagger to API Documentation
  const config = new DocumentBuilder()
    .setTitle('Appointments API')
    .setDescription(
      'API for medical appointment management, enabling doctors and patients to schedule, view, reschedule, and cancel appointments efficiently. It includes features for availability validation, JWT-based authentication, and detailed error handling to ensure a secure and reliable experience.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('medical-appointments/api/v1/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
