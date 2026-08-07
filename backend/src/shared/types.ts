export enum Platform {
  ALIEXPRESS = 'ALIEXPRESS',
  MERCADOLIVRE = 'MERCADOLIVRE',
  SHOPEE = 'SHOPEE',
}

export enum ProductStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  ERROR = 'ERROR',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  FULFILLMENT_PENDING = 'FULFILLMENT_PENDING',
  PLACED_ON_AE = 'PLACED_ON_AE',
  AWAITING_TRACKING = 'AWAITING_TRACKING',
  TRACKING_SYNCED = 'TRACKING_SYNCED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  ERROR = 'ERROR',
}

export enum SyncLogType {
  PRODUCT_SYNC = 'PRODUCT_SYNC',
  ORDER_FULFILLMENT = 'ORDER_FULFILLMENT',
  TRACKING_SYNC = 'TRACKING_SYNC',
  TOKEN_REFRESH = 'TOKEN_REFRESH',
}

export enum SyncLogStatus {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  INFO = 'INFO',
}

export interface AuthenticatedRequest extends Express.Request {
  userId?: string;
}
