export interface SupplierAdapter {
  name: string;
  type: 'API' | 'MANUAL';
  
  // Import a product from this supplier (API suppliers fetch from their API, manual returns null)
  importProduct(productId: string, credentials?: any): Promise<SupplierProductData | null>;
  
  // Create an order with this supplier (API suppliers call their API, manual just returns a pending status)
  createOrder(orderData: SupplierOrderData, credentials?: any): Promise<SupplierOrderResult>;
  
  // Get tracking info from this supplier
  getTracking(orderId: string, credentials?: any): Promise<SupplierTrackingResult | null>;
}

export interface SupplierProductData {
  title: string;
  description?: string;
  images: string[];
  costPriceUsd: number;
  stock: number;
  supplierProductId: string;
  supplierUrl?: string;
}

export interface SupplierOrderData {
  supplierProductId: string;
  quantity: number;
  buyerName: string;
  buyerAddress: string;
  buyerPhone?: string;
}

export interface SupplierOrderResult {
  success: boolean;
  supplierOrderId?: string;
  status: string;
  message?: string;
}

export interface SupplierTrackingResult {
  trackingCode: string;
  trackingUrl?: string;
  status: string;
}
