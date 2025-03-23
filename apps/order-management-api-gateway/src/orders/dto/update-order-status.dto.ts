import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export type OrderStatus =
  | 'created'
  | 'paymentSuccess'
  | 'paymentFailed'
  | 'shipped'
  | 'canceled'
  | 'delivered';

export class UpdateOrderStatusDto {
  status: OrderStatus;
}

const schema = z.object({
  status: z.enum(['processing', 'canceled', 'delivered']),
});

export class UpdateOrderStatusDtoSchema extends createZodDto(schema) {}
