import { useQuery } from "@tanstack/react-query";
import { useAuth, useUser } from "@clerk/clerk-react";
import { fetchWithAuth } from "../lib/api";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Activity, Wallet, ShieldCheck, HeartPulse, Trophy } from "lucide-react";
import { cn } from "../lib/utils";
import { motion } from "framer-motion";

export function Dashboard() {
  const { getToken } = useAuth();
  const { user } = useUser();

  const { data: assets = [] } = useQuery({ queryKey: ["assets"], queryFn: () => fetchWithAuth("/finance/assets", getToken) });
  const { data: liabilities = [] } = useQuery({ queryKey: ["liabilities"], queryFn: () => fetchWithAuth("/finance/liabilities", getToken) });
  const { data: profile } = useQuery({ queryKey: ["userProfile"], queryFn: () => fetchWithAuth("/user/profile", getToken) });
  
  const { data: health, isLoading: healthLoading } = useQuery({
    queryKey: ["healthScore"],
    queryFn: () => fetchWithAuth("/ai/health-score", getToken),
  });

  const { data: trendingRaw, isLoading: isLoadingTrendingRaw } = useQuery({
    queryKey: ["trending"],
    queryFn: () => fetchWithAuth("/market/trending", getToken),
  });

  const trendingSymbols = trendingRaw?.quotes?.map((q: any) => q.symbol).slice(0, 5) || [];

  const { data: trendingQuotes, isLoading: isLoadingTrendingQuotes } = useQuery({
    queryKey: ["trending-quotes", trendingSymbols],
    queryFn: () => fetchWithAuth(`/market/quotes?symbols=${trendingSymbols.join(',')}`, getToken),
    enabled: trendingSymbols.length > 0,
  });

  const { data: history, isLoading: isLoadingHistory } = useQuery({
    queryKey: ["history", "^NSEI"],
    queryFn: () => fetchWithAuth("/market/history/^NSEI?range=6mo", getToken),
  });

  const { data: niftyQuote } = useQuery({
    queryKey: ["quote", "^NSEI"],
    queryFn: () => fetchWithAuth("/market/quote/^NSEI", getToken),
  });

  const totalAssets = assets.reduce((a: number, b: any) => a + b.value, 0);
  const totalLiabilities = liabilities.reduce((a: number, b: any) => a + b.value, 0);
  const netWorth = totalAssets - totalLiabilities;

  const chartData = history?.map((h: any) => ({
    name: new Date(h.date).toLocaleDateString('en-IN', { month: 'short' }),
    value: h.close
  })) || [];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="p-8 space-y-8 max-w-7xl mx-auto pb-32">
      
      <motion.header variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white flex flex-wrap items-center gap-3">
            Welcome back, {user?.firstName || "Investor"} 
            {profile?.financialLevel && <span className="bg-emerald-500/20 text-emerald-500 text-sm px-2 py-1 rounded-full border border-emerald-500/50">Lvl {profile.financialLevel}</span>}
          </h1>
          <p className="text-zinc-400 mt-2">Here is your executive financial summary for today.</p>
        </div>
      </motion.header>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Net Worth" 
          value={`₹${netWorth.toLocaleString()}`} 
          icon={<Wallet className="w-5 h-5 text-emerald-500" />} 
          highlight 
        />
        <MetricCard 
          title="Total Assets" 
          value={`₹${totalAssets.toLocaleString()}`} 
          icon={<TrendingUp className="w-5 h-5 text-blue-500" />} 
        />
        <MetricCard 
          title="Total Liabilities" 
          value={`₹${totalLiabilities.toLocaleString()}`} 
          icon={<TrendingDown className="w-5 h-5 text-rose-500" />} 
        />
        
        <div className="bg-zinc-900 border border-emerald-500/30 p-6 rounded-3xl shadow-[0_0_15px_rgba(16,185,129,0.1)] relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-8 -top-8 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl"></div>
          <h3 className="text-sm font-medium text-zinc-400 flex items-center gap-2 mb-2"><HeartPulse className="w-4 h-4 text-emerald-500" /> AI Health Score</h3>
          {healthLoading ? (
            <div className="animate-pulse h-10 w-24 bg-black rounded-lg"></div>
          ) : (
            <div>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-black text-white">{health?.score || 0}</span>
                <span className="text-emerald-500 font-semibold mb-1">{health?.status}</span>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <div>
                <h2 className="text-lg md:text-xl font-bold tracking-tight text-white flex items-center gap-2"><Activity className="w-5 h-5 text-emerald-500 shrink-0" /> <span className="truncate">Market Pulse (NIFTY 50)</span></h2>
                {niftyQuote && !niftyQuote.error && (
                  <div className="flex items-center gap-3 mt-1 ml-0 md:ml-7">
                    <span className="text-xl md:text-2xl font-black text-white font-mono">₹{niftyQuote.regularMarketPrice?.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                    <span className={cn("text-sm font-bold flex items-center", niftyQuote.regularMarketChangePercent >= 0 ? "text-emerald-500" : "text-rose-500")}>
                      {niftyQuote.regularMarketChangePercent >= 0 ? <ArrowUpRight className="w-4 h-4"/> : <ArrowDownRight className="w-4 h-4"/>}
                      {niftyQuote.regularMarketChangePercent?.toFixed(2)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="h-80">
              {isLoadingHistory ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#525252" fontSize={12} tickLine={false} axisLine={false} minTickGap={30} />
                    <YAxis stroke="#525252" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${(val/1000).toFixed(0)}k`} domain={['auto', 'auto']} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }}
                      itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                      formatter={(val: number) => [`₹${val.toLocaleString()}`, 'Index Value']}
                    />
                    <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl">
            <h2 className="text-xl font-bold tracking-tight mb-4 flex items-center gap-2 text-white">
              <TrendingUp className="w-5 h-5 text-amber-500" /> Trending Assets
            </h2>
            <div className="space-y-3">
              {isLoadingTrendingQuotes ? (
                <div className="animate-pulse space-y-3">
                  {[1,2,3,4,5].map(i => <div key={i} className="h-12 bg-black rounded-xl border border-zinc-800"></div>)}
                </div>
              ) : trendingSymbols.map((sym: string) => {
                const stock = trendingQuotes?.quotes?.find((q: any) => q.symbol === sym);
                return (
                  <div key={sym} onClick={() => window.location.href = `/company/${sym}`} className="flex items-center justify-between p-3 rounded-xl bg-black border border-zinc-800 hover:border-emerald-500/50 transition-all cursor-pointer group">
                    <div>
                      <h3 className="font-bold text-sm text-white group-hover:text-emerald-500 transition-colors">{sym}</h3>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-sm text-white">
                        {stock?.currency === 'INR' ? '₹' : '$'}{stock?.regularMarketPrice ? stock.regularMarketPrice.toLocaleString(undefined, {minimumFractionDigits: 2}) : '---'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-900/40 to-black border border-emerald-500/20 p-6 rounded-3xl relative overflow-hidden">
             <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
             <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-500" /> Recent Achievement</h2>
             {profile?.achievements && profile.achievements.length > 0 ? (
               <div className="mt-4 p-4 bg-black/50 border border-zinc-800 rounded-2xl flex items-center gap-4">
                 <div className="p-3 bg-yellow-500/20 rounded-full border border-yellow-500/50 text-yellow-500">
                   <Trophy className="w-6 h-6" />
                 </div>
                 <div>
                   <p className="font-bold text-white">{profile.achievements[0].title}</p>
                   <p className="text-xs text-zinc-400">Unlocked recently</p>
                 </div>
               </div>
             ) : (
               <p className="text-sm text-emerald-100/70 mt-2">Complete onboarding, add assets, and reach financial milestones to unlock achievements.</p>
             )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function MetricCard({ title, value, icon, highlight = false }: any) {
  return (
    <div className={cn(
      "p-6 rounded-3xl flex flex-col justify-between border transition-all duration-300 hover:shadow-lg",
      highlight ? "bg-black border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)]" : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
    )}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-medium text-zinc-400">{title}</h3>
        <div className="p-2 bg-black rounded-xl border border-zinc-800">
          {icon}
        </div>
      </div>
      <span className={cn("text-3xl font-bold tracking-tight", highlight ? "text-emerald-500" : "text-white")}>{value}</span>
    </div>
  );
}
