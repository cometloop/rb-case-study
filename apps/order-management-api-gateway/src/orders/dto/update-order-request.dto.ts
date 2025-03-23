import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export class UpdateOrderRequestDto {
  shipCompanyId?: string;
  trackingNumber?: string;
}

const schema = z.object({
  shipCompanyId: z.string(),
  trackingNumber: z.string(),
});

export class UpdateOrderRequestDtoSchema extends createZodDto(schema) {}
