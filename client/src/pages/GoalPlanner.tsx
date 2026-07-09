import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { fetchWithAuth } from "../lib/api";
import { Target, Plus, CheckCircle2, TrendingUp, Calendar, Trash2 } from "lucide-react";
import { CurrencyInput } from "../components/ui/CurrencyInput";
import { motion } from "framer-motion";

export const GoalPlanner = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: "", targetAmount: "", currentAmount: "", targetDate: "", monthlyContribution: "", category: "RETIREMENT" });

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ["goals"],
    queryFn: () => fetchWithAuth("/finance/goals", getToken),
  });

  const addMutation = useMutation({
    mutationFn: (data: any) => fetchWithAuth("/finance/goals", getToken, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      setIsAdding(false);
      setFormData({ name: "", targetAmount: "", currentAmount: "", targetDate: "", monthlyContribution: "", category: "RETIREMENT" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetchWithAuth(`/finance/goals/${id}`, getToken, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["goals"] }),
  });

  if (isLoading) return <div className="p-8 text-center text-zinc-400">Loading goals...</div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Goal Planner</h1>
          <p className="text-zinc-400">Set, track, and crush your financial milestones.</p>
        </div>
        <button onClick={() => setIsAdding(true)} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-lg flex items-center gap-2 transition-colors shadow-[0_0_20px_-5px_rgba(16,185,129,0.5)]">
          <Plus className="w-5 h-5" /> New Goal
        </button>
      </div>

      {isAdding && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl">
          <h3 className="text-lg font-semibold text-white mb-4">Create New Goal</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium text-zinc-400 block mb-1">Goal Name</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-2 text-white focus:border-emerald-500" placeholder="e.g. Dream House" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Target Amount</label>
              <CurrencyInput value={formData.targetAmount} onChange={(val) => setFormData({...formData, targetAmount: val})} placeholder="10000000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Current Saved Amount</label>
              <CurrencyInput value={formData.currentAmount} onChange={(val) => setFormData({...formData, currentAmount: val})} placeholder="500000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Target Date</label>
              <input type="date" value={formData.targetDate} onChange={(e) => setFormData({...formData, targetDate: e.target.value})} className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-2 text-white focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Monthly Contribution (Optional)</label>
              <CurrencyInput value={formData.monthlyContribution} onChange={(val) => setFormData({...formData, monthlyContribution: val})} placeholder="25000" />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-400 block mb-1">Category</label>
              <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-2 text-white focus:border-emerald-500">
                <option value="RETIREMENT">Retirement</option>
                <option value="HOUSE">House</option>
                <option value="CAR">Car</option>
                <option value="EDUCATION">Education</option>
                <option value="VACATION">Vacation</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 justify-end mt-4">
            <button onClick={() => setIsAdding(false)} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors">Cancel</button>
            <button onClick={() => addMutation.mutate(formData)} disabled={!formData.name || !formData.targetAmount} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-lg transition-colors disabled:opacity-50">Save Goal</button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map((goal: any) => {
          const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
          const isComplete = progress >= 100;
          return (
            <div key={goal.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden group">
              {isComplete && <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${isComplete ? 'bg-emerald-500/20 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}`}>
                    {isComplete ? <CheckCircle2 className="w-6 h-6" /> : <Target className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-lg">{goal.name}</h3>
                    <p className="text-sm text-zinc-400">{goal.category}</p>
                  </div>
                </div>
                <button onClick={() => deleteMutation.mutate(goal.id)} className="text-zinc-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-5 h-5" /></button>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Progress</span>
                  <span className="font-semibold text-white">{progress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-black rounded-full h-2.5 overflow-hidden">
                  <div className="bg-emerald-500 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                </div>
                <div className="flex justify-between text-xs text-zinc-500">
                  <span>₹{goal.currentAmount.toLocaleString()}</span>
                  <span>₹{goal.targetAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-zinc-800">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-zinc-500" />
                  <div className="flex flex-col">
                    <span className="text-xs text-zinc-500">Target Date</span>
                    <span className="text-sm font-medium text-zinc-300">{goal.targetDate ? new Date(goal.targetDate).toLocaleDateString() : 'No date'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-zinc-500" />
                  <div className="flex flex-col">
                    <span className="text-xs text-zinc-500">Monthly SIP</span>
                    <span className="text-sm font-medium text-zinc-300">₹{goal.monthlyContribution?.toLocaleString() || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {goals.length === 0 && !isAdding && (
        <div className="text-center py-12 bg-zinc-900/50 rounded-2xl border border-zinc-800 border-dashed">
          <Target className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-zinc-400">No Goals Yet</h3>
          <p className="text-zinc-500 mb-4">Start planning your future by adding a financial goal.</p>
          <button onClick={() => setIsAdding(true)} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg">Add Goal</button>
        </div>
      )}
    </div>
  );
};
