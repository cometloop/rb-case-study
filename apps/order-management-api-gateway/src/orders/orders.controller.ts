import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  OrderIdRequestDto,
  OrderIdRequestParams,
} from 'apps/order-management-api-gateway/src/orders/dto/get-order-request.dto';
import {
  OrderDeliveredRequestDto,
  OrderDeliveredRequestDtoSchema,
} from 'apps/order-management-api-gateway/src/orders/dto/order-delivered-dto';
import {
  UpdateOrderRequestDto,
  UpdateOrderRequestDtoSchema,
} from 'apps/order-management-api-gateway/src/orders/dto/update-order-request.dto';
import { UseZodGuard } from 'nestjs-zod';
import {
  CreateOrderRequestDto,
  CreateOrderRequestDtoSchema,
} from './dto/create-order-request.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @UseZodGuard('body', CreateOrderRequestDtoSchema)
  @Post()
  createOrder(@Body() createOrderRequest: CreateOrderRequestDto) {
    return this.ordersService.createOrder(createOrderRequest);
  }

  @Get()
  getOrders() {
    return this.ordersService.getOrders();
  }

  @UseZodGuard('params', OrderIdRequestDto)
  @UseZodGuard('body', UpdateOrderRequestDtoSchema)
  @Patch(':id')
  updateOrder(
    @Param() params: OrderIdRequestParams,
    @Body() updateOrderRequest: UpdateOrderRequestDto,
  ) {
    return this.ordersService.updateOrder(params.id, updateOrderRequest);
  }

  @UseZodGuard('params', OrderIdRequestDto)
  @Patch(':id/cancel')
  cancel(@Param() params: OrderIdRequestParams) {
    return this.ordersService.cancelOrder(params.id);
  }

  @UseZodGuard('params', OrderIdRequestDto)
  @UseZodGuard('body', OrderDeliveredRequestDtoSchema)
  @Patch(':id/delivered')
  orderDelivered(
    @Param() params: OrderIdRequestParams,
    @Body() req: OrderDeliveredRequestDto,
  ) {
    return this.ordersService.orderDelivered(params.id, req);
  }

  @UseZodGuard('params', OrderIdRequestDto)
  @Get(':id')
  getOrder(@Param() params: OrderIdRequestParams) {
    return this.ordersService.getOrder(params.id);
  }

  @UseZodGuard('params', OrderIdRequestDto)
  @Delete(':id')
  deleteOrder(@Param() params: OrderIdRequestParams) {
    return this.ordersService.deleteOrder(params.id);
  }
}
