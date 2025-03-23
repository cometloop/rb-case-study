import { NestFactory } from '@nestjs/core';
import { OrderManagementApiGatewayModule } from './order-management-api-gateway.module';
async function bootstrap() {
  const app = await NestFactory.create(OrderManagementApiGatewayModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
