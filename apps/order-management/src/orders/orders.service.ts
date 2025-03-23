import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  OrderWorkerQueue,
  Subjects,
} from 'apps/order-management/src/constants';
import { CustomerService } from 'apps/order-management/src/customer/customer.service';
import { PaymentTransaction } from 'apps/order-management/src/customer/entities/payment-transaction.entity';
import {
  Order,
  OrderStatus,
} from 'apps/order-management/src/orders/entities/order.entity';
import {
  FailureResult,
  Result,
  Status,
  SuccessResult,
} from 'apps/order-management/src/types';
import { sleep } from 'apps/order-management/src/utils/sleep';
import { v4 as uuid } from 'uuid';

import { InventoryService } from 'apps/order-management/src/inventory/inventory.service';
import { OrderDeliveredDto } from 'apps/order-management/src/orders/dto/order-delivered-dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @Inject('ORDERS_WORKER_QUEUE')
    private readonly ordersWorkerQueueClient: ClientProxy,
    @Inject() private readonly customerService: CustomerService,
    @Inject() private readonly inventoryService: InventoryService,
  ) {}

  private readonly orders: Order[] = [];

  orderCreated(orderId: string) {
    this.ordersWorkerQueueClient.emit(
      {
        queue: OrderWorkerQueue,
        subject: Subjects.OrderWorkerQueue.ProcessPayment,
      },
      orderId,
    );
  }

  paymentSuccess(orderId: string) {
    this.ordersWorkerQueueClient.emit(
      {
        queue: OrderWorkerQueue,
        subject: Subjects.OrderWorkerQueue.Ship,
      },
      orderId,
    );
  }

  async orderDelivered(dto: OrderDeliveredDto) {
    this.updateStatus(dto.id, 'delivered');
    await this.notifyUserOfStatusChange(dto.id, 'delivered');
    return SuccessResult(true);
  }

  cancel(id: string) {
    const result = this.findOne(id);
    if (result.status === Status.FAILURE) {
      return result;
    }
    return this.updateStatus(id, 'canceled');
  }

  async processPayment(orderId: string): Promise<Result<PaymentTransaction>> {
    await sleep(1000);

    const orderResult = this.findOne(orderId);
    if (orderResult.status === Status.FAILURE) {
      return FailureResult(`Order ${orderId} not found`);
    }
    const customerResult = this.customerService.getCustomer(
      orderResult.value.customerId,
    );
    if (customerResult.status === Status.FAILURE) {
      return FailureResult(
        `Customer ${orderResult.value.customerId} not found`,
      );
    }
    const transResult = await this.customerService.chargePaymentMethod(
      orderResult.value.paymentMethodId,
    );
    if (transResult.status === Status.FAILURE) {
      return FailureResult(
        `Charging payment method failed for order: ${orderId} paymentMethodId: ${orderResult.value.paymentMethodId}`,
      );
    }
    return SuccessResult(transResult.value);
  }

  async notifyUserOfStatusChange(
    orderId: string,
    status: OrderStatus,
  ): Promise<Result> {
    console.log('notify user', orderId, status);
    await sleep(100);
    return SuccessResult(true);
  }

  async shipOrder(orderId: string): Promise<Result<boolean>> {
    await sleep(1000);

    const orderResult = this.findOne(orderId);
    if (orderResult.status === Status.FAILURE) {
      return FailureResult(`Order ${orderId} not found`);
    }

    const order = orderResult.value;

    // Do some inventory and shipping related things
    const shipResult = this.inventoryService.shipProduct(
      order.id,
      order.productId,
      order.variantId,
      order.quantity,
    );

    if (shipResult.status === Status.FAILURE) {
      return FailureResult({
        msg: 'Error shipping product for order',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        error: shipResult.error,
      });
    }

    this.update(orderId, {
      id: orderId,
      shipCompanyId: 'UPS',
      trackingNumber: 'TRACK1231902y89123y198232yu91283',
    });

    const nextStatus: OrderStatus = 'shipped';
    this.updateStatus(orderId, nextStatus);
    // notify customer their order has shipped
    await this.notifyUserOfStatusChange(orderId, nextStatus);

    return SuccessResult(true);
  }

  create(createOrderDto: CreateOrderDto): Result<Order> {
    const order: Order = {
      id: uuid(),
      ...createOrderDto,
      status: 'created',
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.orders.push(order);
    return { status: Status.SUCCESS, value: order };
  }

  getAll(): Result<Order[]> {
    return { status: Status.SUCCESS, value: this.orders };
  }

  findOne(id: string): Result<Order> {
    const match = this.orders.find((x) => x.id === id);
    if (!match) {
      return { status: Status.FAILURE, error: 'Order does not exist' };
    }
    return { status: Status.SUCCESS, value: match };
  }

  update(id: string, updateOrderDto: UpdateOrderDto): Result<Order> {
    const idx = this.orders.findIndex((x) => x.id === id);
    if (idx !== -1) {
      this.orders[idx] = {
        ...this.orders[idx],
        ...updateOrderDto,
        updatedAt: new Date(),
      };
      return { status: Status.SUCCESS, value: this.orders[idx] };
    }
    return FailureResult(`Unable to update order: ${id}: Order not found`);
  }

  updateStatus(id: string, status: OrderStatus): Result<Order> {
    const idx = this.orders.findIndex((x) => x.id === id);
    if (idx !== -1) {
      this.orders[idx] = {
        ...this.orders[idx],
        status,
        updatedAt: new Date(),
      };
      return { status: Status.SUCCESS, value: this.orders[idx] };
    }
    return { status: Status.FAILURE, error: 'Unable to update order status' };
  }

  remove(id: string): Result<true> {
    const idx = this.orders.findIndex((x) => x.id === id);
    if (idx !== -1) {
      this.orders[idx].isDeleted = true;
      return { status: Status.SUCCESS, value: true };
    }
    return { status: Status.FAILURE, error: 'Unable to delete order' };
  }
}
