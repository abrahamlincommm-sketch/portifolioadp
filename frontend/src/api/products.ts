import client from './client';

export const productsApi = {
  getProducts: () => client.get('/products'),
  importProduct: (url: string) => client.post('/products/import', { url }),
};
