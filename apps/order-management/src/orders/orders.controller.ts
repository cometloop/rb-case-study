import { Controller, NotFoundException, UseGuards } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
  RpcException,
} from '@nestjs/microservices';
import {
  OrderRequestQueue,
  OrderWorkerQueue,
  Subjects,
} from 'apps/order-management/src/constants';
import { ZodValidationGuard } from 'apps/order-management/src/guards/zod-validation-guard';
import { InventoryService } from 'apps/order-management/src/inventory/inventory.service';
import {
  OrderDeliveredDto,
  OrderDeliveredDtoSchema,
} from 'apps/order-management/src/orders/dto/order-delivered-dto';
import {
  UpdateOrderStatusDto,
  UpdateOrderStatusDtoSchema,
} from 'apps/order-management/src/orders/dto/update-order-status.dto';
import { Status } from 'apps/order-management/src/types';
import { AckService } from 'apps/order-management/src/utils/ack';
import { sleep } from 'apps/order-management/src/utils/sleep';
import { CreateOrderDto, CreateOrderDtoSchema } from './dto/create-order.dto';
import { UpdateOrderDto, UpdateOrderDtoSchema } from './dto/update-order.dto';
import { OrdersService } from './orders.service';

@Controller()
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly inventoryService: InventoryService,
    private readonly ackService: AckService,
  ) {}

  @UseGuards(new ZodValidationGuard(CreateOrderDtoSchema))
  @MessagePattern({
    queue: OrderWorkerQueue,
    subject: Subjects.OrderWorkerQueue.Create,
  })
  create(
    @Payload() createOrderDto: CreateOrderDto,
    @Ctx() context: RmqContext,
  ) {
    const result = this.ordersService.create(createOrderDto);
    if (result.status === Status.SUCCESS) {
      this.ackService.ack(context);
      console.log('order created');
      this.ordersService.orderCreated(result.value.id);
    }
    return result;
  }

  @EventPattern({
    queue: OrderWorkerQueue,
    subject: Subjects.OrderWorkerQueue.ProcessPayment,
  })
  async processPayment(@Payload() orderId: string, @Ctx() context: RmqContext) {
    console.log('process payment called', orderId);
    // assume payment was successful w/ make believe call to payment microservice
    const result = await this.ordersService.processPayment(orderId);
    if (result.status === Status.SUCCESS) {
      console.log('process payment success', orderId);
      this.ordersService.updateStatus(orderId, 'paymentSuccess');
      this.ackService.ack(context);
      this.ordersService.paymentSuccess(orderId);
    }
  }

  @EventPattern({
    queue: OrderWorkerQueue,
    subject: Subjects.OrderWorkerQueue.Ship,
  })
  async ship(@Payload() orderId: string, @Ctx() context: RmqContext) {
    console.log('ship order called', orderId);
    await sleep(1000);

    // check and ensure order item(s) is in stock
    // assuming they ara... add shipping/tracking info and upate status

    const result = await this.ordersService.shipOrder(orderId);
    console.log('ship result', result);
    if (result.status === Status.SUCCESS) {
      this.ackService.ack(context);
    }
  }

  @UseGuards(new ZodValidationGuard(UpdateOrderDtoSchema))
  @MessagePattern({
    queue: OrderWorkerQueue,
    subject: Subjects.OrderWorkerQueue.Update,
  })
  update(
    @Payload() updateOrderDto: UpdateOrderDto,
    @Ctx() context: RmqContext,
  ) {
    console.log('orders.update', updateOrderDto);
    const result = this.ordersService.update(updateOrderDto.id, updateOrderDto);
    if (result.status === Status.SUCCESS) {
      this.ackService.ack(context);
    }
    return result;
  }

  @UseGuards(new ZodValidationGuard(UpdateOrderStatusDtoSchema))
  @MessagePattern({
    queue: OrderWorkerQueue,
    subject: Subjects.OrderWorkerQueue.UpateStatus,
  })
  updateStatus(
    @Payload() status: UpdateOrderStatusDto,
    @Ctx() context: RmqContext,
  ) {
    console.log('orders.update.status', status);
    const result = this.ordersService.updateStatus(status.id, status.status);
    if (result.status) {
      this.ackService.ack(context);
    }
    return result;
  }

  @MessagePattern({
    queue: OrderWorkerQueue,
    subject: Subjects.OrderWorkerQueue.Delete,
  })
  remove(@Payload() id: string, @Ctx() context: RmqContext) {
    console.log('orders.delete', id);
    const result = this.ordersService.remove(id);
    if (result.status === Status.SUCCESS) {
      this.ackService.ack(context);
    }
    return result;
  }

  @MessagePattern({
    queue: OrderRequestQueue,
    subject: Subjects.OrderRequestQueue.GetAll,
  })
  getAll() {
    console.log('orders.getAll');
    const result = this.ordersService.getAll();
    return result;
  }

  @MessagePattern({
    queue: OrderRequestQueue,
    subject: Subjects.OrderRequestQueue.FindOne,
  })
  findOne(@Payload() id: string) {
    const order = this.ordersService.findOne(id);
    if (!order) {
      throw new RpcException(new NotFoundException());
    }
    return order;
  }

  @UseGuards(new ZodValidationGuard(OrderDeliveredDtoSchema))
  @MessagePattern({
    queue: OrderWorkerQueue,
    subject: Subjects.OrderWorkerQueue.Delivered,
  })
  async orderDelivered(
    @Payload() orderDeliveredDto: OrderDeliveredDto,
    @Ctx() context: RmqContext,
  ) {
    console.log('orders.delivered', orderDeliveredDto);
    const result = await this.ordersService.orderDelivered(orderDeliveredDto);
    if (result.status === Status.SUCCESS) {
      this.ackService.ack(context);
    }
    return result;
  }

  @MessagePattern({
    queue: OrderWorkerQueue,
    subject: Subjects.OrderWorkerQueue.Cancel,
  })
  orderDelete(@Payload() id: string, @Ctx() context: RmqContext) {
    console.log('cancel called');
    const result = this.ordersService.cancel(id);
    if (result.status === Status.SUCCESS) {
      this.ackService.ack(context);
    }
    return result;
  }
}
