import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export class OrderDeliveredRequestDto {
  trackingId: string;
  confirmationId: string;
}

export class OrderDeliveredMessageDto {
  id: string;
  trackingId: string;
  confirmationId: string;
}

const schema = z.object({
  trackingId: z.string(),
  confirmationId: z.string(),
});

export class OrderDeliveredRequestDtoSchema extends createZodDto(schema) {}
