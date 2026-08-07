import axios from 'axios';
import { generateHmacSha256 } from '../../shared/utils.js';

export class ShopeeClient {
  private baseUrl = 'https://partner.shopeemobile.com';

  constructor(private partnerId: string, private partnerKey: string) {}

  private async callApi(path: string, body: any, accessToken: string, shopId: string) {
    const timestamp = Math.floor(Date.now() / 1000);
    const message = `${this.partnerId}${path}${timestamp}${accessToken}${shopId}`;
    const sign = generateHmacSha256(this.partnerKey, message);

    const url = `${this.baseUrl}${path}?partner_id=${this.partnerId}&timestamp=${timestamp}&access_token=${accessToken}&shop_id=${shopId}&sign=${sign}`;

    const res = await axios.post(url, body, {
      headers: { 'Content-Type': 'application/json' }
    });
    return res.data;
  }

  async addItem(accessToken: string, shopId: string, itemData: any) {
    return this.callApi('/api/v2/product/add_item', itemData, accessToken, shopId);
  }

  async updateStock(accessToken: string, shopId: string, itemId: string, stock: number) {
    return this.callApi('/api/v2/product/update_stock', { item_id: itemId, stock_list: [{ stock }] }, accessToken, shopId);
  }

  async updatePrice(accessToken: string, shopId: string, itemId: string, price: number) {
    return this.callApi('/api/v2/product/update_price', { item_id: itemId, price_list: [{ original_price: price }] }, accessToken, shopId);
  }

  async getOrderDetail(accessToken: string, shopId: string, orderSn: string) {
    return this.callApi('/api/v2/order/get_order_detail', { order_sn_list: [orderSn] }, accessToken, shopId);
  }

  async updateTrackingNo(accessToken: string, shopId: string, orderSn: string, trackingNo: string) {
    return this.callApi('/api/v2/logistics/ship_order', { order_sn: orderSn, tracking_number: trackingNo }, accessToken, shopId);
  }

  async refreshToken(refreshToken: string, shopId: string) {
    const timestamp = Math.floor(Date.now() / 1000);
    const path = '/api/v2/auth/access_token/get';
    const message = `${this.partnerId}${path}${timestamp}`;
    const sign = generateHmacSha256(this.partnerKey, message);

    const url = `${this.baseUrl}${path}?partner_id=${this.partnerId}&timestamp=${timestamp}&sign=${sign}`;
    const res = await axios.post(url, { refresh_token: refreshToken, shop_id: Number(shopId), partner_id: Number(this.partnerId) });
    return res.data;
  }
}
