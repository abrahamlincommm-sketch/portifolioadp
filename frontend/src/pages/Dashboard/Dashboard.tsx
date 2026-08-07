import React from 'react';
import { Card } from '../../components/UI/Card';
import { StatusBadge } from '../../components/UI/StatusBadge';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './Dashboard.css';

const revenueData = [
  { name: '01/ago', value: 1200 }, { name: '02/ago', value: 1900 }, { name: '03/ago', value: 1500 },
  { name: '04/ago', value: 2800 }, { name: '05/ago', value: 2200 }, { name: '06/ago', value: 3500 },
  { name: '07/ago', value: 3100 },
];

const platformData = [
  { name: 'Mercado Livre', value: 65, color: '#f59e0b' },
  { name: 'Shopee', value: 35, color: '#f43f5e' },
];

const recentOrders = [
  { id: '1042', product: 'Smartwatch Y20', platform: 'Mercado Livre', amount: 'R$ 149,90', status: 'pending' },
  { id: '1041', product: 'Fone Bluetooth 5.0', platform: 'Shopee', amount: 'R$ 89,90', status: 'processing' },
  { id: '1040', product: 'Ring Light 10"', platform: 'Mercado Livre', amount: 'R$ 119,90', status: 'success' },
  { id: '1039', product: 'Mini Projetor HD', platform: 'Shopee', amount: 'R$ 299,90', status: 'success' },
  { id: '1038', product: 'Cabo iPhone Turbo', platform: 'Mercado Livre', amount: 'R$ 39,90', status: 'error' },
];

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <div className="kpi-grid">
        <Card gradientTop className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Total Produtos</span>
            <div className="kpi-icon purple"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg></div>
          </div>
          <div className="kpi-value">245</div>
          <div className="kpi-trend positive">+12% desde o último mês</div>
        </Card>
        
        <Card gradientTop className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Pedidos Hoje</span>
            <div className="kpi-icon blue"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg></div>
          </div>
          <div className="kpi-value">38</div>
          <div className="kpi-trend positive">+5% que ontem</div>
        </Card>

        <Card gradientTop className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Faturamento Mês</span>
            <div className="kpi-icon emerald"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>
          </div>
          <div className="kpi-value">R$ 42.500</div>
          <div className="kpi-trend positive">+18% desde o último mês</div>
        </Card>

        <Card gradientTop className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Rastreios Pendentes</span>
            <div className="kpi-icon amber"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg></div>
          </div>
          <div className="kpi-value">12</div>
          <div className="kpi-trend negative">-3 que ontem</div>
        </Card>
      </div>

      <div className="charts-grid">
        <Card className="chart-card">
          <h3>Faturamento (Últimos 7 dias)</h3>
          <div className="chart-container">
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
                <YAxis stroke="#9090a8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `R$${val/1000}k`} />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', borderColor: '#2a2a3e', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="value" stroke="#7c3aed" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="chart-card">
          <h3>Vendas por Plataforma</h3>
          <div className="chart-container">
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
          </div>
          <div className="chart-legend">
            {platformData.map(item => (
              <div key={item.name} className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: item.color }}></span>
                <span>{item.name}</span>
                <span className="legend-value">{item.value}%</span>
              </div>
            ))}
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
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{order.product}</td>
                    <td>{order.platform}</td>
                    <td>{order.amount}</td>
                    <td>
                      <StatusBadge 
                        status={order.status as any} 
                        label={order.status === 'success' ? 'Concluído' : order.status === 'pending' ? 'Pendente' : order.status === 'processing' ? 'Processando' : 'Erro'} 
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
