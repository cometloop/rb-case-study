import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import {
  OrderRequestQueue,
  OrderWorkerQueue,
} from 'apps/order-management-api-gateway/src/constants';
import { OrdersService } from 'apps/order-management-api-gateway/src/orders/orders.service';
import { OrdersController } from './orders/orders.controller';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    OrdersModule,
    // Queue Retains all messages until explicit ACK
    ClientsModule.register([
      {
        name: 'ORDERS_WORKER_QUEUE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://rabbitmq:5672'],
          queue: OrderWorkerQueue,
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
    // Request/Response Queue
    ClientsModule.register([
      {
        name: 'ORDERS_REQUEST',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://rabbitmq:5672'],
          queue: OrderRequestQueue,
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrderManagementApiGatewayModule {}
