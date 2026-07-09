import { useState } from "react";
import { Calculator, TrendingUp, PiggyBank, Target, RefreshCw, Activity, Shield, Coins, Home, Flame } from "lucide-react";
import { cn } from "../lib/utils";

const CALCULATORS = [
  { id: "sip", name: "SIP Calculator", icon: RefreshCw },
  { id: "lumpsum", name: "Lumpsum", icon: Coins },
  { id: "compound", name: "Compound Interest", icon: TrendingUp },
  { id: "retirement", name: "Retirement", icon: PiggyBank },
  { id: "emi", name: "Loan EMI", icon: Home },
  { id: "inflation", name: "Inflation", icon: Flame },
  { id: "passive", name: "Passive Income", icon: Calculator },
  { id: "emergency", name: "Emergency Fund", icon: Shield },
  { id: "goal", name: "Goal Planner", icon: Target },
  { id: "networth", name: "Net Worth", icon: Activity },
];

export function Calculators() {
  const [activeTab, setActiveTab] = useState(CALCULATORS[0].id);

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 pb-32 max-w-7xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <Calculator className="w-8 h-8 text-emerald-500" /> Financial Calculators
        </h1>
        <p className="text-zinc-400 mt-2">10 comprehensive tools to plan your wealth journey.</p>
      </header>

      <div className="flex flex-wrap gap-2 border-b border-zinc-800 pb-2">
        {CALCULATORS.map(calc => (
          <button 
            key={calc.id}
            onClick={() => setActiveTab(calc.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-colors",
              activeTab === calc.id 
                ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
            )}
          >
            <calc.icon className="w-4 h-4" /> {calc.name}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {activeTab === "sip" && <SIPCalculator />}
        {activeTab === "lumpsum" && <LumpsumCalculator />}
        {activeTab === "compound" && <CompoundCalculator />}
        {activeTab === "retirement" && <RetirementCalculator />}
        {activeTab === "emi" && <EMICalculator />}
        {activeTab === "inflation" && <InflationCalculator />}
        {activeTab === "passive" && <PassiveIncomeCalculator />}
        {activeTab === "emergency" && <EmergencyFundCalculator />}
        {activeTab === "goal" && <GoalCalculator />}
        {activeTab === "networth" && <NetWorthCalculator />}
      </div>
    </div>
  );
}

// Reusable UI Components
const InputGroup = ({ label, value, onChange, unit, prefix = false }: any) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-zinc-400 flex justify-between">
      {label} <span className="text-white font-bold">{prefix ? unit : ""}{value.toLocaleString()}{!prefix ? unit : ""}</span>
    </label>
    <input type="number" value={value} onChange={onChange} className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-2 text-white focus:border-emerald-500" />
  </div>
);

const ResultCard = ({ label, value, highlight = false }: any) => (
  <div className={cn("p-6 rounded-2xl border", highlight ? "bg-emerald-500/10 border-emerald-500/30" : "bg-zinc-900 border-zinc-800")}>
    <p className="text-sm text-zinc-400 mb-1">{label}</p>
    <p className={cn("text-3xl font-bold", highlight ? "text-emerald-500" : "text-white")}>{value}</p>
  </div>
);

// 1. SIP Calculator
function SIPCalculator() {
  const [investment, setInvestment] = useState(5000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);
  const i = rate / 100 / 12;
  const n = years * 12;
  const totalInvested = investment * n;
  const futureValue = investment * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
  const returns = futureValue - totalInvested;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <InputGroup label="Monthly Investment" value={investment} onChange={(e:any) => setInvestment(Number(e.target.value))} unit="₹" prefix />
        <InputGroup label="Expected Return (p.a)" value={rate} onChange={(e:any) => setRate(Number(e.target.value))} unit="%" />
        <InputGroup label="Time Period" value={years} onChange={(e:any) => setYears(Number(e.target.value))} unit=" Yrs" />
      </div>
      <div className="space-y-4">
        <ResultCard label="Total Invested" value={`₹${Math.round(totalInvested).toLocaleString()}`} />
        <ResultCard label="Estimated Returns" value={`₹${Math.round(returns).toLocaleString()}`} />
        <ResultCard label="Total Value" value={`₹${Math.round(futureValue).toLocaleString()}`} highlight />
      </div>
    </div>
  );
}

