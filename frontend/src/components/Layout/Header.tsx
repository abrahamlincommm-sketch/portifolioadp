import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import './Header.css';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [showDropdown, setShowDropdown] = useState(false);

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Dashboard';
      case '/products': return 'Gerenciar Produtos';
      case '/orders': return 'Pedidos';
      case '/tracking': return 'Rastreamento';
      case '/settings': return 'Configurações';
      default: return 'DropHub';
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="top-header glass-effect">
      <div className="header-title">
        <h2>{getPageTitle()}</h2>
      </div>

      <div className="header-actions">
        <div className="search-bar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="search-icon">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" placeholder="Buscar pedidos, produtos..." />
        </div>

        <button className="icon-btn sync-btn" title="Sincronizar Agora" onClick={() => window.location.reload()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
        </button>

        <button className="icon-btn notification-btn" title="Notificações">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </button>

        <div className="user-profile-wrapper" style={{ position: 'relative' }}>
          <div 
            className="user-profile" 
            style={{ cursor: 'pointer' }}
            onClick={() => setShowDropdown(!showDropdown)}
            title="Opções de conta"
          >
            <div className="avatar">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <span className="user-name">{user?.name || 'Usuário'}</span>
          </div>

          {showDropdown && (
            <div 
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '8px',
                background: '#1a1a2e',
                border: '1px solid #2a2a3e',
                borderRadius: '8px',
                padding: '8px 0',
                minWidth: '160px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                zIndex: 1000
              }}
            >
              <div style={{ padding: '8px 16px', fontSize: '0.8rem', color: 'var(--text-muted)', borderBottom: '1px solid #2a2a3e' }}>
                {user?.email}
              </div>
              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  background: 'none',
                  border: 'none',
                  color: '#f43f5e',
                  textAlign: 'left',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Sair da Conta
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
