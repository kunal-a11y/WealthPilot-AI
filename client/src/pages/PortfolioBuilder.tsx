import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { fetchWithAuth } from "../lib/api";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Briefcase, ShieldAlert, Sparkles } from "lucide-react";
import { CurrencyInput } from "../components/ui/CurrencyInput";
import { useNotifications } from "../lib/NotificationContext";

const COLORS = ['#22C55E', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899'];

export function PortfolioBuilder() {
  const { getToken } = useAuth();
  const { addNotification } = useNotifications();
  
  const [formData, setFormData] = useState({
    amount: "100000",
    risk: "Medium",
    goal: "Retirement",
    country: "IN",
    expectedReturn: "12"
  });

  const buildMutation = useMutation({
    mutationFn: (data: typeof formData) => fetchWithAuth(`/ai/build-portfolio`, getToken, {
      method: "POST",
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      addNotification({
        type: 'success',
        title: 'Portfolio Generated',
        message: 'Successfully generated your personalized AI portfolio.'
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Portfolio Builder Error',
        message: error.message || 'Failed to generate portfolio. Please try again.'
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    buildMutation.mutate(formData);
  };

  const result = buildMutation.data;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-32">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <Briefcase className="w-8 h-8 text-brand-500" /> Portfolio Builder
        </h1>
        <p className="text-muted mt-2">Let our AI generate a professionally diversified portfolio tailored strictly to your risk profile and financial goals.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Input Form */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted">Investment Amount</label>
                <div className="relative">
                  <CurrencyInput value={formData.amount} onChange={(val) => setFormData({...formData, amount: val})} placeholder="500000" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted">Risk Tolerance</label>
                <div className="relative">
                  <select 
                    value={formData.risk}
                    onChange={e => setFormData(p => ({...p, risk: e.target.value}))}
                    className="w-full bg-secondaryCard border border-border rounded-lg px-4 py-2 text-foreground appearance-none focus:outline-none focus:border-brand-500 cursor-pointer"
                  >
                    <option value="Low" className="bg-[#161616] text-white">Low (Capital Preservation)</option>
                    <option value="Medium" className="bg-[#161616] text-white">Medium (Balanced Growth)</option>
                    <option value="High" className="bg-[#161616] text-white">High (Aggressive Growth)</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted">Primary Goal</label>
                <input 
                  type="text" 
                  value={formData.goal}
                  onChange={e => setFormData(p => ({...p, goal: e.target.value}))}
                  placeholder="e.g. Retirement, Buying a house"
                  className="w-full bg-secondaryCard border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-brand-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted">Expected Annual Return (%)</label>
                <input 
                  type="number" 
                  value={formData.expectedReturn}
                  onChange={e => setFormData(p => ({...p, expectedReturn: e.target.value}))}
                  placeholder="e.g. 12"
                  className="w-full bg-secondaryCard border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-brand-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted">Market Focus</label>
                <div className="relative">
                  <select 
                    value={formData.country}
                    onChange={e => setFormData(p => ({...p, country: e.target.value}))}
                    className="w-full bg-secondaryCard border border-border rounded-lg px-4 py-2 text-foreground appearance-none focus:outline-none focus:border-brand-500 cursor-pointer"
                  >
                    <option value="US" className="bg-[#161616] text-white">United States</option>
                    <option value="IN" className="bg-[#161616] text-white">India</option>
                    <option value="UK" className="bg-[#161616] text-white">United Kingdom</option>
                    <option value="Global" className="bg-[#161616] text-white">Global Diversified</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={buildMutation.isPending}
                className="w-full py-3 mt-4 rounded-lg bg-brand-500 hover:bg-brand-600 text-black font-bold transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {buildMutation.isPending ? "Analyzing Markets..." : "Generate Portfolio"} 
                {!buildMutation.isPending && <Sparkles className="w-4 h-4" />}
              </button>
            </form>
          </div>
          
          <div className="bg-warning/10 border border-warning/20 p-4 rounded-xl flex items-start gap-3 text-warning">
            <ShieldAlert className="w-5 h-5 mt-0.5 shrink-0" />
            <p className="text-xs font-medium leading-relaxed">
              This portfolio is generated by AI for educational purposes only. It is not personalized financial advice. Investing involves risk, including the possible loss of principal.
            </p>
          </div>
        </div>

        {/* Results Area */}
        <div className="lg:col-span-8">
          {buildMutation.isIdle && (
            <div className="h-full border border-dashed border-border rounded-xl flex flex-col items-center justify-center p-12 text-center text-muted">
              <Briefcase className="w-12 h-12 mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-foreground">Awaiting Configuration</h3>
              <p className="max-w-sm mt-2">Fill out your investment profile on the left to see your AI-generated diversified portfolio.</p>
            </div>
          )}

          {buildMutation.isPending && (
            <div className="h-full glass flex flex-col items-center justify-center p-12 text-center">
              <div className="w-12 h-12 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin mb-4"></div>
              <h3 className="text-lg font-bold">Structuring Portfolio</h3>
              <p className="text-muted mt-2">Calculating optimal asset allocation based on your risk profile...</p>
            </div>
          )}

          {buildMutation.isError && (
            <div className="glass p-8 border-destructive/30">
              <h3 className="text-xl font-bold text-destructive flex items-center gap-2">
                <ShieldAlert className="w-6 h-6" /> Generation Failed
              </h3>
              <p className="text-muted mt-2">{buildMutation.error.message}</p>
            </div>
          )}

          {result && !result.error && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass p-6">
                  <h3 className="text-sm font-medium text-muted">Expected Annual Return</h3>
                  <div className="text-3xl font-black text-brand-500 mt-2 tracking-tighter">
                    {result.expectedAnnualReturn}
                  </div>
                </div>
                <div className="glass p-6">
                  <h3 className="text-sm font-medium text-muted">Strategy Summary</h3>
                  <p className="text-sm mt-2 leading-relaxed">{result.summary}</p>
                </div>
              </div>

              <div className="glass p-6">
                <h3 className="text-lg font-bold mb-6">Asset Allocation</h3>
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="w-64 h-64 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={result.allocations}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="percentage"
                          stroke="none"
                        >
                          {result.allocations?.map((_entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#161616', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                          itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                          formatter={(value: any) => `${value}%`}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 w-full space-y-4">
                    {result.allocations?.map((alloc: any, index: number) => (
                      <div key={index} className="flex flex-col p-3 rounded-lg bg-secondaryCard/50 border border-transparent hover:border-border transition-colors">
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                            <span className="font-bold text-sm">{alloc.assetClass} {alloc.symbol ? `(${alloc.symbol})` : ''}</span>
                            {alloc.currentPrice && (
                              <span className="text-xs px-2 py-0.5 rounded bg-brand-500/10 text-brand-500 font-mono flex items-center gap-1">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
                                </span>
                                {alloc.currency === 'USD' ? '$' : (alloc.currency === 'INR' ? '₹' : '')}{alloc.currentPrice.toFixed(2)}
                              </span>
                            )}
                          </div>
                          <span className="font-mono font-bold text-brand-500">{alloc.percentage}%</span>
                        </div>
                        <p className="text-xs text-muted ml-5">{alloc.reasoning}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="glass p-6">
                <h3 className="text-lg font-bold mb-2">Risk Analysis</h3>
                <p className="text-sm text-muted leading-relaxed">{result.riskAnalysis}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
