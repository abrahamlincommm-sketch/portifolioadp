import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import './Header.css';

const Header = () => {
  const location = useLocation();
  const { user } = useAuthStore();

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

        <button className="icon-btn sync-btn" title="Sincronizar Agora">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
        </button>

        <button className="icon-btn notification-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span className="badge">3</span>
        </button>

        <div className="user-profile">
          <div className="avatar">
            {user?.name.charAt(0)}
          </div>
          <span className="user-name">{user?.name}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
