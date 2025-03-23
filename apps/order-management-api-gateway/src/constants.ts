export const OrderWorkerQueue: string = 'order-worker-queue';
export const OrderRequestQueue: string = 'order-request-queue';

export const Subjects = {
  OrderWorkerQueue: {
    Create: 'orders.create',
    Upate: 'orders.update',
    UpateStatus: 'orders.update.status',
    Delete: 'orders.delete',
  },
  OrderRequestQueue: {
    GetAll: 'orders.getAll',
    FindOne: 'orders.findOne',
    Cancel: 'orders.cancel',
    Delivered: 'orders.delivered',
  },
} as const;
