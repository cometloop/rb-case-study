import { z } from 'zod';

export class OrderDeliveredDto {
  id: string;
  trackingId: string;
  confirmationId: string;
}

export const OrderDeliveredDtoSchema = z.object({
  id: z.string().uuid(),
  trackingId: z.string(),
  confirmationId: z.string(),
});
