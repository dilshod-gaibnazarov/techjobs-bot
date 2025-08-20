import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const PORT = Number(process.env.PORT) || 5000;

async function startApp() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',
    methods: 'GET, DELETE, POST, PATCH',
    preflightContinue: false,
  });
  app.setGlobalPrefix('api');
  await app.listen(PORT, () => {
    console.log('Server running on port', PORT);
  });
}

startApp();
