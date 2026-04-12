import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { PieChart, Percent, TrendingDown, DollarSign, Info, AlertTriangle, CheckCircle } from 'lucide-react';

// ──────────────────────────────────────────────────────────────────────────────
// TAX-DRAG ANALYZER — Expense Ratio × Capital Gains × Location Optimization
// ──────────────────────────────────────────────────────────────────────────────

interface AssetHolding {
  id: string;
  name: string;
  ticker: string;
  value: number;             // current market value
  expenseRatio: number;      // in %
  yieldType: 'ordinary' | 'ltcg' | 'qualified-div' | 'tax-free' | 'reit';
  currentAccount: 'taxable' | 'traditional' | 'roth';
  annualYield: number;       // %
}

const YIELD_TYPE_LABELS: Record<AssetHolding['yieldType'], string> = {
  'ordinary': 'Ordinary Income',
  'ltcg': 'Long-Term Cap. Gains',
  'qualified-div': 'Qualified Dividend',
  'tax-free': 'Tax-Exempt',
  'reit': 'REIT Distribution',
};

const ACCOUNT_LABELS: Record<AssetHolding['currentAccount'], string> = {
  taxable: 'Taxable Brokerage',
  traditional: 'Traditional IRA / 401k',
  roth: 'Roth IRA',
};

// Tax rates by yield type and account
function calcTaxDrag(
  holding: AssetHolding,
  marginalRate: number,  // federal
  ltcgRate: number,      // 0, 15, or 20%
): {
  annualTaxCost: number;
  dragPct: number;
  optimalAccount: AssetHolding['currentAccount'];
  action: 'OPTIMAL' | 'MOVE' | 'CONSIDER';
} {
  const annualIncome = holding.value * (holding.annualYield / 100);
  let effectiveTaxRate = 0;
  let optimalAccount: AssetHolding['currentAccount'] = 'taxable';

  if (holding.currentAccount === 'roth') {
    // Roth: zero tax on distributions
    effectiveTaxRate = 0;
  } else if (holding.currentAccount === 'traditional') {
    // Traditional: deferred, no current drag
    effectiveTaxRate = 0;
  } else {
    // Taxable account: apply rates
    switch (holding.yieldType) {
      case 'ordinary': effectiveTaxRate = marginalRate; optimalAccount = 'traditional'; break;
      case 'reit': effectiveTaxRate = marginalRate * 0.8; optimalAccount = 'traditional'; break; // 20% QBI deduction
      case 'ltcg': effectiveTaxRate = ltcgRate; optimalAccount = 'taxable'; break;
      case 'qualified-div': effectiveTaxRate = ltcgRate; optimalAccount = 'taxable'; break;
      case 'tax-free': effectiveTaxRate = 0; optimalAccount = 'taxable'; break;
    }
  }

  const expenseAnnual = holding.value * (holding.expenseRatio / 100);
  const taxCostAnnual = annualIncome * effectiveTaxRate;
  const annualTaxCost = taxCostAnnual + expenseAnnual;
  const dragPct = (annualTaxCost / holding.value) * 100;

  let action: 'OPTIMAL' | 'MOVE' | 'CONSIDER' = 'OPTIMAL';
  if (holding.currentAccount !== optimalAccount && holding.currentAccount === 'taxable') {
    action = taxCostAnnual > 500 ? 'MOVE' : 'CONSIDER';
  }
  if (holding.expenseRatio > 1.0) action = 'MOVE';

  return { annualTaxCost, dragPct, optimalAccount, action };
}

// 30-Year wealth erosion simulation
function simulate30YearDrag(
  startingBalance: number,
  grossReturn: number,            // %
  expenseRatio: number,           // %
  annualTaxDrag: number,          // % of balance
): { year: number; gross: number; afterDrag: number; dragCost: number }[] {
  const data = [];
  let gross = startingBalance;
  let afterDrag = startingBalance;

  for (let y = 0; y <= 30; y++) {
    data.push({
      year: y,
      gross: Math.round(gross),
      afterDrag: Math.round(afterDrag),
      dragCost: Math.round(gross - afterDrag),
    });
    gross *= (1 + grossReturn / 100);
    afterDrag *= (1 + (grossReturn - expenseRatio - annualTaxDrag) / 100);
  }
  return data;
}

