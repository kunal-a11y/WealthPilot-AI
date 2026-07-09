import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { fetchWithAuth } from "../lib/api";
import { Search, Filter, ArrowUpRight, ArrowDownRight, Globe2, Sparkles, Building2, Coins, TrendingUp, TrendingDown, Star, Activity, Briefcase } from "lucide-react";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ResponsiveContainer, AreaChart, Area, YAxis } from "recharts";

// High-quality geoJSON for the map
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Massive global ticker list
const GLOBAL_ASSETS: Record<string, Record<string, string[]>> = {
  "United States": {
    "Technology Stocks": ["AAPL", "MSFT", "NVDA", "GOOGL", "META", "TSLA", "AMD", "INTC", "CRM", "ADBE", "NFLX", "AMZN"],
    "Value & Dividend": ["BRK-B", "JPM", "JNJ", "WMT", "PG", "KO", "PEP", "CVX", "XOM", "ABBV", "MCD", "PFE"],
    "Growth Stocks": ["PLTR", "SNOW", "CRWD", "DDOG", "NET", "SQ", "SHOP", "ROKU"],
    "Broad ETFs": ["SPY", "QQQ", "DIA", "VTI", "VOO", "IVV", "IWM", "VT"],
    "Sector ETFs": ["XLF", "XLV", "XLK", "XLE", "SMH", "ARKK", "XLY", "XLP"],
    "Mutual Funds": ["VFIAX", "FXAIX", "VTSAX", "FCNTX", "VWENX", "PRASX"],
    "Government Bonds": ["TLT", "IEF", "SHY", "GOVT", "VGIT", "BIL"],
    "Corporate Bonds": ["LQD", "HYG", "VCIT", "JNK", "VCSH", "USIG"],
    "REITs": ["VNQ", "AMT", "PLD", "O", "SPG", "CCI", "PSA"]
  },
  "India": {
    "Large Cap Stocks": ["RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "INFY.NS", "ICICIBANK.NS", "SBIN.NS", "BHARTIARTL.NS", "ITC.NS", "L&T.NS"],
    "Mid/Small Cap": ["TRENT.NS", "CGPOWER.NS", "DIXON.NS", "SUZLON.NS", "IREDA.NS", "ZOMATO.NS", "PAYTM.NS", "RVNL.NS"],
    "Index ETFs": ["NIFTYBEES.NS", "BANKBEES.NS", "CPSEETF.NS", "JUNIORBEES.NS", "ITBEES.NS"],
    "Mutual Funds": ["0P00005WLZ.BO", "0P0000XVUM.BO", "0P0000XW8Z.BO", "0P0001B619.BO"], // Example Indian Mutual Funds
    "Bonds & G-Secs": ["GSEC10YR-IND.NS", "LIQUIDBEES.NS", "SGBMAY29.NS"]
  },
  "United Kingdom": {
    "Large Cap Stocks": ["AZN.L", "SHEL.L", "HSBA.L", "UNLV.L", "BP.L", "GSK.L", "RIO.L", "BATS.L"],
    "ETFs & Funds": ["ISF.L", "VUAG.L", "VUKG.L", "CSPX.L", "VUKE.L"],
    "Bonds (Gilts)": ["IGLT.L", "VGOV.L", "GLTS.L"]
  },
  "European Union": {
    "Large Cap Stocks": ["MC.PA", "ASML.AS", "SAP.DE", "SIE.DE", "OR.PA", "TTE.PA", "SAN.PA", "ALV.DE"],
    "ETFs": ["EXSA.DE", "SXR8.DE", "EUNL.DE", "CSSPX.MI", "CEU.PA"],
    "Bonds": ["MTS.PA", "XG7S.DE", "IBGL.AS"]
  },
  "Canada": {
    "Large Cap Stocks": ["RY.TO", "TD.TO", "SHOP.TO", "CNQ.TO", "ENB.TO", "CP.TO", "BMO.TO"],
    "ETFs": ["XIU.TO", "VCE.TO", "XIC.TO", "VDY.TO"],
    "Bonds": ["XBB.TO", "ZAG.TO", "VAB.TO"]
  },
  "Australia": {
    "Large Cap Stocks": ["BHP.AX", "CBA.AX", "CSL.AX", "NAB.AX", "WBC.AX", "ANZ.AX"],
    "ETFs": ["VAS.AX", "IOZ.AX", "A200.AX", "VDHG.AX"],
    "Bonds": ["VAF.AX", "IAF.AX", "CRED.AX"]
  },
  "Japan": {
    "Large Cap Stocks": ["7203.T", "6758.T", "8306.T", "9984.T", "6861.T", "9432.T", "8035.T"], // Toyota, Sony, MUFG, SoftBank, Keyence
    "ETFs": ["1306.T", "1321.T", "1570.T"],
  },
  "Global/Crypto/Commodities": {
    "Top Cryptocurrencies": ["BTC-USD", "ETH-USD", "SOL-USD", "BNB-USD", "XRP-USD", "ADA-USD", "DOGE-USD", "AVAX-USD", "LINK-USD"],
    "DeFi & Altcoins": ["UNI-USD", "MKR-USD", "AAVE-USD", "MATIC-USD", "DOT-USD"],
    "Stablecoins": ["USDT-USD", "USDC-USD", "DAI-USD"],
    "Commodities": ["GC=F", "SI=F", "CL=F", "BZ=F", "HG=F", "NG=F", "ZC=F", "PA=F", "PL=F"], // Gold, Silver, Crude, Brent, Copper, Nat Gas, Corn, Palladium, Platinum
    "Currencies (Forex)": ["EURUSD=X", "JPY=X", "GBPUSD=X", "INR=X", "AUDUSD=X", "CAD=X", "CHF=X", "CNY=X"],
    "International Funds": ["VXUS", "VEA", "VWO", "EEM", "VEU", "IXUS"]
  }
};

const REGIONS = Object.keys(GLOBAL_ASSETS);

const REGION_MAP: Record<string, string> = {
  "United States": "USA",
  "India": "IND",
  "United Kingdom": "GBR",
  "European Union": "FRA", // Representative for click
  "Canada": "CAN",
  "Australia": "AUS",
  "Japan": "JPN"
};

export function Screener() {
  const { getToken } = useAuth();
  
  const [region, setRegion] = useState("United States");
  const [assetClass, setAssetClass] = useState("Technology Stocks");
  const [discoveryQuery, setDiscoveryQuery] = useState("");
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveredAssets, setDiscoveredAssets] = useState<{symbol: string, name: string, reason: string}[] | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");

  useEffect(() => {
    if (!discoveredAssets) {
      const classes = Object.keys(GLOBAL_ASSETS[region] || {});
      if (classes.length > 0 && !classes.includes(assetClass)) {
        setAssetClass(classes[0]);
      }
    }
  }, [region, discoveredAssets]);

  const activeSymbols = discoveredAssets 
    ? discoveredAssets.map(a => a.symbol) 
    : (GLOBAL_ASSETS[region]?.[assetClass] || []);

  const { data: quotesData, isLoading: quotesLoading } = useQuery({
    queryKey: ["global-quotes", activeSymbols],
    queryFn: () => fetchWithAuth(`/market/quotes?symbols=${activeSymbols.join(',')}`, getToken),
    enabled: activeSymbols.length > 0,
  });

  const { data: sparklines, isLoading: sparklinesLoading } = useQuery({
    queryKey: ["global-sparklines", activeSymbols],
    queryFn: () => fetchWithAuth(`/market/sparklines?symbols=${activeSymbols.join(',')}`, getToken),
    enabled: activeSymbols.length > 0,
  });

  const handleDiscovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!discoveryQuery.trim()) {
      setDiscoveredAssets(null);
      return;
    }
    setIsDiscovering(true);
    setViewMode("grid");
    try {
      const results = await fetchWithAuth(`/ai/discover`, getToken, {
        method: "POST",
        body: JSON.stringify({ prompt: discoveryQuery })
      });
      if (Array.isArray(results)) {
        setDiscoveredAssets(results);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleMapClick = (geo: any) => {
    const id = geo.id; // ISO3 code
    const mappedRegion = Object.keys(REGION_MAP).find(k => REGION_MAP[k] === id);
    if (mappedRegion) {
      setRegion(mappedRegion);
      setDiscoveredAssets(null);
      setViewMode("grid");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="space-y-12 pb-32 max-w-[1400px] mx-auto text-white bg-[#090909] min-h-screen"
    >
      {/* HEADER SECTION */}
      <header className="text-center space-y-6 pt-8 px-4">
        <motion.div initial={{ y: -20 }} animate={{ y: 0 }} className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#151515] border border-zinc-800 text-sm font-medium text-zinc-400">
          <Globe2 className="w-4 h-4 text-emerald-500" /> Premium Global Intelligence
        </motion.div>
        <h1 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tighter">
          Global Market <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">Scanner</span>
        </h1>
        <p className="text-lg md:text-xl text-zinc-500 max-w-2xl mx-auto font-medium">
          Discover and analyze investment opportunities from around the world using AI.
        </p>

        {/* AI SEARCH BAR */}
        <div className="max-w-3xl mx-auto relative mt-8">
          <form onSubmit={handleDiscovery} className="relative flex items-center">
            <Search className="absolute left-4 md:left-6 w-5 h-5 md:w-6 md:h-6 text-zinc-500" />
            <input 
              type="text" 
              value={discoveryQuery}
              onChange={e => setDiscoveryQuery(e.target.value)}
              disabled={isDiscovering}
              placeholder="Search assets or ask AI..."
              className="w-full bg-[#151515]/80 backdrop-blur-xl border border-zinc-800 text-white placeholder:text-zinc-600 rounded-full py-4 md:py-5 pl-12 md:pl-16 pr-[120px] md:pr-44 text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all shadow-2xl text-ellipsis"
            />
            <button 
              type="submit" 
              disabled={isDiscovering || !discoveryQuery.trim()}
              className="absolute right-2 md:right-3 bg-emerald-500 text-black px-4 md:px-6 py-2.5 md:py-3 rounded-full font-bold hover:bg-emerald-400 disabled:opacity-50 transition-colors flex items-center gap-2 text-sm md:text-base"
            >
              {isDiscovering ? "Scanning..." : <><Sparkles className="w-4 h-4"/> <span className="hidden sm:inline">Discover</span></>}
            </button>
          </form>
          {discoveredAssets && (
            <button onClick={() => { setDiscoveredAssets(null); setDiscoveryQuery(""); }} className="mt-4 text-sm text-zinc-500 hover:text-white transition-colors">
              Clear AI Discovery Results
            </button>
          )}
        </div>
      </header>

      {/* VIEW TOGGLES */}
      <div className="flex justify-center gap-4">
        <button onClick={() => setViewMode("grid")} className={cn("px-6 py-2 rounded-full font-bold transition-all text-sm", viewMode === "grid" ? "bg-white text-black shadow-lg shadow-white/10" : "bg-[#151515] text-zinc-400 hover:text-white border border-zinc-800")}>
          Asset Grid
        </button>
        <button onClick={() => setViewMode("map")} className={cn("px-6 py-2 rounded-full font-bold transition-all text-sm", viewMode === "map" ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20" : "bg-[#151515] text-zinc-400 hover:text-white border border-zinc-800")}>
          World Map
        </button>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === "map" ? (
          <motion.div 
            key="map"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full h-[600px] bg-[#151515] border border-zinc-800 rounded-[40px] overflow-hidden relative shadow-2xl"
          >
            <div className="absolute top-8 left-8 z-10 pointer-events-none">
              <h3 className="text-2xl font-black mb-2">Global Markets</h3>
              <p className="text-zinc-500 font-medium">Map view is currently optimizing. Please use the Asset Grid.</p>
            </div>
            <div className="w-full h-full flex flex-col items-center justify-center opacity-50">
              <Globe2 className="w-32 h-32 text-zinc-600 mb-6 animate-pulse-slow" />
              <button onClick={() => setViewMode("grid")} className="px-8 py-3 bg-emerald-500 text-black font-bold rounded-full">Return to Grid View</button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* HORIZONTAL REGION SELECTOR */}
            {!discoveredAssets && (
              <div className="w-full overflow-x-auto custom-scrollbar pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
                <div className="flex items-center gap-3 w-max mx-auto">
                  {REGIONS.map(r => (
                    <button 
                      key={r} 
                      onClick={() => setRegion(r)}
                      className={cn("px-6 py-3 rounded-2xl font-bold transition-all whitespace-nowrap border text-sm", region === r ? "bg-white text-black border-transparent shadow-xl" : "bg-[#151515] text-zinc-500 border-zinc-800 hover:border-zinc-600 hover:text-white")}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col lg:flex-row gap-8 mt-8">
              {/* ADVANCED FILTER PANEL */}
              {!discoveredAssets && (
                <div className="w-full lg:w-72 shrink-0 space-y-8 bg-[#151515]/50 backdrop-blur-xl border border-zinc-800 rounded-[32px] p-6 shadow-2xl h-fit sticky top-24">
                  <div className="flex items-center gap-2 text-white font-black text-xl mb-6">
                    <Filter className="w-5 h-5 text-emerald-500" /> Filters
                  </div>
                  
                  <div>
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Asset Type</h3>
                    <div className="flex flex-col gap-2">
                      {Object.keys(GLOBAL_ASSETS[region] || {}).map(c => (
                        <button 
                          key={c} 
                          onClick={() => setAssetClass(c)}
                          className={cn("text-left px-4 py-3 rounded-xl font-medium transition-all text-sm border", assetClass === c ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-black/50 text-zinc-400 border-transparent hover:bg-zinc-800")}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Premium Metrics (AI)</h3>
                    <div className="p-4 rounded-xl bg-black/50 border border-zinc-800 text-sm text-zinc-400 font-medium flex items-center justify-between opacity-50 cursor-not-allowed">
                      Dividend Yield <ArrowDownRight className="w-4 h-4" />
                    </div>
                    <div className="p-4 rounded-xl bg-black/50 border border-zinc-800 text-sm text-zinc-400 font-medium flex items-center justify-between opacity-50 cursor-not-allowed">
                      P/E Ratio <ArrowDownRight className="w-4 h-4" />
                    </div>
                    <div className="p-4 rounded-xl bg-black/50 border border-zinc-800 text-sm text-zinc-400 font-medium flex items-center justify-between opacity-50 cursor-not-allowed">
                      AI Risk Score <ArrowDownRight className="w-4 h-4" />
                    </div>
                    <p className="text-xs text-zinc-600 text-center mt-4">Advanced granular filtering requires WealthPilot Pro.</p>
                  </div>
                </div>
              )}

              {/* RESULT GRID */}
              <div className="flex-1 min-w-0">
                {discoveredAssets && (
                  <div className="mb-8 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-[32px] flex items-start gap-4 shadow-2xl">
                    <Sparkles className="w-8 h-8 text-emerald-500 shrink-0 mt-1" />
                    <div>
                      <h2 className="text-2xl font-black text-white mb-2">AI Discovered Assets</h2>
                      <p className="text-zinc-400 font-medium text-lg">"{discoveryQuery}"</p>
                    </div>
                  </div>
                )}
                
                <AssetGrid symbols={activeSymbols} quotesData={quotesData} sparklines={sparklines} loading={quotesLoading || sparklinesLoading} discoveredAssets={discoveredAssets} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function AssetGrid({ symbols, quotesData, sparklines, loading, discoveredAssets }: any) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="h-64 bg-[#151515] rounded-[32px] border border-zinc-800 animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (symbols.length === 0) {
    return <div className="p-24 text-center text-zinc-500 font-bold text-xl">No assets found for this category.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {symbols.map((sym: string, i: number) => {
        const quote = quotesData?.quotes?.find((q: any) => q.symbol === sym);
        const aiReason = discoveredAssets?.find((a: any) => a.symbol === sym)?.reason;
        const sparklineData = sparklines?.[sym] ? sparklines[sym].map((val: number, idx: number) => ({ date: idx, val })) : [];
        const isPositive = quote?.regularMarketChangePercent >= 0;

        return (
          <motion.div 
            key={sym} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link to={`/company/${sym}`} className="group block bg-[#151515] border border-zinc-800 hover:border-emerald-500/50 p-6 rounded-[32px] transition-all hover:shadow-[0_20px_40px_-15px_rgba(34,197,94,0.15)] h-full flex flex-col justify-between overflow-hidden relative">
              
              {/* GLASS HIGHLIGHT EFFECT */}
              <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none rounded-t-[32px]"></div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4 gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-black text-2xl text-white group-hover:text-emerald-500 transition-colors truncate">{sym}</h3>
                    <p className="text-sm text-zinc-500 font-medium truncate">{quote?.shortName || quote?.longName || 'Unknown Asset'}</p>
                  </div>
                  {quote && (
                    <div className="text-right shrink-0">
                      <div className="font-black text-xl text-white">
                        {quote.currency === 'INR' ? '₹' : quote.currency ? '$' : ''}
                        {quote.regularMarketPrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className={cn("text-sm font-bold flex items-center justify-end mt-1", isPositive ? "text-emerald-500" : "text-rose-500")}>
                        {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        {quote.regularMarketChangePercent?.toFixed(2)}%
                      </div>
                    </div>
                  )}
                </div>

                {/* AI BADGES */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {quote?.marketCap > 1e11 && <span className="text-[10px] uppercase font-black px-2 py-1 bg-white/5 text-white rounded-md border border-white/10">Mega Cap</span>}
                  {quote?.trailingAnnualDividendYield > 0.03 && <span className="text-[10px] uppercase font-black px-2 py-1 bg-amber-500/10 text-amber-500 rounded-md border border-amber-500/20">High Div</span>}
                  {aiReason && <span className="text-[10px] uppercase font-black px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-md border border-emerald-500/20">AI Pick</span>}
                </div>

                {/* MINI SPARKLINE */}
                <div className="h-16 w-full mb-6 relative">
                  {sparklineData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={sparklineData}>
                        <defs>
                          <linearGradient id={`color-${sym}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={isPositive ? '#10b981' : '#f43f5e'} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={isPositive ? '#10b981' : '#f43f5e'} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <YAxis domain={['auto', 'auto']} hide />
                        <Area type="monotone" dataKey="val" stroke={isPositive ? '#10b981' : '#f43f5e'} strokeWidth={2} fillOpacity={1} fill={`url(#color-${sym})`} isAnimationActive={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-800 text-xs font-bold">No Chart Data</div>
                  )}
                </div>
                
                {/* AI REASON OR STATS */}
                {aiReason ? (
                  <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 relative">
                    <Sparkles className="w-4 h-4 absolute top-4 left-4 text-emerald-500/50" />
                    <p className="text-xs text-zinc-300 font-medium leading-relaxed pl-6 line-clamp-3">
                      {aiReason}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 mt-auto">
                    <div className="p-3 bg-black/50 rounded-2xl border border-zinc-800">
                      <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Vol (Avg)</div>
                      <div className="text-xs text-white font-bold truncate">{formatLargeNumber(quote?.averageDailyVolume3Month)}</div>
                    </div>
                    <div className="p-3 bg-black/50 rounded-2xl border border-zinc-800">
                      <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">P/E (TTM)</div>
                      <div className="text-xs text-white font-bold truncate">{quote?.trailingPE?.toFixed(2) || 'N/A'}</div>
                    </div>
                  </div>
                )}
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}

function formatLargeNumber(num: number | undefined) {
  if (!num) return 'N/A';
  if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  return num.toLocaleString();
}
