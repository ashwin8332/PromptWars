import { useState, useEffect } from 'react';
import './App.css';
import {
  LayoutDashboard, TrendingUp, ShieldAlert, ArrowLeftRight,
  Lock, BookOpen, BrainCircuit, PieChart, Zap, Shield,
  Activity, ChevronRight, Menu, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardOverview from './components/DashboardOverview.tsx';
import WaterfallFlow from './components/WaterfallFlow.tsx';
import MonteCarlo from './components/MonteCarlo.tsx';
import Arbitrage from './components/Arbitrage.tsx';
import LiteracyAssistant from './components/LiteracyAssistant.tsx';
import AIAssistant from './components/AIAssistant.tsx';
import TaxDragAnalyzer from './components/TaxDragAnalyzer.tsx';
import './index.css';

type Tab = 'overview' | 'ai' | 'waterfall' | 'montecarlo' | 'arbitrage' | 'taxdrag' | 'literacy';

interface NavItem {
  id: Tab;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  section?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'ai', label: 'AI Chief Advisor', icon: <BrainCircuit size={16} />, badge: 'RAG', section: 'Intelligence' },
  { id: 'overview', label: 'Health Dashboard', icon: <LayoutDashboard size={16} />, section: 'Intelligence' },
  { id: 'waterfall', label: 'Cash Flow Waterfall', icon: <ArrowLeftRight size={16} />, section: 'Engines' },
  { id: 'montecarlo', label: 'Risk Engine (SORR)', icon: <ShieldAlert size={16} />, badge: 'MC', section: 'Engines' },
  { id: 'arbitrage', label: 'Debt Arbitrage', icon: <TrendingUp size={16} />, section: 'Engines' },
  { id: 'taxdrag', label: 'Tax-Drag Analyzer', icon: <PieChart size={16} />, section: 'Engines' },
  { id: 'literacy', label: 'Finance Education', icon: <BookOpen size={16} />, section: 'Learning' },
];

const PAGE_TITLES: Record<Tab, { title: string; subtitle: string }> = {
  ai: { title: 'AI Chief Advisor', subtitle: 'RAG-Grounded Fiduciary Intelligence Engine' },
  overview: { title: 'Financial Health Dashboard', subtitle: 'Real-time Wealth Optimization Metrics' },
  waterfall: { title: 'Cash Flow Waterfall', subtitle: 'DTI Monitor & Capital Velocity Analysis' },
  montecarlo: { title: 'Monte Carlo Risk Engine', subtitle: 'SORR Analysis • 1,000-Iteration Simulation' },
  arbitrage: { title: 'Debt Arbitrage Logic', subtitle: 'Effective Return vs. Guaranteed ROI Optimizer' },
  taxdrag: { title: 'Tax-Drag Analyzer', subtitle: 'Location Optimization & Fee Erosion Calculator' },
  literacy: { title: 'Financial Education Center', subtitle: 'From First Principles to Advanced Concepts',  },
};

