/* eslint-disable @typescript-eslint/no-unused-vars */
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Result, Status } from 'apps/order-management/src/types';

@Injectable()
export class InventoryService {
  constructor(
    @Inject('ORDERS_WORKER_QUEUE') private ordersWorkerQueueClient: ClientProxy,
  ) {}

  shipProduct(
    orderId: string,
    productId: string,
    variantId: string,
    qty: number,
  ): Result<boolean> {
    return {
      status: Status.SUCCESS,
      value: true,
    };
  }
}
