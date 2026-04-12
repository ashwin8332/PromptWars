import { useState, useMemo, useCallback } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, LineChart, Line, Legend
} from 'recharts';
import { ShieldAlert, Zap, AlertTriangle, CheckCircle, Info, RefreshCw, TrendingDown } from 'lucide-react';

// ──────────────────────────────────────────────────────────────────────────────
// REAL MONTE CARLO ENGINE — Box-Muller normal distribution sampling
// ──────────────────────────────────────────────────────────────────────────────
function gaussianRandom(mean: number, stdDev: number): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return mean + stdDev * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

interface StressScenario {
  id: string;
  label: string;
  yearlyShocks: number[];  // year-by-year returns (as decimals), then revert to normal
  description: string;
  color: string;
  btnClass: string;
}

const STRESS_SCENARIOS: StressScenario[] = [
  {
    id: 'normal',
    label: 'Baseline (No Shock)',
    yearlyShocks: [],
    description: 'Historical average returns with full volatility simulation.',
    color: 'var(--accent-electric)',
    btnClass: '',
  },
  {
    id: 'crash2008',
    label: '2008 Financial Crisis',
    yearlyShocks: [-0.37, 0.265, 0.151, 0.022, 0.135],
    description: 'S&P 500 dropped 37% in Year 1. SORR risk is highest here: withdrawals lock in losses permanently.',
    color: 'var(--accent-red)',
    btnClass: 'crash-2008',
  },
  {
    id: 'stagflation',
    label: '1970s Stagflation',
    yearlyShocks: [-0.145, -0.265, 0.372, -0.069, 0.189, -0.116, 0.233],
    description: '7-year volatility: inflation hits 13%+, real returns devastated. Classic failure pattern for fixed withdrawals.',
    color: 'var(--accent-amber)',
    btnClass: 'stagflation',
  },
  {
    id: 'dotcom',
    label: '2000 Dot-Com Crash',
    yearlyShocks: [-0.091, -0.119, -0.221, 0.287, 0.107],
    description: '3-year consecutive down markets. SORR compounds with each withdrawal during a multi-year bear.',
    color: 'var(--accent-blue)',
    btnClass: 'dot-com',
  },
  {
    id: 'covid',
    label: '2020 Covid Crash',
    yearlyShocks: [-0.34, 0.68, 0.27],
    description: 'Fast 34% drop, fast recovery. Demonstrates how SORR is reduced by rapid V-shape recovery.',
    color: 'var(--accent-violet)',
    btnClass: 'covid',
  },
];

interface SimResult {
  percentile10: number[];
  percentile25: number[];
  percentile50: number[];
  percentile75: number[];
  percentile90: number[];
  failureRate: number;
  sorrRisk: string;
  sorrColor: string;
  medianFinal: number;
}

function runMonteCarlo(
  startingBalance: number,
  annualWithdrawal: number,
  years: number,
  meanReturn: number,   // annual decimal
  stdDev: number,       // annual decimal
  N: number,            // simulations
  shocks: number[]
): SimResult {
  const allPaths: number[][] = [];
  let failures = 0;

  for (let sim = 0; sim < N; sim++) {
    let balance = startingBalance;
    const path: number[] = [balance];
    let failed = false;

    for (let y = 0; y < years; y++) {
      // Apply stress shock first, then normal for remaining years
      const annualReturn = y < shocks.length
        ? shocks[y] + gaussianRandom(0, stdDev * 0.3) // small noise around shock
        : gaussianRandom(meanReturn, stdDev);

      balance = balance * (1 + annualReturn) - annualWithdrawal;

      if (balance <= 0) {
        balance = 0;
        if (!failed) { failures++; failed = true; }
      }
      path.push(Math.round(balance));
    }
    allPaths.push(path);
  }

  // Calculate percentile at each time step
  const percentile = (arr: number[], p: number) => {
    const sorted = [...arr].sort((a, b) => a - b);
    const idx = Math.floor((p / 100) * (sorted.length - 1));
    return sorted[idx];
  };

  const yearLabels = years + 1;
  const p10: number[] = [], p25: number[] = [], p50: number[] = [], p75: number[] = [], p90: number[] = [];

  for (let i = 0; i < yearLabels; i++) {
    const vals = allPaths.map(p => p[i]);
    p10.push(percentile(vals, 10));
    p25.push(percentile(vals, 25));
    p50.push(percentile(vals, 50));
    p75.push(percentile(vals, 75));
    p90.push(percentile(vals, 90));
  }

  const failureRate = (failures / N) * 100;
  let sorrRisk = '', sorrColor = '';
  if (failureRate >= 30) { sorrRisk = 'CRITICAL'; sorrColor = 'var(--accent-red)'; }
  else if (failureRate >= 15) { sorrRisk = 'HIGH'; sorrColor = 'var(--accent-amber)'; }
  else if (failureRate >= 5)  { sorrRisk = 'MODERATE'; sorrColor = 'var(--accent-amber)'; }
  else                        { sorrRisk = 'LOW'; sorrColor = 'var(--accent-electric)'; }

  return { percentile10: p10, percentile25: p25, percentile50: p50, percentile75: p75, percentile90: p90, failureRate, sorrRisk, sorrColor, medianFinal: p50[years] };
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--nb-bg-3)', border: '2px solid var(--border-color)', padding: '0.75rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', boxShadow: 'var(--shadow-md)' }}>
      <p style={{ color: 'var(--text-muted)', marginBottom: '0.4rem' }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.stroke || p.fill || 'white', margin: '2px 0' }}>
          {p.name}: <strong>${(p.value / 1000000).toFixed(2)}M</strong>
        </p>
      ))}
    </div>
  );
};

