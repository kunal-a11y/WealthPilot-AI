import { useQuery } from "@tanstack/react-query";
import { useAuth, useUser } from "@clerk/clerk-react";
import { fetchWithAuth } from "../lib/api";
import { Shield, TrendingUp, Award, DollarSign, Target, Activity, Settings } from "lucide-react";

export const Profile = () => {
  const { getToken } = useAuth();
  const { user: clerkUser } = useUser();

  const { data: user, isLoading } = useQuery({
    queryKey: ["userProfile"],
    queryFn: () => fetchWithAuth("/user/profile", getToken),
  });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header Profile Section */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
          <img src={clerkUser?.imageUrl || "https://ui-avatars.com/api/?name=" + user?.firstName} alt="Profile" className="w-24 h-24 rounded-full border-2 border-emerald-500 object-cover" />
          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-bold text-white">{user?.firstName} {user?.lastName}</h1>
            <p className="text-zinc-400">{user?.occupation} • {user?.country}</p>
            
            <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-sm font-medium">
                <Shield className="w-4 h-4" /> Level {user?.financialLevel || 1}
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-sm font-medium">
                <TrendingUp className="w-4 h-4" /> {user?.riskProfile} Risk
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-sm font-medium">
                <Award className="w-4 h-4" /> Pro Investor
              </div>
            </div>
          </div>
          <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg flex items-center gap-2 transition-colors">
            <Settings className="w-4 h-4" /> Edit Profile
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Financial Twin Baseline */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg"><DollarSign className="w-5 h-5" /></div>
            <h3 className="text-lg font-semibold text-white">Financial Baseline</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
              <span className="text-zinc-400">Monthly Income</span>
              <span className="font-semibold text-white">{user?.currency} {user?.monthlyIncome?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
              <span className="text-zinc-400">Monthly Expenses</span>
              <span className="font-semibold text-white">{user?.currency} {user?.monthlyExpenses?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Savings Rate</span>
              <span className="font-semibold text-emerald-400">
                {user?.monthlyIncome ? Math.round(((user.monthlyIncome - user.monthlyExpenses) / user.monthlyIncome) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>

        {/* AI Health Badges */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg"><Activity className="w-5 h-5" /></div>
            <h3 className="text-lg font-semibold text-white">AI Health Scores</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-zinc-800 bg-black text-center">
              <div className="text-2xl font-bold text-emerald-500 mb-1">85</div>
              <div className="text-xs text-zinc-400">Overall Health</div>
            </div>
            <div className="p-4 rounded-xl border border-zinc-800 bg-black text-center">
              <div className="text-2xl font-bold text-blue-500 mb-1">92</div>
              <div className="text-xs text-zinc-400">Debt Score</div>
            </div>
            <div className="p-4 rounded-xl border border-zinc-800 bg-black text-center">
              <div className="text-2xl font-bold text-amber-500 mb-1">78</div>
              <div className="text-xs text-zinc-400">Liquidity</div>
            </div>
            <div className="p-4 rounded-xl border border-zinc-800 bg-black text-center">
              <div className="text-2xl font-bold text-rose-500 mb-1">65</div>
              <div className="text-xs text-zinc-400">Diversification</div>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg"><Target className="w-5 h-5" /></div>
            <h3 className="text-lg font-semibold text-white">Achievements</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 border border-emerald-500/30">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-white">Profile Completed</h4>
                <p className="text-xs text-zinc-400">Unlocked your AI Financial Twin</p>
              </div>
            </div>
            <div className="flex items-center gap-4 opacity-40">
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 border border-zinc-700">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-white">First Investment</h4>
                <p className="text-xs text-zinc-400">Link an asset to unlock</p>
              </div>
            </div>
            <div className="flex items-center gap-4 opacity-40">
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 border border-zinc-700">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-white">Emergency Funded</h4>
                <p className="text-xs text-zinc-400">Save 6x monthly expenses</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
