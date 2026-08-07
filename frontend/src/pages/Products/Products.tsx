import React, { useState } from 'react';
import { Button } from '../../components/UI/Button';
import { Card } from '../../components/UI/Card';
import { StatusBadge } from '../../components/UI/StatusBadge';
import { Input } from '../../components/UI/Input';
import { Modal } from '../../components/UI/Modal';
import { useUIStore } from '../../store/uiStore';
import './Products.css';

const mockProducts = [
  { id: '1', image: 'https://via.placeholder.com/60', title: 'Smartwatch Y20 PRO Bluetooth', aliPrice: 45.90, salePrice: 149.90, margin: 69, stock: 120, ml: true, shopee: true, status: 'success' },
  { id: '2', image: 'https://via.placeholder.com/60', title: 'Fone de Ouvido Bluetooth 5.0 TWS', aliPrice: 22.50, salePrice: 89.90, margin: 75, stock: 450, ml: false, shopee: true, status: 'success' },
  { id: '3', image: 'https://via.placeholder.com/60', title: 'Ring Light 10 Polegadas com Tripé', aliPrice: 35.00, salePrice: 119.90, margin: 70, stock: 35, ml: true, shopee: false, status: 'success' },
  { id: '4', image: 'https://via.placeholder.com/60', title: 'Mini Projetor Portátil HD 1080p', aliPrice: 110.00, salePrice: 299.90, margin: 63, stock: 12, ml: true, shopee: true, status: 'pending' },
];

const Products = () => {
  const { openModal } = useUIStore();
  const [importUrl, setImportUrl] = useState('');

  return (
    <div className="products-container">
      <div className="page-header">
        <div>
          <h2>Gerenciar Produtos</h2>
          <p className="subtitle">Importe e gerencie seus produtos do AliExpress</p>
        </div>
        <Button 
          leftIcon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>}
          onClick={() => openModal('import-product')}
        >
          Importar Produto
        </Button>
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
          <option value="all">Plataforma: Todas</option>
          <option value="ml">Mercado Livre</option>
          <option value="shopee">Shopee</option>
        </select>
      </Card>

      <div className="products-grid">
        {mockProducts.map(prod => (
          <Card key={prod.id} className="product-card">
            <div className="product-image-wrap">
              <img src={prod.image} alt={prod.title} className="product-img" />
              <div className="product-badges">
                <StatusBadge status={prod.status as any} label={prod.status === 'success' ? 'Ativo' : 'Pendente'} />
              </div>
            </div>
            
            <div className="product-info">
              <h4 className="product-title">{prod.title}</h4>
              
              <div className="price-details">
                <div className="price-col">
                  <span className="price-label">Custo (AliExpress)</span>
                  <span className="price-value cost">R$ {prod.aliPrice.toFixed(2).replace('.', ',')}</span>
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
        ))}
      </div>

      <Modal id="import-product" title="Importar Produto do AliExpress">
        <div className="import-modal-content">
          <Input 
            label="URL do Produto (AliExpress)" 
            placeholder="https://pt.aliexpress.com/item/..." 
            value={importUrl}
            onChange={(e) => setImportUrl(e.target.value)}
          />
          <div className="modal-actions">
            <Button variant="primary">Buscar Dados</Button>
          </div>
          
          {/* Mock Preview area after fetch */}
          <div className="import-preview disabled">
            <p className="preview-placeholder">Insira a URL e clique em buscar para pré-visualizar os dados do produto.</p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Products;
