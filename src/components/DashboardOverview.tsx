import { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, AreaChart, Area
} from 'recharts';
import {
  TrendingUp, TrendingDown, Activity, Wallet, Shield,
  AlertTriangle, CheckCircle, Zap, ArrowUpRight, ArrowDownRight,
  Target, RefreshCw
} from 'lucide-react';

// ─── REAL-WORLD FINANCIAL HEALTH CALCULATOR ───────────────────────────────
function computeHealthScore(params: {
  liquidityMonths: number;
  savingsRate: number;          // %
  dtiBackEnd: number;           // %
  netWorthTrend: number;        // % change
  emergencyFunded: boolean;
  highRateDebt: boolean;
}): { score: number; grade: string; color: string } {
  let score = 0;

  // Liquidity (0-25 pts): target 6 months
  score += Math.min(25, (params.liquidityMonths / 6) * 25);

  // Savings Rate (0-25 pts): target >15%
  score += Math.min(25, (params.savingsRate / 20) * 25);

  // DTI (0-20 pts): back-end <36% optimal
  const dtiScore = params.dtiBackEnd <= 36 ? 20 : params.dtiBackEnd <= 43 ? 10 : 0;
  score += dtiScore;

  // Net worth direction (0-15 pts)
  score += params.netWorthTrend > 0 ? Math.min(15, params.netWorthTrend / 5 * 15) : 0;

  // Emergency fund (0-10 pts)
  score += params.emergencyFunded ? 10 : 0;

  // No high-rate debt (0-5 pts)
  score += params.highRateDebt ? 0 : 5;

  score = Math.round(Math.min(100, score));

  let grade = 'Critical';
  let color = 'var(--accent-red)';
  if (score >= 85) { grade = 'Excellent'; color = 'var(--accent-electric)'; }
  else if (score >= 70) { grade = 'Good'; color = '#7fff6a'; }
  else if (score >= 55) { grade = 'Fair'; color = 'var(--accent-amber)'; }
  else if (score >= 40) { grade = 'Poor'; color = 'var(--accent-red)'; }

  return { score, grade, color };
}

// Mock 12-month net worth data with realistic volatility
const NET_WORTH_BASE = [
  { month: 'May\'25', value: 112000, benchmark: 108000 },
  { month: 'Jun',     value: 118400, benchmark: 110000 },
  { month: 'Jul',     value: 115800, benchmark: 111500 },
  { month: 'Aug',     value: 122300, benchmark: 113000 },
  { month: 'Sep',     value: 119600, benchmark: 114000 },
  { month: 'Oct',     value: 128900, benchmark: 116500 },
  { month: 'Nov',     value: 131200, benchmark: 118000 },
  { month: 'Dec',     value: 127000, benchmark: 120000 },
  { month: 'Jan\'26', value: 135400, benchmark: 122000 },
  { month: 'Feb',     value: 139800, benchmark: 124000 },
  { month: 'Mar',     value: 145200, benchmark: 126000 },
  { month: 'Apr',     value: 151700, benchmark: 128000 },
];

interface MetricCardProps {
  label: string;
  value: string;
  delta?: string;
  deltaPositive?: boolean;
  color?: string;
  icon: React.ReactNode;
  subtext?: string;
  progress?: number;
  progressColor?: string;
}

function MetricCard({ label, value, delta, deltaPositive, color = 'var(--accent-electric)', icon, subtext, progress, progressColor }: MetricCardProps) {
  return (
    <div className="nb-stat-card">
      <div className="flex items-center justify-between mb-3">
        <span className="stat-label">{label}</span>
        <div style={{ color, opacity: 0.7 }}>{icon}</div>
      </div>
      <div className="stat-number" style={{ color, fontSize: '1.9rem' }}>{value}</div>
      {delta && (
        <div className="flex items-center gap-1 mt-2">
          {deltaPositive
            ? <ArrowUpRight size={12} color="var(--accent-electric)" />
            : <ArrowDownRight size={12} color="var(--accent-red)" />
          }
          <span className="stat-delta" style={{ color: deltaPositive ? 'var(--accent-electric)' : 'var(--accent-red)' }}>
            {delta}
          </span>
        </div>
      )}
      {subtext && <p className="text-xs text-muted mt-2">{subtext}</p>}
      {progress !== undefined && (
        <div className="progress-track mt-3">
          <div
            className="progress-fill"
            style={{ width: `${Math.min(100, progress)}%`, background: progressColor || color }}
          />
        </div>
      )}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--nb-bg-3)', border: '2px solid var(--border-color)', padding: '0.75rem 1rem', boxShadow: 'var(--shadow-md)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
      <p style={{ color: 'var(--text-muted)', marginBottom: '0.4rem' }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: <strong>${(p.value / 1000).toFixed(1)}k</strong>
        </p>
      ))}
    </div>
  );
};

