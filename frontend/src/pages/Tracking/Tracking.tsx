import React from 'react';
import { Card } from '../../components/UI/Card';
import { DataTable } from '../../components/UI/DataTable';
import { StatusBadge } from '../../components/UI/StatusBadge';
import './Tracking.css';

const mockTracking = [
  { id: '1041', aliOrderId: '81239487123', code: 'NL123456789BR', status: 'transit', lastUpdate: 'Curitiba, PR - Recebido no Brasil', days: 12 },
  { id: '1040', aliOrderId: '81239487124', code: 'NL123456790BR', status: 'delivered', lastUpdate: 'São Paulo, SP - Entregue ao destinatário', days: 15 },
  { id: '1039', aliOrderId: '81239487125', code: 'Aguardando', status: 'pending', lastUpdate: 'Aguardando envio do fornecedor', days: 2 },
  { id: '1038', aliOrderId: '81239487126', code: 'NL123456791BR', status: 'transit', lastUpdate: 'Valinhos, SP - Em trânsito para Cajamar', days: 18 },
];

const Tracking = () => {
  const columns = [
    { key: 'id', header: 'Pedido' },
    { key: 'aliOrderId', header: 'Pedido Ali' },
    { key: 'code', header: 'Código de Rastreio', render: (row: any) => (
      row.code !== 'Aguardando' ? (
        <div className="tracking-code-cell">
          {row.code}
          <button className="copy-btn" title="Copiar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
        </div>
      ) : <span className="text-muted">Aguardando</span>
    )},
    { key: 'status', header: 'Status', render: (row: any) => (
      <StatusBadge 
        status={row.status === 'delivered' ? 'success' : row.status === 'transit' ? 'processing' : 'pending'} 
        label={row.status === 'delivered' ? 'Entregue' : row.status === 'transit' ? 'Em Trânsito' : 'Pendente'} 
      />
    )},
    { key: 'lastUpdate', header: 'Última Atualização' },
    { key: 'days', header: 'Dias', render: (row: any) => `${row.days} dias` },
  ];

  return (
    <div className="tracking-container">
      <div className="page-header">
        <div>
          <h2>Rastreamento</h2>
          <p className="subtitle">Monitore a entrega dos pedidos do AliExpress</p>
        </div>
      </div>

      <div className="tracking-summary">
        <Card className="tracking-card">
          <div className="tc-icon amber"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
          <div className="tc-info">
            <span className="tc-value">12</span>
            <span className="tc-label">Aguardando Código</span>
          </div>
        </Card>
        <Card className="tracking-card">
          <div className="tc-icon blue"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg></div>
          <div className="tc-info">
            <span className="tc-value">45</span>
            <span className="tc-label">Em Trânsito</span>
          </div>
        </Card>
        <Card className="tracking-card">
          <div className="tc-icon emerald"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
          <div className="tc-info">
            <span className="tc-value">28</span>
            <span className="tc-label">Entregues (Mês)</span>
          </div>
        </Card>
      </div>

      <Card className="tracking-table-card">
        <DataTable columns={columns} data={mockTracking} keyExtractor={(row) => row.id} />
      </Card>
    </div>
  );
};

export default Tracking;
