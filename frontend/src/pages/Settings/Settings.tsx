import React, { useState } from 'react';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import './Settings.css';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('connections');

  return (
    <div className="settings-container">
      <div className="page-header">
        <h2>Configurações</h2>
      </div>

      <div className="settings-layout">
        <Card className="settings-sidebar">
          <nav className="settings-nav">
            <button className={`settings-tab ${activeTab === 'connections' ? 'active' : ''}`} onClick={() => setActiveTab('connections')}>Conexões API</button>
            <button className={`settings-tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>Perfil</button>
            <button className={`settings-tab ${activeTab === 'margins' ? 'active' : ''}`} onClick={() => setActiveTab('margins')}>Margens Padrão</button>
            <button className={`settings-tab ${activeTab === 'webhooks' ? 'active' : ''}`} onClick={() => setActiveTab('webhooks')}>Webhooks</button>
            <button className={`settings-tab ${activeTab === 'sync' ? 'active' : ''}`} onClick={() => setActiveTab('sync')}>Sincronização</button>
          </nav>
        </Card>

        <div className="settings-content">
          {activeTab === 'connections' && (
            <div className="tab-pane">
              <h3>Integrações de Plataforma</h3>
              <p className="text-secondary mb-4">Conecte suas contas para automatizar pedidos e rastreio.</p>
              
              <div className="connections-grid">
                <Card className="connection-card">
                  <div className="conn-header">
                    <div className="conn-brand aliexpress">AliExpress</div>
                    <div className="conn-status connected"><span className="dot"></span> Conectado</div>
                  </div>
                  <div className="conn-body">
                    <Input label="App Key" defaultValue="****************" type="password" />
                    <Input label="App Secret" defaultValue="****************" type="password" />
                  </div>
                  <div className="conn-footer">
                    <span className="last-sync">Última sinc: Hoje, 14:30</span>
                    <Button variant="secondary" size="sm">Atualizar</Button>
                  </div>
                </Card>

                <Card className="connection-card">
                  <div className="conn-header">
                    <div className="conn-brand ml">Mercado Livre</div>
                    <div className="conn-status connected"><span className="dot"></span> Conectado</div>
                  </div>
                  <div className="conn-body">
                    <p className="conn-desc">Autenticação via OAuth2. Acesso a anúncios e pedidos.</p>
                  </div>
                  <div className="conn-footer">
                    <span className="last-sync">Última sinc: Há 5 min</span>
                    <Button variant="danger" size="sm">Desconectar</Button>
                  </div>
                </Card>

                <Card className="connection-card">
                  <div className="conn-header">
                    <div className="conn-brand shopee">Shopee</div>
                    <div className="conn-status disconnected"><span className="dot"></span> Desconectado</div>
                  </div>
                  <div className="conn-body">
                    <p className="conn-desc">Requer autorização no portal de desenvolvedores da Shopee.</p>
                  </div>
                  <div className="conn-footer">
                    <span className="last-sync">-</span>
                    <Button variant="primary" size="sm">Conectar Conta</Button>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'margins' && (
            <div className="tab-pane">
              <h3>Margens e Precificação</h3>
              <Card className="settings-card">
                <div className="form-grid">
                  <Input label="Margem de Lucro Padrão (%)" defaultValue="70" type="number" />
                  <Input label="Taxa de Câmbio USD para BRL (Fixa)" defaultValue="5.15" type="number" step="0.01" />
                  <Input label="Acréscimo de Frete Padrão (R$)" defaultValue="15.00" type="number" step="0.01" />
                </div>
                <div className="mt-4">
                  <Button>Salvar Configurações</Button>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="tab-pane">
              <h3>Meu Perfil</h3>
              <Card className="settings-card">
                <div className="form-grid">
                  <Input label="Nome Completo" defaultValue="Alisson" />
                  <Input label="E-mail" defaultValue="admin@drophub.com" />
                </div>
                <h4 className="mt-4 mb-2">Alterar Senha</h4>
                <div className="form-grid">
                  <Input label="Senha Atual" type="password" />
                  <Input label="Nova Senha" type="password" />
                </div>
                <div className="mt-4">
                  <Button>Atualizar Perfil</Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