export default function DashboardOverview() {
  const [inflationRate, setInflationRate] = useState(3.2);
  const [refreshKey, setRefreshKey] = useState(0);

  const health = computeHealthScore({
    liquidityMonths: 6.5,
    savingsRate: 18.2,
    dtiBackEnd: 30.8,
    netWorthTrend: 7.8,
    emergencyFunded: true,
    highRateDebt: false,
  });

  // Real-return adjusted net worth
  const adjustedData = useMemo(() =>
    NET_WORTH_BASE.map(d => ({
      ...d,
      real: Math.round(d.value / (1 + inflationRate / 100))
    })),
    [inflationRate, refreshKey]
  );

  // Capital allocation algorithm output
  const allocations = [
    { rank: 1, action: 'Emergency Fund', status: '✓ Funded', color: 'var(--accent-electric)', desc: '6.5 months coverage', badge: 'COMPLETE', badgeClass: 'badge-green' },
    { rank: 2, action: 'Employer 401k Match', status: 'Max 6% Match', color: 'var(--accent-electric)', desc: '$285/mo → 100% instant ROI', badge: 'OPTIMAL', badgeClass: 'badge-green' },
    { rank: 3, action: 'High Interest Debt (>7%)', status: 'None Detected', color: 'var(--accent-electric)', desc: 'All debts below arbitrage threshold', badge: 'CLEAR', badgeClass: 'badge-green' },
    { rank: 4, action: 'Max Tax-Advantaged (IRA)', status: 'In Progress', color: 'var(--accent-amber)', desc: '$3,200/$7,000 annual limit', badge: 'ACTION', badgeClass: 'badge-amber' },
    { rank: 5, action: 'Taxable Brokerage', status: 'Available', color: 'var(--accent-blue)', desc: '$640/mo surplus available', badge: 'NEXT', badgeClass: 'badge-blue' },
  ];

  const circumference = 2 * Math.PI * 42; // r=42
  const strokeDash = (health.score / 100) * circumference;

  return (
    <div className="flex-col gap-6">
      {/* ── ROW 1: HEALTH SCORE + KEY METRICS ── */}
      <div className="grid grid-4 gap-4">

        {/* HEALTH SCORE (spans 1 col, taller presence) */}
        <div className="nb-card accent-green" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', textAlign: 'center', gridRow: 'span 1' }}>
          {/* SVG Score Ring */}
          <div className="score-ring-wrapper" style={{ width: 110, height: 110 }}>
            <svg viewBox="0 0 100 100" width="110" height="110" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="50" cy="50" r="42" fill="none" stroke="var(--nb-surface-2)" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="42" fill="none"
                stroke={health.color}
                strokeWidth="8"
                strokeDasharray={`${strokeDash} ${circumference}`}
                strokeLinecap="square"
                style={{ transition: 'stroke-dasharray 1s ease' }}
              />
            </svg>
            <div className="score-ring-center">
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.8rem', fontWeight: 700, color: health.color, lineHeight: 1 }}>
                {health.score}
              </div>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '2px' }}>
                {health.grade}
              </div>
            </div>
          </div>
          <div>
            <p className="stat-label">Financial Health Score</p>
            <p className="text-xs text-muted mt-1">Actuarial composite index</p>
          </div>
        </div>

        <MetricCard
          label="Net Worth (Nominal)"
          value="$151.7k"
          delta="+$5,150 vs. Mar"
          deltaPositive={true}
          color="var(--accent-electric)"
          icon={<TrendingUp size={18} />}
          subtext="12-month direction: ↑ 35.4%"
        />
        <MetricCard
          label="Liquidity Ratio"
          value="6.5 mo"
          delta="0.5 above target"
          deltaPositive={true}
          color="var(--accent-cyan)"
          icon={<Shield size={18} />}
          subtext="Target ≥ 6.0 months"
          progress={100}
          progressColor="var(--accent-electric)"
        />
        <MetricCard
          label="Savings Rate"
          value="18.2%"
          delta="+1.4% vs. last qtr"
          deltaPositive={true}
          color="var(--accent-amber)"
          icon={<Wallet size={18} />}
          subtext="Target ≥ 15% (CFP standard)"
          progress={91}
          progressColor="var(--accent-amber)"
        />
      </div>

      {/* ── ROW 2: SECONDARY METRICS ── */}
      <div className="grid grid-4 gap-4">
        <MetricCard
          label="Back-End DTI"
          value="30.8%"
          delta="Below 36% threshold"
          deltaPositive={true}
          color="var(--accent-electric)"
          icon={<Activity size={18} />}
          subtext="Mortgage-ready"
          progress={30.8}
          progressColor="var(--accent-electric)"
        />
        <MetricCard
          label="Real Return (Inflation-Adj)"
          value={`${(7.2 - inflationRate).toFixed(1)}%`}
          delta={`Inflation: ${inflationRate}%`}
          deltaPositive={(7.2 - inflationRate) > 0}
          color={(7.2 - inflationRate) > 0 ? 'var(--accent-electric)' : 'var(--accent-red)'}
          icon={<Target size={18} />}
          subtext="Portfolio nominal: 7.2%"
        />
        <MetricCard
          label="Tax-Advantaged Coverage"
          value="45.7%"
          delta="IRA at $3,200 / $7,000"
          deltaPositive={false}
          color="var(--accent-violet)"
          icon={<TrendingDown size={18} />}
          subtext="Room to optimize: $3,800"
          progress={45.7}
          progressColor="var(--accent-violet)"
        />
        <MetricCard
          label="High-Rate Debt"
          value="$0"
          delta="All debt < 7% threshold"
          deltaPositive={true}
          color="var(--accent-electric)"
          icon={<CheckCircle size={18} />}
          subtext="Arbitrage opportunity: CLEAR"
        />
      </div>

      {/* ── ROW 3: NET WORTH CHART ── */}
      <div className="nb-card" style={{ padding: '1.5rem' }}>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
              Net Worth Trajectory
            </h3>
            <p className="text-xs text-muted mt-1" style={{ fontFamily: 'var(--font-mono)' }}>
              Nominal vs. Inflation-Adjusted ({inflationRate}% CPI) vs. S&P 500 Benchmark
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="nb-label" style={{ margin: 0, whiteSpace: 'nowrap' }}>CPI %:</label>
              <input
                type="range" min={1} max={8} step={0.1}
                value={inflationRate}
                onChange={e => setInflationRate(parseFloat(e.target.value))}
                className="nb-slider"
                style={{ width: '100px' }}
              />
              <span className="font-mono text-sm text-amber">{inflationRate.toFixed(1)}%</span>
            </div>
            <button className="btn btn-ghost" style={{ padding: '0.35rem 0.6rem' }} onClick={() => setRefreshKey(k => k + 1)}>
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-6 mb-4" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          <span><span style={{ display: 'inline-block', width: 12, height: 3, background: 'var(--accent-electric)', marginRight: 4, verticalAlign: 'middle' }} />Nominal</span>
          <span><span style={{ display: 'inline-block', width: 12, height: 3, background: 'var(--accent-blue)', marginRight: 4, verticalAlign: 'middle', borderTop: '2px dashed var(--accent-blue)' }} />Real (Inflation-Adj)</span>
          <span><span style={{ display: 'inline-block', width: 12, height: 3, background: 'var(--accent-amber)', marginRight: 4, verticalAlign: 'middle', borderTop: '1px dashed var(--accent-amber)' }} />S&P 500 Benchmark</span>
        </div>

        <div style={{ height: '280px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={adjustedData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradNominal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-electric)" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="var(--accent-electric)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--nb-border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
                tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
                axisLine={false} tickLine={false} width={50}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={120000} stroke="var(--nb-border)" strokeDasharray="4 4" label={{ value: 'Start', fill: 'var(--text-muted)', fontSize: 10 }} />
              <Area type="monotone" dataKey="benchmark" name="S&P 500" stroke="var(--accent-amber)" strokeWidth={1.5} strokeDasharray="5 3" fill="none" dot={false} />
              <Area type="monotone" dataKey="real" name="Real Return" stroke="var(--accent-blue)" strokeWidth={1.5} strokeDasharray="3 2" fill="none" dot={false} />
              <Area type="monotone" dataKey="value" name="Nominal" stroke="var(--accent-electric)" strokeWidth={2.5} fill="url(#gradNominal)"
                dot={{ r: 3, fill: 'var(--nb-bg)', stroke: 'var(--accent-electric)', strokeWidth: 2 }}
                activeDot={{ r: 5, fill: 'var(--accent-electric)' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── ROW 4: CAPITAL ALLOCATION ALGORITHM ── */}
      <div className="nb-card">
        <div className="section-header">
          <div className="flex items-center gap-2">
            <Zap size={14} color="var(--accent-electric)" />
            <span className="section-title">Wealth Optimization Algorithm</span>
          </div>
          <div className="section-header-line" />
          <span className="badge badge-green">ACTIVE</span>
        </div>
        <p className="text-xs text-muted mb-4" style={{ fontFamily: 'var(--font-mono)' }}>
          // Next $1 capital allocation directive (Fiduciary priority order)
        </p>
        {allocations.map((a, i) => (
          <div key={i} className="allocation-item">
            <div className="allocation-rank">{a.rank}</div>
            <div style={{ width: 8, height: 8, borderRadius: 0, background: a.color, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{a.action}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>{a.desc}</div>
            </div>
            <div style={{ fontWeight: 600, fontSize: '0.8rem', color: a.color }}>{a.status}</div>
            <span className={`badge ${a.badgeClass}`}>{a.badge}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
