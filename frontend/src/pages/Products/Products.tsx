import React, { useState } from 'react';
import { Button } from '../../components/UI/Button';
import { Card } from '../../components/UI/Card';
import { StatusBadge } from '../../components/UI/StatusBadge';
import { Input } from '../../components/UI/Input';
import { Modal } from '../../components/UI/Modal';
import { useUIStore } from '../../store/uiStore';
import './Products.css';

const SUPPLIERS = [
  { value: 'ALIEXPRESS', label: 'AliExpress', type: 'API', color: '#e43225' },
  { value: 'MANUAL', label: 'Fornecedor Manual', type: 'MANUAL', color: '#7c3aed' },
];

const mockProducts = [
  { id: '1', image: 'https://via.placeholder.com/60', title: 'Smartwatch Y20 PRO Bluetooth', supplierName: 'ALIEXPRESS', costPrice: 45.90, salePrice: 149.90, margin: 69, stock: 120, ml: true, shopee: true, status: 'success' },
  { id: '2', image: 'https://via.placeholder.com/60', title: 'Fone de Ouvido Bluetooth 5.0 TWS', supplierName: 'ALIEXPRESS', costPrice: 22.50, salePrice: 89.90, margin: 75, stock: 450, ml: false, shopee: true, status: 'success' },
  { id: '3', image: 'https://via.placeholder.com/60', title: 'Camiseta Oversized Premium', supplierName: 'MANUAL', costPrice: 25.00, salePrice: 79.90, margin: 68, stock: 200, ml: true, shopee: false, status: 'success' },
  { id: '4', image: 'https://via.placeholder.com/60', title: 'Mini Projetor Portátil HD 1080p', supplierName: 'ALIEXPRESS', costPrice: 110.00, salePrice: 299.90, margin: 63, stock: 12, ml: true, shopee: true, status: 'pending' },
];

const getSupplierInfo = (name: string) => {
  return SUPPLIERS.find(s => s.value === name) || { label: name, color: '#7c3aed', type: 'MANUAL' };
};

