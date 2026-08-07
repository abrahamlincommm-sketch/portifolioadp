import client from './client';

export const authApi = {
  login: (data: any) => client.post('/auth/login', data),
  getMe: () => client.get('/auth/me'),
};
