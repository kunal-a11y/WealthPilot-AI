import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { fetchWithAuth } from "../lib/api";
import { TrendingUp, TrendingDown, Activity, Globe2, Coins, Flame, ArrowUpRight, ArrowDownRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ResponsiveContainer, AreaChart, Area, YAxis } from "recharts";
import { cn } from "../lib/utils";

const OVERVIEW_SYMBOLS = {
  indices: ["^GSPC", "^DJI", "^IXIC", "^RUT", "^VIX", "^NSEI", "^BSESN", "^FTSE", "^N225", "^STOXX50E"],
  crypto: ["BTC-USD", "ETH-USD", "SOL-USD", "BNB-USD", "XRP-USD"],
  commodities: ["GC=F", "SI=F", "CL=F", "BZ=F", "NG=F"],
  forex: ["EURUSD=X", "JPY=X", "GBPUSD=X", "INR=X", "AUDUSD=X"]
};

export const MarketOverview = () => {
  const { getToken } = useAuth();

  const allOverviewSymbols = Object.values(OVERVIEW_SYMBOLS).flat();

  const { data: overviewQuotes, isLoading: loadingOverview } = useQuery({
    queryKey: ["overview-quotes"],
    queryFn: () => fetchWithAuth(`/market/quotes?symbols=${allOverviewSymbols.join(',')}`, getToken),
  });

  const { data: sparklines, isLoading: loadingSparklines } = useQuery({
    queryKey: ["overview-sparklines"],
    queryFn: () => fetchWithAuth(`/market/sparklines?symbols=${allOverviewSymbols.join(',')}`, getToken),
  });

  const { data: trendingData, isLoading: loadingTrendingRaw } = useQuery({
    queryKey: ["trending-raw"],
    queryFn: () => fetchWithAuth("/market/trending", getToken),
  });

  const trendingSymbols = trendingData?.quotes?.map((q: any) => q.symbol).slice(0, 6) || [];

  const { data: trendingQuotes, isLoading: loadingTrendingQuotes } = useQuery({
    queryKey: ["trending-quotes", trendingSymbols],
    queryFn: () => fetchWithAuth(`/market/quotes?symbols=${trendingSymbols.join(',')}`, getToken),
    enabled: trendingSymbols.length > 0,
  });

  if (loadingOverview || loadingTrendingRaw) {
    return (
      <div className="p-8 h-full bg-[#090909] text-white space-y-8 max-w-[1400px] mx-auto">
        <div className="h-12 w-64 bg-[#151515] animate-pulse rounded-xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-40 bg-[#151515] animate-pulse rounded-2xl"></div>)}
        </div>
      </div>
    );
  }

  const renderGrid = (symbols: string[], icon: any, title: string) => {
    return (
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-emerald-500/10 rounded-lg">{icon}</div>
          <h2 className="text-2xl font-black text-white">{title}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {symbols.map((sym, i) => {
            const quote = overviewQuotes?.quotes?.find((q: any) => q.symbol === sym);
            const sparklineData = sparklines?.[sym] ? sparklines[sym].map((val: number, idx: number) => ({ date: idx, val })) : [];
            return <AssetCard key={sym} sym={sym} quote={quote} sparklineData={sparklineData} i={i} />;
          })}
        </div>
      </section>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="pb-32 max-w-[1400px] mx-auto text-white bg-[#090909] min-h-screen pt-4"
    >
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">
          Market <span className="text-emerald-500">Overview</span>
        </h1>
        <p className="text-lg text-zinc-500 font-medium max-w-3xl">
          Real-time bird's-eye view of global indices, commodities, forex, and cryptocurrency trends.
        </p>
      </div>

      {renderGrid(OVERVIEW_SYMBOLS.indices, <Globe2 className="w-5 h-5 text-emerald-500" />, "Global Indices")}
      {renderGrid(OVERVIEW_SYMBOLS.commodities, <Activity className="w-5 h-5 text-emerald-500" />, "Commodities")}
      {renderGrid(OVERVIEW_SYMBOLS.crypto, <Coins className="w-5 h-5 text-emerald-500" />, "Cryptocurrencies")}
      {renderGrid(OVERVIEW_SYMBOLS.forex, <Globe2 className="w-5 h-5 text-emerald-500" />, "Forex & Currencies")}

      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-rose-500/10 rounded-lg"><Flame className="w-5 h-5 text-rose-500" /></div>
          <h2 className="text-2xl font-black text-white">Trending Now</h2>
        </div>
        
        {loadingTrendingQuotes ? (
          <div className="flex gap-4"><div className="h-40 w-full bg-[#151515] animate-pulse rounded-2xl"></div></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
            {trendingSymbols.map((sym: string, i: number) => {
              const quote = trendingQuotes?.quotes?.find((q: any) => q.symbol === sym);
              return <AssetCard key={sym} sym={sym} quote={quote} sparklineData={[]} i={i} />;
            })}
          </div>
        )}
      </section>
    </motion.div>
  );
};

function AssetCard({ sym, quote, sparklineData, i }: any) {
  const isPositive = (quote?.regularMarketChangePercent ?? 0) >= 0;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.05 }}
    >
      <Link to={`/company/${sym}`} className="group block bg-[#151515] border border-zinc-800 hover:border-emerald-500/50 p-5 rounded-[24px] transition-all hover:shadow-[0_10px_30px_-15px_rgba(34,197,94,0.15)] relative overflow-hidden flex flex-col h-full">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none rounded-t-[24px]"></div>
        
        <div className="relative z-10 flex flex-col h-full justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-black text-lg text-white group-hover:text-emerald-500 transition-colors truncate pr-2">{sym}</h3>
              {quote && (
                <div className={cn("text-xs font-bold flex items-center px-2 py-0.5 rounded-md", isPositive ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500")}>
                  {isPositive ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                  {Math.abs(quote.regularMarketChangePercent ?? 0).toFixed(2)}%
                </div>
              )}
            </div>
            <p className="text-xs text-zinc-500 font-medium truncate mb-4">{quote?.shortName || quote?.longName || 'Loading...'}</p>
          </div>

          <div>
            {quote && (
              <div className="font-black text-xl text-white mb-4">
                {quote.currency === 'INR' ? '₹' : quote.currency === 'EUR' ? '€' : quote.currency === 'GBP' ? '£' : quote.currency === 'JPY' ? '¥' : '$'}
                {(quote.regularMarketPrice ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            )}

            {sparklineData && sparklineData.length > 0 && (
              <div className="h-10 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sparklineData}>
                    <defs>
                      <linearGradient id={`colorOverview-${sym}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={isPositive ? '#10b981' : '#f43f5e'} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={isPositive ? '#10b981' : '#f43f5e'} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <YAxis domain={['auto', 'auto']} hide />
                    <Area type="monotone" dataKey="val" stroke={isPositive ? '#10b981' : '#f43f5e'} strokeWidth={2} fillOpacity={1} fill={`url(#colorOverview-${sym})`} isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
