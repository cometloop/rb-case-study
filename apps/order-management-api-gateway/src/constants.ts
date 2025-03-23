export const OrderWorkerQueue: string = 'order-worker-queue';
export const OrderRequestQueue: string = 'order-request-queue';

export const Subjects = {
  OrderWorkerQueue: {
    Create: 'orders.create',
    Upate: 'orders.update',
    UpateStatus: 'orders.update.status',
    Delete: 'orders.delete',
    Cancel: 'orders.cancel',
    Delivered: 'orders.delivered',
  },
  OrderRequestQueue: {
    GetAll: 'orders.getAll',
    FindOne: 'orders.findOne',
  },
} as const;
