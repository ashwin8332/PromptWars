import { ArrowRight, AlertTriangle, CheckCircle, Percent } from 'lucide-react';

export default function Arbitrage() {
  const arbitrageScenarios = [
    {
      id: 1,
      opportunity: 'Student Loan vs. Brokerage',
      debtName: 'Navient Student Loan',
      debtRate: 6.8, // %
      investmentName: 'S&P 500 Index Fund (VTI)',
      expectedReturn: 9.5, // %
      taxDrag: 2.1, // %
      recommendation: 'INVEST',
      confidence: 'High',
    },
    {
      id: 2,
      opportunity: 'Auto Loan vs. High-Yield Savings',
      debtName: 'Tesla Auto Finance',
      debtRate: 7.2,
      investmentName: 'Ally Bank HYSA',
      expectedReturn: 4.5,
      taxDrag: 1.1,
      recommendation: 'PAY_DEBT',
      confidence: 'Certain (Guaranteed ROI)',
    }
  ];

  return (
    <div className="flex-col gap-6">
      <div className="glass-panel p-6 mb-6">
        <h3 className="mb-2">Capital Arbitrage Analysis</h3>
        <p className="label">Determines the mathematical efficiency of your next $1.00 of capital.</p>
        <p className="label" style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
          * Expected Return is adjusted for <span style={{ color: 'var(--accent-warning)' }}>Tax Drag</span> based on your marginal brackets.
        </p>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
        {arbitrageScenarios.map(scenario => {
          const netReturn = scenario.expectedReturn - scenario.taxDrag;
          const delta = netReturn - scenario.debtRate;
          const isInvest = delta > 0;

          return (
            <div key={scenario.id} className="glass-panel p-6">
              <h4 className="mb-6">{scenario.opportunity}</h4>
              
              <div className="flex justify-between items-center mb-6">
                {/* Debt Side */}
                <div className="flex-col items-center" style={{ width: '40%' }}>
                  <p className="label text-center mb-2">Debt Obligation</p>
                  <div className="p-4" style={{ background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)', textAlign: 'center' }}>
                    <p style={{ fontWeight: 600 }}>{scenario.debtName}</p>
                    <div className="flex justify-center items-center gap-1 mt-2">
                      <Percent size={14} color="var(--accent-danger)" />
                      <span className="stat-value" style={{ fontSize: '1.5rem', background: 'none', color: 'var(--accent-danger)' }}>{scenario.debtRate.toFixed(1)}</span>
                    </div>
                    <p className="label mt-1" style={{ fontSize: '0.7rem' }}>Guaranteed Cost</p>
                  </div>
                </div>

                {/* Versus */}
                <div className="flex flex-col items-center gap-2">
                  <span className="label" style={{ fontSize: '0.8rem', background: 'var(--glass-bg)', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>VS</span>
                  <ArrowRight size={24} color={isInvest ? 'var(--accent-success)' : 'var(--text-secondary)'} 
                    style={{ transform: isInvest ? 'rotate(0)' : 'rotate(180deg)' }}
                  />
                </div>

                {/* Investment Side */}
                <div className="flex-col items-center" style={{ width: '40%' }}>
                  <p className="label text-center mb-2">Market Vehicle</p>
                  <div className="p-4" style={{ background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)', textAlign: 'center' }}>
                    <p style={{ fontWeight: 600 }}>{scenario.investmentName}</p>
                    <div className="flex justify-center items-center gap-1 mt-2">
                      <Percent size={14} color="var(--accent-success)" />
                      <span className="stat-value" style={{ fontSize: '1.5rem', background: 'none', color: 'var(--accent-success)' }}>{netReturn.toFixed(1)}</span>
                    </div>
                    <p className="label mt-1" style={{ fontSize: '0.7rem' }}>After Tax-Drag (Expected)</p>
                  </div>
                </div>
              </div>

              {/* Recommendation Ribbon */}
              <div 
                className="mt-6 p-4 flex items-center justify-between" 
                style={{ 
                  background: isInvest ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                  borderRadius: '8px',
                  borderLeft: `4px solid ${isInvest ? 'var(--accent-success)' : 'var(--accent-primary)'}`
                }}
              >
                <div>
                  <p className="label" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Algorithm Directive:</p>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    {isInvest 
                      ? 'Allocate surplus capital to investment. Mathematical edge: +' + delta.toFixed(1) + '%'
                      : 'Pay down debt immediately. Guaranteed ROI exceeds expected market return.'
                    }
                  </p>
                </div>
                {isInvest ? <CheckCircle color="var(--accent-success)" /> : <AlertTriangle color="var(--accent-primary)" />}
              </div>
            </div>
          );
        })}
      </div>

      <div className="glass-panel p-6 mt-6">
        <h3>Tax Drag Locator</h3>
        <p className="label mb-4">Location Optimization for maximum efficiency.</p>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
              <th className="p-4 label">Asset Class</th>
              <th className="p-4 label">Yield Type</th>
              <th className="p-4 label">Current Location</th>
              <th className="p-4 label">Optimization Directive</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
              <td className="p-4">Corporate Bonds</td>
              <td className="p-4" style={{ color: 'var(--accent-warning)' }}>Ordinary Income</td>
              <td className="p-4">Brokerage (Taxable)</td>
              <td className="p-4"><span style={{ color: 'var(--accent-danger)' }}>ACTION: Move to Tax-Deferred (IRA)</span></td>
            </tr>
            <tr>
              <td className="p-4">Large Cap Equities</td>
              <td className="p-4" style={{ color: 'var(--accent-success)' }}>Long Term Capital Gains</td>
              <td className="p-4">Brokerage (Taxable)</td>
              <td className="p-4"><span style={{ color: 'var(--accent-success)' }}>OPTIMAL</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
