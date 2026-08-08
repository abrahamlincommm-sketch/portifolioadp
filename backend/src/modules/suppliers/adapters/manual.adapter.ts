import { SupplierAdapter, SupplierProductData, SupplierOrderData, SupplierOrderResult, SupplierTrackingResult } from '../supplier.adapter.js';

export class ManualAdapter implements SupplierAdapter {
  name = 'FORNECEDOR_MANUAL';
  type = 'MANUAL' as const;

  async importProduct(productId: string, credentials?: any): Promise<SupplierProductData | null> {
    return null;
  }

  async createOrder(orderData: SupplierOrderData, credentials?: any): Promise<SupplierOrderResult> {
    return {
      success: true,
      status: 'FULFILLMENT_PENDING',
      message: 'Faça o pedido manualmente no site do fornecedor'
    };
  }

  async getTracking(orderId: string, credentials?: any): Promise<SupplierTrackingResult | null> {
    return null;
  }
}
