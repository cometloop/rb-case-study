import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { ZodSchema } from 'zod';

@Injectable()
export class ZodValidationGuard implements CanActivate {
  constructor(private readonly schema: ZodSchema<any>) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const ctx = context.switchToRpc(); // Get microservice context
    const data = ctx.getData<unknown>(); // Get the payload from the message

    // Validate the payload using the provided Zod schema
    const result = this.schema.safeParse(data);

    if (!result.success) {
      // If validation fails, throw an error
      throw new RpcException(
        new UnprocessableEntityException(
          `Validation failed: ${result.error.errors
            .map((err) => `${err.path.join('.')}: ${err.message}`)
            .join(', ')}`,
        ),
      );
    }

    return true; // Allow the request if validation passes
  }
}
