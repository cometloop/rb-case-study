import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { OrderWorkerQueue } from 'apps/order-management-api-gateway/src/constants';
import { CustomerService } from 'apps/order-management/src/customer/customer.service';
import { InventoryService } from 'apps/order-management/src/inventory/inventory.service';
import { AckService } from 'apps/order-management/src/utils/ack';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [
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
  ],
  controllers: [OrdersController],
  providers: [OrdersService, AckService, CustomerService, InventoryService],
})
export class OrdersModule {}
