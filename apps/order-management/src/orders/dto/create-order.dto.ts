import { z } from 'zod';

export class CreateOrderDto {
  customerId: string;
  productId: string;
  variantId: string;
  paymentMethodId: string;
  quantity: number;
  shipCompanyId?: string;
  trackingNumber?: string;
}

export const CreateOrderDtoSchema = z.object({
  customerId: z.string(),
  paymentMethodId: z.string(),
  productId: z.string(),
  variantId: z.string(),
  quantity: z.number().min(1),
  shipCompanyId: z.string().optional().nullable(),
  trackingNumber: z.string().optional().nullable(),
});
