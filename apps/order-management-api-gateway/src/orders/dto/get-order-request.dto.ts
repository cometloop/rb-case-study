import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const OrderIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export type OrderIdRequestParams = z.infer<typeof OrderIdParamsSchema>;

export class OrderIdRequestDto extends createZodDto(OrderIdParamsSchema) {}
