import React, { useEffect, useState } from 'react';
import { Card } from '../../components/UI/Card';
import { StatusBadge } from '../../components/UI/StatusBadge';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import client from '../../api/client';
import './Dashboard.css';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  ordersToday: number;
  pendingTracking: number;
  revenueBrl: number;
  platforms?: {
    mercadolivre: number;
    shopee: number;
  };
}

interface RevenuePoint {
  name: string;
  value: number;
}

interface RecentOrder {
  id: string;
  platform: string;
  totalBrl: number;
  status: string;
  createdAt: string;
  product?: {
    title: string;
  };
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    ordersToday: 0,
    pendingTracking: 0,
    revenueBrl: 0,
  });
  const [revenueData, setRevenueData] = useState<RevenuePoint[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, chartRes, ordersRes] = await Promise.all([
        client.get('/dashboard/stats'),
        client.get('/dashboard/revenue-chart'),
        client.get('/dashboard/recent-orders'),
      ]);

      setStats(statsRes.data);
      setRevenueData(chartRes.data || []);
      setRecentOrders(ordersRes.data || []);
    } catch (err) {
      console.error('Erro ao carregar dados do dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const mlCount = stats.platforms?.mercadolivre || 0;
  const shopeeCount = stats.platforms?.shopee || 0;
  const totalPlatformOrders = mlCount + shopeeCount;

  const platformData = totalPlatformOrders > 0 ? [
    { name: 'Mercado Livre', value: mlCount, percentage: Math.round((mlCount / totalPlatformOrders) * 100), color: '#f59e0b' },
    { name: 'Shopee', value: shopeeCount, percentage: Math.round((shopeeCount / totalPlatformOrders) * 100), color: '#f43f5e' },
  ] : [];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'DELIVERED':
      case 'TRACKING_SYNCED':
        return { status: 'success' as const, label: 'Concluído' };
      case 'PENDING':
        return { status: 'pending' as const, label: 'Pendente' };
      case 'FULFILLMENT_PENDING':
      case 'PLACED_ON_AE':
      case 'AWAITING_TRACKING':
        return { status: 'processing' as const, label: 'Processando' };
      case 'ERROR':
      case 'CANCELLED':
        return { status: 'error' as const, label: 'Erro/Cancelado' };
      default:
        return { status: 'draft' as const, label: status };
    }
  };

  return (
    <div className="dashboard-container">
      <div className="kpi-grid">
        <Card gradientTop className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Total Produtos</span>
            <div className="kpi-icon purple">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              </svg>
            </div>
          </div>
          <div className="kpi-value">{loading ? '...' : stats.totalProducts}</div>
          <div className="kpi-trend" style={{ color: 'var(--text-muted)' }}>Produtos cadastrados</div>
        </Card>
        
        <Card gradientTop className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Pedidos Hoje</span>
            <div className="kpi-icon blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
            </div>
          </div>
          <div className="kpi-value">{loading ? '...' : stats.ordersToday}</div>
          <div className="kpi-trend" style={{ color: 'var(--text-muted)' }}>Vendas registradas hoje</div>
        </Card>

        <Card gradientTop className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Faturamento Total</span>
            <div className="kpi-icon emerald">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
          </div>
          <div className="kpi-value">{loading ? '...' : formatCurrency(stats.revenueBrl)}</div>
          <div className="kpi-trend" style={{ color: 'var(--text-muted)' }}>Volume bruto de vendas</div>
        </Card>

        <Card gradientTop className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Rastreios Pendentes</span>
            <div className="kpi-icon amber">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="3" width="15" height="13"/>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
            </div>
          </div>
          <div className="kpi-value">{loading ? '...' : stats.pendingTracking}</div>
          <div className="kpi-trend" style={{ color: 'var(--text-muted)' }}>Aguardando código</div>
        </Card>
      </div>

      <div className="charts-grid">
        <Card className="chart-card">
          <h3>Faturamento (Últimos 7 dias)</h3>
          <div className="chart-container">
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" vertical={false} />
                  <XAxis dataKey="name" stroke="#9090a8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9090a8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `R$${val}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a2e', borderColor: '#2a2a3e', borderRadius: '8px' }} 
                    formatter={(val: any) => [formatCurrency(Number(val)), 'Faturamento']}
                  />
                  <Area type="monotone" dataKey="value" stroke="#7c3aed" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-chart">Nenhum histórico de vendas recente</div>
            )}
          </div>
        </Card>

        <Card className="chart-card">
          <h3>Vendas por Plataforma</h3>
          <div className="chart-container">
            {platformData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={platformData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {platformData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', borderColor: '#2a2a3e', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="chart-legend">
                  {platformData.map(item => (
                    <div key={item.name} className="legend-item">
                      <span className="legend-dot" style={{ backgroundColor: item.color }}></span>
                      <span>{item.name}</span>
                      <span className="legend-value">{item.percentage}% ({item.value})</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                Nenhuma venda registrada ainda
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="bottom-grid">
        <Card className="recent-orders-card">
          <div className="card-header">
            <h3>Pedidos Recentes</h3>
            <a href="/orders" className="view-all">Ver todos</a>
          </div>
          <div className="table-responsive">
            {recentOrders.length > 0 ? (
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Produto</th>
                    <th>Plataforma</th>
                    <th>Valor</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => {
                    const statusInfo = getStatusInfo(order.status);
                    return (
                      <tr key={order.id}>
                        <td>#{order.id.slice(0, 8)}</td>
                        <td>{order.product?.title || 'Produto'}</td>
                        <td>{order.platform}</td>
                        <td>{formatCurrency(order.totalBrl)}</td>
                        <td>
                          <StatusBadge 
                            status={statusInfo.status} 
                            label={statusInfo.label} 
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                Nenhum pedido recente registrado no sistema.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
