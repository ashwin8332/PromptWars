import { useState, useMemo } from 'react';
import { ArrowRight, ArrowLeft, AlertTriangle, CheckCircle, Percent, Plus, Trash2, Calculator, TrendingUp } from 'lucide-react';

// ──────────────────────────────────────────────────────────────────────────────
// DEBT ARBITRAGE ENGINE
// Formula: Effective After-Tax Return = Expected Return × (1 - Marginal Tax Rate)
// Decision: If Effective Return > Debt Rate → INVEST; else → PAY DEBT
// ──────────────────────────────────────────────────────────────────────────────

const FEDERAL_TAX_BRACKETS = [
  { max: 11600,   rate: 0.10, label: '10%' },
  { max: 47150,   rate: 0.12, label: '12%' },
  { max: 100525,  rate: 0.22, label: '22%' },
  { max: 191950,  rate: 0.24, label: '24%' },
  { max: 243725,  rate: 0.32, label: '32%' },
  { max: 609350,  rate: 0.35, label: '35%' },
  { max: Infinity, rate: 0.37, label: '37%' },
];

function getMarginalRate(income: number): number {
  const bracket = FEDERAL_TAX_BRACKETS.find(b => income <= b.max);
  return bracket ? bracket.rate : 0.37;
}

interface Debt {
  id: string;
  name: string;
  rate: number;    // %
  balance: number;
  type: 'student' | 'auto' | 'credit' | 'mortgage' | 'personal' | 'business';
}

interface Investment {
  id: string;
  name: string;
  expectedReturn: number;    // % gross
  expenseRatio: number;      // %
  type: 'index' | 'etf' | 'bond' | 'reit' | 'hysa' | 'cd';
}

const TYPE_COLORS: Record<Debt['type'] | Investment['type'], string> = {
  student: 'var(--accent-violet)', auto: 'var(--accent-blue)', credit: 'var(--accent-red)',
  mortgage: 'var(--accent-amber)', personal: 'var(--accent-amber)', business: 'var(--accent-cyan)',
  index: 'var(--accent-electric)', etf: 'var(--accent-electric)', bond: 'var(--accent-blue)',
  reit: 'var(--accent-violet)', hysa: 'var(--accent-cyan)', cd: 'var(--accent-blue)',
};

const DEFAULT_DEBTS: Debt[] = [
  { id: 'd1', name: 'Federal Student Loan', rate: 6.80, balance: 28500, type: 'student' },
  { id: 'd2', name: 'Tesla Auto Finance',   rate: 7.20, balance: 21000, type: 'auto' },
  { id: 'd3', name: 'Chase Credit Card',    rate: 22.90, balance: 4200, type: 'credit' },
];

const DEFAULT_INVESTMENTS: Investment[] = [
  { id: 'i1', name: 'VTI (Total Market ETF)', expectedReturn: 9.50, expenseRatio: 0.03, type: 'etf' },
  { id: 'i2', name: 'Ally Bank HYSA',          expectedReturn: 5.00, expenseRatio: 0.00, type: 'hysa' },
  { id: 'i3', name: 'BND (Bond Index)',         expectedReturn: 4.20, expenseRatio: 0.03, type: 'bond' },
];

