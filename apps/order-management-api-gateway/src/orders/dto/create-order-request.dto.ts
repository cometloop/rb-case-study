import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export class CreateOrderRequestDto {
  customerId: string;
  productId: string;
  variantId: string;
  paymentMethodId: string;
  quantity: number;
  shipCompanyId?: string;
  trackingNumber?: string;
}

const schema = z.object({
  customerId: z.string(),
  productId: z.string(),
  variantId: z.string(),
  paymentMethodId: z.string(),
  quantity: z.number().min(1),
  shipCompanyId: z.string().optional().nullable(),
  trackingNumber: z.string().optional().nullable(),
});

export class CreateOrderRequestDtoSchema extends createZodDto(schema) {}
