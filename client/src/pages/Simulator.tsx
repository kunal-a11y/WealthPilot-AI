import { useState, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { SlidersHorizontal, ArrowRight, TrendingUp, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export const Simulator = () => {
  const [currentAge, setCurrentAge] = useState(30);
  const [retirementAge, setRetirementAge] = useState(60);
  const [currentCorpus, setCurrentCorpus] = useState(100000);
  const [monthlySip, setMonthlySip] = useState(20000);
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [inflation, setInflation] = useState(6);
  const [stepUp, setStepUp] = useState(10); // Annual increase in SIP

  const data = useMemo(() => {
    let result = [];
    let corpus = currentCorpus;
    let sip = monthlySip;
    let realCorpus = currentCorpus;
    
    for (let age = currentAge; age <= retirementAge; age++) {
      result.push({
        age,
        nominal: Math.round(corpus),
        real: Math.round(realCorpus),
      });

      // Annual calculation
      const annualInvestment = sip * 12;
      corpus = corpus * (1 + expectedReturn / 100) + annualInvestment;
      
      // Real (inflation-adjusted) calculation
      const realReturn = ((1 + expectedReturn/100) / (1 + inflation/100) - 1);
      realCorpus = realCorpus * (1 + realReturn) + (annualInvestment / Math.pow(1 + inflation/100, age - currentAge));
      
      // Step up SIP for next year
      sip = sip * (1 + stepUp / 100);
    }
    return result;
  }, [currentAge, retirementAge, currentCorpus, monthlySip, expectedReturn, inflation, stepUp]);

  const finalNominal = data[data.length - 1]?.nominal || 0;
  const finalReal = data[data.length - 1]?.real || 0;

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">What-If Simulator</h1>
        <p className="text-zinc-400">Time travel through your finances. Adjust variables to project your wealth.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Sliders Panel */}
        <div className="space-y-6 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6 text-white font-semibold">
            <SlidersHorizontal className="w-5 h-5 text-emerald-500" /> Parameters
          </div>
          
          <Slider label="Current Age" value={currentAge} setValue={setCurrentAge} min={18} max={70} unit="Years" />
          <Slider label="Retirement Age" value={retirementAge} setValue={setRetirementAge} min={currentAge + 1} max={80} unit="Years" />
          <Slider label="Current Corpus" value={currentCorpus} setValue={setCurrentCorpus} min={0} max={10000000} step={10000} unit="₹" prefix />
          <Slider label="Monthly SIP" value={monthlySip} setValue={setMonthlySip} min={0} max={1000000} step={1000} unit="₹" prefix />
          <Slider label="Annual SIP Step-Up" value={stepUp} setValue={setStepUp} min={0} max={50} unit="%" />
          <Slider label="Expected Return" value={expectedReturn} setValue={setExpectedReturn} min={1} max={30} step={0.5} unit="%" />
          <Slider label="Expected Inflation" value={inflation} setValue={setInflation} min={0} max={15} step={0.5} unit="%" />
        </div>

        {/* Chart Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-zinc-900 border border-emerald-500/30 rounded-2xl p-6 shadow-[0_0_15px_rgba(16,185,129,0.1)] relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl"></div>
              <h3 className="text-sm font-medium text-zinc-400 mb-1">Nominal Wealth at Age {retirementAge}</h3>
              <p className="text-4xl font-bold text-white">₹{formatLarge(finalNominal)}</p>
              <p className="text-xs text-emerald-500 mt-2 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Absolute growth without inflation</p>
            </div>
            
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden">
               <h3 className="text-sm font-medium text-zinc-400 mb-1">Real Wealth (Inflation Adjusted)</h3>
              <p className="text-4xl font-bold text-emerald-500">₹{formatLarge(finalReal)}</p>
              <p className="text-xs text-zinc-500 mt-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Purchasing power in today's money</p>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 h-[400px]">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorNominal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#52525b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#52525b" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="age" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${formatLarge(val)}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                    itemStyle={{ fontWeight: 'bold' }}
                    labelFormatter={(val) => `Age ${val}`}
                    formatter={(val: number, name: string) => [`₹${val.toLocaleString()}`, name === 'nominal' ? 'Nominal Wealth' : 'Real Wealth']}
                  />
                  <Area type="monotone" dataKey="nominal" stroke="#71717a" fillOpacity={1} fill="url(#colorNominal)" />
                  <Area type="monotone" dataKey="real" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorReal)" />
                </AreaChart>
              </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

function Slider({ label, value, setValue, min, max, step = 1, unit, prefix = false }: any) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-zinc-400">{label}</span>
        <span className="font-semibold text-white bg-black px-2 py-0.5 rounded border border-zinc-800">
          {prefix ? `${unit}${value.toLocaleString()}` : `${value.toLocaleString()}${unit}`}
        </span>
      </div>
      <input 
        type="range" 
        min={min} 
        max={max} 
        step={step}
        value={value}
        onChange={(e) => setValue(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400"
      />
    </div>
  );
}

function formatLarge(num: number) {
  if (num >= 1e7) return (num / 1e7).toFixed(2) + ' Cr';
  if (num >= 1e5) return (num / 1e5).toFixed(2) + ' L';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + ' K';
  return num.toString();
}
