import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { env } from '../../config/env.js';
import crypto from 'crypto';

const prisma = new PrismaClient();

export class AuthService {
  async register(data: any) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
      },
    });
    return { id: user.id, email: user.email };
  }

  async login(data: any) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      throw new Error('Credenciais inválidas');
    }
    const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, { expiresIn: '1d' });
    return { token, user: { id: user.id, email: user.email, name: user.name } };
  }

  async getMe(userId: string) {
    return prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, name: true } });
  }

  getMLAuthUrl() {
    return `https://auth.mercadolivre.com.br/authorization?response_type=code&client_id=${env.ML_CLIENT_ID}&redirect_uri=${env.ML_REDIRECT_URI}`;
  }

  async handleMLCallback(code: string, state: string) {
    // Exchange code for token
    console.log('ML callback received', { code, state });
  }

  getShopeeAuthUrl() {
    const timestamp = Math.floor(Date.now() / 1000);
    const path = '/api/v2/shop/auth_partner';
    const message = env.SHOPEE_PARTNER_ID + path + timestamp;
    const sign = crypto.createHmac('sha256', env.SHOPEE_PARTNER_KEY || '').update(message).digest('hex');
    
    return `https://partner.shopeemobile.com${path}?partner_id=${env.SHOPEE_PARTNER_ID}&sign=${sign}&timestamp=${timestamp}&redirect=${env.SHOPEE_REDIRECT_URI}`;
  }

  async handleShopeeCallback(code: string, shopId: string) {
    console.log('Shopee callback received', { code, shopId });
  }

  async saveAliExpressCredentials(userId: string, data: any) {
    return prisma.credential.create({
      data: {
        userId,
        platform: 'ALIEXPRESS',
        appKey: data.appKey,
        appSecret: data.appSecret,
      }
    });
  }

  async getCredentials(userId: string) {
    return prisma.credential.findMany({ where: { userId } });
  }

  async deleteCredential(userId: string, id: string) {
    return prisma.credential.deleteMany({ where: { id, userId } });
  }
}
