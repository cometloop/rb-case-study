export type OrderStatus =
  | 'created'
  | 'paymentSuccess'
  | 'paymentFailed'
  | 'shipped'
  | 'canceled'
  | 'delivered';

export class Order {
  id: string;
  customerId: string;
  productId: string;
  variantId: string;
  quantity: number;
  paymentMethodId: string;
  paymentTransactionId?: string;
  shipCompanyId?: string;
  trackingNumber?: string;
  confirmationId?: string;
  status: OrderStatus;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