const INITIAL_HOLDINGS: AssetHolding[] = [
  { id: 'h1', name: 'Corporate Bond Index', ticker: 'BND',    value: 45000, expenseRatio: 0.04, yieldType: 'ordinary',      currentAccount: 'taxable',     annualYield: 4.2 },
  { id: 'h2', name: 'Total Market ETF',      ticker: 'VTI',    value: 80000, expenseRatio: 0.03, yieldType: 'ltcg',           currentAccount: 'taxable',     annualYield: 1.5 },
  { id: 'h3', name: 'REIT Index Fund',        ticker: 'VNQ',    value: 22000, expenseRatio: 0.12, yieldType: 'reit',          currentAccount: 'taxable',     annualYield: 4.8 },
  { id: 'h4', name: 'Actively Managed Fund',  ticker: 'FXAIX',  value: 35000, expenseRatio: 0.02, yieldType: 'qualified-div', currentAccount: 'traditional', annualYield: 2.1 },
  { id: 'h5', name: 'High-Yield Bond Fund',   ticker: 'HYG',    value: 18000, expenseRatio: 0.49, yieldType: 'ordinary',      currentAccount: 'taxable',     annualYield: 6.8 },
];

export default function TaxDragAnalyzer() {
  const [holdings, setHoldings] = useState<AssetHolding[]>(INITIAL_HOLDINGS);
  const [marginalRate, setMarginalRate] = useState(24);  // %
  const [ltcgRate, setLtcgRate] = useState(15);          // %
  const [grossReturn, setGrossReturn] = useState(9.0);   // %
  const [selectedHolding, setSelectedHolding] = useState(INITIAL_HOLDINGS[0].id);

  const analyses = useMemo(() =>
    holdings.map(h => ({
      ...h,
      ...calcTaxDrag(h, marginalRate / 100, ltcgRate / 100),
    })),
    [holdings, marginalRate, ltcgRate]
  );

  const totalAUM = holdings.reduce((s, h) => s + h.value, 0);
  const totalDragAnnual = analyses.reduce((s, a) => s + a.annualTaxCost, 0);
  const totalDragPct = (totalDragAnnual / totalAUM) * 100;
  const drag30yr = totalAUM * Math.pow(1 + grossReturn / 100, 30) - totalAUM * Math.pow(1 + (grossReturn - totalDragPct) / 100, 30);

  const selected = analyses.find(a => a.id === selectedHolding) || analyses[0];

  const sim30yr = useMemo(() =>
    simulate30YearDrag(totalAUM, grossReturn, 0, totalDragPct),
    [totalAUM, grossReturn, totalDragPct]
  );

  const ACTION_COLORS = { OPTIMAL: 'var(--accent-electric)', MOVE: 'var(--accent-red)', CONSIDER: 'var(--accent-amber)' };
  const ACTION_BADGES = { OPTIMAL: 'badge-green', MOVE: 'badge-red', CONSIDER: 'badge-amber' };

  const updateHolding = (id: string, field: keyof AssetHolding, val: any) => {
    setHoldings(prev => prev.map(h => h.id === id ? { ...h, [field]: val } : h));
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: 'var(--nb-bg-3)', border: '2px solid var(--border-color)', padding: '0.65rem 0.9rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Year {label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.stroke || p.fill, margin: '2px 0' }}>
            {p.name}: <strong>${(p.value / 1000).toFixed(0)}k</strong>
          </p>
        ))}
        {payload.length >= 2 && (
          <p style={{ color: 'var(--accent-red)', borderTop: '1px solid var(--border-color)', marginTop: 4, paddingTop: 4 }}>
            Drag Loss: <strong>${((payload[0].value - payload[1].value) / 1000).toFixed(0)}k</strong>
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="flex-col gap-6">
      {/* ── TOP METRICS ── */}
      <div className="grid grid-4 gap-4">
        {[
          { label: 'Total AUM', val: `$${(totalAUM / 1000).toFixed(0)}k`, color: 'var(--accent-electric)' },
          { label: 'Annual Tax-Drag Cost', val: `$${totalDragAnnual.toFixed(0)}`, color: 'var(--accent-red)' },
          { label: 'Total Drag %', val: `${totalDragPct.toFixed(2)}%/yr`, color: totalDragPct > 1 ? 'var(--accent-red)' : 'var(--accent-amber)' },
          { label: '30-Year Wealth Erosion', val: `$${(drag30yr / 1000).toFixed(0)}k`, color: 'var(--accent-red)' },
        ].map(m => (
          <div key={m.label} className="nb-stat-card">
            <p className="stat-label">{m.label}</p>
            <p className="font-mono" style={{ fontSize: '1.5rem', fontWeight: 700, color: m.color, lineHeight: 1, marginTop: 6 }}>{m.val}</p>
          </div>
        ))}
      </div>

      {/* Tax rate controls */}
      <div className="nb-card">
        <div className="grid grid-3 gap-4">
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="nb-label">Marginal Federal Rate (%)</label>
            <div className="flex items-center gap-2">
              <input type="range" min={0} max={37} step={1} value={marginalRate} onChange={e => setMarginalRate(parseInt(e.target.value))} className="nb-slider flex-1" />
              <span className="font-mono text-sm text-amber">{marginalRate}%</span>
            </div>
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="nb-label">LTCG / Qualified Div Rate (%)</label>
            <div className="flex items-center gap-2">
              <input type="range" min={0} max={20} step={5} value={ltcgRate} onChange={e => setLtcgRate(parseInt(e.target.value))} className="nb-slider flex-1" />
              <span className="font-mono text-sm text-amber">{ltcgRate}%</span>
            </div>
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="nb-label">Expected Gross Return (%)</label>
            <div className="flex items-center gap-2">
              <input type="range" min={3} max={14} step={0.5} value={grossReturn} onChange={e => setGrossReturn(parseFloat(e.target.value))} className="nb-slider flex-1" />
              <span className="font-mono text-sm text-green">{grossReturn.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 380px', gap: '1.5rem' }}>
        {/* ── 30-YEAR EROSION CHART ── */}
        <div className="nb-card">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>30-Year Wealth Erosion</h3>
              <p className="text-xs text-muted mt-1" style={{ fontFamily: 'var(--font-mono)' }}>
                Gross portfolio vs. after total tax-drag ({totalDragPct.toFixed(2)}%/yr cost)
              </p>
            </div>
            <div className="alert alert-danger" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}>
              <TrendingDown size={12} />
              Lost: ${(drag30yr / 1000).toFixed(0)}k over 30 yrs
            </div>
          </div>
          <div style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sim30yr.filter((_, i) => i % 3 === 0)} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--nb-border)" vertical={false} />
                <XAxis dataKey="year" tickFormatter={v => `Yr${v}`} tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} width={50} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="gross" name="Gross Portfolio" fill="var(--accent-electric)" fillOpacity={0.3} />
                <Bar dataKey="afterDrag" name="After Tax-Drag" fill="var(--accent-electric)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* High drag warning */}
          {totalDragPct > 1 && (
            <div className="alert alert-danger mt-3" style={{ fontSize: '0.78rem' }}>
              <AlertTriangle size={13} />
              <div>
                <strong>High drag detected ({totalDragPct.toFixed(2)}%/yr).</strong> A 1% drag compounds to ${(totalAUM * (Math.pow(1 + grossReturn / 100, 30) - Math.pow(1 + (grossReturn - 1) / 100, 30)) / 1000).toFixed(0)}k in lost wealth over 30 years. Optimize asset location immediately.
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: LOCATION OPTIMIZATION TABLE ── */}
        <div className="flex-col gap-4">
          <div className="nb-card" style={{ padding: '1rem' }}>
            <div className="flex items-center gap-2 mb-3">
              <PieChart size={14} color="var(--accent-electric)" />
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700 }}>Location Optimizer</h3>
            </div>

            <div className="flex-col gap-2">
              {analyses.map(a => (
                <div
                  key={a.id}
                  className="cursor-pointer"
                  onClick={() => setSelectedHolding(a.id)}
                  style={{
                    padding: '0.6rem 0.75rem',
                    border: `2px solid ${selectedHolding === a.id ? ACTION_COLORS[a.action] : 'var(--border-color)'}`,
                    background: selectedHolding === a.id ? ACTION_COLORS[a.action] + '15' : 'var(--nb-surface)',
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    transition: 'var(--transition-fast)',
                    boxShadow: selectedHolding === a.id ? `3px 3px 0px ${ACTION_COLORS[a.action]}` : 'none',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.78rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {a.ticker} — {a.name}
                    </div>
                    <div className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 1 }}>
                      ${a.value.toLocaleString()} | Drag: {a.dragPct.toFixed(2)}%/yr
                    </div>
                  </div>
                  <span className={`badge ${ACTION_BADGES[a.action]}`} style={{ fontSize: '0.6rem', flexShrink: 0 }}>
                    {a.action}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* SELECTED HOLDING DETAIL */}
          {selected && (
            <div className="nb-card" style={{ padding: '1rem', borderLeft: `3px solid ${ACTION_COLORS[selected.action]}` }}>
              <div className="flex justify-between items-center mb-3">
                <h3 style={{ fontSize: '0.85rem', fontWeight: 700 }}>{selected.ticker}</h3>
                <span className={`badge ${ACTION_BADGES[selected.action]}`}>{selected.action}</span>
              </div>

              {[
                { k: 'Yield Type', v: YIELD_TYPE_LABELS[selected.yieldType] },
                { k: 'Current Account', v: ACCOUNT_LABELS[selected.currentAccount] },
                { k: 'Optimal Account', v: ACCOUNT_LABELS[selected.optimalAccount] },
                { k: 'Expense Ratio', v: `${selected.expenseRatio}%${selected.expenseRatio > 1 ? ' ⚠ HIGH' : ''}` },
                { k: 'Annual Yield', v: `${selected.annualYield}%` },
                { k: 'Annual Tax Cost', v: `$${selected.annualTaxCost.toFixed(0)}` },
                { k: 'Total Drag', v: `${selected.dragPct.toFixed(3)}%/yr` },
              ].map(r => (
                <div key={r.k} className="flex justify-between items-center py-1" style={{ borderBottom: '1px solid var(--nb-border)', fontSize: '0.76rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{r.k}</span>
                  <span className="font-mono" style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{r.v}</span>
                </div>
              ))}

              {/* Action directive */}
              <div className={`mt-3 flex items-start gap-2 p-3`} style={{
                background: ACTION_COLORS[selected.action] + '15',
                border: `2px solid ${ACTION_COLORS[selected.action]}`,
                fontSize: '0.76rem', color: ACTION_COLORS[selected.action],
              }}>
                {selected.action === 'OPTIMAL'
                  ? <><CheckCircle size={12} style={{ flexShrink: 0, marginTop: 2 }} /> <span>Position is optimally located. No action required.</span></>
                  : selected.action === 'MOVE'
                    ? <><AlertTriangle size={12} style={{ flexShrink: 0, marginTop: 2 }} /> <span><strong>ACTION:</strong> Move {selected.ticker} ({YIELD_TYPE_LABELS[selected.yieldType]}) from {ACCOUNT_LABELS[selected.currentAccount]} → {ACCOUNT_LABELS[selected.optimalAccount]}. Saves ${selected.annualTaxCost.toFixed(0)}/yr in drag.</span></>
                    : <><Info size={12} style={{ flexShrink: 0, marginTop: 2 }} /> <span><strong>CONSIDER:</strong> Relocation to {ACCOUNT_LABELS[selected.optimalAccount]} may reduce drag modestly.</span></>
                }
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── LOCATION OPTIMIZATION TABLE ── */}
      <div className="nb-card">
        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem' }}>Full Asset Location Matrix</h3>
        <table className="nb-table">
          <thead>
            <tr>
              <th>Asset</th>
              <th>Yield Type</th>
              <th>Current Account</th>
              <th>Optimal Account</th>
              <th>ER</th>
              <th>Annual Tax Cost</th>
              <th>Drag %/yr</th>
              <th>Directive</th>
            </tr>
          </thead>
          <tbody>
            {analyses.map(a => (
              <tr key={a.id} style={{ background: a.action === 'MOVE' ? 'var(--accent-red-dim)' : undefined }}>
                <td style={{ fontWeight: 700, fontSize: '0.82rem' }}>{a.ticker} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>— {a.name}</span></td>
                <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{YIELD_TYPE_LABELS[a.yieldType]}</td>
                <td style={{ fontSize: '0.78rem' }}>{ACCOUNT_LABELS[a.currentAccount]}</td>
                <td style={{ fontSize: '0.78rem', color: a.optimalAccount !== a.currentAccount ? 'var(--accent-amber)' : 'var(--accent-electric)', fontWeight: 600 }}>
                  {ACCOUNT_LABELS[a.optimalAccount]}
                </td>
                <td className="font-mono" style={{ color: a.expenseRatio > 1 ? 'var(--accent-red)' : 'var(--text-secondary)', fontSize: '0.78rem' }}>
                  {a.expenseRatio}%
                </td>
                <td className="font-mono" style={{ color: 'var(--accent-red)', fontWeight: 600 }}>${a.annualTaxCost.toFixed(0)}</td>
                <td className="font-mono" style={{ color: a.dragPct > 1 ? 'var(--accent-red)' : 'var(--accent-amber)' }}>{a.dragPct.toFixed(2)}%</td>
                <td><span className={`badge ${ACTION_BADGES[a.action]}`}>{a.action}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
