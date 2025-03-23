import { z } from 'zod';

export class UpdateOrderDto {
  id: string;
  shipCompanyId: string;
  trackingNumber: string;
}

export const UpdateOrderDtoSchema = z.object({
  id: z.string().uuid(),
  shipCompanyId: z.string(),
  trackingNumber: z.string(),
});