// 2. Lumpsum Calculator
function LumpsumCalculator() {
  const [investment, setInvestment] = useState(100000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);
  const futureValue = investment * Math.pow(1 + rate/100, years);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <InputGroup label="Total Investment" value={investment} onChange={(e:any) => setInvestment(Number(e.target.value))} unit="₹" prefix />
        <InputGroup label="Expected Return (p.a)" value={rate} onChange={(e:any) => setRate(Number(e.target.value))} unit="%" />
        <InputGroup label="Time Period" value={years} onChange={(e:any) => setYears(Number(e.target.value))} unit=" Yrs" />
      </div>
      <div className="space-y-4">
        <ResultCard label="Total Invested" value={`₹${Math.round(investment).toLocaleString()}`} />
        <ResultCard label="Estimated Returns" value={`₹${Math.round(futureValue - investment).toLocaleString()}`} />
        <ResultCard label="Total Value" value={`₹${Math.round(futureValue).toLocaleString()}`} highlight />
      </div>
    </div>
  );
}

// 3. Compound Interest
function CompoundCalculator() {
  const [principal, setPrincipal] = useState(10000);
  const [rate, setRate] = useState(8);
  const [years, setYears] = useState(15);
  const [frequency, setFrequency] = useState(1);
  const amount = principal * Math.pow(1 + (rate/100)/frequency, frequency * years);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <InputGroup label="Initial Principal" value={principal} onChange={(e:any) => setPrincipal(Number(e.target.value))} unit="₹" prefix />
        <InputGroup label="Interest Rate (p.a)" value={rate} onChange={(e:any) => setRate(Number(e.target.value))} unit="%" />
        <InputGroup label="Time Period" value={years} onChange={(e:any) => setYears(Number(e.target.value))} unit=" Yrs" />
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-400">Compounding Frequency</label>
          <select value={frequency} onChange={e => setFrequency(Number(e.target.value))} className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-2 text-white">
            <option value={1}>Annually</option><option value={2}>Semi-Annually</option><option value={4}>Quarterly</option><option value={12}>Monthly</option>
          </select>
        </div>
      </div>
      <div className="space-y-4">
        <ResultCard label="Principal" value={`₹${Math.round(principal).toLocaleString()}`} />
        <ResultCard label="Interest Earned" value={`₹${Math.round(amount - principal).toLocaleString()}`} />
        <ResultCard label="Future Value" value={`₹${Math.round(amount).toLocaleString()}`} highlight />
      </div>
    </div>
  );
}

// 4. Retirement
function RetirementCalculator() {
  const [currentAge, setCurrentAge] = useState(30);
  const [retireAge, setRetireAge] = useState(60);
  const [monthlyExpense, setMonthlyExpense] = useState(50000);
  const [inflation, setInflation] = useState(6);
  const years = retireAge - currentAge;
  const futureExpense = monthlyExpense * Math.pow(1 + inflation/100, years);
  const corpusNeeded = (futureExpense * 12) / 0.04; // 4% rule

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <InputGroup label="Current Age" value={currentAge} onChange={(e:any) => setCurrentAge(Number(e.target.value))} unit=" Yrs" />
        <InputGroup label="Retirement Age" value={retireAge} onChange={(e:any) => setRetireAge(Number(e.target.value))} unit=" Yrs" />
        <InputGroup label="Current Monthly Expenses" value={monthlyExpense} onChange={(e:any) => setMonthlyExpense(Number(e.target.value))} unit="₹" prefix />
        <InputGroup label="Expected Inflation" value={inflation} onChange={(e:any) => setInflation(Number(e.target.value))} unit="%" />
      </div>
      <div className="space-y-4">
        <ResultCard label={`Monthly Expense at Age ${retireAge}`} value={`₹${Math.round(futureExpense).toLocaleString()}`} />
        <ResultCard label="Target Retirement Corpus (4% Rule)" value={`₹${Math.round(corpusNeeded).toLocaleString()}`} highlight />
      </div>
    </div>
  );
}

// 5. Loan EMI
function EMICalculator() {
  const [loan, setLoan] = useState(5000000);
  const [rate, setRate] = useState(8.5);
  const [years, setYears] = useState(20);
  const r = rate / 12 / 100;
  const n = years * 12;
  const emi = loan * r * (Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1));
  const totalAmount = emi * n;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <InputGroup label="Loan Amount" value={loan} onChange={(e:any) => setLoan(Number(e.target.value))} unit="₹" prefix />
        <InputGroup label="Interest Rate (p.a)" value={rate} onChange={(e:any) => setRate(Number(e.target.value))} unit="%" />
        <InputGroup label="Loan Tenure" value={years} onChange={(e:any) => setYears(Number(e.target.value))} unit=" Yrs" />
      </div>
      <div className="space-y-4">
        <ResultCard label="Monthly EMI" value={`₹${Math.round(emi).toLocaleString()}`} highlight />
        <ResultCard label="Total Interest" value={`₹${Math.round(totalAmount - loan).toLocaleString()}`} />
        <ResultCard label="Total Amount Payable" value={`₹${Math.round(totalAmount).toLocaleString()}`} />
      </div>
    </div>
  );
}

