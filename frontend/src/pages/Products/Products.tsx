import React, { useState, useEffect } from 'react';
import { Button } from '../../components/UI/Button';
import { Card } from '../../components/UI/Card';
import { StatusBadge } from '../../components/UI/StatusBadge';
import { Input } from '../../components/UI/Input';
import { Modal } from '../../components/UI/Modal';
import { useUIStore } from '../../store/uiStore';
import client from '../../api/client';
import './Products.css';

interface ProductItem {
  id: string;
  supplierProductId: string;
  supplierUrl?: string;
  supplierName: string;
  title: string;
  images: string;
  costPriceUsd: number;
  costPriceBrl: number;
  margin: number;
  salePriceBrl: number;
  stock: number;
  mlItemId?: string;
  shopeeItemId?: string;
  status: string;
  lastSyncAt?: string;
}

const SUPPLIERS = [
  { value: 'ALIEXPRESS', label: 'AliExpress', type: 'API', color: '#e43225' },
  { value: 'MANUAL', label: 'Fornecedor Manual', type: 'MANUAL', color: '#7c3aed' },
];

const Products = () => {
  const { openModal, closeModal } = useUIStore();
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [supplierFilter, setSupplierFilter] = useState('all');

  // Form states
  const [importUrl, setImportUrl] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('ALIEXPRESS');
  const [importMode, setImportMode] = useState<'api' | 'manual'>('api');
  const [errorMsg, setErrorMsg] = useState('');

  const [manualForm, setManualForm] = useState({
    title: '',
    supplierName: '',
    supplierUrl: '',
    costPriceBrl: '',
    salePriceBrl: '',
    stock: '',
    description: '',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await client.get('/products');
      setProducts(res.data || []);
    } catch (err) {
      console.error('Erro ao buscar produtos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualChange = (field: string, value: string) => {
    setManualForm(prev => ({ ...prev, [field]: value }));
  };

  const handleImportApi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importUrl) return;
    setErrorMsg('');
    setActionLoading(true);

    try {
      await client.post('/products/import', {
        supplierName: selectedSupplier,
        productId: importUrl,
      });
      setImportUrl('');
      closeModal();
      fetchProducts();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Erro ao importar produto');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.title || !manualForm.salePriceBrl) return;
    setErrorMsg('');
    setActionLoading(true);

    try {
      await client.post('/products/manual', {
        title: manualForm.title,
        supplierName: manualForm.supplierName || 'MANUAL',
        supplierUrl: manualForm.supplierUrl,
        costPriceBrl: Number(manualForm.costPriceBrl) || 0,
        salePriceBrl: Number(manualForm.salePriceBrl) || 0,
        stock: Number(manualForm.stock) || 0,
        description: manualForm.description,
      });
      setManualForm({
        title: '',
        supplierName: '',
        supplierUrl: '',
        costPriceBrl: '',
        salePriceBrl: '',
        stock: '',
        description: '',
      });
      closeModal();
      fetchProducts();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Erro ao cadastrar produto');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePublishML = async (id: string) => {
    try {
      await client.post(`/products/${id}/publish/mercadolivre`);
      fetchProducts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao publicar no Mercado Livre');
    }
  };

  const handlePublishShopee = async (id: string) => {
    try {
      await client.post(`/products/${id}/publish/shopee`);
      fetchProducts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao publicar na Shopee');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) return;
    try {
      await client.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      console.error('Erro ao excluir produto:', err);
    }
  };

  const filteredProducts = products.filter(prod => {
    const matchesSearch = prod.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          prod.supplierProductId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || prod.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSupplier = supplierFilter === 'all' || prod.supplierName.toUpperCase() === supplierFilter.toUpperCase();
    return matchesSearch && matchesStatus && matchesSupplier;
  });

  const getProductImage = (prod: ProductItem) => {
    try {
      const parsed = JSON.parse(prod.images || '[]');
      if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
    } catch {
      // Fallback
    }
    return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=80';
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="products-container">
      <div className="page-header">
        <div>
          <h2>Gerenciar Produtos</h2>
          <p className="subtitle">Importe de fornecedores ou cadastre produtos no seu catálogo</p>
        </div>
        <div className="header-actions">
          <Button
            variant="secondary"
            leftIcon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>}
            onClick={() => {
              setImportMode('manual');
              setErrorMsg('');
              openModal('add-product');
            }}
          >
            Cadastro Manual
          </Button>
          <Button
            leftIcon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>}
            onClick={() => {
              setImportMode('api');
              setErrorMsg('');
              openModal('add-product');
            }}
          >
            Importar via API
          </Button>
        </div>
      </div>

      <Card className="filter-bar">
        <Input
          placeholder="Buscar produto por nome ou ID..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>}
        />
        <select className="ui-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">Status: Todos</option>
          <option value="ACTIVE">Ativos</option>
          <option value="DRAFT">Rascunhos</option>
          <option value="PAUSED">Pausados</option>
        </select>
        <select className="ui-select" value={supplierFilter} onChange={(e) => setSupplierFilter(e.target.value)}>
          <option value="all">Fornecedor: Todos</option>
          <option value="ALIEXPRESS">AliExpress</option>
          <option value="MANUAL">Manual / Outros</option>
        </select>
      </Card>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)' }}>
          Carregando catálogo de produtos...
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="products-grid">
          {filteredProducts.map(prod => {
            const supplier = SUPPLIERS.find(s => s.value === prod.supplierName) || { label: prod.supplierName, color: '#7c3aed' };
            return (
              <Card key={prod.id} className="product-card">
                <div className="product-image-wrap">
                  <img src={getProductImage(prod)} alt={prod.title} className="product-img" />
                  <div className="product-badges">
                    <StatusBadge 
                      status={prod.status === 'ACTIVE' ? 'success' : prod.status === 'DRAFT' ? 'draft' : 'pending'} 
                      label={prod.status === 'ACTIVE' ? 'Ativo' : prod.status === 'DRAFT' ? 'Rascunho' : prod.status} 
                    />
                  </div>
                </div>

                <div className="product-info">
                  <div className="product-supplier-tag" style={{ borderColor: supplier.color, color: supplier.color }}>
                    {supplier.label}
                  </div>
                  <h4 className="product-title">{prod.title}</h4>

                  <div className="price-details">
                    <div className="price-col">
                      <span className="price-label">Custo</span>
                      <span className="price-value cost">{formatCurrency(prod.costPriceBrl)}</span>
                    </div>
                    <div className="price-col">
                      <span className="price-label">Venda</span>
                      <span className="price-value sale">{formatCurrency(prod.salePriceBrl)}</span>
                    </div>
                    <div className="price-col">
                      <span className="price-label">Margem</span>
                      <span className="price-value margin">{prod.margin}%</span>
                    </div>
                  </div>

                  <div className="product-footer">
                    <div className="platforms">
                      {prod.mlItemId && <span className="platform-icon ml" title="Mercado Livre">ML</span>}
                      {prod.shopeeItemId && <span className="platform-icon shopee" title="Shopee">SH</span>}
                    </div>
                    <div className="stock-info">
                      Estoque: {prod.stock}
                    </div>
                  </div>
                </div>

                <div className="product-actions">
                  <Button variant="secondary" size="sm" onClick={() => handleDelete(prod.id)}>Excluir</Button>
                  {!prod.mlItemId ? (
                    <Button variant="primary" size="sm" onClick={() => handlePublishML(prod.id)}>Publicar ML</Button>
                  ) : !prod.shopeeItemId ? (
                    <Button variant="primary" size="sm" onClick={() => handlePublishShopee(prod.id)}>Publicar SH</Button>
                  ) : (
                    <Button variant="ghost" size="sm">Publicado</Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card style={{ textAlign: 'center', padding: '64px 24px' }}>
          <div style={{ maxWidth: '400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(124, 58, 237, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="28" height="28">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              </svg>
            </div>
            <h3 style={{ margin: 0 }}>Nenhum produto cadastrado ainda</h3>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>
              Seu catálogo está vazio. Adicione seu primeiro produto importando de um fornecedor ou fazendo o cadastro manual.
            </p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <Button onClick={() => { setImportMode('manual'); openModal('add-product'); }}>
                Cadastrar Manualmente
              </Button>
              <Button variant="secondary" onClick={() => { setImportMode('api'); openModal('add-product'); }}>
                Importar via Fornecedor
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Modal: Add Product */}
      <Modal id="add-product" title={importMode === 'api' ? 'Importar Produto via Fornecedor' : 'Cadastro Manual de Produto'}>
        <div className="import-modal-content">
          {errorMsg && (
            <div style={{ padding: '10px 14px', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: '8px', color: '#f43f5e', fontSize: '0.85rem' }}>
              {errorMsg}
            </div>
          )}

          {importMode === 'api' ? (
            <form onSubmit={handleImportApi} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="supplier-selector">
                <label className="field-label">Selecione o Fornecedor</label>
                <div className="supplier-options">
                  {SUPPLIERS.filter(s => s.type === 'API').map(s => (
                    <button
                      type="button"
                      key={s.value}
                      className={`supplier-option ${selectedSupplier === s.value ? 'active' : ''}`}
                      onClick={() => setSelectedSupplier(s.value)}
                      style={{ '--supplier-color': s.color } as React.CSSProperties}
                    >
                      <span className="supplier-dot" style={{ background: s.color }}></span>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <Input
                label="URL ou ID do Produto"
                placeholder={selectedSupplier === 'ALIEXPRESS' ? 'Ex: 10050012345678 ou URL completa' : 'Cole a URL do produto...'}
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                required
              />

              <div className="modal-actions">
                <Button variant="primary" disabled={actionLoading}>
                  {actionLoading ? 'Importando...' : 'Importar Produto'}
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleCreateManual} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Input
                label="Nome do Fornecedor"
                placeholder="Ex: Fábrica SP, Shein, Nacional..."
                value={manualForm.supplierName}
                onChange={(e) => handleManualChange('supplierName', e.target.value)}
              />
              <Input
                label="Link do Fornecedor (opcional)"
                placeholder="https://..."
                value={manualForm.supplierUrl}
                onChange={(e) => handleManualChange('supplierUrl', e.target.value)}
              />
              <Input
                label="Título do Produto"
                placeholder="Nome que aparecerá no anúncio"
                value={manualForm.title}
                onChange={(e) => handleManualChange('title', e.target.value)}
                required
              />
              <div className="form-row">
                <Input
                  label="Custo (R$)"
                  placeholder="0,00"
                  type="number"
                  step="0.01"
                  value={manualForm.costPriceBrl}
                  onChange={(e) => handleManualChange('costPriceBrl', e.target.value)}
                />
                <Input
                  label="Venda (R$)"
                  placeholder="0,00"
                  type="number"
                  step="0.01"
                  value={manualForm.salePriceBrl}
                  onChange={(e) => handleManualChange('salePriceBrl', e.target.value)}
                  required
                />
                <Input
                  label="Estoque"
                  placeholder="0"
                  type="number"
                  value={manualForm.stock}
                  onChange={(e) => handleManualChange('stock', e.target.value)}
                />
              </div>
              <div className="field-group">
                <label className="field-label">Descrição (opcional)</label>
                <textarea
                  className="ui-textarea"
                  placeholder="Descreva o produto..."
                  rows={3}
                  value={manualForm.description}
                  onChange={(e) => handleManualChange('description', e.target.value)}
                />
              </div>
              <div className="modal-actions">
                <Button variant="primary" disabled={actionLoading}>
                  {actionLoading ? 'Salvando...' : 'Cadastrar Produto'}
                </Button>
              </div>
            </form>
          )}

          <div className="mode-toggle">
            <button
              type="button"
              className={`mode-btn ${importMode === 'api' ? 'active' : ''}`}
              onClick={() => { setImportMode('api'); setErrorMsg(''); }}
            >
              🔗 Importar via API
            </button>
            <button
              type="button"
              className={`mode-btn ${importMode === 'manual' ? 'active' : ''}`}
              onClick={() => { setImportMode('manual'); setErrorMsg(''); }}
            >
              ✏️ Cadastro Manual
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Products;
