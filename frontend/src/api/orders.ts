import client from './client';

export const ordersApi = {
  getOrders: () => client.get('/orders'),
  getOrderStats: () => client.get('/orders/stats'),
};
