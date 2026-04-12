import { useState } from 'react';
import { ArrowDown, DollarSign, Home, CreditCard, Building, TrendingUp } from 'lucide-react';

export default function WaterfallFlow() {
  const [income, setIncome] = useState(120000);
  const [housing, setHousing] = useState(25000); // annual
  const [otherDebt, setOtherDebt] = useState(12000); // annual
  
  // Calculations
  const grossMonthly = income / 12;
  const housingMonthly = housing / 12;
  const debtMonthly = otherDebt / 12;
  
  const frontEndDTI = (housingMonthly / grossMonthly) * 100;
  const backEndDTI = ((housingMonthly + debtMonthly) / grossMonthly) * 100;

  return (
    <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
      {/* Waterfall Visualization */}
      <div className="flex-col gap-4">
        <h3 className="mb-4">Cash Flow Velocity</h3>
        
        <div className="glass-panel p-4 flex justify-between items-center" style={{ borderLeft: '4px solid var(--accent-success)' }}>
          <div className="flex items-center gap-4">
            <div className="p-2" style={{ background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px' }}>
              <DollarSign size={20} color="var(--accent-success)" />
            </div>
            <div>
              <p className="label">1. Gross Inflow</p>
              <h4>${(income / 12).toLocaleString(undefined, { maximumFractionDigits: 0 })} /mo</h4>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center my-1"><ArrowDown size={20} color="var(--text-secondary)" /></div>

        <div className="glass-panel p-4 flex justify-between items-center" style={{ borderLeft: '4px solid var(--accent-warning)', marginLeft: '1rem' }}>
          <div className="flex items-center gap-4">
            <div className="p-2" style={{ background: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px' }}>
              <Home size={20} color="var(--accent-warning)" />
            </div>
            <div>
              <p className="label">2. Housing Obligation</p>
              <h4>${housingMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })} /mo</h4>
            </div>
          </div>
        </div>

        <div className="flex justify-center my-1"><ArrowDown size={20} color="var(--text-secondary)" /></div>

        <div className="glass-panel p-4 flex justify-between items-center" style={{ borderLeft: '4px solid var(--accent-danger)', marginLeft: '2rem' }}>
          <div className="flex items-center gap-4">
            <div className="p-2" style={{ background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>
              <CreditCard size={20} color="var(--accent-danger)" />
            </div>
            <div>
              <p className="label">3. Debt Service (Back-end)</p>
              <h4>${debtMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })} /mo</h4>
            </div>
          </div>
        </div>

        <div className="flex justify-center my-1"><ArrowDown size={20} color="var(--text-secondary)" /></div>

        <div className="glass-panel p-4 flex justify-between items-center" style={{ borderLeft: '4px solid #a78bfa', marginLeft: '3rem' }}>
          <div className="flex items-center gap-4">
            <div className="p-2" style={{ background: 'rgba(167, 139, 250, 0.1)', borderRadius: '8px' }}>
              <Building size={20} color="#a78bfa" />
            </div>
            <div>
              <p className="label">4. Tax-Advantaged Inv.</p>
              <h4>$1,916 /mo</h4>
            </div>
          </div>
        </div>
      </div>

      {/* DTI Analytics Panel */}
      <div className="flex flex-col gap-6">
        <div className="glass-panel p-6">
          <h3 className="mb-4">DTI Monitor (Lending View)</h3>
          
          <div className="mb-6">
            <div className="flex justify-between items-end mb-2">
              <div>
                <span className="label">Front-End Ratio (Housing)</span>
                <h4>{frontEndDTI.toFixed(1)}%</h4>
              </div>
              <span className="label " style={{ color: frontEndDTI > 28 ? 'var(--accent-danger)' : 'var(--accent-success)' }}>
                {frontEndDTI <= 28 ? 'Optimal (≤28%)' : 'Caution (>28%)'}
              </span>
            </div>
            <div className="progress-bar-container">
              <div 
                className="progress-bar" 
                style={{ 
                  width: `${Math.min(frontEndDTI, 100)}%`, 
                  background: frontEndDTI > 28 ? 'var(--accent-danger)' : 'var(--accent-success)' 
                }}>
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-end mb-2">
              <div>
                <span className="label">Back-End Ratio (Total Debt)</span>
                <h4>{backEndDTI.toFixed(1)}%</h4>
              </div>
              <span className="label" style={{ color: backEndDTI > 36 ? 'var(--accent-danger)' : 'var(--accent-success)' }}>
                {backEndDTI <= 36 ? 'Optimal (≤36%)' : 'Caution (>36%)'}
              </span>
            </div>
            <div className="progress-bar-container">
              <div 
                className="progress-bar" 
                style={{ 
                  width: `${Math.min(backEndDTI, 100)}%`, 
                  background: backEndDTI > 36 ? 'var(--accent-danger)' : 'var(--accent-success)' 
                }}>
              </div>
            </div>
          </div>
        </div>

        {/* Inputs */}
        <div className="glass-panel p-6">
          <h3 className="mb-4 flex items-center gap-2">
            <TrendingUp size={20} />
            Adjust Variables
          </h3>
          <div className="input-group">
            <label className="label">Gross Annual Income</label>
            <input 
              type="number" 
              className="input" 
              value={income} 
              onChange={(e) => setIncome(Number(e.target.value))}
            />
          </div>
          <div className="input-group">
            <label className="label">Annual Housing Costs</label>
            <input 
              type="number" 
              className="input" 
              value={housing} 
              onChange={(e) => setHousing(Number(e.target.value))}
            />
          </div>
          <div className="input-group">
            <label className="label">Other Annual Debt Payments</label>
            <input 
              type="number" 
              className="input" 
              value={otherDebt} 
              onChange={(e) => setOtherDebt(Number(e.target.value))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
