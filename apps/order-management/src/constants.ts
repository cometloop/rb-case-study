export const OrderWorkerQueue: string = 'order-worker-queue';
export const OrderRequestQueue: string = 'order-request-queue';

export const Subjects = {
  OrderWorkerQueue: {
    Create: 'orders.create',
    ProcessPayment: 'orders.process.payment',
    Ship: 'orders.ship',
    Update: 'orders.update',
    UpateStatus: 'orders.update.status',
    Delete: 'orders.delete',
  },
  OrderRequestQueue: {
    GetAll: 'orders.getAll',
    FindOne: 'orders.findOne',
    Delivered: 'orders.delivered',
    Cancel: 'orders.cancel',
  },
} as const;
