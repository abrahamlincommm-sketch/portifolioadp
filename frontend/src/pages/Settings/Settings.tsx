import React, { useState, useEffect } from 'react';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { useAuthStore } from '../../store/authStore';
import client from '../../api/client';
import './Settings.css';

interface Credential {
  id: string;
  platform: string;
  sellerId?: string;
  hasAccessToken?: boolean;
  hasAppKey?: boolean;
  expiresAt?: string;
  createdAt: string;
}

interface CustomSupplier {
  id: string;
  name: string;
  type: string;
  apiEndpoint?: string;
  isActive: boolean;
  config?: string;
}

const Settings = () => {
  const [activeTab, setActiveTab] = useState('connections');
  const { user, setUser } = useAuthStore();

  // Credentials State
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loadingCreds, setLoadingCreds] = useState(false);
  const [aliKey, setAliKey] = useState('');
  const [aliSecret, setAliSecret] = useState('');
  const [savingAli, setSavingAli] = useState(false);

  // Custom Suppliers State
  const [customSuppliers, setCustomSuppliers] = useState<CustomSupplier[]>([]);
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState('');
  const [newSupplierEndpoint, setNewSupplierEndpoint] = useState('');
  const [newSupplierApiKey, setNewSupplierApiKey] = useState('');
  const [savingSupplier, setSavingSupplier] = useState(false);

  // Profile Form State
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Margins State
  const [defaultMargin, setDefaultMargin] = useState(() => localStorage.getItem('drophub_margin') || '50');
  const [usdRate, setUsdRate] = useState(() => localStorage.getItem('drophub_usd_rate') || '5.60');
  const [extraFee, setExtraFee] = useState(() => localStorage.getItem('drophub_extra_fee') || '0.00');
  const [marginsSaved, setMarginsSaved] = useState(false);

  // Sync State
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchCredentials();
    fetchSuppliers();
    if (user) {
      setProfileName(user.name);
      setProfileEmail(user.email);
    }
  }, [user]);

  const fetchCredentials = async () => {
    try {
      setLoadingCreds(true);
      const res = await client.get('/auth/credentials');
      setCredentials(res.data || []);
    } catch (err) {
      console.error('Erro ao carregar credenciais:', err);
    } finally {
      setLoadingCreds(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await client.get('/suppliers');
      setCustomSuppliers(res.data?.dbSuppliers || []);
    } catch (err) {
      console.error('Erro ao buscar fornecedores:', err);
    }
  };

  const getCred = (platform: string) => {
    return credentials.find(c => c.platform.toUpperCase() === platform.toUpperCase());
  };

  // ── Salvar Fornecedor Customizado / API ──
  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplierName) return;
    try {
      setSavingSupplier(true);
      await client.post('/suppliers', {
        name: newSupplierName,
        config: {
          endpoint: newSupplierEndpoint,
          apiKey: newSupplierApiKey
        }
      });
      setNewSupplierName('');
      setNewSupplierEndpoint('');
      setNewSupplierApiKey('');
      setShowAddSupplier(false);
      fetchSuppliers();
      alert(`Fornecedor "${newSupplierName}" cadastrado com sucesso!`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao cadastrar fornecedor');
    } finally {
      setSavingSupplier(false);
    }
  };

  const handleDeleteSupplier = async (id: string, name: string) => {
    if (!window.confirm(`Deseja excluir o fornecedor "${name}"?`)) return;
    try {
      await client.delete(`/suppliers/${id}`);
      fetchSuppliers();
    } catch (err) {
      alert('Erro ao excluir fornecedor');
    }
  };

  // ── AliExpress ──
  const handleSaveAli = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aliKey || !aliSecret) return;
    try {
      setSavingAli(true);
      await client.post('/auth/aliexpress/credentials', { appKey: aliKey, appSecret: aliSecret });
      setAliKey('');
      setAliSecret('');
      alert('Credenciais do AliExpress salvas com sucesso!');
      fetchCredentials();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao salvar credenciais do AliExpress');
    } finally {
      setSavingAli(false);
    }
  };

  // ── Disconnect ──
  const handleDisconnect = async (id: string, platformName: string) => {
    if (!window.confirm(`Deseja realmente desconectar ${platformName}?`)) return;
    try {
      await client.delete(`/auth/credentials/${id}`);
      fetchCredentials();
    } catch (err: any) {
      alert('Erro ao desconectar plataforma');
    }
  };

  // ── Profile Update ──
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    setSavingProfile(true);

    try {
      const res = await client.put('/auth/me', {
        name: profileName,
        email: profileEmail,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      });

      setUser(res.data);
      setCurrentPassword('');
      setNewPassword('');
      setProfileMsg({ type: 'success', text: 'Perfil atualizado com sucesso!' });
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.response?.data?.error || err.message || 'Erro ao atualizar perfil' });
    } finally {
      setSavingProfile(false);
    }
  };

  // ── Save Margins ──
  const handleSaveMargins = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('drophub_margin', defaultMargin);
    localStorage.setItem('drophub_usd_rate', usdRate);
    localStorage.setItem('drophub_extra_fee', extraFee);
    setMarginsSaved(true);
    setTimeout(() => setMarginsSaved(false), 3000);
  };

  // ── Force Sync ──
  const handleForceSync = async () => {
    try {
      setSyncing(true);
      setSyncMsg(null);
      const res = await client.post('/tracking/sync');
      setSyncMsg(res.data.message || 'Sincronização concluída com sucesso!');
    } catch (err: any) {
      setSyncMsg(err.response?.data?.message || 'Erro ao sincronizar rastreios.');
    } finally {
      setSyncing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('URL copiada para a área de transferência!');
  };

  const aliCred = getCred('ALIEXPRESS');
  const mlCred = getCred('MERCADOLIVRE');
  const shopeeCred = getCred('SHOPEE');

  const backendHost = 'https://drophub-backend.onrender.com';

  return (
    <div className="settings-container">
      <div className="page-header">
        <div>
          <h2>Configurações</h2>
          <p className="subtitle">Gerencie suas conexões de marketplaces, fornecedores e automações</p>
        </div>
      </div>

      <div className="settings-layout">
        <Card className="settings-sidebar">
          <nav className="settings-nav">
            <button className={`settings-tab ${activeTab === 'connections' ? 'active' : ''}`} onClick={() => setActiveTab('connections')}>
              🔗 Conexões API
            </button>
            <button className={`settings-tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
              👤 Perfil
            </button>
            <button className={`settings-tab ${activeTab === 'margins' ? 'active' : ''}`} onClick={() => setActiveTab('margins')}>
              💰 Margens Padrão
            </button>
            <button className={`settings-tab ${activeTab === 'webhooks' ? 'active' : ''}`} onClick={() => setActiveTab('webhooks')}>
              🔔 Webhooks
            </button>
            <button className={`settings-tab ${activeTab === 'sync' ? 'active' : ''}`} onClick={() => setActiveTab('sync')}>
              ⚡ Sincronização
            </button>
          </nav>
        </Card>

        <div className="settings-content">
          {/* TAB: CONNECTIONS */}
          {activeTab === 'connections' && (
            <div className="tab-pane">
              <h3>Canais de Venda (Marketplaces)</h3>
              <p className="text-secondary mb-4">Conecte suas contas onde os anúncios serão publicados e os pedidos recebidos.</p>
              
              <div className="connections-grid" style={{ marginBottom: '32px' }}>
                {/* Mercado Livre */}
                <Card className="connection-card">
                  <div className="conn-header">
                    <div className="conn-brand ml">Mercado Livre</div>
                    <div className={`conn-status ${mlCred ? 'connected' : 'disconnected'}`}>
                      <span className="dot"></span> {mlCred ? 'Conectado' : 'Desconectado'}
                    </div>
                  </div>
                  <div className="conn-body">
                    <p className="conn-desc">
                      {mlCred 
                        ? `Conexão OAuth2 ativa com sua conta Mercado Livre. Seller ID: ${mlCred.sellerId || 'Vinculado'}.`
                        : 'Autenticação oficial via OAuth2. Permite sincronizar anúncios e receber pedidos automaticamente.'}
                    </p>
                  </div>
                  <div className="conn-footer">
                    <span className="last-sync">{mlCred ? 'Token sincronizado' : 'Não conectado'}</span>
                    {mlCred ? (
                      <Button variant="danger" size="sm" onClick={() => handleDisconnect(mlCred.id, 'Mercado Livre')}>
                        Desconectar
                      </Button>
                    ) : (
                      <a href={`${backendHost}/api/auth/mercadolivre/connect`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                        <Button variant="primary" size="sm">Conectar Conta</Button>
                      </a>
                    )}
                  </div>
                </Card>

                {/* Shopee */}
                <Card className="connection-card">
                  <div className="conn-header">
                    <div className="conn-brand shopee">Shopee</div>
                    <div className={`conn-status ${shopeeCred ? 'connected' : 'disconnected'}`}>
                      <span className="dot"></span> {shopeeCred ? 'Conectado' : 'Desconectado'}
                    </div>
                  </div>
                  <div className="conn-body">
                    <p className="conn-desc">
                      {shopeeCred 
                        ? `Conexão ativa com o Open Platform da Shopee. Shop ID: ${shopeeCred.sellerId || 'Vinculado'}.`
                        : 'Requer autorização no portal de desenvolvedores da Shopee (Open Platform).'}
                    </p>
                  </div>
                  <div className="conn-footer">
                    <span className="last-sync">{shopeeCred ? 'Token sincronizado' : 'Não conectado'}</span>
                    {shopeeCred ? (
                      <Button variant="danger" size="sm" onClick={() => handleDisconnect(shopeeCred.id, 'Shopee')}>
                        Desconectar
                      </Button>
                    ) : (
                      <a href={`${backendHost}/api/auth/shopee/connect`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                        <Button variant="primary" size="sm">Conectar Conta</Button>
                      </a>
                    )}
                  </div>
                </Card>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: 0 }}>Fornecedores & APIs Integradas</h3>
                  <p className="text-secondary" style={{ margin: '4px 0 0', fontSize: '0.85rem' }}>
                    Configure fornecedores nacionais, locais ou APIs externas adicionais.
                  </p>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => setShowAddSupplier(!showAddSupplier)}
                  variant={showAddSupplier ? 'secondary' : 'primary'}
                >
                  {showAddSupplier ? 'Fechar' : '+ Cadastrar Nova API / Fornecedor'}
                </Button>
              </div>

              {showAddSupplier && (
                <Card style={{ marginBottom: '24px', border: '1px solid var(--accent-primary)' }}>
                  <h4 style={{ margin: '0 0 12px', color: 'var(--text-primary)' }}>Adicionar Novo Fornecedor ou API</h4>
                  <form onSubmit={handleCreateSupplier} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div className="form-grid">
                      <Input 
                        label="Nome do Fornecedor / Empresa" 
                        placeholder="Ex: Fornecedor SP, CJ Dropshipping, Brás Moda..." 
                        value={newSupplierName}
                        onChange={(e) => setNewSupplierName(e.target.value)}
                        required
                      />
                      <Input 
                        label="Endpoint da API / URL Base (Opcional)" 
                        placeholder="https://api.fornecedor.com.br/v1" 
                        value={newSupplierEndpoint}
                        onChange={(e) => setNewSupplierEndpoint(e.target.value)}
                      />
                    </div>
                    <Input 
                      label="API Key / Token de Acesso (Opcional)" 
                      placeholder="Insira a chave de autenticação se houver" 
                      type="password"
                      value={newSupplierApiKey}
                      onChange={(e) => setNewSupplierApiKey(e.target.value)}
                    />
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                      <Button type="button" variant="secondary" size="sm" onClick={() => setShowAddSupplier(false)}>Cancelar</Button>
                      <Button size="sm" disabled={savingSupplier}>
                        {savingSupplier ? 'Salvando...' : 'Salvar Fornecedor'}
                      </Button>
                    </div>
                  </form>
                </Card>
              )}

              <div className="connections-grid">
                {/* Fornecedores customizados */}
                {customSuppliers.map((s) => (
                  <Card key={s.id} className="connection-card">
                    <div className="conn-header">
                      <div className="conn-brand" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{s.name}</div>
                      <div className="conn-status connected"><span className="dot"></span> Ativo</div>
                    </div>
                    <div className="conn-body">
                      <p className="conn-desc">
                        {s.config ? 'API Configurada para cotação e pedidos.' : 'Fornecedor cadastrado para compras e catalogação.'}
                      </p>
                    </div>
                    <div className="conn-footer">
                      <span className="last-sync">Pronto para uso</span>
                      <Button variant="danger" size="sm" onClick={() => handleDeleteSupplier(s.id, s.name)}>Remover</Button>
                    </div>
                  </Card>
                ))}

                {/* AliExpress (Opcional) */}
                <Card className="connection-card">
                  <div className="conn-header">
                    <div className="conn-brand aliexpress">AliExpress (Opcional)</div>
                    <div className={`conn-status ${aliCred ? 'connected' : 'disconnected'}`}>
                      <span className="dot"></span> {aliCred ? 'Conectado' : 'Desconectado'}
                    </div>
                  </div>
                  <form onSubmit={handleSaveAli} className="conn-body">
                    <Input 
                      label="App Key" 
                      placeholder={aliCred ? 'Configurado' : 'Insira sua App Key'} 
                      value={aliKey}
                      onChange={(e) => setAliKey(e.target.value)}
                      required
                    />
                    <Input 
                      label="App Secret" 
                      placeholder={aliCred ? 'Configurado' : 'Insira seu App Secret'} 
                      type="password"
                      value={aliSecret}
                      onChange={(e) => setAliSecret(e.target.value)}
                      required
                    />
                    <div className="conn-footer" style={{ marginTop: '12px' }}>
                      <span className="last-sync">{aliCred ? 'Ativo' : 'Opcional'}</span>
                      <Button variant="primary" size="sm" disabled={savingAli}>
                        {savingAli ? 'Salvando...' : aliCred ? 'Atualizar' : 'Salvar'}
                      </Button>
                    </div>
                  </form>
                </Card>
              </div>
            </div>
          )}

          {/* TAB: PROFILE */}
          {activeTab === 'profile' && (
            <div className="tab-pane">
              <h3>Meu Perfil</h3>
              <p className="text-secondary mb-4">Atualize suas informações cadastrais e segurança da conta.</p>

              {profileMsg && (
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  background: profileMsg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                  border: `1px solid ${profileMsg.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
                  color: profileMsg.type === 'success' ? '#10b981' : '#f43f5e'
                }}>
                  {profileMsg.text}
                </div>
              )}

              <Card className="settings-card">
                <form onSubmit={handleUpdateProfile}>
                  <div className="form-grid">
                    <Input 
                      label="Nome Completo" 
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      required 
                    />
                    <Input 
                      label="E-mail" 
                      type="email"
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      required 
                    />
                  </div>
                  <h4 className="mt-4 mb-2">Alterar Senha (opcional)</h4>
                  <div className="form-grid">
                    <Input 
                      label="Senha Atual" 
                      type="password" 
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                    <Input 
                      label="Nova Senha" 
                      type="password" 
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="mt-4">
                    <Button disabled={savingProfile}>
                      {savingProfile ? 'Salvando...' : 'Atualizar Perfil'}
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
          )}

          {/* TAB: MARGINS */}
          {activeTab === 'margins' && (
            <div className="tab-pane">
              <h3>Margens e Precificação</h3>
              <p className="text-secondary mb-4">Defina os parâmetros padrão para cálculo automático dos preços de venda.</p>
              <Card className="settings-card">
                <form onSubmit={handleSaveMargins}>
                  <div className="form-grid">
                    <Input 
                      label="Margem de Lucro Padrão (%)" 
                      type="number" 
                      value={defaultMargin}
                      onChange={(e) => setDefaultMargin(e.target.value)}
                      required
                    />
                    <Input 
                      label="Taxa de Câmbio USD para BRL (se importado)" 
                      type="number" 
                      step="0.01" 
                      value={usdRate}
                      onChange={(e) => setUsdRate(e.target.value)}
                      required
                    />
                    <Input 
                      label="Acréscimo de Embalagem/Frete (R$)" 
                      type="number" 
                      step="0.01" 
                      value={extraFee}
                      onChange={(e) => setExtraFee(e.target.value)}
                    />
                  </div>
                  <div className="mt-4" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Button type="submit">Salvar Configurações</Button>
                    {marginsSaved && <span style={{ color: '#10b981', fontSize: '0.9rem' }}>✓ Configurações salvas!</span>}
                  </div>
                </form>
              </Card>
            </div>
          )}

          {/* TAB: WEBHOOKS */}
          {activeTab === 'webhooks' && (
            <div className="tab-pane">
              <h3>Notificações em Tempo Real (Webhooks)</h3>
              <p className="text-secondary mb-4">Configure estes endpoints nas plataformas para receber pedidos instantaneamente.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Card>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <strong style={{ fontSize: '1rem', color: '#f59e0b' }}>Mercado Livre Webhook</strong>
                    <span style={{ fontSize: '0.8rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>Tópico: orders_v2</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                    Cadastre este link no portal de desenvolvedores do Mercado Livre para ser avisado a cada nova venda.
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Input 
                      readOnly 
                      value={`${backendHost}/api/webhooks/mercadolivre`} 
                      style={{ flex: 1 }} 
                    />
                    <Button variant="secondary" onClick={() => copyToClipboard(`${backendHost}/api/webhooks/mercadolivre`)}>
                      Copiar
                    </Button>
                  </div>
                </Card>

                <Card>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <strong style={{ fontSize: '1rem', color: '#f43f5e' }}>Shopee Push Notification</strong>
                    <span style={{ fontSize: '0.8rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e' }}>Evento: order.status_update</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                    Cadastre este link nas configurações de Push Notification do Shopee Open Platform.
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Input 
                      readOnly 
                      value={`${backendHost}/api/webhooks/shopee`} 
                      style={{ flex: 1 }} 
                    />
                    <Button variant="secondary" onClick={() => copyToClipboard(`${backendHost}/api/webhooks/shopee`)}>
                      Copiar
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* TAB: SYNC */}
          {activeTab === 'sync' && (
            <div className="tab-pane">
              <h3>Automações e Sincronização</h3>
              <p className="text-secondary mb-4">Status dos robôs agendados que rodam no servidor.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Card>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      <div style={{ color: '#10b981', fontWeight: 600, marginBottom: '4px' }}>🚚 Rastreios</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>A cada 30 minutos</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Busca código no fornecedor e envia para o comprador</div>
                    </div>

                    <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      <div style={{ color: '#7c3aed', fontWeight: 600, marginBottom: '4px' }}>📦 Estoque & Preços</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>A cada 1 hora</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Sincroniza variações de preço do fornecedor</div>
                    </div>

                    <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      <div style={{ color: '#2563eb', fontWeight: 600, marginBottom: '4px' }}>🔑 Renovação OAuth</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>A cada 4 horas</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Renova tokens para manter as contas conectadas</div>
                    </div>
                  </div>

                  <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Button onClick={handleForceSync} disabled={syncing}>
                      {syncing ? 'Sincronizando agora...' : '⚡ Forçar Sincronização Imediata'}
                    </Button>
                    {syncMsg && <span style={{ color: '#10b981', fontSize: '0.85rem' }}>{syncMsg}</span>}
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
