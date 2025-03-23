import { Injectable } from '@nestjs/common';
import { Customer } from 'apps/order-management/src/customer/entities/customer.entity';
import { PaymentTransaction } from 'apps/order-management/src/customer/entities/payment-transaction.entity';
import { Result, Status } from 'apps/order-management/src/types';
import { sleep } from 'apps/order-management/src/utils/sleep';

@Injectable()
export class CustomerService {
  getCustomer(id: string): Result<Customer> {
    return {
      status: Status.SUCCESS,
      value: {
        id,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phoneNumber: '123-456-7890',
        address: '123 Main St, Springfield, IL, 62704',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };
  }

  async chargePaymentMethod(id: string): Promise<Result<PaymentTransaction>> {
    console.log('charge payment method', id);
    await sleep(3000);
    return { status: Status.SUCCESS, value: { id: 'trans_890283yu42394' } };
  }
}
