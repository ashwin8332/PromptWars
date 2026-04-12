import { useState } from 'react';
import { BookOpen, PiggyBank, Briefcase, Calculator, ChevronRight } from 'lucide-react';

export default function LiteracyAssistant() {
  const [activeConcept, setActiveConcept] = useState('budgeting');
  const [income, setIncome] = useState(5000);
  const [years, setYears] = useState(10);
  const [monthlyContribution, setMonthlyContribution] = useState(500);

  const calculateCompoundInterest = () => {
    let total = 0;
    const rate = 0.07; // 7% annual
    for (let i = 0; i < years; i++) {
      total = (total + monthlyContribution * 12) * (1 + rate);
    }
    return total;
  };

  return (
    <div className="flex-col gap-6">
      <div className="glass-panel p-6 mb-6 text-center">
        <BookOpen size={48} color="var(--accent-primary)" style={{ margin: '0 auto 1rem' }} />
        <h2>Financial Literacy Assistant</h2>
        <p className="label" style={{ maxWidth: '600px', margin: '0 auto' }}>
          Master the fundamentals of personal finance. Before diving into complex metrics like 
          Sequence of Returns Risk or Debt Arbitrage, it's crucial to understand the basics of 
          saving, budgeting, and investing in plain English.
        </p>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'minmax(250px, 300px) 1fr', gap: '2rem' }}>
        {/* Navigation Sidebar for Concepts */}
        <div className="flex flex-col gap-4">
          <div 
            className={`glass-panel p-4 flex items-center justify-between cursor-pointer transition ${activeConcept === 'budgeting' ? 'active-concept' : ''}`}
            onClick={() => setActiveConcept('budgeting')}
            style={{ 
              borderLeft: activeConcept === 'budgeting' ? '4px solid var(--accent-primary)' : '',
              background: activeConcept === 'budgeting' ? 'rgba(255, 255, 255, 0.05)' : ''
            }}
          >
            <div className="flex items-center gap-3">
              <Calculator size={20} color="var(--accent-primary)" />
              <span style={{ fontWeight: 500 }}>Budgeting Basics</span>
            </div>
            <ChevronRight size={16} />
          </div>

          <div 
            className={`glass-panel p-4 flex items-center justify-between cursor-pointer transition ${activeConcept === 'saving' ? 'active-concept' : ''}`}
            onClick={() => setActiveConcept('saving')}
            style={{ 
              borderLeft: activeConcept === 'saving' ? '4px solid var(--accent-success)' : '',
              background: activeConcept === 'saving' ? 'rgba(255, 255, 255, 0.05)' : ''
            }}
          >
            <div className="flex items-center gap-3">
              <PiggyBank size={20} color="var(--accent-success)" />
              <span style={{ fontWeight: 500 }}>Saving Principles</span>
            </div>
            <ChevronRight size={16} />
          </div>

          <div 
            className={`glass-panel p-4 flex items-center justify-between cursor-pointer transition ${activeConcept === 'investing' ? 'active-concept' : ''}`}
            onClick={() => setActiveConcept('investing')}
            style={{ 
              borderLeft: activeConcept === 'investing' ? '4px solid #a78bfa' : '',
              background: activeConcept === 'investing' ? 'rgba(255, 255, 255, 0.05)' : ''
            }}
          >
            <div className="flex items-center gap-3">
              <Briefcase size={20} color="#a78bfa" />
              <span style={{ fontWeight: 500 }}>Investing 101</span>
            </div>
            <ChevronRight size={16} />
          </div>
        </div>

        {/* Interactive Content Area */}
        <div className="glass-panel p-8">
          
          {/* BUDGETING CONCEPT */}
          {activeConcept === 'budgeting' && (
            <div className="animate-fade-in">
              <h3 className="mb-4">The 50/30/20 Rule: A Practical Guide</h3>
              <p className="mb-6 label" style={{ color: 'var(--text-primary)' }}>
                Budgeting isn't about restriction; it's about giving every dollar a job. 
                A simple way to start is the 50/30/20 rule.
              </p>
              
              <div className="input-group mb-8">
                <label className="label">Enter Your Monthly Income AFTER Tax:</label>
                <input 
                  type="number" 
                  className="input" 
                  value={income} 
                  onChange={(e) => setIncome(Number(e.target.value) || 0)} 
                  placeholder="e.g. 5000"
                />
              </div>

              <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div className="p-4 rounded" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                  <h4 style={{ color: 'var(--accent-primary)' }}>50% Needs</h4>
                  <p className="stat-value mt-2" style={{ fontSize: '1.5rem', background: 'none', color: 'var(--text-primary)' }}>
                    ${(income * 0.5).toFixed(0)}
                  </p>
                  <p className="label mt-2" style={{ fontSize: '0.8rem' }}>Housing, food, utilities, minimum debt payments.</p>
                </div>
                
                <div className="p-4 rounded" style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                  <h4 style={{ color: 'var(--accent-warning)' }}>30% Wants</h4>
                  <p className="stat-value mt-2" style={{ fontSize: '1.5rem', background: 'none', color: 'var(--text-primary)' }}>
                    ${(income * 0.3).toFixed(0)}
                  </p>
                  <p className="label mt-2" style={{ fontSize: '0.8rem' }}>Dining out, hobbies, subscriptions, travel.</p>
                </div>
                
                <div className="p-4 rounded" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  <h4 style={{ color: 'var(--accent-success)' }}>20% Savings</h4>
                  <p className="stat-value mt-2" style={{ fontSize: '1.5rem', background: 'none', color: 'var(--text-primary)' }}>
                    ${(income * 0.2).toFixed(0)}
                  </p>
                  <p className="label mt-2" style={{ fontSize: '0.8rem' }}>Emergency fund, retirement, extra debt payments.</p>
                </div>
              </div>
            </div>
          )}

          {/* SAVING CONCEPT */}
          {activeConcept === 'saving' && (
            <div className="animate-fade-in">
              <h3 className="mb-4">The Foundation: Liquidity & Emergencies</h3>
              <p className="mb-6 label" style={{ color: 'var(--text-primary)' }}>
                Saving provides a cushion against life's uncertainties. The golden rule is 
                to build an Emergency Fund of 3 to 6 months of living expenses before 
                aggressive investing.
              </p>
              
              <div className="p-6 rounded mb-6" style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--glass-border)' }}>
                <h4 className="mb-3 flex items-center gap-2">
                  <PiggyBank size={18} color="var(--accent-success)" />
                  Where should I keep it?
                </h4>
                <ul className="space-y-2 ml-6 list-disc" style={{ color: 'var(--text-secondary)' }}>
                  <li><strong style={{ color: 'var(--text-primary)' }}>High-Yield Savings Accounts (HYSA):</strong> Earn 4-5% interest while remaining totally accessible.</li>
                  <li><strong style={{ color: 'var(--text-primary)' }}>Money Market Accounts:</strong> Similar to a HYSA but sometimes comes with a debit card or check-writing privileges.</li>
                  <li><span style={{ color: 'var(--accent-warning)' }}>Avoid:</span> Putting emergency money into the stock market. If the market crashes when you lose your job, you face compound disasters.</li>
                </ul>
              </div>
            </div>
          )}

          {/* INVESTING CONCEPT */}
          {activeConcept === 'investing' && (
            <div className="animate-fade-in">
              <h3 className="mb-4">The Magic of Compound Interest</h3>
              <p className="mb-6 label" style={{ color: 'var(--text-primary)' }}>
                Investing is how you make your money work for you. Compound interest means you earn interest on your interest, causing wealth to snowball over time.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="input-group">
                  <label className="label">Monthly Contribution ($):</label>
                  <input 
                    type="number" 
                    className="input" 
                    value={monthlyContribution} 
                    onChange={(e) => setMonthlyContribution(Number(e.target.value) || 0)} 
                  />
                </div>
                <div className="input-group">
                  <label className="label">Years to Invest:</label>
                  <input 
                    type="number" 
                    className="input" 
                    value={years} 
                    onChange={(e) => setYears(Number(e.target.value) || 0)} 
                  />
                </div>
              </div>

              <div className="p-6 rounded text-center" style={{ background: 'rgba(167, 139, 250, 0.1)', border: '1px solid rgba(167, 139, 250, 0.3)' }}>
                <p className="label mb-2">Estimated Future Value (assuming 7% annual return)</p>
                <div className="stat-value" style={{ color: '#a78bfa', background: 'none' }}>
                  ${calculateCompoundInterest().toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
                <div className="mt-4 flex justify-around">
                  <div>
                    <p className="label" style={{ fontSize: '0.75rem' }}>Total Contributed</p>
                    <p style={{ fontWeight: 600 }}>${(monthlyContribution * 12 * years).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="label" style={{ fontSize: '0.75rem' }}>Total Interest Earned</p>
                    <p style={{ fontWeight: 600, color: 'var(--accent-success)' }}>
                      +${(calculateCompoundInterest() - (monthlyContribution * 12 * years)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
                <p>This is the fundamental reason behind <strong>The Arbitrage Analysis</strong> module: if your investments grow at ~7%, but your debt costs ~9%, it makes mathematical sense to pay the debt first.</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
