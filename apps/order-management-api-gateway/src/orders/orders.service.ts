import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  OrderRequestQueue,
  OrderWorkerQueue,
  Subjects,
} from 'apps/order-management-api-gateway/src/constants';
import {
  OrderDeliveredMessageDto,
  OrderDeliveredRequestDto,
} from 'apps/order-management-api-gateway/src/orders/dto/order-delivered-dto';
import { CreateOrderRequestDto } from './dto/create-order-request.dto';
import { UpdateOrderRequestDto } from './dto/update-order-request.dto';

@Injectable()
export class OrdersService {
  constructor(
    @Inject('ORDERS_WORKER_QUEUE') private ordersWorkerQueueClient: ClientProxy,
    @Inject('ORDERS_REQUEST') private ordersRequestClient: ClientProxy,
  ) {}
  createOrder(createOrderRequest: CreateOrderRequestDto) {
    return this.ordersWorkerQueueClient.send(
      {
        queue: OrderWorkerQueue,
        subject: Subjects.OrderWorkerQueue.Create,
      },
      createOrderRequest,
    );
  }

  updateOrder(id: string, req: UpdateOrderRequestDto) {
    return this.ordersWorkerQueueClient.send(
      {
        queue: OrderWorkerQueue,
        subject: Subjects.OrderWorkerQueue.Upate,
      },
      { id, ...req },
    );
  }

  deleteOrder(id: string) {
    return this.ordersWorkerQueueClient.send(
      {
        queue: OrderWorkerQueue,
        subject: Subjects.OrderWorkerQueue.Delete,
      },
      id,
    );
  }

  cancelOrder(id: string) {
    return this.ordersWorkerQueueClient.send(
      {
        queue: OrderWorkerQueue,
        subject: Subjects.OrderWorkerQueue.Cancel,
      },
      id,
    );
  }

  orderDelivered(id: string, message: OrderDeliveredRequestDto) {
    const messageDto: OrderDeliveredMessageDto = {
      id,
      ...message,
    };

    return this.ordersWorkerQueueClient.send(
      {
        queue: OrderWorkerQueue,
        subject: Subjects.OrderWorkerQueue.Delivered,
      },
      messageDto,
    );
  }

  getOrders() {
    return this.ordersRequestClient.send(
      {
        queue: OrderRequestQueue,
        subject: Subjects.OrderRequestQueue.GetAll,
      },
      {},
    );
  }

  getOrder(id: string) {
    return this.ordersRequestClient.send(
      {
        queue: OrderRequestQueue,
        subject: Subjects.OrderRequestQueue.FindOne,
      },
      id,
    );
  }
}