// 6. Inflation
function InflationCalculator() {
  const [amount, setAmount] = useState(100000);
  const [rate, setRate] = useState(6);
  const [years, setYears] = useState(10);
  const futureValue = amount * Math.pow(1 + rate/100, years);
  const purchasingPower = amount / Math.pow(1 + rate/100, years);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <InputGroup label="Current Amount" value={amount} onChange={(e:any) => setAmount(Number(e.target.value))} unit="₹" prefix />
        <InputGroup label="Inflation Rate" value={rate} onChange={(e:any) => setRate(Number(e.target.value))} unit="%" />
        <InputGroup label="Time Period" value={years} onChange={(e:any) => setYears(Number(e.target.value))} unit=" Yrs" />
      </div>
      <div className="space-y-4">
        <ResultCard label="Future Cost (What it will cost)" value={`₹${Math.round(futureValue).toLocaleString()}`} highlight />
        <ResultCard label="Purchasing Power (What it's worth)" value={`₹${Math.round(purchasingPower).toLocaleString()}`} />
      </div>
    </div>
  );
}

// 7. Passive Income
function PassiveIncomeCalculator() {
  const [corpus, setCorpus] = useState(10000000);
  const [yieldRate, setYieldRate] = useState(5); // Dividend or interest yield
  const annual = corpus * (yieldRate / 100);
  const monthly = annual / 12;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <InputGroup label="Total Invested Corpus" value={corpus} onChange={(e:any) => setCorpus(Number(e.target.value))} unit="₹" prefix />
        <InputGroup label="Dividend/Interest Yield (p.a)" value={yieldRate} onChange={(e:any) => setYieldRate(Number(e.target.value))} unit="%" />
      </div>
      <div className="space-y-4">
        <ResultCard label="Monthly Passive Income" value={`₹${Math.round(monthly).toLocaleString()}`} highlight />
        <ResultCard label="Annual Passive Income" value={`₹${Math.round(annual).toLocaleString()}`} />
      </div>
    </div>
  );
}

// 8. Emergency Fund
function EmergencyFundCalculator() {
  const [expenses, setExpenses] = useState(40000);
  const [months, setMonths] = useState(6);
  const total = expenses * months;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <InputGroup label="Monthly Living Expenses" value={expenses} onChange={(e:any) => setExpenses(Number(e.target.value))} unit="₹" prefix />
        <InputGroup label="Months of Coverage" value={months} onChange={(e:any) => setMonths(Number(e.target.value))} unit=" Months" />
      </div>
      <div className="space-y-4">
        <ResultCard label="Recommended Emergency Fund" value={`₹${Math.round(total).toLocaleString()}`} highlight />
      </div>
    </div>
  );
}

// 9. Goal Planner
function GoalCalculator() {
  const [target, setTarget] = useState(5000000);
  const [years, setYears] = useState(5);
  const [rate, setRate] = useState(12);
  const i = rate / 100 / 12;
  const n = years * 12;
  const requiredSip = target / (((Math.pow(1 + i, n) - 1) / i) * (1 + i));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <InputGroup label="Target Amount" value={target} onChange={(e:any) => setTarget(Number(e.target.value))} unit="₹" prefix />
        <InputGroup label="Time to Goal" value={years} onChange={(e:any) => setYears(Number(e.target.value))} unit=" Yrs" />
        <InputGroup label="Expected Return (p.a)" value={rate} onChange={(e:any) => setRate(Number(e.target.value))} unit="%" />
      </div>
      <div className="space-y-4">
        <ResultCard label="Required Monthly SIP" value={`₹${Math.round(requiredSip).toLocaleString()}`} highlight />
      </div>
    </div>
  );
}

// 10. Net Worth
function NetWorthCalculator() {
  const [assets, setAssets] = useState(5000000);
  const [liabilities, setLiabilities] = useState(1500000);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <InputGroup label="Total Assets (Cash, Stocks, Property)" value={assets} onChange={(e:any) => setAssets(Number(e.target.value))} unit="₹" prefix />
        <InputGroup label="Total Liabilities (Loans, Debts)" value={liabilities} onChange={(e:any) => setLiabilities(Number(e.target.value))} unit="₹" prefix />
      </div>
      <div className="space-y-4">
        <ResultCard label="Total Net Worth" value={`₹${(assets - liabilities).toLocaleString()}`} highlight />
      </div>
    </div>
  );
}