const Products = () => {
  const { openModal } = useUIStore();
  const [importUrl, setImportUrl] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('ALIEXPRESS');
  const [importMode, setImportMode] = useState<'api' | 'manual'>('api');

  // Manual product form state
  const [manualForm, setManualForm] = useState({
    title: '',
    supplierName: '',
    supplierUrl: '',
    costPriceBrl: '',
    salePriceBrl: '',
    stock: '',
    description: '',
  });

  const handleManualChange = (field: string, value: string) => {
    setManualForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="products-container">
      <div className="page-header">
        <div>
          <h2>Gerenciar Produtos</h2>
          <p className="subtitle">Importe de fornecedores ou cadastre manualmente</p>
        </div>
        <div className="header-actions">
          <Button
            variant="secondary"
            leftIcon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>}
            onClick={() => {
              setImportMode('manual');
              openModal('add-product');
            }}
          >
            Cadastro Manual
          </Button>
          <Button
            leftIcon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>}
            onClick={() => {
              setImportMode('api');
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
          leftIcon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>}
        />
        <select className="ui-select">
          <option value="all">Status: Todos</option>
          <option value="active">Ativos</option>
          <option value="draft">Rascunhos</option>
        </select>
        <select className="ui-select">
          <option value="all">Fornecedor: Todos</option>
          <option value="ALIEXPRESS">AliExpress</option>
          <option value="MANUAL">Fornecedor Manual</option>
        </select>
        <select className="ui-select">
          <option value="all">Plataforma: Todas</option>
          <option value="ml">Mercado Livre</option>
          <option value="shopee">Shopee</option>
        </select>
      </Card>

      <div className="products-grid">
        {mockProducts.map(prod => {
          const supplier = getSupplierInfo(prod.supplierName);
          return (
            <Card key={prod.id} className="product-card">
              <div className="product-image-wrap">
                <img src={prod.image} alt={prod.title} className="product-img" />
                <div className="product-badges">
                  <StatusBadge status={prod.status as any} label={prod.status === 'success' ? 'Ativo' : 'Pendente'} />
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
                    <span className="price-value cost">R$ {prod.costPrice.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="price-col">
                    <span className="price-label">Venda</span>
                    <span className="price-value sale">R$ {prod.salePrice.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="price-col">
                    <span className="price-label">Margem</span>
                    <span className="price-value margin">{prod.margin}%</span>
                  </div>
                </div>

                <div className="product-footer">
                  <div className="platforms">
                    {prod.ml && <span className="platform-icon ml" title="Mercado Livre">ML</span>}
                    {prod.shopee && <span className="platform-icon shopee" title="Shopee">SH</span>}
                  </div>
                  <div className="stock-info">
                    Estoque: {prod.stock}
                  </div>
                </div>
              </div>

              <div className="product-actions">
                <Button variant="secondary" size="sm">Editar</Button>
                <Button variant="primary" size="sm">Sincronizar</Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Modal: Add Product (API Import or Manual) */}
      <Modal id="add-product" title={importMode === 'api' ? 'Importar Produto via Fornecedor' : 'Cadastro Manual de Produto'}>
        <div className="import-modal-content">
          {importMode === 'api' ? (
            <>
              {/* API Import Mode */}
              <div className="supplier-selector">
                <label className="field-label">Selecione o Fornecedor</label>
                <div className="supplier-options">
                  {SUPPLIERS.filter(s => s.type === 'API').map(s => (
                    <button
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
                placeholder={selectedSupplier === 'ALIEXPRESS' ? 'https://pt.aliexpress.com/item/...' : 'Cole a URL do produto...'}
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
              />
              <div className="modal-actions">
                <Button variant="primary">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" style={{ marginRight: 8 }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Importar Produto
                </Button>
              </div>

              <div className="import-preview disabled">
                <p className="preview-placeholder">Insira a URL e clique em importar para buscar os dados automaticamente do fornecedor.</p>
              </div>

              <div className="import-tip">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                <span>Não encontrou seu fornecedor na lista? Use o <strong>Cadastro Manual</strong> para adicionar produtos de qualquer fornecedor.</span>
              </div>
            </>
          ) : (
            <>
              {/* Manual Mode */}
              <Input
                label="Nome do Fornecedor"
                placeholder="Ex: Fábrica São Paulo, CJ Dropshipping, Shein..."
                value={manualForm.supplierName}
                onChange={(e) => handleManualChange('supplierName', e.target.value)}
              />
              <Input
                label="Link do Produto no Site do Fornecedor (opcional)"
                placeholder="https://..."
                value={manualForm.supplierUrl}
                onChange={(e) => handleManualChange('supplierUrl', e.target.value)}
              />
              <Input
                label="Título do Produto"
                placeholder="Nome que aparecerá no anúncio"
                value={manualForm.title}
                onChange={(e) => handleManualChange('title', e.target.value)}
              />
              <div className="form-row">
                <Input
                  label="Preço de Custo (R$)"
                  placeholder="0,00"
                  type="number"
                  step="0.01"
                  value={manualForm.costPriceBrl}
                  onChange={(e) => handleManualChange('costPriceBrl', e.target.value)}
                />
                <Input
                  label="Preço de Venda (R$)"
                  placeholder="0,00"
                  type="number"
                  step="0.01"
                  value={manualForm.salePriceBrl}
                  onChange={(e) => handleManualChange('salePriceBrl', e.target.value)}
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
                  rows={4}
                  value={manualForm.description}
                  onChange={(e) => handleManualChange('description', e.target.value)}
                />
              </div>
              <div className="modal-actions">
                <Button variant="primary">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" style={{ marginRight: 8 }}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Cadastrar Produto
                </Button>
              </div>

              <div className="import-tip">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                <span>Produtos manuais precisam ter o pedido processado manualmente no site do fornecedor quando houver uma venda.</span>
              </div>
            </>
          )}

          {/* Toggle between modes */}
          <div className="mode-toggle">
            <button
              className={`mode-btn ${importMode === 'api' ? 'active' : ''}`}
              onClick={() => setImportMode('api')}
            >
              🔗 Importar via API
            </button>
            <button
              className={`mode-btn ${importMode === 'manual' ? 'active' : ''}`}
              onClick={() => setImportMode('manual')}
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