function ArbitrageCard({ debt, investment, marginalTaxRate, stateTaxRate }: {
  debt: Debt;
  investment: Investment;
  marginalTaxRate: number;
  stateTaxRate: number;
}) {
  const totalTaxRate = Math.min(marginalTaxRate + stateTaxRate, 0.55);
  // Net investment return after fees and tax-drag
  const netInvestReturn = (investment.expectedReturn - investment.expenseRatio) * (1 - totalTaxRate);
  const delta = netInvestReturn - debt.rate;
  const isInvest = delta > 0;
  const isHighPriority = debt.rate > 15;

  // 10-year wealth comparison
  const monthlyExtra = 500;
  const debtPayoff = (debt.balance / (monthlyExtra * 12)) * 12; // rough months
  const invested10yr = monthlyExtra * 12 * Math.pow(1 + netInvestReturn / 100, 10);
  const debtPaid10yr = monthlyExtra * 12 * 10;

  return (
    <div className={`nb-card ${isHighPriority ? 'accent-red' : isInvest ? 'accent-green' : 'accent-blue'}`}>
      <div className="flex justify-between items-start mb-4">
        <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>{debt.name} ↔ {investment.name}</h4>
        <span className={`badge ${isHighPriority ? 'badge-red' : isInvest ? 'badge-green' : 'badge-blue'}`}>
          {isHighPriority ? 'CRITICAL: PAY NOW' : isInvest ? 'INVEST' : 'PAY DEBT'}
        </span>
      </div>

      {/* VS Visual */}
      <div className="flex items-center justify-between gap-2 mb-4">
        {/* Debt Side */}
        <div style={{ flex: 1, background: 'var(--accent-red-dim)', border: '2px solid var(--accent-red)', padding: '0.75rem', textAlign: 'center' }}>
          <p className="text-xs" style={{ color: 'var(--accent-red)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.35rem' }}>
            Guaranteed Cost
          </p>
          <div className="flex items-center justify-center gap-1">
            <span className="font-mono" style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent-red)', lineHeight: 1 }}>
              {debt.rate.toFixed(1)}
            </span>
            <Percent size={14} color="var(--accent-red)" style={{ marginTop: 4 }} />
          </div>
          <p className="text-xs text-muted mt-1">Paying $0 = losing at {debt.rate}% guaranteed</p>
          <p className="text-xs text-muted" style={{ fontFamily: 'var(--font-mono)' }}>Balance: ${debt.balance.toLocaleString()}</p>
        </div>

        {/* Arrow */}
        <div className="flex flex-col items-center gap-1">
          {isInvest
            ? <ArrowRight size={20} color="var(--accent-electric)" />
            : <ArrowLeft size={20} color="var(--accent-blue)" />
          }
          <span className="text-xs text-muted">vs</span>
        </div>

        {/* Investment Side */}
        <div style={{ flex: 1, background: 'var(--accent-electric-dim)', border: '2px solid var(--accent-electric)', padding: '0.75rem', textAlign: 'center' }}>
          <p className="text-xs" style={{ color: 'var(--accent-electric)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.35rem' }}>
            After Tax-Drag Return
          </p>
          <div className="flex items-center justify-center gap-1">
            <span className="font-mono" style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent-electric)', lineHeight: 1 }}>
              {netInvestReturn.toFixed(2)}
            </span>
            <Percent size={14} color="var(--accent-electric)" style={{ marginTop: 4 }} />
          </div>
          <p className="text-xs text-muted mt-1">Gross {investment.expectedReturn}% − Tax {(totalTaxRate * 100).toFixed(0)}% − Fee {investment.expenseRatio}%</p>
          <p className="text-xs text-muted" style={{ fontFamily: 'var(--font-mono)' }}>ER: {investment.expenseRatio}%</p>
        </div>
      </div>

      {/* Mathematical verdict */}
      <div className={`verdict-banner ${isHighPriority ? 'critical' : isInvest ? 'invest' : 'pay-debt'}`}>
        <div className="flex-1">
          <p style={{ fontWeight: 700, fontSize: '0.8rem' }}>ALGORITHM DIRECTIVE:</p>
          <p style={{ fontSize: '0.78rem', opacity: 0.85, marginTop: 2 }}>
            {isHighPriority
              ? `CRITICAL: ${debt.rate.toFixed(1)}% rate is above all market expected returns. Eliminate this debt immediately.`
              : isInvest
                ? `Mathematical edge: +${delta.toFixed(2)}% advantage. Each $1 grows ${delta.toFixed(2)}¢ more per year when invested vs. debt payoff.`
                : `Guaranteed ROI of paying debt (${debt.rate.toFixed(1)}%) exceeds market return (${netInvestReturn.toFixed(2)}%). Pay debt.`
            }
          </p>
        </div>
        <div style={{ marginLeft: '1rem', flexShrink: 0 }}>
          {isHighPriority ? <AlertTriangle size={20} /> : isInvest ? <TrendingUp size={20} /> : <CheckCircle size={20} />}
        </div>
      </div>
    </div>
  );
}

