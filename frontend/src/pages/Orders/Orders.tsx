import React, { useState } from 'react';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { StatusBadge } from '../../components/UI/StatusBadge';
import { DataTable } from '../../components/UI/DataTable';
import './Orders.css';

const mockOrders = [
  { id: '1042', date: '07/ago 14:30', platform: 'ML', product: 'Smartwatch Y20', buyer: 'João Silva', amount: 149.90, status: 'pending' },
  { id: '1041', date: '07/ago 11:15', platform: 'SH', product: 'Fone Bluetooth 5.0', buyer: 'Maria Costa', amount: 89.90, status: 'processing' },
  { id: '1040', date: '06/ago 16:45', platform: 'ML', product: 'Ring Light 10"', buyer: 'Carlos Souza', amount: 119.90, status: 'success' },
  { id: '1039', date: '06/ago 09:20', platform: 'SH', product: 'Mini Projetor HD', buyer: 'Ana Pereira', amount: 299.90, status: 'success' },
  { id: '1038', date: '05/ago 18:10', platform: 'ML', product: 'Cabo iPhone Turbo', buyer: 'Lucas Lima', amount: 39.90, status: 'error' },
];

const Orders = () => {
  const [activeTab, setActiveTab] = useState('all');

  const columns = [
    { key: 'id', header: 'Pedido', render: (row: any) => <strong>#{row.id}</strong> },
    { key: 'date', header: 'Data' },
    { key: 'platform', header: 'Plataforma', render: (row: any) => (
      <span className={`platform-tag ${row.platform.toLowerCase()}`}>{row.platform}</span>
    )},
    { key: 'product', header: 'Produto' },
    { key: 'buyer', header: 'Comprador' },
    { key: 'amount', header: 'Valor', render: (row: any) => `R$ ${row.amount.toFixed(2).replace('.', ',')}` },
    { key: 'status', header: 'Status', render: (row: any) => (
      <StatusBadge 
        status={row.status} 
        label={{ pending: 'Pendente', processing: 'Processando', success: 'Concluído', error: 'Erro' }[row.status as string] || row.status} 
      />
    )},
    { key: 'actions', header: 'Ações', render: () => (
      <Button variant="ghost" size="sm">Ver Detalhes</Button>
    )},
  ];

  return (
    <div className="orders-container">
      <div className="page-header">
        <div>
          <h2>Pedidos</h2>
          <p className="subtitle">Gerencie os pedidos de todas as plataformas</p>
        </div>
        <Button 
          leftIcon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>}
        >
          Sincronizar Pedidos
        </Button>
      </div>

      <div className="stats-bar">
        <Card className="stat-card">
          <div className="stat-value">156</div>
          <div className="stat-label">Total (Mês)</div>
        </Card>
        <Card className="stat-card warning">
          <div className="stat-value">12</div>
          <div className="stat-label">Pendentes de Compra</div>
        </Card>
        <Card className="stat-card primary">
          <div className="stat-value">28</div>
          <div className="stat-label">Em Processamento</div>
        </Card>
        <Card className="stat-card success">
          <div className="stat-value">116</div>
          <div className="stat-label">Concluídos</div>
        </Card>
      </div>

      <Card className="orders-table-card">
        <div className="tabs">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'pending', label: 'Pendentes' },
            { id: 'fulfillment', label: 'Fulfillment' },
            { id: 'tracking', label: 'Rastreio' },
            { id: 'completed', label: 'Concluídos' },
          ].map(tab => (
            <button 
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        <DataTable 
          columns={columns} 
          data={mockOrders} 
          keyExtractor={(row) => row.id} 
        />
      </Card>
    </div>
  );
};

export default Orders;
