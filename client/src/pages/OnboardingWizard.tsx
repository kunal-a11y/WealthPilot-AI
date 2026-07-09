import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@clerk/clerk-react";
import { fetchWithAuth } from "../lib/api";
import { CheckCircle, ChevronRight, TrendingUp, ShieldAlert, Sparkles, Building2 } from "lucide-react";
import { CurrencyInput } from "../components/ui/CurrencyInput";

const steps = [
  { id: 'basics', title: 'The Basics' },
  { id: 'financials', title: 'Your Finances' },
  { id: 'goals', title: 'Goals & Risk' },
  { id: 'complete', title: 'AI Profile Setup' }
];

export const OnboardingWizard = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    age: "",
    country: "US",
    currency: "USD",
    occupation: "",
    monthlyIncome: "",
    monthlyExpenses: "",
    riskProfile: "MEDIUM",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep((prev) => prev + 1);
  };

  const handleComplete = async () => {
    try {
      await fetchWithAuth("/user/onboard", getToken, {
        method: "POST",
        body: JSON.stringify({
          ...formData,
          age: parseInt(formData.age),
          monthlyIncome: parseFloat(formData.monthlyIncome),
          monthlyExpenses: parseFloat(formData.monthlyExpenses),
          financialLevel: 1
        }),
      });
      // Redirect to dashboard
      window.location.href = "/";
    } catch (error) {
      console.error("Failed to save onboarding data:", error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 bg-gradient-to-br from-black via-zinc-900 to-black">
      
      {/* Abstract Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-900/20 blur-[120px]" />
      </div>

      <div className="w-full max-w-2xl relative z-10">
        
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex justify-between relative">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-zinc-800 -z-10 -translate-y-1/2 rounded-full"></div>
            <div 
              className="absolute top-1/2 left-0 h-1 bg-emerald-500 -z-10 -translate-y-1/2 rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            ></div>
            
            {steps.map((step, idx) => (
              <div key={step.id} className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${idx <= currentStep ? 'bg-black border-emerald-500 text-emerald-500' : 'bg-black border-zinc-800 text-zinc-500'}`}>
                  {idx < currentStep ? <CheckCircle className="w-5 h-5" /> : <span>{idx + 1}</span>}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${idx <= currentStep ? 'text-zinc-200' : 'text-zinc-600'}`}>{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-zinc-950/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <AnimatePresence mode="wait">
            
            {currentStep === 0 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-2">Welcome to WealthPilot AI</h2>
                  <p className="text-zinc-400">Let's get to know you to build your AI Financial Twin.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">First Name</label>
                    <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors" placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Last Name</label>
                    <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors" placeholder="Doe" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Age</label>
                    <input type="number" name="age" value={formData.age} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors" placeholder="30" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Occupation</label>
                    <input type="text" name="occupation" value={formData.occupation} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors" placeholder="Software Engineer" />
                  </div>
                </div>
                <button onClick={handleNext} disabled={!formData.firstName || !formData.age} className="w-full bg-emerald-500 text-black font-semibold rounded-lg px-4 py-3 mt-8 flex items-center justify-center gap-2 hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  Next Step <ChevronRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {currentStep === 1 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-2">Financial Baseline</h2>
                  <p className="text-zinc-400">What does your monthly cash flow look like?</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Currency</label>
                    <select name="currency" value={formData.currency} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors">
                      <option value="USD">USD ($)</option>
                      <option value="INR">INR (₹)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Country</label>
                    <select name="country" value={formData.country} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors">
                      <option value="US">United States</option>
                      <option value="IN">India</option>
                      <option value="UK">United Kingdom</option>
                      <option value="EU">Europe</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Monthly Income</label>
                    <CurrencyInput value={formData.monthlyIncome} onChange={(val) => setFormData({...formData, monthlyIncome: val})} placeholder="50000" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Monthly Expenses</label>
                    <CurrencyInput value={formData.monthlyExpenses} onChange={(val) => setFormData({...formData, monthlyExpenses: val})} placeholder="30000" />
                  </div>
                </div>
                <div className="flex gap-4 mt-8">
                  <button onClick={() => setCurrentStep(0)} className="w-1/3 bg-zinc-800 text-white font-semibold rounded-lg px-4 py-3 hover:bg-zinc-700 transition-colors">Back</button>
                  <button onClick={handleNext} disabled={!formData.monthlyIncome || !formData.monthlyExpenses} className="w-2/3 bg-emerald-500 text-black font-semibold rounded-lg px-4 py-3 flex items-center justify-center gap-2 hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    Next Step <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-2">Risk & Strategy</h2>
                  <p className="text-zinc-400">How do you approach investing?</p>
                </div>
                
                <div className="space-y-4">
                  <label className="text-sm font-medium text-zinc-400 block">Select your risk tolerance</label>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div 
                      onClick={() => setFormData({...formData, riskProfile: 'LOW'})}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${formData.riskProfile === 'LOW' ? 'border-emerald-500 bg-emerald-500/10' : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/20 text-blue-500 rounded-lg"><Building2 className="w-6 h-6" /></div>
                        <div>
                          <h4 className="font-semibold text-white">Conservative (Low Risk)</h4>
                          <p className="text-sm text-zinc-400">Prioritize capital preservation over high returns. Focus on bonds and FDs.</p>
                        </div>
                      </div>
                    </div>

                    <div 
                      onClick={() => setFormData({...formData, riskProfile: 'MEDIUM'})}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${formData.riskProfile === 'MEDIUM' ? 'border-emerald-500 bg-emerald-500/10' : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/20 text-emerald-500 rounded-lg"><TrendingUp className="w-6 h-6" /></div>
                        <div>
                          <h4 className="font-semibold text-white">Balanced (Medium Risk)</h4>
                          <p className="text-sm text-zinc-400">A mix of growth and stability. Focus on ETFs and Blue-chip stocks.</p>
                        </div>
                      </div>
                    </div>

                    <div 
                      onClick={() => setFormData({...formData, riskProfile: 'HIGH'})}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${formData.riskProfile === 'HIGH' ? 'border-emerald-500 bg-emerald-500/10' : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-rose-500/20 text-rose-500 rounded-lg"><ShieldAlert className="w-6 h-6" /></div>
                        <div>
                          <h4 className="font-semibold text-white">Aggressive (High Risk)</h4>
                          <p className="text-sm text-zinc-400">Maximize long-term growth. Focus on Tech stocks, Small-caps, and Crypto.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <button onClick={() => setCurrentStep(1)} className="w-1/3 bg-zinc-800 text-white font-semibold rounded-lg px-4 py-3 hover:bg-zinc-700 transition-colors">Back</button>
                  <button onClick={handleNext} className="w-2/3 bg-emerald-500 text-black font-semibold rounded-lg px-4 py-3 flex items-center justify-center gap-2 hover:bg-emerald-400 transition-colors">
                    Next Step <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8 py-8 text-center"
              >
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-10 h-10 text-emerald-500 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-4">You're All Set!</h2>
                  <p className="text-zinc-400 max-w-sm mx-auto">
                    We've initialized your AI Financial Twin. You are now ready to build portfolios, analyze companies, and plan your wealth journey.
                  </p>
                </div>
                <button onClick={handleComplete} className="w-full bg-emerald-500 text-black font-semibold rounded-lg px-4 py-4 hover:bg-emerald-400 transition-all shadow-[0_0_30px_-5px_rgba(16,185,129,0.4)]">
                  Enter Dashboard
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
