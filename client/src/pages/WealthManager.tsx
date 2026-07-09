import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { fetchWithAuth } from "../lib/api";
import { Plus, Wallet, Building, CreditCard, TrendingUp, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { CurrencyInput } from "../components/ui/CurrencyInput";

export const WealthManager = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"ASSETS" | "LIABILITIES">("ASSETS");
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ type: "STOCK", name: "", value: "", currency: "INR", interestRate: "" });

  const { data: assets = [], isLoading: loadingAssets } = useQuery({
    queryKey: ["assets"],
    queryFn: () => fetchWithAuth("/finance/assets", getToken),
  });

  const { data: liabilities = [], isLoading: loadingLiabilities } = useQuery({
    queryKey: ["liabilities"],
    queryFn: () => fetchWithAuth("/finance/liabilities", getToken),
  });

  const addMutation = useMutation({
    mutationFn: (data: any) => fetchWithAuth(`/finance/${activeTab.toLowerCase()}`, getToken, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [activeTab.toLowerCase()] });
      setIsAdding(false);
      setFormData({ type: activeTab === "ASSETS" ? "STOCK" : "MORTGAGE", name: "", value: "", currency: "INR", interestRate: "" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetchWithAuth(`/finance/${activeTab.toLowerCase()}/${id}`, getToken, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [activeTab.toLowerCase()] }),
  });

  const totalAssets = assets.reduce((acc: number, val: any) => acc + val.value, 0);
  const totalLiabilities = liabilities.reduce((acc: number, val: any) => acc + val.value, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Wealth Manager</h1>
          <p className="text-zinc-400">Track and manage your entire financial ecosystem.</p>
        </div>
        <button onClick={() => setIsAdding(true)} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-lg flex items-center gap-2 transition-colors shadow-[0_0_20px_-5px_rgba(16,185,129,0.5)]">
          <Plus className="w-5 h-5" /> Add New
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="flex items-center gap-3 mb-2 text-emerald-500">
            <TrendingUp className="w-5 h-5" />
            <h3 className="font-semibold">Total Assets</h3>
          </div>
          <p className="text-3xl font-bold text-white">₹{totalAssets.toLocaleString()}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="flex items-center gap-3 mb-2 text-rose-500">
            <CreditCard className="w-5 h-5" />
            <h3 className="font-semibold">Total Liabilities</h3>
          </div>
          <p className="text-3xl font-bold text-white">₹{totalLiabilities.toLocaleString()}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="flex items-center gap-3 mb-2 text-blue-500">
            <Wallet className="w-5 h-5" />
            <h3 className="font-semibold">Net Worth</h3>
          </div>
          <p className="text-3xl font-bold text-white">₹{(totalAssets - totalLiabilities).toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="flex border-b border-zinc-800">
          <button onClick={() => setActiveTab("ASSETS")} className={`flex-1 py-4 font-semibold text-center transition-colors ${activeTab === "ASSETS" ? "text-emerald-500 border-b-2 border-emerald-500" : "text-zinc-500 hover:text-zinc-300"}`}>Assets</button>
          <button onClick={() => setActiveTab("LIABILITIES")} className={`flex-1 py-4 font-semibold text-center transition-colors ${activeTab === "LIABILITIES" ? "text-rose-500 border-b-2 border-rose-500" : "text-zinc-500 hover:text-zinc-300"}`}>Liabilities</button>
        </div>

        {isAdding && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-black border-b border-zinc-800">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="text-sm font-medium text-zinc-400 block mb-1">Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500" placeholder="e.g. HDFC Home" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Value / Amount</label>
                <CurrencyInput value={formData.value} onChange={(val: string) => setFormData({...formData, value: val})} placeholder="500000" />
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-400 block mb-1">Type</label>
                <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500">
                  {activeTab === "ASSETS" ? (
                    <><option value="STOCK">Stock</option><option value="REAL_ESTATE">Real Estate</option><option value="MUTUAL_FUND">Mutual Fund</option><option value="CASH">Cash</option></>
                  ) : (
                    <><option value="MORTGAGE">Mortgage</option><option value="CAR_LOAN">Car Loan</option><option value="CREDIT_CARD">Credit Card</option><option value="PERSONAL_LOAN">Personal Loan</option></>
                  )}
                </select>
              </div>
              <div className="flex gap-2">
                <button onClick={() => addMutation.mutate(formData)} disabled={!formData.name || !formData.value} className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-lg py-2 disabled:opacity-50">Save</button>
                <button onClick={() => setIsAdding(false)} className="px-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg py-2">Cancel</button>
              </div>
            </div>
          </motion.div>
        )}

        <div className="p-0">
          {(activeTab === "ASSETS" ? assets : liabilities).map((item: any) => (
            <div key={item.id} className="flex items-center justify-between p-4 border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${activeTab === 'ASSETS' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                  {activeTab === 'ASSETS' ? <Building className="w-6 h-6" /> : <CreditCard className="w-6 h-6" />}
                </div>
                <div>
                  <h4 className="font-semibold text-white">{item.name}</h4>
                  <p className="text-sm text-zinc-400">{item.type.replace('_', ' ')}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-lg font-bold text-white">₹{item.value.toLocaleString()}</span>
                <button onClick={() => deleteMutation.mutate(item.id)} className="text-zinc-600 hover:text-rose-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
              </div>
            </div>
          ))}
          {(activeTab === "ASSETS" ? assets : liabilities).length === 0 && (
            <div className="p-8 text-center text-zinc-500">
              <p>No {activeTab.toLowerCase()} recorded yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
