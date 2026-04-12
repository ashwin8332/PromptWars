import { useState, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { BookOpen, Calculator, PiggyBank, Briefcase, ChevronRight, TrendingUp, Zap } from 'lucide-react';

// ──────────────────────────────────────────────────────────────────────────────
// LITERACY ASSISTANT — From First Principles to Advanced Concepts
// ──────────────────────────────────────────────────────────────────────────────

type ConceptKey = 'budgeting' | 'saving' | 'investing' | 'compound' | 'riskreturn';

interface Concept {
  id: ConceptKey;
  label: string;
  icon: React.ReactNode;
  color: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
}

const CONCEPTS: Concept[] = [
  { id: 'budgeting', label: 'Budgeting Basics', icon: <Calculator size={16} />, color: 'var(--accent-blue)', level: 'Beginner' },
  { id: 'saving', label: 'Emergency Funds', icon: <PiggyBank size={16} />, color: 'var(--accent-electric)', level: 'Beginner' },
  { id: 'investing', label: 'Market Vehicles', icon: <Briefcase size={16} />, color: 'var(--accent-violet)', level: 'Intermediate' },
  { id: 'compound', label: 'Compound Interest', icon: <TrendingUp size={16} />, color: 'var(--accent-amber)', level: 'Intermediate' },
  { id: 'riskreturn', label: 'Risk-Return Spectrum', icon: <Zap size={16} />, color: 'var(--accent-red)', level: 'Advanced' },
];

export default function LiteracyAssistant() {
  const [activeConcept, setActiveConcept] = useState<ConceptKey>('budgeting');
  const [income, setIncome] = useState(5000);
  const [monthly, setMonthly] = useState(500);
  const [years, setYears] = useState(20);
  const [returnRate, setReturnRate] = useState(7.0);
  const [inflation, setInflation] = useState(3.0);

  const concept = CONCEPTS.find(c => c.id === activeConcept)!;

  // Compound interest calculation
  const projectionData = useMemo(() => {
    const data = [];
    let nominal = 0;
    let real = 0;
    const realRate = (returnRate - inflation) / 100;
    const nomRate = returnRate / 100;

    for (let y = 0; y <= years; y++) {
      data.push({ year: y, nominal: Math.round(nominal), real: Math.round(real), contributed: monthly * 12 * y });
      nominal = (nominal + monthly * 12) * (1 + nomRate);
      real = (real + monthly * 12) * (1 + realRate);
    }
    return data;
  }, [monthly, years, returnRate, inflation]);

  const finalNominal = projectionData[years]?.nominal ?? 0;
  const finalReal = projectionData[years]?.real ?? 0;
  const totalContributed = monthly * 12 * years;
  const totalInterest = finalNominal - totalContributed;

  const LEVEL_COLORS = { Beginner: 'var(--accent-electric)', Intermediate: 'var(--accent-amber)', Advanced: 'var(--accent-red)' };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: 'var(--nb-bg-3)', border: '2px solid var(--border-color)', padding: '0.65rem 0.9rem', fontFamily: 'var(--font-mono)', fontSize: '0.74rem' }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: 4 }}>Year {label}</p>
        {payload.map((p: any) => <p key={p.name} style={{ color: p.stroke }}>{p.name}: <strong>${(p.value / 1000).toFixed(1)}k</strong></p>)}
      </div>
    );
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '1.5rem' }}>
      {/* ── CONCEPT NAVIGATOR ── */}
      <div className="flex-col gap-2">
        <p className="stat-label mb-2">Curriculum</p>
        {CONCEPTS.map(c => (
          <div
            key={c.id}
            className="cursor-pointer"
            onClick={() => setActiveConcept(c.id)}
            style={{
              padding: '0.65rem 0.85rem',
              border: `2px solid ${activeConcept === c.id ? c.color : 'var(--border-color)'}`,
              background: activeConcept === c.id ? c.color + '18' : 'var(--nb-surface)',
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              boxShadow: activeConcept === c.id ? `3px 3px 0px ${c.color}` : 'var(--shadow-sm)',
              transition: 'var(--transition-fast)',
            }}
          >
            <div style={{ color: c.color }}>{c.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-primary)' }}>{c.label}</div>
              <div style={{ fontSize: '0.63rem', color: LEVEL_COLORS[c.level], fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 1 }}>
                {c.level}
              </div>
            </div>
            {activeConcept === c.id && <ChevronRight size={14} color={c.color} />}
          </div>
        ))}

        {/* Level guide */}
        <div className="nb-card mt-4" style={{ padding: '0.85rem' }}>
          <p className="stat-label mb-2">Difficulty Levels</p>
          {Object.entries(LEVEL_COLORS).map(([level, color]) => (
            <div key={level} className="flex items-center gap-2 mb-1">
              <div style={{ width: 8, height: 8, background: color, flexShrink: 0 }} />
              <span style={{ fontSize: '0.73rem', color: 'var(--text-secondary)' }}>{level}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── CONTENT AREA ── */}
      <div className="animate-fade-in" key={activeConcept}>

        {/* BUDGETING */}
        {activeConcept === 'budgeting' && (
          <div className="flex-col gap-4">
            <div className="nb-card accent-blue">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen size={16} color="var(--accent-blue)" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>The 50/30/20 Framework</h3>
                <span className="badge badge-blue ml-auto">Beginner</span>
              </div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                Budgeting is not restriction — it's <strong style={{ color: 'var(--text-primary)' }}>intentional capital allocation</strong>.
                The 50/30/20 rule is your first framework: categorize every dollar of net income
                before you spend it. This is the foundation of all cash flow management.
              </p>
            </div>

            <div className="input-group">
              <label className="nb-label">Monthly Net Income After Tax ($)</label>
              <input type="number" className="nb-input" value={income} onChange={e => setIncome(Number(e.target.value))} step={100} style={{ maxWidth: 300 }} />
            </div>

            <div className="grid grid-3 gap-4">
              {[
                { pct: 50, label: 'Needs', color: 'var(--accent-blue)', desc: 'Housing, food, utilities, insurance, minimum debt payments. Non-negotiable survivability costs.' },
                { pct: 30, label: 'Wants', color: 'var(--accent-amber)', desc: 'Dining out, hobbies, subscriptions, travel. Comfort spending that requires deliberate control.' },
                { pct: 20, label: 'Wealth-Building', color: 'var(--accent-electric)', desc: 'Emergency fund, retirement accounts, extra debt payments, investments. This is your future self.' },
              ].map(b => (
                <div key={b.label} className="nb-card" style={{ borderTop: `3px solid ${b.color}`, textAlign: 'center' }}>
                  <div className="font-mono" style={{ fontSize: '2rem', fontWeight: 700, color: b.color, lineHeight: 1 }}>{b.pct}%</div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', marginTop: 4, marginBottom: 8 }}>{b.label}</div>
                  <div className="font-mono" style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                    ${(income * b.pct / 100).toLocaleString()}
                  </div>
                  <p style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>{b.desc}</p>
                  <div className="progress-track mt-3">
                    <div className="progress-fill" style={{ width: `${b.pct}%`, background: b.color }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="alert alert-info">
              <Zap size={14} />
              <div>
                <strong>Professional Upgrade:</strong> Once you master 50/30/20, advance to the <strong>Cash Flow Waterfall</strong> module — it replaces "categories" with a <em>priority-based flow</em> that mirrors what professional wealth managers actually use.
              </div>
            </div>
          </div>
        )}

        {/* EMERGENCY FUNDS */}
        {activeConcept === 'saving' && (
          <div className="flex-col gap-4">
            <div className="nb-card accent-green">
              <div className="flex items-center gap-2 mb-2">
                <PiggyBank size={16} color="var(--accent-electric)" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Liquidity Architecture: The Emergency Fund</h3>
                <span className="badge badge-green ml-auto">Beginner</span>
              </div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                Before any investment, professionals build a <strong style={{ color: 'var(--text-primary)' }}>Liquidity Buffer</strong> — 3 to 6 months of essential expenses in a liquid, FDIC-insured account.
                This is your "financial immune system." Without it, any unexpected event forces you to liquidate investments at potentially the worst time.
              </p>
            </div>

            <div className="grid grid-3 gap-4">
              {[
                { account: 'High-Yield Savings (HYSA)', apr: '4.5-5.0%', pros: 'FDIC insured, instant access, earns real yield', cons: 'Slightly lower than CD rates', rec: true },
                { account: 'Money Market Fund', apr: '4.8-5.2%', pros: 'Slightly higher yield, check-writing available', cons: 'Not FDIC insured (SIPC only)', rec: false },
                { account: 'T-Bills (3-month)', apr: '5.0-5.3%', pros: 'Federal guarantee, State tax-exempt', cons: 'Slightly less liquid (secondary market)', rec: false },
              ].map(a => (
                <div key={a.account} className="nb-card" style={{ borderLeft: `3px solid ${a.rec ? 'var(--accent-electric)' : 'var(--border-color)'}` }}>
                  <div className="flex justify-between items-start mb-2">
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, lineHeight: 1.3 }}>{a.account}</h4>
                    {a.rec && <span className="badge badge-green">Recommended</span>}
                  </div>
                  <div className="font-mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-electric)', marginBottom: 8 }}>{a.apr} APY</div>
                  <p style={{ fontSize: '0.73rem', color: 'var(--accent-electric)', marginBottom: 4 }}>✓ {a.pros}</p>
                  <p style={{ fontSize: '0.73rem', color: 'var(--accent-amber)' }}>⚠ {a.cons}</p>
                </div>
              ))}
            </div>

            <div className="alert alert-warning">
              <span style={{ fontSize: '0.8rem' }}>
                <strong>Why NOT the stock market?</strong> A 2008-level crash coinciding with job loss means you sell equities at the worst price AND lose income simultaneously — a compound catastrophe. Your emergency fund must be <em>uncorrelated</em> with your employment risk.
              </span>
            </div>
          </div>
        )}

        {/* MARKET VEHICLES */}
        {activeConcept === 'investing' && (
          <div className="flex-col gap-4">
            <div className="nb-card accent-violet">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase size={16} color="var(--accent-violet)" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Investment Vehicle Taxonomy</h3>
                <span className="badge badge-violet ml-auto">Intermediate</span>
              </div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                Not all "investing" is the same. Understanding the <strong style={{ color: 'var(--text-primary)' }}>fee structure, tax treatment, and risk profile</strong> of each vehicle is what separates portfolio managers from passive savers.
              </p>
            </div>

            <table className="nb-table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Typical Return</th>
                  <th>Tax Treatment</th>
                  <th>Typical Expense</th>
                  <th>Best Account</th>
                  <th>Professional Rating</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { v: 'Index ETF (VTI)', ret: '8-10%', tax: 'LTCG', er: '0.03-0.05%', acct: 'Taxable OK', rating: '★★★★★', ratingColor: 'var(--accent-electric)' },
                  { v: 'Actively Managed Fund', ret: '6-8%', tax: 'Ordinary', er: '0.5-1.5%', acct: 'Tax-Deferred', rating: '★★☆☆☆', ratingColor: 'var(--accent-amber)' },
                  { v: 'Corporate Bonds', ret: '4-6%', tax: 'Ordinary', er: '0.03-0.2%', acct: 'IRA / 401k', rating: '★★★☆☆', ratingColor: 'var(--accent-blue)' },
                  { v: 'Municipal Bonds', ret: '3-4% (tax-free)', tax: 'Tax-Exempt', er: '0.07-0.3%', acct: 'Taxable', rating: '★★★★☆', ratingColor: 'var(--accent-electric)' },
                  { v: 'REIT Index (VNQ)', ret: '7-9%', tax: 'Ordinary (20% QBI)', er: '0.12%', acct: 'IRA / 401k', rating: '★★★★☆', ratingColor: 'var(--accent-electric)' },
                  { v: 'High-Yield Bonds', ret: '5-7%', tax: 'Ordinary', er: '0.4-0.5%', acct: 'Tax-Deferred', rating: '★★★☆☆', ratingColor: 'var(--accent-amber)' },
                ].map(r => (
                  <tr key={r.v}>
                    <td style={{ fontWeight: 600, fontSize: '0.82rem' }}>{r.v}</td>
                    <td className="font-mono" style={{ color: 'var(--accent-electric)' }}>{r.ret}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{r.tax}</td>
                    <td className="font-mono" style={{ color: parseFloat(r.er) > 0.5 ? 'var(--accent-red)' : 'var(--accent-electric)', fontSize: '0.82rem' }}>{r.er}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{r.acct}</td>
                    <td style={{ color: r.ratingColor }}>{r.rating}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* COMPOUND INTEREST */}
        {activeConcept === 'compound' && (
          <div className="flex-col gap-4">
            <div className="nb-card accent-amber">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={16} color="var(--accent-amber)" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Compound Interest: The 8th Wonder</h3>
                <span className="badge badge-amber ml-auto">Intermediate</span>
              </div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                Compound interest means you earn <strong style={{ color: 'var(--text-primary)' }}>returns on your returns</strong>. Over long time horizons, this becomes exponential — a mathematical inevitability that favors those who start <em>early</em>, not those who invest <em>more</em>.
              </p>
            </div>

            {/* Controls */}
            <div className="nb-card">
              <div className="grid grid-3 gap-4">
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="nb-label">Monthly Contribution ($)</label>
                  <input type="number" className="nb-input" value={monthly} onChange={e => setMonthly(Number(e.target.value))} step={50} />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="nb-label">Time Horizon (yrs)</label>
                  <div className="flex items-center gap-2">
                    <input type="range" min={5} max={40} value={years} onChange={e => setYears(parseInt(e.target.value))} className="nb-slider flex-1" />
                    <span className="font-mono text-sm text-amber">{years} yr</span>
                  </div>
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="nb-label">Expected Return (%)</label>
                  <div className="flex items-center gap-2">
                    <input type="range" min={2} max={14} step={0.5} value={returnRate} onChange={e => setReturnRate(parseFloat(e.target.value))} className="nb-slider flex-1" />
                    <span className="font-mono text-sm text-green">{returnRate}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="grid grid-3 gap-4">
              {[
                { label: 'Final Nominal Value', val: `$${(finalNominal / 1000).toFixed(1)}k`, color: 'var(--accent-electric)' },
                { label: 'Total Contributed', val: `$${(totalContributed / 1000).toFixed(1)}k`, color: 'var(--text-secondary)' },
                { label: 'Interest Earned', val: `$${(totalInterest / 1000).toFixed(1)}k`, color: 'var(--accent-amber)' },
              ].map(m => (
                <div key={m.label} className="nb-stat-card" style={{ textAlign: 'center' }}>
                  <p className="stat-label mb-2">{m.label}</p>
                  <p className="font-mono" style={{ fontSize: '1.6rem', fontWeight: 700, color: m.color }}>{m.val}</p>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div className="nb-card" style={{ padding: '1rem' }}>
              <div style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={projectionData.filter((_, i) => i % Math.max(1, Math.floor(years / 15)) === 0)} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="litGrad1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--accent-amber)" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="var(--accent-amber)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="litGrad2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--accent-electric)" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="var(--accent-electric)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--nb-border)" vertical={false} />
                    <XAxis dataKey="year" tickFormatter={v => `Yr${v}`} tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} width={48} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="contributed" name="Contributed" stroke="var(--text-muted)" fill="var(--nb-surface-2)" />
                    <Area type="monotone" dataKey="nominal" name="Nominal" stroke="var(--accent-amber)" strokeWidth={2} fill="url(#litGrad1)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-muted text-center mt-2" style={{ fontFamily: 'var(--font-mono)' }}>
                The gap between the grey area (what you contributed) and the amber line (total value) is <strong style={{ color: 'var(--accent-amber)' }}>compound interest working for you</strong>.
              </p>
            </div>
          </div>
        )}

        {/* RISK-RETURN */}
        {activeConcept === 'riskreturn' && (
          <div className="flex-col gap-4">
            <div className="nb-card accent-red">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={16} color="var(--accent-red)" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>The Risk-Return Spectrum</h3>
                <span className="badge badge-red ml-auto">Advanced</span>
              </div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                Every investment lies on a <strong style={{ color: 'var(--text-primary)' }}>risk-return curve</strong> proven by Modern Portfolio Theory (Markowitz, 1952). There is no "safe high return" — if something appears to offer both, it is hiding risk (liquidity, counterparty, or complexity risk). A professional always prices risk <em>explicitly</em>.
              </p>
            </div>

            <table className="nb-table">
              <thead>
                <tr>
                  <th>Asset Class</th>
                  <th>Expected Annual Return</th>
                  <th>Standard Deviation (σ)</th>
                  <th>Max Drawdown (hist.)</th>
                  <th>Sharpe Ratio (est.)</th>
                  <th>Role in Portfolio</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { asset: 'Cash / T-Bills', ret: '4-5%', std: '0.5%', dd: '0%', sharpe: 'N/A', role: 'Liquidity buffer' },
                  { asset: 'US Bonds (BND)', ret: '4-6%', std: '7%', dd: '-17%', sharpe: '0.40', role: 'Volatility dampener' },
                  { asset: 'US Large Cap (VTI)', ret: '9-11%', std: '15%', dd: '-55%', sharpe: '0.55', role: 'Core growth engine' },
                  { asset: 'Intl Developed (VXUS)', ret: '7-9%', std: '17%', dd: '-56%', sharpe: '0.42', role: 'Geographic diversification' },
                  { asset: 'REIT Index (VNQ)', ret: '8-10%', std: '22%', dd: '-68%', sharpe: '0.38', role: 'Inflation hedge + income' },
                  { asset: 'Small-Cap Value (VBR)', ret: '10-13%', std: '25%', dd: '-62%', sharpe: '0.45', role: 'Factor premium capture' },
                  { asset: 'Emerging Markets', ret: '8-12%', std: '30%', dd: '-65%', sharpe: '0.32', role: 'High-risk growth satellite' },
                  { asset: 'Crypto (BTC equivalent)', ret: '15-80%?', std: '80%+', dd: '-84%', sharpe: 'N/A', role: 'Speculative / extreme risk' },
                ].map(r => (
                  <tr key={r.asset}>
                    <td style={{ fontWeight: 600, fontSize: '0.82rem' }}>{r.asset}</td>
                    <td className="font-mono" style={{ color: 'var(--accent-electric)' }}>{r.ret}</td>
                    <td className="font-mono" style={{ color: parseFloat(r.std) > 25 ? 'var(--accent-red)' : 'var(--accent-amber)' }}>{r.std}</td>
                    <td className="font-mono" style={{ color: 'var(--accent-red)' }}>{r.dd}</td>
                    <td className="font-mono" style={{ color: 'var(--accent-blue)' }}>{r.sharpe}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{r.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="alert alert-violet">
              <Zap size={14} />
              <div style={{ fontSize: '0.8rem' }}>
                <strong>The Efficient Frontier:</strong> MPT proves there exists a portfolio mix that maximizes expected return for any given level of risk. A 3-fund portfolio (VTI + VXUS + BND) provides near-optimal diversification with minimal fees — the academic consensus for retail investors.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
