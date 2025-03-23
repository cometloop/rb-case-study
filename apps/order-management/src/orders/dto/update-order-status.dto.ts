import { OrderStatus } from 'apps/order-management/src/orders/entities/order.entity';
import { z } from 'zod';

export class UpdateOrderStatusDto {
  id: string;
  status: OrderStatus;
}

export const UpdateOrderStatusDtoSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['processing', 'canceled', 'delivered']),
});