const pageVariants = {
  initial: { opacity: 0, y: 15, scale: 0.99 },
  in: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.25, 0.8, 0.25, 1] } },
  out: { opacity: 0, y: -15, scale: 0.99, transition: { duration: 0.3, ease: [0.25, 0.8, 0.25, 1] } }
};

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [secureMode, setSecureMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':    return <DashboardOverview />;
      case 'waterfall':   return <WaterfallFlow />;
      case 'montecarlo':  return <MonteCarlo />;
      case 'arbitrage':   return <Arbitrage />;
      case 'taxdrag':     return <TaxDragAnalyzer />;
      case 'literacy':    return <LiteracyAssistant />;
      case 'ai':          return <AIAssistant />;
      default:            return <DashboardOverview />;
    }
  };

  const sections = [...new Set(NAV_ITEMS.map(n => n.section))];
  const { title, subtitle } = PAGE_TITLES[activeTab];

  return (
    <div className="dashboard-layout" style={{ minHeight: '100vh' }}>
      {/* ── SIDEBAR ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 258, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'backOut' }}
            className="sidebar"
          >
            {/* Logo */}
            <div className="sidebar-logo">
              <div className="sidebar-logo-icon">
                <Zap size={18} />
              </div>
              <div style={{ whiteSpace: 'nowrap' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.04em', color: '#f5c800', lineHeight: 1 }}>
                  PFIS
                </div>
                <div style={{ fontSize: '0.6rem', color: '#666', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '2px' }}>
                  Intelligence Suite
                </div>
              </div>
            </div>

            {/* Nav Sections */}
            <div style={{ overflowX: 'hidden' }}>
              {sections.map(section => (
                <div key={section} className="mb-4">
                  <div className="sidebar-section-label">{section}</div>
                  {NAV_ITEMS.filter(n => n.section === section).map(item => (
                    <motion.div
                      whileHover={{ scale: 1.02, x: 2 }}
                      whileTap={{ scale: 0.98 }}
                      key={item.id}
                      id={`nav-${item.id}`}
                      className={`nav-item${activeTab === item.id ? ' active' : ''}`}
                      onClick={() => setActiveTab(item.id)}
                      role="button"
                      aria-pressed={activeTab === item.id}
                    >
                      {item.icon}
                      <span style={{ flex: 1, whiteSpace: 'nowrap' }}>{item.label}</span>
                      {item.badge && (
                        <span className="badge badge-violet" style={{ fontSize: '0.55rem', padding: '0.1rem 0.35rem' }}>
                          {item.badge}
                        </span>
                      )}
                      <div className="nav-dot" />
                    </motion.div>
                  ))}
                </div>
              ))}
            </div>

            {/* Bottom: Security Status */}
            <div className="mt-auto" style={{ overflowX: 'hidden' }}>
              <div style={{ height: 1, background: '#333', margin: '1.25rem 0' }} />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                className="security-badge w-full"
                style={{ width: '100%', cursor: 'pointer', justifyContent: 'center', gap: '0.5rem' }}
                onClick={() => setSecureMode(s => !s)}
                id="secure-mode-toggle"
                aria-label="Toggle secure mode"
              >
                {secureMode
                  ? <><Lock size={12} /> AES-256 ACTIVE</>
                  : <><Shield size={12} style={{ color: '#ffb800' }} /> <span style={{ color: '#ffb800' }}>PLAINTEXT MODE</span></>
                }
              </motion.button>
              <div className="mt-2" style={{ fontSize: '0.65rem', color: '#555', textAlign: 'center', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                {time.toLocaleTimeString()} • Zero-Knowledge
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── MAIN CONTENT ── */}
      <main className="main-content" style={{ minWidth: 0 }}>
        {/* Top Header Bar */}
        <header className="page-header">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="btn btn-ghost"
              style={{ padding: '0.4rem', border: 'none', boxShadow: 'none' }}
              onClick={() => setSidebarOpen(s => !s)}
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </motion.button>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab + "-title"}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="page-title" style={{ whiteSpace: 'nowrap' }}>{title}</h2>
                <p className="page-subtitle">// {subtitle}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-3">
            {/* Live indicator */}
            <div className="flex items-center gap-2" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              <div style={{ width: 6, height: 6, background: 'var(--accent-electric)', borderRadius: '50%' }} className="animate-pulse" />
              LIVE
            </div>

            <div className="flex items-center gap-2">
              <Activity size={14} color="var(--accent-electric)" />
              <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                Market: +0.43%
              </span>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-secondary"
              id="import-data-btn"
              style={{ fontSize: '0.75rem', padding: '0.45rem 0.9rem' }}
            >
              Import CSV
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-primary"
              id="run-simulation-btn"
              onClick={() => setActiveTab('montecarlo')}
              style={{ fontSize: '0.75rem', padding: '0.45rem 0.9rem' }}
            >
              <Zap size={14} />
              Simulate
            </motion.button>
          </div>
        </header>

        {/* Secure Mode Warning Banner */}
        <AnimatePresence>
          {!secureMode && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="alert alert-warning mb-6"
              style={{ overflow: 'hidden' }}
            >
              <Shield size={16} style={{ flexShrink: 0 }} />
              <div>
                <strong>Plaintext Mode Active:</strong> Financial data is displayed without encryption. Switch to Secure Mode to enable AES-256 local encryption.
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Page Content */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeTab}
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            style={{ width: '100%', height: '100%' }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;

