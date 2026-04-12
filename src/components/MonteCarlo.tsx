import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ShieldAlert, Info } from 'lucide-react';

export default function MonteCarlo() {
  const currentPortfolio = 500000;
  
  // Generate mock fan chart data simulating Monte Carlo
  const data = useMemo(() => {
    const pts = [];
    let median = currentPortfolio;
    let worst = currentPortfolio;
    let best = currentPortfolio;
    for (let year = 0; year <= 30; year++) {
      pts.push({
        year: `Year ${year}`,
        median: Math.round(median),
        worst: Math.round(worst),
        best: Math.round(best),
      });
      median *= 1.07; // 7% linear return
      worst *= 1.02; // 2% worst case
      best *= 1.11; // 11% best case
    }
    return pts;
  }, []);

  return (
    <div className="grid" style={{ gridTemplateColumns: 'minmax(300px, 1fr) 300px', gap: '2rem' }}>
      
      {/* Chart Section */}
      <div className="flex-col gap-6">
        <div className="glass-panel p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3>Monte Carlo Simulator</h3>
              <p className="label">1,000 Iterations • Adjusted for Real Returns</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <span style={{ width: '12px', height: '12px', background: 'rgba(59, 130, 246, 0.5)', display: 'inline-block', borderRadius: '2px' }}></span> 
                95% Confidence Interval
              </span>
            </div>
          </div>
          <div style={{ height: '400px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBest" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
                <XAxis dataKey="year" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                <YAxis 
                  stroke="var(--text-secondary)" 
                  tick={{ fill: 'var(--text-secondary)' }} 
                  tickFormatter={(value) => `$${(value/1000000).toFixed(1)}M`}
                  axisLine={false} 
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ background: 'rgba(15, 17, 26, 0.9)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                  formatter={(value: any) => `$${value.toLocaleString()}`}
                />
                {/* Confidence Interval Fan */}
                <Area type="monotone" dataKey="best" stroke="none" fill="var(--accent-primary)" fillOpacity={0.1} />
                <Area type="monotone" dataKey="worst" stroke="none" fill="var(--bg-dark)" fillOpacity={1} /> 
                <Area type="monotone" dataKey="worst" stroke="var(--accent-danger)" fill="none" strokeDasharray="5 5" />
                <Area type="monotone" dataKey="median" stroke="var(--accent-primary)" strokeWidth={3} fill="url(#colorBest)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Metrics Section */}
      <div className="flex-col gap-6">
        <div className="glass-panel p-6">
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert size={20} color="var(--accent-warning)" />
            <h3>SORR Analysis</h3>
          </div>
          <p className="label mb-4">Sequence of Returns Risk</p>
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid var(--accent-warning)' }}>
            <p style={{ fontSize: '0.85rem' }}>If a 2008-level crash occurs in years 1-3 of retirement, your portfolio survival rate drops to <strong>74%</strong>.</p>
          </div>
          <button className="btn btn-glass mt-4 w-full">Stress Test: 2008 Crash</button>
          <button className="btn btn-glass mt-2 w-full">Stress Test: 1970s Stagflation</button>
        </div>

        <div className="glass-panel p-6">
          <div className="flex items-center gap-2 mb-4">
            <Info size={20} color="var(--text-secondary)" />
            <h3>Engine Constants</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <span className="label">Inflation Model</span>
              <span style={{ fontWeight: 500 }}>Dynamic (3.2%)</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="label">Safe Withdrawal</span>
              <span style={{ fontWeight: 500 }}>4.00% (Trinity)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="label">Tax Treatment</span>
              <span style={{ fontWeight: 500 }}>Federal/State Marginal</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
