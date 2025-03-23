import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { OrderWorkerQueue } from 'apps/order-management/src/constants';
import { CustomerService } from './customer/customer.service';
import { InventoryService } from './inventory/inventory.service';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    OrdersModule,
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
  providers: [CustomerService, InventoryService],
})
export class OrderManagementModule {}
