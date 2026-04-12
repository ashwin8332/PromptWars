import { useState } from 'react';
import { LayoutDashboard, TrendingUp, ShieldAlert, PieChart, ArrowLeftRight, Lock, BookOpen, BrainCircuit } from 'lucide-react';
import DashboardOverview from './components/DashboardOverview.tsx';
import WaterfallFlow from './components/WaterfallFlow.tsx';
import MonteCarlo from './components/MonteCarlo.tsx';
import Arbitrage from './components/Arbitrage.tsx';
import LiteracyAssistant from './components/LiteracyAssistant.tsx';
import AIAssistant from './components/AIAssistant.tsx';
function App() {
  const [activeTab, setActiveTab] = useState('overview');

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <DashboardOverview />;
      case 'waterfall': return <WaterfallFlow />;
      case 'montecarlo': return <MonteCarlo />;
      case 'arbitrage': return <Arbitrage />;
      case 'literacy': return <LiteracyAssistant />;
      case 'ai': return <AIAssistant />;
      default: return <DashboardOverview />;
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar Focus on Professional Aesthetic */}
      <aside className="sidebar">
        <div className="flex items-center gap-2 mb-8 px-2">
          <div style={{ background: 'var(--accent-primary)', padding: '0.5rem', borderRadius: '8px' }}>
            <TrendingUp size={24} color="white" />
          </div>
          <h1 className="gradient-text" style={{ fontSize: '1.5rem', margin: 0 }}>PFIS</h1>
        </div>
        
        <div className="mb-6 px-2">
          <p className="label mb-2" style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>Intelligence Modules</p>
          <nav>
            <div 
              className={`nav-item ${activeTab === 'ai' ? 'active' : ''}`}
              onClick={() => setActiveTab('ai')}
            >
              <BrainCircuit size={18} />
              <span>AI Chief Advisor</span>
            </div>
            <div 
              className={`nav-item ${activeTab === 'literacy' ? 'active' : ''}`}
              onClick={() => setActiveTab('literacy')}
            >
              <BookOpen size={18} />
              <span>Literacy Assistant</span>
            </div>
            <div 
              className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <LayoutDashboard size={18} />
              <span>Health Overview</span>
            </div>
            <div 
              className={`nav-item ${activeTab === 'waterfall' ? 'active' : ''}`}
              onClick={() => setActiveTab('waterfall')}
            >
              <ArrowLeftRight size={18} />
              <span>Cash Flow Waterfall</span>
            </div>
            <div 
              className={`nav-item ${activeTab === 'montecarlo' ? 'active' : ''}`}
              onClick={() => setActiveTab('montecarlo')}
            >
              <ShieldAlert size={18} />
              <span>Risk Engine (SORR)</span>
            </div>
            <div 
              className={`nav-item ${activeTab === 'arbitrage' ? 'active' : ''}`}
              onClick={() => setActiveTab('arbitrage')}
            >
              <PieChart size={18} />
              <span>Debt Arbitrage</span>
            </div>
          </nav>
        </div>

        <div className="mt-auto px-2 absolute" style={{ bottom: '2rem' }}>
          <div className="glass-panel p-4" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Lock size={16} color="var(--accent-success)" />
            <div>
              <p className="label" style={{ fontSize: '0.7rem', color: 'var(--accent-success)' }}>Secure Mode</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>AES-256 Local Encryption</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 600 }}>
              {activeTab === 'ai' && 'AI Financial Intelligence'}
              {activeTab === 'literacy' && 'Education Center'}
              {activeTab === 'overview' && 'Professional Dashboard'}
              {activeTab === 'waterfall' && 'Dynamic Cash Flow'}
              {activeTab === 'montecarlo' && 'Monte Carlo Stress Test'}
              {activeTab === 'arbitrage' && 'Capital Arbitrage Analysis'}
            </h2>
            <p className="label">Wealth Optimization Environment synced</p>
          </div>
          <div className="flex gap-4">
            <button className="btn btn-glass">Import Data</button>
            <button className="btn btn-primary">Run Simulation</button>
          </div>
        </header>

        <div className="animate-fade-in">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;
