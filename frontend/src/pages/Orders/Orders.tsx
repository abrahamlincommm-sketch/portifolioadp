import React, { useState, useEffect } from 'react';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { StatusBadge } from '../../components/UI/StatusBadge';
import { DataTable } from '../../components/UI/DataTable';
import client from '../../api/client';
import './Orders.css';

interface OrderItem {
  id: string;
  platform: string;
  platformOrderId: string;
  supplierOrderId?: string;
  supplierName: string;
  buyerName: string;
  quantity: number;
  totalBrl: number;
  status: string;
  trackingCode?: string;
  trackingUrl?: string;
  createdAt: string;
  product?: {
    title: string;
  };
}

interface OrderStats {
  total: number;
  pending: number;
  processing: number;
  completed: number;
}

const Orders = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [stats, setStats] = useState<OrderStats>({ total: 0, pending: 0, processing: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [fulfillingId, setFulfillingId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrdersData();
  }, []);

  const fetchOrdersData = async () => {
    try {
      setLoading(true);
      const [ordersRes, statsRes] = await Promise.all([
        client.get('/orders'),
        client.get('/orders/stats'),
      ]);
      setOrders(ordersRes.data || []);
      setStats(statsRes.data || { total: 0, pending: 0, processing: 0, completed: 0 });
    } catch (err) {
      console.error('Erro ao buscar pedidos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFulfill = async (orderId: string) => {
    try {
      setFulfillingId(orderId);
      await client.post(`/orders/${orderId}/fulfill`);
      fetchOrdersData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao processar pedido com o fornecedor');
    } finally {
      setFulfillingId(null);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
      case 'TRACKING_SYNCED':
        return <StatusBadge status="success" label="Concluído" />;
      case 'PENDING':
        return <StatusBadge status="pending" label="Pendente" />;
      case 'FULFILLMENT_PENDING':
      case 'PLACED_ON_AE':
      case 'AWAITING_TRACKING':
        return <StatusBadge status="processing" label="Processando" />;
      case 'ERROR':
      case 'CANCELLED':
        return <StatusBadge status="error" label="Erro/Cancelado" />;
      default:
        return <StatusBadge status="draft" label={status} />;
    }
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return order.status === 'PENDING';
    if (activeTab === 'fulfillment') return ['FULFILLMENT_PENDING', 'PLACED_ON_AE'].includes(order.status);
    if (activeTab === 'tracking') return ['AWAITING_TRACKING', 'TRACKING_SYNCED'].includes(order.status);
    if (activeTab === 'completed') return ['DELIVERED', 'TRACKING_SYNCED'].includes(order.status);
    return true;
  });

  const columns = [
    { key: 'id', header: 'Pedido', render: (row: OrderItem) => <strong>#{row.platformOrderId || row.id.slice(0, 8)}</strong> },
    { key: 'date', header: 'Data', render: (row: OrderItem) => new Date(row.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) },
    { key: 'platform', header: 'Plataforma', render: (row: OrderItem) => (
      <span className={`platform-tag ${row.platform.toLowerCase()}`}>{row.platform === 'MERCADOLIVRE' ? 'ML' : row.platform}</span>
    )},
    { key: 'product', header: 'Produto', render: (row: OrderItem) => row.product?.title || 'Produto' },
    { key: 'buyer', header: 'Comprador', render: (row: OrderItem) => row.buyerName },
    { key: 'amount', header: 'Valor', render: (row: OrderItem) => formatCurrency(row.totalBrl) },
    { key: 'status', header: 'Status', render: (row: OrderItem) => getStatusBadge(row.status) },
    { key: 'actions', header: 'Ações', render: (row: OrderItem) => (
      row.status === 'PENDING' ? (
        <Button 
          variant="primary" 
          size="sm" 
          disabled={fulfillingId === row.id}
          onClick={() => handleFulfill(row.id)}
        >
          {fulfillingId === row.id ? 'Processando...' : 'Comprar Fornecedor'}
        </Button>
      ) : (
        <Button variant="ghost" size="sm">Detalhes</Button>
      )
    )},
  ];

  return (
    <div className="orders-container">
      <div className="page-header">
        <div>
          <h2>Pedidos</h2>
          <p className="subtitle">Gerencie os pedidos recebidos das plataformas de venda</p>
        </div>
        <Button 
          leftIcon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>}
          onClick={fetchOrdersData}
        >
          Atualizar Pedidos
        </Button>
      </div>

      <div className="stats-bar">
        <Card className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total de Pedidos</div>
        </Card>
        <Card className="stat-card warning">
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-label">Pendentes de Compra</div>
        </Card>
        <Card className="stat-card primary">
          <div className="stat-value">{stats.processing}</div>
          <div className="stat-label">Em Processamento</div>
        </Card>
        <Card className="stat-card success">
          <div className="stat-value">{stats.completed}</div>
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
        
        {loading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Carregando pedidos...
          </div>
        ) : filteredOrders.length > 0 ? (
          <DataTable 
            columns={columns} 
            data={filteredOrders} 
            keyExtractor={(row) => row.id} 
          />
        ) : (
          <div style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Nenhum pedido encontrado nesta categoria.
          </div>
        )}
      </Card>
    </div>
  );
};

export default Orders;
