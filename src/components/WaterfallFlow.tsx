import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, ReferenceLine
} from 'recharts';
import { ArrowDown, DollarSign, Home, CreditCard, Shield, TrendingUp, PiggyBank, Building, ShoppingBag, AlertTriangle } from 'lucide-react';

// ──────────────────────────────────────────────────────────────────────────────
// CASH FLOW WATERFALL — Professional DTI + Wealth Waterfall Engine
// ──────────────────────────────────────────────────────────────────────────────

const FEDERAL_TAX_BRACKETS = [
  { max: 11600,    rate: 0.10 },
  { max: 47150,    rate: 0.12 },
  { max: 100525,   rate: 0.22 },
  { max: 191950,   rate: 0.24 },
  { max: 243725,   rate: 0.32 },
  { max: 609350,   rate: 0.35 },
  { max: Infinity, rate: 0.37 },
];

function estimateTax(grossIncome: number, stateTaxRate: number): number {
  let tax = 0;
  let prev = 0;
  for (const b of FEDERAL_TAX_BRACKETS) {
    if (grossIncome <= prev) break;
    const taxable = Math.min(grossIncome, b.max) - prev;
    tax += taxable * b.rate;
    prev = b.max;
  }
  tax += grossIncome * (stateTaxRate / 100);
  tax += grossIncome * 0.0765; // FICA
  return tax;
}

interface WaterfallStep {
  id: number;
  icon: React.ReactNode;
  label: string;
  desc: string;
  amount: number;
  color: string;
  indent: number;
  isNegative?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--nb-bg-3)', border: '2px solid var(--border-color)', padding: '0.65rem 0.9rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', boxShadow: 'var(--shadow-md)' }}>
      <p style={{ color: 'var(--text-muted)', marginBottom: '0.3rem' }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.fill || p.color }}>{p.name}: <strong>${p.value?.toLocaleString() ?? '-'}</strong></p>
      ))}
    </div>
  );
};