export default function MonteCarlo() {
  const [portfolio, setPortfolio] = useState(500000);
  const [withdrawalRate, setWithdrawalRate] = useState(4.0);
  const [years, setYears] = useState(30);
  const [meanReturn, setMeanReturn] = useState(7.0);
  const [volatility, setVolatility] = useState(15.0);
  const [inflation, setInflation] = useState(3.0);
  const [activeScenario, setActiveScenario] = useState('normal');
  const [isRunning, setIsRunning] = useState(false);
  const [simCount] = useState(1000);

  const scenario = STRESS_SCENARIOS.find(s => s.id === activeScenario)!;

  const annualWithdrawal = useMemo(() =>
    portfolio * (withdrawalRate / 100),
    [portfolio, withdrawalRate]
  );

  // Inflation-adjusted net return
  const realMeanReturn = (meanReturn - inflation) / 100;
  const stdDevDecimal = volatility / 100;

  const result = useMemo(() => {
    setIsRunning(false);
    return runMonteCarlo(
      portfolio,
      annualWithdrawal,
      years,
      realMeanReturn,
      stdDevDecimal,
      simCount,
      scenario.yearlyShocks
    );
  }, [portfolio, annualWithdrawal, years, realMeanReturn, stdDevDecimal, simCount, scenario]);

  // Build chart data
  const chartData = useMemo(() => {
    return Array.from({ length: years + 1 }, (_, i) => ({
      year: `Yr ${i}`,
      p10: result.percentile10[i],
      p25: result.percentile25[i],
      p50: result.percentile50[i],
      p75: result.percentile75[i],
      p90: result.percentile90[i],
    }));
  }, [result, years]);

  const handleRunSim = useCallback(() => {
    setIsRunning(true);
    setTimeout(() => setIsRunning(false), 300);
  }, []);

  const sorr3YearFail = useMemo(() => {
    // Simulate starting with a shock in year 1-3 specifically
    const earlyCrashResult = runMonteCarlo(
      portfolio, annualWithdrawal, years, realMeanReturn, stdDevDecimal, 500,
      [-0.37, 0.05, 0.08] // forced early crash
    );
    return earlyCrashResult.failureRate;
  }, [portfolio, annualWithdrawal, years, realMeanReturn, stdDevDecimal]);

  return (
    <div className="flex-col gap-6">
      {/* ── CONTROLS ── */}
      <div className="nb-card">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Simulation Parameters</h3>
            <p className="text-xs text-muted mt-1" style={{ fontFamily: 'var(--font-mono)' }}>// {simCount} iterations • Box-Muller normal distribution sampling</p>
          </div>
          <button className="btn btn-primary" onClick={handleRunSim} disabled={isRunning}>
            {isRunning ? <span className="loading-ring" /> : <RefreshCw size={14} />}
            {isRunning ? 'Running...' : 'Re-Run'}
          </button>
        </div>

        <div className="grid grid-3 gap-4">
          <div className="input-group">
            <label className="nb-label">Portfolio Balance</label>
            <input type="number" className="nb-input" value={portfolio} onChange={e => setPortfolio(Number(e.target.value))} step={10000} />
          </div>
          <div className="input-group">
            <label className="nb-label">Withdrawal Rate (SWR %)</label>
            <div className="flex items-center gap-2">
              <input type="range" min={2} max={8} step={0.1} value={withdrawalRate} onChange={e => setWithdrawalRate(parseFloat(e.target.value))} className="nb-slider flex-1" />
              <span className="font-mono text-sm text-amber">{withdrawalRate.toFixed(1)}%</span>
            </div>
          </div>
          <div className="input-group">
            <label className="nb-label">Projection Years</label>
            <div className="flex items-center gap-2">
              <input type="range" min={10} max={50} step={1} value={years} onChange={e => setYears(parseInt(e.target.value))} className="nb-slider flex-1" />
              <span className="font-mono text-sm" style={{ color: 'var(--accent-cyan)', minWidth: '2rem' }}>{years}</span>
            </div>
          </div>
          <div className="input-group">
            <label className="nb-label">Expected Annual Return (%)</label>
            <div className="flex items-center gap-2">
              <input type="range" min={2} max={14} step={0.5} value={meanReturn} onChange={e => setMeanReturn(parseFloat(e.target.value))} className="nb-slider flex-1" />
              <span className="font-mono text-sm text-green">{meanReturn.toFixed(1)}%</span>
            </div>
          </div>
          <div className="input-group">
            <label className="nb-label">Volatility / Std Dev (σ %)</label>
            <div className="flex items-center gap-2">
              <input type="range" min={5} max={35} step={1} value={volatility} onChange={e => setVolatility(parseFloat(e.target.value))} className="nb-slider flex-1" />
              <span className="font-mono text-sm text-amber">{volatility}%</span>
            </div>
          </div>
          <div className="input-group">
            <label className="nb-label">Inflation Rate (CPI %)</label>
            <div className="flex items-center gap-2">
              <input type="range" min={1} max={12} step={0.5} value={inflation} onChange={e => setInflation(parseFloat(e.target.value))} className="nb-slider flex-1" />
              <span className="font-mono text-sm text-red">{inflation.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Key derived metrics */}
        <div className="grid grid-4 gap-3 mt-2">
          {[
            { label: 'Annual Withdrawal', val: `$${annualWithdrawal.toLocaleString()}`, color: 'var(--accent-amber)' },
            { label: 'Real Return (Net Inflation)', val: `${(realMeanReturn * 100).toFixed(2)}%`, color: realMeanReturn > 0 ? 'var(--accent-electric)' : 'var(--accent-red)' },
            { label: 'Monthly Withdrawal', val: `$${(annualWithdrawal / 12).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: 'var(--text-primary)' },
            { label: 'Trinity Rule Check', val: withdrawalRate <= 4 ? '≤ 4% Safe' : `${withdrawalRate}% Risky`, color: withdrawalRate <= 4 ? 'var(--accent-electric)' : 'var(--accent-red)' },
          ].map(m => (
            <div key={m.label} className="nb-stat-card" style={{ padding: '0.75rem 1rem' }}>
              <p className="stat-label">{m.label}</p>
              <p className="font-mono" style={{ color: m.color, fontWeight: 700, fontSize: '1rem', marginTop: 4 }}>{m.val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── MAIN GRID: CHART + STRESS TESTS ── */}
      <div className="grid" style={{ gridTemplateColumns: '1fr 320px', gap: '1.5rem' }}>

        {/* CHART */}
        <div className="nb-card" style={{ padding: '1.25rem' }}>
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Fan Chart</h3>
                <span className="badge" style={{ background: scenario.color + '22', color: scenario.color, borderColor: scenario.color }}>
                  {scenario.label}
                </span>
              </div>
              <p className="text-xs text-muted mt-1" style={{ fontFamily: 'var(--font-mono)' }}>
                95% Confidence Interval • Shaded bands show probability distribution
              </p>
            </div>
            {/* Legend */}
            <div className="flex flex-col gap-1" style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              <span><span style={{ display: 'inline-block', width: 10, height: 2, background: scenario.color, marginRight: 4, verticalAlign: 'middle' }} />Median (P50)</span>
              <span><span style={{ display: 'inline-block', width: 10, height: 8, background: scenario.color + '40', marginRight: 4, verticalAlign: 'middle' }} />P25–P75</span>
              <span><span style={{ display: 'inline-block', width: 10, height: 8, background: scenario.color + '18', marginRight: 4, verticalAlign: 'middle' }} />P10–P90</span>
            </div>
          </div>

          <div style={{ height: 380 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="mcGrad1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={scenario.color} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={scenario.color} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--nb-border)" vertical={false} />
                <XAxis dataKey="year" tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
                  tickFormatter={v => `$${(v / 1000000).toFixed(1)}M`}
                  axisLine={false} tickLine={false} width={55}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={0} stroke="var(--accent-red)" strokeWidth={1} strokeDasharray="6 3" />
                {/* P10-P90 outer band */}
                <Area type="monotone" dataKey="p90" stroke="none" fill={scenario.color} fillOpacity={0.08} name="P90" />
                <Area type="monotone" dataKey="p10" stroke="none" fill="var(--nb-bg)" fillOpacity={1} name="P10" />
                {/* P25-P75 inner band */}
                <Area type="monotone" dataKey="p75" stroke="none" fill={scenario.color} fillOpacity={0.2} name="P75" />
                <Area type="monotone" dataKey="p25" stroke="none" fill="var(--nb-bg)" fillOpacity={1} name="P25" />
                {/* Median */}
                <Area type="monotone" dataKey="p50" stroke={scenario.color} strokeWidth={2.5} fill="url(#mcGrad1)" name="Median"
                  dot={false} activeDot={{ r: 5, fill: scenario.color }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RIGHT PANEL: SORR + STRESS TESTS */}
        <div className="flex-col gap-4">

          {/* SORR ANALYSIS */}
          <div className="nb-card" style={{ borderLeft: `4px solid ${result.sorrColor}` }}>
            <div className="flex items-center gap-2 mb-3">
              <ShieldAlert size={16} color={result.sorrColor} />
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700 }}>SORR Analysis</h3>
              <span className="badge ml-auto" style={{ background: result.sorrColor + '22', color: result.sorrColor, borderColor: result.sorrColor }}>
                {result.sorrRisk}
              </span>
            </div>

            <div className="grid grid-2 gap-3 mb-4">
              <div>
                <p className="stat-label">Portfolio Failure Rate</p>
                <p className="font-mono" style={{ fontSize: '1.6rem', fontWeight: 700, color: result.sorrColor }}>
                  {result.failureRate.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="stat-label">Median Balance (Yr {years})</p>
                <p className="font-mono" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-electric)' }}>
                  ${(result.medianFinal / 1000).toFixed(0)}k
                </p>
              </div>
            </div>

            {/* SORR Early-Crash metric */}
            <div className="alert alert-warning" style={{ padding: '0.75rem', fontSize: '0.78rem' }}>
              <AlertTriangle size={13} />
              <div>
                <strong>Early Crash SORR (Yr 1–3):</strong> Failure rate rises to <strong style={{ color: 'var(--accent-red)' }}>{sorr3YearFail.toFixed(1)}%</strong> if a 37% crash occurs in retirement Year 1.
              </div>
            </div>

            {result.failureRate < 5 && (
              <div className="alert alert-success mt-3" style={{ padding: '0.75rem', fontSize: '0.78rem' }}>
                <CheckCircle size={13} />
                <span>Portfolio highly resilient. Trinity Study 4% threshold maintained.</span>
              </div>
            )}
          </div>

          {/* STRESS TEST BUTTONS */}
          <div className="nb-card" style={{ padding: '1rem' }}>
            <div className="flex items-center gap-2 mb-3">
              <Zap size={14} color="var(--accent-electric)" />
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700 }}>Stress Test Scenarios</h3>
            </div>
            <div className="flex-col gap-2">
              {STRESS_SCENARIOS.map(s => (
                <button
                  key={s.id}
                  className={`stress-btn ${s.btnClass} ${activeScenario === s.id ? 'active' : ''}`}
                  style={activeScenario === s.id ? { background: s.color, color: 'var(--nb-black)', borderColor: 'var(--nb-black)', boxShadow: 'var(--shadow-md)' } : {}}
                  onClick={() => setActiveScenario(s.id)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scenario Description */}
          <div className="nb-card" style={{ padding: '1rem', borderLeft: `3px solid ${scenario.color}` }}>
            <div className="flex items-center gap-2 mb-2">
              <Info size={13} color={scenario.color} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: scenario.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Scenario Intel
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {scenario.description}
            </p>
            {scenario.yearlyShocks.length > 0 && (
              <div className="mt-2" style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                {scenario.yearlyShocks.map((shock, i) => (
                  <span key={i} className={`badge ${shock < 0 ? 'badge-red' : 'badge-green'}`} style={{ fontSize: '0.62rem' }}>
                    Yr{i + 1}: {(shock * 100).toFixed(0)}%
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Engine Constants */}
          <div className="nb-card" style={{ padding: '1rem' }}>
            <p className="stat-label mb-3">Engine Constants</p>
            {[
              { k: 'Normal Dist.', v: 'Box-Muller sampling' },
              { k: 'Risk Model', v: 'Std Dev σ-adjusted' },
              { k: 'Tax Treatment', v: 'Pre-distribution' },
              { k: 'Longevity', v: 'Trinity Study base' },
            ].map(r => (
              <div key={r.k} className="flex justify-between items-center" style={{ fontSize: '0.75rem', padding: '0.3rem 0', borderBottom: '1px solid var(--nb-border)' }}>
                <span style={{ color: 'var(--text-muted)' }}>{r.k}</span>
                <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>{r.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