export default function Arbitrage() {
  const [debts, setDebts] = useState<Debt[]>(DEFAULT_DEBTS);
  const [investments, setInvestments] = useState<Investment[]>(DEFAULT_INVESTMENTS);
  const [grossIncome, setGrossIncome] = useState(95000);
  const [stateTaxRate, setStateTaxRate] = useState(5.0);
  const [selectedDebt, setSelectedDebt] = useState<string>(DEFAULT_DEBTS[0].id);
  const [selectedInv, setSelectedInv] = useState<string>(DEFAULT_INVESTMENTS[0].id);

  const marginalRate = useMemo(() => getMarginalRate(grossIncome), [grossIncome]);
  const effectiveTotalTax = marginalRate + stateTaxRate / 100;

  const debt = debts.find(d => d.id === selectedDebt) || debts[0];
  const investment = investments.find(i => i.id === selectedInv) || investments[0];

  // All comparisons (cross-product)
  const allPairs = useMemo(() =>
    debts.flatMap(d =>
      investments.map(inv => {
        const net = (inv.expectedReturn - inv.expenseRatio) * (1 - effectiveTotalTax);
        const delta = net - d.rate;
        return { debt: d, investment: inv, net, delta, verdict: delta > 0 ? 'INVEST' : 'PAY_DEBT' };
      })
    ),
    [debts, investments, effectiveTotalTax]
  );

  // Best action
  const bestAction = allPairs.sort((a, b) => {
    // Prioritize eliminating debts > 15%
    if (a.debt.rate > 15) return -1;
    if (b.debt.rate > 15) return 1;
    return Math.abs(b.delta) - Math.abs(a.delta);
  })[0];

  return (
    <div className="flex-col gap-6">

      {/* ── TAX SETUP ── */}
      <div className="nb-card">
        <div className="flex items-center gap-2 mb-4">
          <Calculator size={16} color="var(--accent-electric)" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Tax Profile</h3>
          <span className="badge badge-violet ml-auto">Federal Brackets 2024</span>
        </div>
        <div className="grid grid-3 gap-4">
          <div className="input-group">
            <label className="nb-label">Gross Annual Income</label>
            <input type="number" className="nb-input" value={grossIncome} onChange={e => setGrossIncome(Number(e.target.value))} step={5000} />
          </div>
          <div className="input-group">
            <label className="nb-label">State Tax Rate (%)</label>
            <div className="flex items-center gap-2">
              <input type="range" min={0} max={13} step={0.1} value={stateTaxRate} onChange={e => setStateTaxRate(parseFloat(e.target.value))} className="nb-slider flex-1" />
              <span className="font-mono text-sm text-amber">{stateTaxRate.toFixed(1)}%</span>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="nb-stat-card flex-1" style={{ padding: '0.75rem' }}>
              <p className="stat-label">Marginal Federal Rate</p>
              <p className="font-mono" style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent-amber)' }}>
                {(marginalRate * 100).toFixed(0)}%
              </p>
            </div>
            <div className="nb-stat-card flex-1" style={{ padding: '0.75rem' }}>
              <p className="stat-label">Effective Tax-Drag</p>
              <p className="font-mono" style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent-red)' }}>
                {(effectiveTotalTax * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        {/* Formula display */}
        <div className="alert alert-info mt-4" style={{ fontSize: '0.78rem' }}>
          <div style={{ fontFamily: 'var(--font-mono)' }}>
            <strong>Fiduciary Formula:</strong> Effective Return = (Gross Return − Expense Ratio) × (1 − {(effectiveTotalTax * 100).toFixed(1)}%)
          </div>
        </div>
      </div>

      {/* ── TOP RECOMMENDATION ── */}
      <div className="nb-card" style={{ borderLeft: '4px solid var(--accent-electric)', background: 'var(--accent-electric-dim)' }}>
        <div className="flex items-center gap-3">
          <TrendingUp size={18} color="var(--accent-electric)" />
          <div>
            <p style={{ fontSize: '0.72rem', color: 'var(--accent-electric)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Optimal Capital Directive (Next $1.00)
            </p>
            <p style={{ fontSize: '0.9rem', fontWeight: 700, marginTop: 2 }}>
              {bestAction.debt.rate > 15
                ? `CRITICAL: Eliminate ${bestAction.debt.name} (${bestAction.debt.rate}% guaranteed loss rate)`
                : bestAction.verdict === 'INVEST'
                  ? `Invest in ${bestAction.investment.name} — net edge: +${bestAction.delta.toFixed(2)}% over ${bestAction.debt.name}`
                  : `Pay down ${bestAction.debt.name} — guaranteed ${bestAction.debt.rate}% ROI beats market`
              }
            </p>
          </div>
          <span className={`badge ml-auto ${bestAction.verdict === 'INVEST' ? 'badge-green' : 'badge-blue'}`}>
            {bestAction.verdict === 'INVEST' ? 'INVEST FIRST' : 'PAY DEBT'}
          </span>
        </div>
      </div>

      {/* ── DEBT & INVESTMENT SELECTORS ── */}
      <div className="grid grid-2 gap-4">
        <div className="nb-card" style={{ padding: '1rem' }}>
          <p className="stat-label mb-3">Your Debts</p>
          <div className="flex-col gap-2">
            {debts.map(d => (
              <div
                key={d.id}
                onClick={() => setSelectedDebt(d.id)}
                className="cursor-pointer"
                style={{
                  padding: '0.65rem 0.85rem',
                  border: `2px solid ${selectedDebt === d.id ? 'var(--accent-red)' : 'var(--border-color)'}`,
                  background: selectedDebt === d.id ? 'var(--accent-red-dim)' : 'var(--nb-surface)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  boxShadow: selectedDebt === d.id ? 'var(--shadow-red)' : 'none',
                  transition: 'var(--transition-fast)',
                }}
              >
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.82rem' }}>{d.name}</p>
                  <p className="font-mono text-xs text-muted">${d.balance.toLocaleString()}</p>
                </div>
                <span className="font-mono" style={{ color: 'var(--accent-red)', fontWeight: 700, fontSize: '1rem' }}>
                  {d.rate}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="nb-card" style={{ padding: '1rem' }}>
          <p className="stat-label mb-3">Investment Vehicles</p>
          <div className="flex-col gap-2">
            {investments.map(inv => {
              const net = (inv.expectedReturn - inv.expenseRatio) * (1 - effectiveTotalTax);
              return (
                <div
                  key={inv.id}
                  onClick={() => setSelectedInv(inv.id)}
                  className="cursor-pointer"
                  style={{
                    padding: '0.65rem 0.85rem',
                    border: `2px solid ${selectedInv === inv.id ? 'var(--accent-electric)' : 'var(--border-color)'}`,
                    background: selectedInv === inv.id ? 'var(--accent-electric-dim)' : 'var(--nb-surface)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    boxShadow: selectedInv === inv.id ? 'var(--shadow-electric)' : 'none',
                    transition: 'var(--transition-fast)',
                  }}
                >
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.82rem' }}>{inv.name}</p>
                    <p className="font-mono text-xs text-muted">ER: {inv.expenseRatio}% | Net: {net.toFixed(2)}%</p>
                  </div>
                  <span className="font-mono" style={{ color: 'var(--accent-electric)', fontWeight: 700, fontSize: '1rem' }}>
                    {inv.expectedReturn}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── ARBITRAGE CARD ── */}
      <ArbitrageCard
        debt={debt}
        investment={investment}
        marginalTaxRate={marginalRate}
        stateTaxRate={stateTaxRate / 100}
      />

      {/* ── ALL PAIRS TABLE ── */}
      <div className="nb-card" style={{ padding: '1.25rem' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem' }}>
          Matrix: All Debt vs. Investment Combinations
        </h3>
        <table className="nb-table">
          <thead>
            <tr>
              <th>Debt</th>
              <th>Investment</th>
              <th>Debt Rate</th>
              <th>Net Return (After Tax)</th>
              <th>Delta (Edge)</th>
              <th>Verdict</th>
            </tr>
          </thead>
          <tbody>
            {allPairs.map((pair, i) => (
              <tr key={i} style={{ opacity: pair.debt.rate > 15 ? 1 : undefined }}>
                <td style={{ fontWeight: 600, fontSize: '0.82rem' }}>{pair.debt.name}</td>
                <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{pair.investment.name}</td>
                <td className="font-mono" style={{ color: 'var(--accent-red)', fontWeight: 700 }}>{pair.debt.rate.toFixed(1)}%</td>
                <td className="font-mono" style={{ color: 'var(--accent-electric)', fontWeight: 700 }}>{pair.net.toFixed(2)}%</td>
                <td className="font-mono" style={{ color: pair.delta > 0 ? 'var(--accent-electric)' : 'var(--accent-red)', fontWeight: 700 }}>
                  {pair.delta > 0 ? '+' : ''}{pair.delta.toFixed(2)}%
                </td>
                <td>
                  <span className={`badge ${pair.debt.rate > 15 ? 'badge-red' : pair.verdict === 'INVEST' ? 'badge-green' : 'badge-blue'}`}>
                    {pair.debt.rate > 15 ? 'CRITICAL' : pair.verdict}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
