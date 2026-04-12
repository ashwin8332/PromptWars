import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Wallet } from 'lucide-react';

const mockNetWorthData = [
  { month: 'Jan', value: 120000 },
  { month: 'Feb', value: 125000 },
  { month: 'Mar', value: 132000 },
  { month: 'Apr', value: 128000 },
  { month: 'May', value: 136000 },
  { month: 'Jun', value: 145000 },
  { month: 'Jul', value: 151000 },
];

export default function DashboardOverview() {
  const score = 84; // Mock score

  return (
    <div className="flex-col gap-6">
      {/* Top Metrics Grid */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        
        {/* Main Health Score */}
        <div className="glass-panel p-6 flex items-center justify-between">
          <div>
            <h3 className="label mb-2">Financial Health Score</h3>
            <p className="stat-value">{score}</p>
            <p className="label" style={{ color: 'var(--accent-success)', marginTop: '0.5rem' }}>+4 Pts from last quarter</p>
          </div>
          <div className="score-circle" style={{ '--score': score } as any}>
            <div className="score-content">
              <div className="score-value">{score}</div>
              <div className="score-label">Excellent</div>
            </div>
          </div>
        </div>

        {/* Liquidity Ratio */}
        <div className="glass-panel p-6 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2">
            <Activity size={20} color="var(--accent-primary)" />
            <h3 className="label">Liquidity Ratio (Months)</h3>
          </div>
          <p className="stat-value">6.5</p>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: '100%', background: 'var(--accent-success)' }}></div>
          </div>
          <p className="label mt-4" style={{ fontSize: '0.75rem' }}>Target: 6.0 Months • Safe</p>
        </div>

        {/* Savings Rate */}
        <div className="glass-panel p-6 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2">
            <Wallet size={20} color="var(--accent-warning)" />
            <h3 className="label">Savings Rate</h3>
          </div>
          <p className="stat-value">18.2%</p>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: '85%', background: 'var(--accent-warning)' }}></div>
          </div>
          <p className="label mt-4" style={{ fontSize: '0.75rem' }}>Target: &gt;15% • Optimal</p>
        </div>
      </div>

      {/* Net Worth Chart */}
      <div className="glass-panel p-6 mt-6">
        <div className="flex justify-between items-center mb-6">
          <h3 style={{ fontSize: '1.2rem' }}>Net Worth Direction</h3>
          <span className="label">Rolling 6 Months</span>
        </div>
        <div style={{ height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockNetWorthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
              <XAxis dataKey="month" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
              <YAxis 
                stroke="var(--text-secondary)" 
                tick={{ fill: 'var(--text-secondary)' }} 
                tickFormatter={(value) => `$${value/1000}k`}
                axisLine={false} 
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{ background: 'rgba(15, 17, 26, 0.9)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}
                itemStyle={{ color: 'var(--text-primary)' }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="var(--accent-primary)" 
                strokeWidth={3}
                dot={{ fill: 'var(--bg-dark)', stroke: 'var(--accent-primary)', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: 'var(--accent-primary)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