export default function WaterfallFlow() {
  const [grossIncome, setGrossIncome] = useState(120000);
  const [stateTax, setStateTax] = useState(5.0);
  const [housing, setHousing] = useState(24000);
  const [otherDebt, setOtherDebt] = useState(6000);
  const [emergencyFundTarget, setEmergencyFundTarget] = useState(15000);
  const [emergencyFunded, setEmergencyFunded] = useState(9000);
  const [k401Pct, setK401Pct] = useState(6.0);   // % of gross
  const [iraAnnual, setIraAnnual] = useState(3200);
  const [brokerage, setBrokerage] = useState(400); // $/mo to taxable

  // ── CALCULATIONS ──
  const annualTax = useMemo(() => estimateTax(grossIncome, stateTax), [grossIncome, stateTax]);
  const netIncome = grossIncome - annualTax;
  const netMonthly = netIncome / 12;
  const grossMonthly = grossIncome / 12;

  const housingMonthly = housing / 12;
  const debtMonthly = otherDebt / 12;
  const k401Monthly = (grossIncome * k401Pct / 100) / 12;
  const iraMonthly = iraAnnual / 12;
  const emergencyGap = Math.max(0, emergencyFundTarget - emergencyFunded);
  const emergencyMonthly = Math.min(emergencyGap / 12, 300); // spread over 12 months, max $300/mo
  const brokerageMonthly = brokerage;

  const fixedObligations = housingMonthly + debtMonthly;
  const investmentFlow = k401Monthly + iraMonthly + brokerageMonthly;
  const totalOutflow = fixedObligations + emergencyMonthly + investmentFlow;
  const lifestyle = Math.max(0, netMonthly - totalOutflow - emergencyMonthly);
  const surplus = netMonthly - totalOutflow;

  // DTI
  const frontEndDTI = (housingMonthly / grossMonthly) * 100;
  const backEndDTI = ((housingMonthly + debtMonthly) / grossMonthly) * 100;

  // Savings rate
  const savingsRate = ((k401Monthly + iraMonthly + brokerageMonthly) / netMonthly) * 100;

  const steps: WaterfallStep[] = [
    { id: 1, icon: <DollarSign size={16} />, label: 'Gross Income', desc: `Annual: $${grossIncome.toLocaleString()}`, amount: grossMonthly, color: 'var(--accent-electric)', indent: 0 },
    { id: 2, icon: <Building size={16} />, label: 'Federal + State + FICA Taxes', desc: `${((annualTax / grossIncome) * 100).toFixed(1)}% effective rate`, amount: annualTax / 12, color: 'var(--accent-amber)', indent: 1, isNegative: true },
    { id: 3, icon: <Shield size={16} />, label: 'Net Take-Home', desc: 'After all taxes', amount: netMonthly, color: 'var(--accent-cyan)', indent: 0 },
    { id: 4, icon: <Home size={16} />, label: 'Fixed Obligations (Housing)', desc: `DTI front-end: ${frontEndDTI.toFixed(1)}%`, amount: housingMonthly, color: 'var(--accent-amber)', indent: 1, isNegative: true },
    { id: 5, icon: <CreditCard size={16} />, label: 'Debt Service (Back-End)', desc: `Total DTI: ${backEndDTI.toFixed(1)}%`, amount: debtMonthly, color: 'var(--accent-red)', indent: 2, isNegative: true },
    { id: 6, icon: <PiggyBank size={16} />, label: 'Emergency Reserve Build', desc: `$${emergencyFunded.toLocaleString()} / $${emergencyFundTarget.toLocaleString()} funded`, amount: emergencyMonthly, color: 'var(--accent-blue)', indent: 2, isNegative: true },
    { id: 7, icon: <TrendingUp size={16} />, label: '401(k) Pre-Tax Contribution', desc: `${k401Pct}% of gross | ${k401Pct >= 6 ? '✓ Employer match captured' : '⚠ Below match threshold'}`, amount: k401Monthly, color: 'var(--accent-violet)', indent: 2, isNegative: true },
    { id: 8, icon: <Building size={16} />, label: 'IRA Contribution', desc: `$${iraAnnual.toLocaleString()} / $7,000 annual limit`, amount: iraMonthly, color: 'var(--accent-violet)', indent: 2, isNegative: true },
    { id: 9, icon: <TrendingUp size={16} />, label: 'Taxable Brokerage', desc: 'After all priority allocations', amount: brokerageMonthly, color: 'var(--accent-electric)', indent: 2, isNegative: true },
    { id: 10, icon: <ShoppingBag size={16} />, label: 'Lifestyle Float', desc: 'Dining, entertainment, travel', amount: Math.abs(lifestyle), color: lifestyle >= 0 ? 'var(--accent-electric)' : 'var(--accent-red)', indent: 1, isNegative: true },
  ];

  // Bar chart data for composition
  const compositionData = [
    { name: 'Taxes', value: Math.round(annualTax / 12), fill: 'var(--accent-amber)' },
    { name: 'Housing', value: Math.round(housingMonthly), fill: '#e05c2a' },
    { name: 'Debt Svc', value: Math.round(debtMonthly), fill: 'var(--accent-red)' },
    { name: 'Emergency', value: Math.round(emergencyMonthly), fill: 'var(--accent-blue)' },
    { name: '401k', value: Math.round(k401Monthly), fill: 'var(--accent-violet)' },
    { name: 'IRA', value: Math.round(iraMonthly), fill: '#8b5cf6' },
    { name: 'Brokerage', value: Math.round(brokerageMonthly), fill: 'var(--accent-electric)' },
    { name: 'Lifestyle', value: Math.round(Math.abs(lifestyle)), fill: '#555' },
  ];

  return (
    <div className="flex-col gap-6">
      {/* ── TOP METRICS ── */}
      <div className="grid grid-4 gap-4">
        {[
          { label: 'Net Take-Home/mo', val: `$${netMonthly.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`, color: 'var(--accent-electric)' },
          { label: 'Front-End DTI', val: `${frontEndDTI.toFixed(1)}%`, color: frontEndDTI > 28 ? 'var(--accent-red)' : 'var(--accent-electric)', desc: frontEndDTI <= 28 ? '≤ 28% optimal' : '> 28% over limit' },
          { label: 'Back-End DTI', val: `${backEndDTI.toFixed(1)}%`, color: backEndDTI > 36 ? 'var(--accent-red)' : 'var(--accent-electric)', desc: backEndDTI <= 36 ? '≤ 36% optimal' : '> 36% risky' },
          { label: 'Investment Rate', val: `${savingsRate.toFixed(1)}%`, color: savingsRate >= 15 ? 'var(--accent-electric)' : 'var(--accent-amber)', desc: savingsRate >= 15 ? '≥ 15% target met' : '< 15% optimize' },
        ].map(m => (
          <div key={m.label} className="nb-stat-card">
            <p className="stat-label">{m.label}</p>
            <p className="font-mono" style={{ fontSize: '1.6rem', fontWeight: 700, color: m.color, lineHeight: 1, marginTop: 6 }}>{m.val}</p>
            {m.desc && <p className="text-xs text-muted mt-1">{m.desc}</p>}
          </div>
        ))}
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 340px', gap: '1.5rem' }}>
        {/* ── WATERFALL ── */}
        <div className="nb-card">
          <div className="section-header">
            <span className="section-title">Cash Flow Waterfall</span>
            <div className="section-header-line" />
            <span className="badge badge-green">LIVE</span>
          </div>

          <div className="flex-col" style={{ gap: '0.2rem' }}>
            {steps.map((step, idx) => (
              <div key={step.id}>
                <div
                  className="waterfall-step"
                  style={{
                    marginLeft: `${step.indent * 1.5}rem`,
                    borderLeft: `3px solid ${step.color}`,
                    opacity: step.amount === 0 ? 0.4 : 1,
                  }}
                >
                  <div style={{ color: step.color, flexShrink: 0 }}>{step.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-primary)' }}>{step.label}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 1, fontFamily: 'var(--font-mono)' }}>{step.desc}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div className="font-mono" style={{ fontWeight: 700, color: step.isNegative ? 'var(--accent-red)' : step.color, fontSize: '0.9rem' }}>
                      {step.isNegative ? '− ' : ''}${step.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>/mo</div>
                  </div>
                  {/* % of net income */}
                  <div className="font-mono text-xs" style={{ color: 'var(--text-muted)', minWidth: '3rem', textAlign: 'right' }}>
                    {((step.amount / netMonthly) * 100).toFixed(0)}%
                  </div>
                </div>

                {/* Arrow connector (except last) */}
                {idx < steps.length - 1 && (
                  <div style={{ marginLeft: `calc(${step.indent * 1.5}rem + 18px)` }}>
                    <div className="waterfall-connector" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Surplus / Deficit */}
          <div className={`alert ${surplus >= 0 ? 'alert-success' : 'alert-danger'} mt-4`}>
            {surplus >= 0
              ? <><TrendingUp size={14} /> Monthly surplus: <strong>${surplus.toFixed(0)}</strong> — Allocate to Round 5 (Taxable Brokerage)</>
              : <><AlertTriangle size={14} /> Monthly deficit: <strong>−${Math.abs(surplus).toFixed(0)}</strong> — Reduce lifestyle or restructure debt</>
            }
          </div>
        </div>

        {/* ── RIGHT PANEL: INPUTS + DTI ── */}
        <div className="flex-col gap-4">
          {/* INPUTS */}
          <div className="nb-card" style={{ padding: '1rem' }}>
            <p className="stat-label mb-4">Adjust Variables</p>

            <div className="input-group">
              <label className="nb-label">Gross Annual Income ($)</label>
              <input type="number" className="nb-input" value={grossIncome} onChange={e => setGrossIncome(Number(e.target.value))} step={1000} />
            </div>

            <div className="input-group">
              <label className="nb-label">State Income Tax (%)</label>
              <div className="flex items-center gap-2">
                <input type="range" min={0} max={13} step={0.5} value={stateTax} onChange={e => setStateTax(parseFloat(e.target.value))} className="nb-slider flex-1" />
                <span className="font-mono text-sm text-amber">{stateTax.toFixed(1)}%</span>
              </div>
            </div>

            <div className="input-group">
              <label className="nb-label">Annual Housing Costs ($)</label>
              <input type="number" className="nb-input" value={housing} onChange={e => setHousing(Number(e.target.value))} step={500} />
            </div>

            <div className="input-group">
              <label className="nb-label">Other Annual Debt Payments ($)</label>
              <input type="number" className="nb-input" value={otherDebt} onChange={e => setOtherDebt(Number(e.target.value))} step={500} />
            </div>

            <div className="input-group">
              <label className="nb-label">401(k) Contribution (%)</label>
              <div className="flex items-center gap-2">
                <input type="range" min={0} max={25} step={0.5} value={k401Pct} onChange={e => setK401Pct(parseFloat(e.target.value))} className="nb-slider flex-1" />
                <span className="font-mono text-sm text-violet">{k401Pct.toFixed(1)}%</span>
              </div>
            </div>

            <div className="input-group">
              <label className="nb-label">IRA Annual Contribution ($)</label>
              <input type="number" className="nb-input" value={iraAnnual} onChange={e => setIraAnnual(Number(e.target.value))} step={100} max={7000} />
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="nb-label">Taxable Brokerage ($/mo)</label>
              <input type="number" className="nb-input" value={brokerage} onChange={e => setBrokerage(Number(e.target.value))} step={50} />
            </div>
          </div>

          {/* DTI MONITOR */}
          <div className="nb-card" style={{ padding: '1rem' }}>
            <p className="stat-label mb-3">DTI Monitor (Lender View)</p>
            {[
              { label: 'Front-End (Housing)', value: frontEndDTI, warn: 28, max: 50 },
              { label: 'Back-End (All Debt)', value: backEndDTI, warn: 36, max: 50 },
            ].map(m => (
              <div key={m.label} className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{m.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono" style={{ fontWeight: 700, fontSize: '0.9rem', color: m.value > m.warn ? 'var(--accent-red)' : 'var(--accent-electric)' }}>
                      {m.value.toFixed(1)}%
                    </span>
                    <span className="badge" style={{ fontSize: '0.6rem', ...(m.value <= m.warn ? { background: 'var(--accent-electric-dim)', color: 'var(--accent-electric)', borderColor: 'var(--accent-electric)' } : { background: 'var(--accent-red-dim)', color: 'var(--accent-red)', borderColor: 'var(--accent-red)' }) }}>
                      {m.value <= m.warn ? `≤${m.warn}% ✓` : `>${m.warn}% ✗`}
                    </span>
                  </div>
                </div>
                <div className="progress-track" style={{ height: 10 }}>
                  <div className="progress-fill" style={{ width: `${Math.min(100, (m.value / m.max) * 100)}%`, background: m.value > m.warn ? 'var(--accent-red)' : 'var(--accent-electric)' }} />
                </div>
                {/* Threshold marker (visual line at warn%) */}
                <div style={{ position: 'relative', height: 10, marginTop: -10 }}>
                  <div style={{ position: 'absolute', left: `${(m.warn / m.max) * 100}%`, top: 0, width: 2, height: '100%', background: 'var(--accent-amber)', opacity: 0.7 }} />
                </div>
                <div className="flex justify-between mt-1" style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  <span>0%</span>
                  <span style={{ color: 'var(--accent-amber)' }}>Threshold: {m.warn}%</span>
                  <span>{m.max}%</span>
                </div>
              </div>
            ))}
          </div>

          {/* COMPOSITION CHART (mini) */}
          <div className="nb-card" style={{ padding: '1rem' }}>
            <p className="stat-label mb-3">Monthly Allocation</p>
            <div style={{ height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={compositionData} layout="horizontal" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 9, fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 9, fontFamily: 'var(--font-mono)' }} tickFormatter={v => `$${v}`} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="Amount" radius={0}>
                    {compositionData.map((entry, i) => (
                      <rect key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
