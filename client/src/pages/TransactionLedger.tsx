import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { fetchWithAuth } from "../lib/api";
import { Receipt, Plus, ArrowUpRight, ArrowDownRight, RefreshCcw, Building, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";
import { CurrencyInput } from "../components/ui/CurrencyInput";

export const TransactionLedger = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ type: "EXPENSE", amount: "", date: new Date().toISOString().split('T')[0], description: "", category: "" });

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => fetchWithAuth("/finance/transactions", getToken),
  });

  const addMutation = useMutation({
    mutationFn: (data: any) => fetchWithAuth("/finance/transactions", getToken, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      setIsAdding(false);
      setFormData({ type: "EXPENSE", amount: "", date: new Date().toISOString().split('T')[0], description: "", category: "" });
    },
  });

  if (isLoading) return <div className="p-8 text-center text-zinc-400">Loading ledger...</div>;

  const getIcon = (type: string) => {
    switch(type) {
      case 'INCOME': return <ArrowUpRight className="w-5 h-5 text-emerald-500" />;
      case 'EXPENSE': return <ArrowDownRight className="w-5 h-5 text-rose-500" />;
      case 'INVESTMENT': return <Building className="w-5 h-5 text-blue-500" />;
      default: return <RefreshCcw className="w-5 h-5 text-zinc-500" />;
    }
  };

  const getColor = (type: string) => {
    switch(type) {
      case 'INCOME': return "text-emerald-500 bg-emerald-500/10";
      case 'EXPENSE': return "text-rose-500 bg-rose-500/10";
      case 'INVESTMENT': return "text-blue-500 bg-blue-500/10";
      default: return "text-zinc-500 bg-zinc-500/10";
    }
  };

  const getSign = (type: string) => (type === 'INCOME' || type === 'WITHDRAWAL') ? '+' : '-';

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Transaction Ledger</h1>
          <p className="text-zinc-400">Track your cash flow, investments, and expenses.</p>
        </div>
        <button onClick={() => setIsAdding(true)} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-lg flex items-center gap-2 transition-colors">
          <Plus className="w-5 h-5" /> Add Log
        </button>
      </div>

      {isAdding && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium text-zinc-400 block mb-1">Type</label>
              <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-2 text-white focus:border-emerald-500">
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
                <option value="INVESTMENT">Investment</option>
                <option value="WITHDRAWAL">Withdrawal</option>
                <option value="LOAN_PAYMENT">Loan Payment</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Amount</label>
              <CurrencyInput value={formData.amount} onChange={(val) => setFormData({...formData, amount: val})} placeholder="5000" />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-400 block mb-1">Date</label>
              <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-2 text-white focus:border-emerald-500" />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-zinc-400 block mb-1">Description</label>
              <input type="text" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-2 text-white focus:border-emerald-500" placeholder="e.g. Salary, Rent, APPL Stock" />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => setIsAdding(false)} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg">Cancel</button>
            <button onClick={() => addMutation.mutate(formData)} disabled={!formData.amount} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-lg disabled:opacity-50">Save</button>
          </div>
        </motion.div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-black/50 border-b border-zinc-800">
            <tr>
              <th className="px-6 py-4 text-xs font-medium text-zinc-500 uppercase">Type</th>
              <th className="px-6 py-4 text-xs font-medium text-zinc-500 uppercase">Description</th>
              <th className="px-6 py-4 text-xs font-medium text-zinc-500 uppercase">Date</th>
              <th className="px-6 py-4 text-xs font-medium text-zinc-500 uppercase text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {transactions.map((tx: any) => (
              <tr key={tx.id} className="hover:bg-zinc-800/20 transition-colors">
                <td className="px-6 py-4">
                  <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium ${getColor(tx.type)}`}>
                    {getIcon(tx.type)} {tx.type.replace('_', ' ')}
                  </div>
                </td>
                <td className="px-6 py-4 font-medium text-white">{tx.description || '-'}</td>
                <td className="px-6 py-4 text-sm text-zinc-400">{new Date(tx.date).toLocaleDateString()}</td>
                <td className={`px-6 py-4 text-right font-bold ${tx.type === 'INCOME' || tx.type === 'WITHDRAWAL' ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {getSign(tx.type)}₹{tx.amount.toLocaleString()}
                </td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">No transactions recorded yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
