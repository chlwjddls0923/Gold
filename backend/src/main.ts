import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { mkdirSync } from 'fs'

async function bootstrap() {
  mkdirSync('./uploads', { recursive: true })

  const app = await NestFactory.create(AppModule)

  app.setGlobalPrefix('api')

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))

  const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://www.goldsangsa.com',
    'https://goldsangsa.com',
  ]
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) callback(null, true)
      else callback(new Error('Not allowed by CORS'))
    },
    credentials: true,
  })

  if (process.env.NODE_ENV !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Goldsangsa API')
      .setDescription('GOLDSANGSA 상품 관리 API')
      .setVersion('1.0')
      .addBearerAuth()
      .build()
    const document = SwaggerModule.createDocument(app, swaggerConfig)
    SwaggerModule.setup('api/docs', app, document)
    console.log(`Swagger: http://localhost:${process.env.PORT || 4000}/api/docs`)
  }

  const port = process.env.PORT || 4000
  await app.listen(port)
  console.log(`Backend: http://localhost:${port}`)
}
bootstrap()
