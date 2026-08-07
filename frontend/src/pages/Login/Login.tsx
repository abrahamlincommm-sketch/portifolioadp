import React from 'react';
import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { getApiUrl } from '../../api/client';
import './Login.css';

function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isRegister ? getApiUrl('/auth/register') : getApiUrl('/auth/login');
      const body = isRegister
        ? { email, password, name }
        : { email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Falha na autenticação');
      }

      login(data.user, data.token);
    } catch (err: any) {
      setError(err.message || 'Erro ao conectar ao servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg-effects">
        <div className="login-orb login-orb-1"></div>
        <div className="login-orb login-orb-2"></div>
        <div className="login-orb login-orb-3"></div>
      </div>

      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">
              <div className="login-logo-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="url(#loginGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <defs>
                    <linearGradient id="loginGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#7c3aed" />
                      <stop offset="100%" stopColor="#2563eb" />
                    </linearGradient>
                  </defs>
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <h1 className="login-brand">DropHub</h1>
            </div>
            <p className="login-subtitle">
              {isRegister ? 'Crie sua conta para começar' : 'Faça login para acessar o painel'}
            </p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {isRegister && (
              <div className="login-field">
                <label htmlFor="name">Nome</label>
                <input
                  id="name"
                  type="text"
                  placeholder="Seu nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="login-field">
              <label htmlFor="email">E-mail</label>
              <input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="password">Senha</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="login-error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                {error}
              </div>
            )}

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? (
                <span className="login-spinner"></span>
              ) : isRegister ? (
                'Criar Conta'
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>
              {isRegister ? 'Já tem uma conta?' : 'Não tem uma conta?'}{' '}
              <button
                type="button"
                className="login-toggle"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError('');
                }}
              >
                {isRegister ? 'Faça login' : 'Registre-se'}
              </button>
            </p>
          </div>
        </div>

        <div className="login-info">
          <p>🔒 Acesso restrito — apenas usuários autorizados</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
