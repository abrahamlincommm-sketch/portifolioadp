import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './pages/Dashboard/Dashboard';
import Products from './pages/Products/Products';
import Orders from './pages/Orders/Orders';
import Tracking from './pages/Tracking/Tracking';
import Settings from './pages/Settings/Settings';
import { useUIStore } from './store/uiStore';
import './App.css'; // Let's quickly inject the layout CSS here since we don't have a Layout wrapper

function App() {
  const { sidebarCollapsed } = useUIStore();

  return (
    <div className="app-layout">
      <Sidebar />
      <div className={`main-wrapper ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/tracking" element={<Tracking />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
