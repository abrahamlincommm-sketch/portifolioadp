import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { env } from '../../config/env.js';
import axios from 'axios';
import crypto from 'crypto';

const prisma = new PrismaClient();

export class AuthService {
  async register(data: any) {
    // Verificar se o e-mail já existe
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new Error('Este e-mail já está cadastrado');
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
      },
    });

    const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, { expiresIn: '7d' });
    return { token, user: { id: user.id, email: user.email, name: user.name } };
  }

  async login(data: any) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      throw new Error('Credenciais inválidas');
    }
    const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, { expiresIn: '7d' });
    return { token, user: { id: user.id, email: user.email, name: user.name } };
  }

  async getMe(userId: string) {
    return prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, name: true } });
  }

  // ─── MERCADO LIVRE ────────────────────────────────────────────────

  getMLAuthUrl(userId: string) {
    // O "state" carrega o userId para sabermos qual usuário conectou na volta do callback
    const state = Buffer.from(JSON.stringify({ userId })).toString('base64url');
    return `https://auth.mercadolivre.com.br/authorization?response_type=code&client_id=${env.ML_CLIENT_ID}&redirect_uri=${encodeURIComponent(env.ML_REDIRECT_URI)}&state=${state}`;
  }

  async handleMLCallback(code: string, state: string) {
    // Decodificar o state para extrair o userId
    const stateData = JSON.parse(Buffer.from(state, 'base64url').toString());
    const userId = stateData.userId;

    if (!userId) throw new Error('Estado inválido no callback do Mercado Livre');

    // Trocar o code por access_token e refresh_token
    const response = await axios.post('https://api.mercadolibre.com/oauth/token', {
      grant_type: 'authorization_code',
      client_id: env.ML_CLIENT_ID,
      client_secret: env.ML_CLIENT_SECRET,
      code: code,
      redirect_uri: env.ML_REDIRECT_URI,
    });

    const { access_token, refresh_token, expires_in, user_id } = response.data;

    // Salvar ou atualizar as credenciais no banco
    const existing = await prisma.credential.findFirst({
      where: { userId, platform: 'MERCADOLIVRE' }
    });

    const expiresAt = new Date(Date.now() + expires_in * 1000);

    if (existing) {
      await prisma.credential.update({
        where: { id: existing.id },
        data: { accessToken: access_token, refreshToken: refresh_token, expiresAt, sellerId: String(user_id) }
      });
    } else {
      await prisma.credential.create({
        data: {
          userId,
          platform: 'MERCADOLIVRE',
          accessToken: access_token,
          refreshToken: refresh_token,
          expiresAt,
          sellerId: String(user_id),
        }
      });
    }

    // Registrar no log de sincronização
    await prisma.syncLog.create({
      data: {
        type: 'TOKEN_REFRESH',
        platform: 'MERCADOLIVRE',
        message: `Mercado Livre conectado com sucesso. Seller ID: ${user_id}`,
        status: 'SUCCESS',
      }
    });
  }

  // ─── SHOPEE ────────────────────────────────────────────────────────

  getShopeeAuthUrl(userId: string) {
    const timestamp = Math.floor(Date.now() / 1000);
    const path = '/api/v2/shop/auth_partner';
    const baseString = env.SHOPEE_PARTNER_ID + path + timestamp;
    const sign = crypto.createHmac('sha256', env.SHOPEE_PARTNER_KEY || '').update(baseString).digest('hex');

    // O redirect_uri carrega o userId via query param para sabermos quem conectou
    const redirectWithState = `${env.SHOPEE_REDIRECT_URI}?state=${Buffer.from(JSON.stringify({ userId })).toString('base64url')}`;

    return `https://partner.shopeemobile.com${path}?partner_id=${env.SHOPEE_PARTNER_ID}&sign=${sign}&timestamp=${timestamp}&redirect=${encodeURIComponent(redirectWithState)}`;
  }

  async handleShopeeCallback(code: string, shopId: string) {
    // Trocar o code por access_token e refresh_token
    const timestamp = Math.floor(Date.now() / 1000);
    const path = '/api/v2/auth/token/get';
    const baseString = env.SHOPEE_PARTNER_ID + path + timestamp;
    const sign = crypto.createHmac('sha256', env.SHOPEE_PARTNER_KEY || '').update(baseString).digest('hex');

    const response = await axios.post(
      `https://partner.shopeemobile.com${path}?partner_id=${env.SHOPEE_PARTNER_ID}&sign=${sign}&timestamp=${timestamp}`,
      {
        code,
        shop_id: Number(shopId),
        partner_id: Number(env.SHOPEE_PARTNER_ID),
      }
    );

    const { access_token, refresh_token, expire_in } = response.data;

    if (!access_token) {
      throw new Error(`Falha ao obter token da Shopee: ${response.data.message || 'Resposta inválida'}`);
    }

    // Precisamos encontrar o userId. Em produção, o state viria no redirect_uri.
    // Por enquanto, buscamos o primeiro usuário com credenciais Shopee ou criamos para o primeiro usuário.
    const users = await prisma.user.findMany({ take: 1 });
    const userId = users[0]?.id;
    if (!userId) throw new Error('Nenhum usuário encontrado no sistema');

    const expiresAt = new Date(Date.now() + expire_in * 1000);

    const existing = await prisma.credential.findFirst({
      where: { userId, platform: 'SHOPEE' }
    });

    if (existing) {
      await prisma.credential.update({
        where: { id: existing.id },
        data: { accessToken: access_token, refreshToken: refresh_token, expiresAt, sellerId: shopId }
      });
    } else {
      await prisma.credential.create({
        data: {
          userId,
          platform: 'SHOPEE',
          accessToken: access_token,
          refreshToken: refresh_token,
          partnerId: env.SHOPEE_PARTNER_ID,
          expiresAt,
          sellerId: shopId,
        }
      });
    }

    await prisma.syncLog.create({
      data: {
        type: 'TOKEN_REFRESH',
        platform: 'SHOPEE',
        message: `Shopee conectada com sucesso. Shop ID: ${shopId}`,
        status: 'SUCCESS',
      }
    });
  }

  // ─── CREDENCIAIS GENÉRICAS ─────────────────────────────────────────

  async saveAliExpressCredentials(userId: string, data: any) {
    // Atualizar se já existir, senão criar
    const existing = await prisma.credential.findFirst({
      where: { userId, platform: 'ALIEXPRESS' }
    });

    if (existing) {
      return prisma.credential.update({
        where: { id: existing.id },
        data: { appKey: data.appKey, appSecret: data.appSecret }
      });
    }

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
    // Retornar credenciais SEM expor os tokens/secrets completos
    const creds = await prisma.credential.findMany({ where: { userId } });
    return creds.map(c => ({
      id: c.id,
      platform: c.platform,
      sellerId: c.sellerId,
      hasAccessToken: !!c.accessToken,
      hasAppKey: !!c.appKey,
      expiresAt: c.expiresAt,
      createdAt: c.createdAt,
    }));
  }

  async deleteCredential(userId: string, id: string) {
    return prisma.credential.deleteMany({ where: { id, userId } });
  }
}
