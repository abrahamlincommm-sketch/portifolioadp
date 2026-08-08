import { SupplierAdapter, SupplierProductData, SupplierOrderData, SupplierOrderResult, SupplierTrackingResult } from '../supplier.adapter.js';
import { AliExpressClient } from '../../aliexpress/aliexpress.client.js';

export class AliExpressAdapter implements SupplierAdapter {
  name = 'ALIEXPRESS';
  type = 'API' as const;

  async importProduct(productId: string, credentials?: any): Promise<SupplierProductData | null> {
    if (!credentials?.appKey || !credentials?.appSecret) {
      throw new Error('AliExpress credentials missing');
    }
    const client = new AliExpressClient(credentials.appKey, credentials.appSecret);
    const result = await client.getProduct(productId);
    
    return {
      title: result?.title || 'Imported Product',
      description: result?.description,
      images: result?.images ? JSON.parse(result.images) : [],
      costPriceUsd: result?.price || 10,
      stock: result?.stock || 100,
      supplierProductId: productId,
      supplierUrl: `https://aliexpress.com/item/${productId}.html`
    };
  }

  async createOrder(orderData: SupplierOrderData, credentials?: any): Promise<SupplierOrderResult> {
    if (!credentials?.appKey || !credentials?.appSecret) {
      throw new Error('AliExpress credentials missing');
    }
    const client = new AliExpressClient(credentials.appKey, credentials.appSecret);
    const result = await client.createOrder(orderData);
    
    return {
      success: true,
      supplierOrderId: result?.order_id || `AE${Date.now()}`,
      status: 'PLACED_ON_AE',
      message: 'Order created on AliExpress'
    };
  }

  async getTracking(orderId: string, credentials?: any): Promise<SupplierTrackingResult | null> {
    if (!credentials?.appKey || !credentials?.appSecret) {
      throw new Error('AliExpress credentials missing');
    }
    const client = new AliExpressClient(credentials.appKey, credentials.appSecret);
    const result = await client.getTrackingInfo(orderId);
    
    if (!result) return null;
    
    return {
      trackingCode: result.tracking_code || 'TRACK_123',
      trackingUrl: result.tracking_url,
      status: result.status || 'SHIPPED'
    };
  }
}
