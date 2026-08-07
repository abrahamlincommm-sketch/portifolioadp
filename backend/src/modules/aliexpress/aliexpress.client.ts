import axios from 'axios';
import { generateHmacMd5 } from '../../shared/utils.js';

export class AliExpressClient {
  private appKey: string;
  private appSecret: string;
  private gateway = 'https://api-sg.aliexpress.com/sync';

  constructor(appKey: string, appSecret: string) {
    this.appKey = appKey;
    this.appSecret = appSecret;
  }

  async callApi(apiMethod: string, params: Record<string, any>) {
    const allParams: Record<string, any> = {
      ...params,
      method: apiMethod,
      app_key: this.appKey,
      sign_method: 'md5',
      timestamp: new Date().toISOString().replace('T', ' ').split('.')[0],
      v: '2.0',
    };

    const sortedKeys = Object.keys(allParams).sort();
    let paramsStr = '';
    for (const key of sortedKeys) {
      paramsStr += key + allParams[key];
    }

    allParams.sign = generateHmacMd5(this.appSecret, paramsStr);

    const response = await axios.post(this.gateway, new URLSearchParams(allParams).toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    return response.data;
  }

  async getProduct(productId: string) {
    return this.callApi('aliexpress.ds.product.get', { product_id: productId });
  }

  async createOrder(orderData: any) {
    return this.callApi('aliexpress.ds.order.create', orderData);
  }

  async getOrderStatus(orderId: string) {
    return this.callApi('aliexpress.ds.order.get', { order_id: orderId });
  }

  async getTrackingInfo(orderId: string) {
    return this.callApi('aliexpress.ds.tracking.get', { order_id: orderId });
  }
}
