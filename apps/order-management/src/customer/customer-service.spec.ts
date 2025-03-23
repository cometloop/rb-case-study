import { Test, TestingModule } from '@nestjs/testing';
import { CustomerService } from 'apps/order-management/src/customer/customer.service';

describe('CustomerServiceService', () => {
  let service: CustomerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomerService],
    }).compile();

    service = module.get<CustomerService>(CustomerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
