import axios from 'axios';

export class MLClient {
  private baseUrl = 'https://api.mercadolibre.com';

  async createItem(accessToken: string, itemData: any) {
    const res = await axios.post(`${this.baseUrl}/items`, itemData, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    return res.data;
  }

  async updateItem(accessToken: string, itemId: string, data: any) {
    const res = await axios.put(`${this.baseUrl}/items/${itemId}`, data, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    return res.data;
  }

  async updateStock(accessToken: string, itemId: string, stock: number) {
    return this.updateItem(accessToken, itemId, { available_quantity: stock });
  }

  async getOrder(accessToken: string, orderId: string) {
    const res = await axios.get(`${this.baseUrl}/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    return res.data;
  }

  async addTracking(accessToken: string, orderId: string, shipmentId: string, trackingNumber: string) {
    const res = await axios.post(`${this.baseUrl}/shipments/${shipmentId}/tracking`, { tracking_number: trackingNumber }, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    return res.data;
  }

  async refreshToken(clientId: string, clientSecret: string, refreshToken: string) {
    const res = await axios.post(`${this.baseUrl}/oauth/token`, {
      grant_type: 'refresh_token',
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken
    });
    return res.data;
  }
}
