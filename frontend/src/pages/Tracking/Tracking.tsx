import React, { useState, useEffect } from 'react';
import { Card } from '../../components/UI/Card';
import { DataTable } from '../../components/UI/DataTable';
import { StatusBadge } from '../../components/UI/StatusBadge';
import client from '../../api/client';
import './Tracking.css';

interface TrackingItem {
  id: string;
  platformOrderId: string;
  supplierOrderId?: string;
  supplierName: string;
  trackingCode?: string;
  trackingUrl?: string;
  status: string;
  updatedAt: string;
  product?: {
    title: string;
  };
}

const Tracking = () => {
  const [items, setItems] = useState<TrackingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrackingData();
  }, []);

  const fetchTrackingData = async () => {
    try {
      setLoading(true);
      const res = await client.get('/orders');
      // Filter orders that are relevant to tracking
      const allOrders: TrackingItem[] = res.data || [];
      const trackingOrders = allOrders.filter(o => 
        ['AWAITING_TRACKING', 'TRACKING_SYNCED', 'DELIVERED', 'PLACED_ON_AE'].includes(o.status)
      );
      setItems(trackingOrders);
    } catch (err) {
      console.error('Erro ao buscar rastreamentos:', err);
    } finally {
      setLoading(false);
    }
  };

  const awaitingCount = items.filter(i => ['AWAITING_TRACKING', 'PLACED_ON_AE'].includes(i.status)).length;
  const inTransitCount = items.filter(i => i.status === 'TRACKING_SYNCED').length;
  const deliveredCount = items.filter(i => i.status === 'DELIVERED').length;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(`Código copiado: ${text}`);
  };

  const columns = [
    { key: 'id', header: 'Pedido', render: (row: TrackingItem) => <strong>#{row.platformOrderId || row.id.slice(0, 8)}</strong> },
    { key: 'supplier', header: 'Fornecedor', render: (row: TrackingItem) => row.supplierName || 'ALIEXPRESS' },
    { key: 'supplierOrderId', header: 'ID Fornecedor', render: (row: TrackingItem) => row.supplierOrderId || '-' },
    { key: 'code', header: 'Código de Rastreio', render: (row: TrackingItem) => (
      row.trackingCode ? (
        <div className="tracking-code-cell">
          <span>{row.trackingCode}</span>
          <button className="copy-btn" title="Copiar" onClick={() => copyToClipboard(row.trackingCode!)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
          </button>
        </div>
      ) : <span className="text-muted">Aguardando emissão</span>
    )},
    { key: 'status', header: 'Status', render: (row: TrackingItem) => (
      <StatusBadge 
        status={row.status === 'DELIVERED' ? 'success' : row.status === 'TRACKING_SYNCED' ? 'processing' : 'pending'} 
        label={row.status === 'DELIVERED' ? 'Entregue' : row.status === 'TRACKING_SYNCED' ? 'Em Trânsito' : 'Aguardando'} 
      />
    )},
    { key: 'updatedAt', header: 'Última Atualização', render: (row: TrackingItem) => new Date(row.updatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) },
  ];

  return (
    <div className="tracking-container">
      <div className="page-header">
        <div>
          <h2>Rastreamento</h2>
          <p className="subtitle">Monitore o status e envio dos pedidos junto aos fornecedores</p>
        </div>
      </div>

      <div className="tracking-summary">
        <Card className="tracking-card">
          <div className="tc-icon amber">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div className="tc-info">
            <span className="tc-value">{awaitingCount}</span>
            <span className="tc-label">Aguardando Código</span>
          </div>
        </Card>
        <Card className="tracking-card">
          <div className="tc-icon blue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="3" width="15" height="13"/>
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
              <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
            </svg>
          </div>
          <div className="tc-info">
            <span className="tc-value">{inTransitCount}</span>
            <span className="tc-label">Em Trânsito</span>
          </div>
        </Card>
        <Card className="tracking-card">
          <div className="tc-icon emerald">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div className="tc-info">
            <span className="tc-value">{deliveredCount}</span>
            <span className="tc-label">Entregues</span>
          </div>
        </Card>
      </div>

      <Card className="tracking-table-card">
        {loading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Carregando dados de rastreamento...
          </div>
        ) : items.length > 0 ? (
          <DataTable columns={columns} data={items} keyExtractor={(row) => row.id} />
        ) : (
          <div style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Nenhum pedido em fase de rastreamento no momento.
          </div>
        )}
      </Card>
    </div>
  );
};

export default Tracking;
