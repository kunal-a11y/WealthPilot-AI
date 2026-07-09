import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { fetchWithAuth } from "../lib/api";
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { ArrowUpRight, ArrowDownRight, Activity, Info, ShieldAlert, Star, Building2, Users, Briefcase, Target, Shield, Clock, BarChart3, AlertTriangle, CheckCircle2, Search } from "lucide-react";
import { cn } from "../lib/utils";

const TIMEFRAMES = ['1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '3y', '5y', '10y', 'max'];

export function Company() {
  const { symbol } = useParams();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [range, setRange] = useState('1y');

  const { data: quote, isLoading: quoteLoading } = useQuery({
    queryKey: ["quote", symbol],
    queryFn: () => fetchWithAuth(`/market/quote/${symbol}`, getToken),
  });

  const { data: companyInfo, isLoading: companyLoading } = useQuery({
    queryKey: ["company", symbol],
    queryFn: () => fetchWithAuth(`/market/company/${symbol}`, getToken),
  });

  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ["history", symbol, range],
    queryFn: () => fetchWithAuth(`/market/history/${symbol}?range=${range}`, getToken),
  });

  const { data: ai, isLoading: aiLoading } = useQuery({
    queryKey: ["ai-analysis-advanced", symbol],
    queryFn: () => fetchWithAuth(`/ai/analyze-company`, getToken, {
      method: "POST",
      body: JSON.stringify({ symbol, marketData: { quote, companyInfo } })
    }),
    enabled: !!quote && !!companyInfo,
  });

  const { data: watchlist } = useQuery({
    queryKey: ["watchlist"],
    queryFn: () => fetchWithAuth(`/watchlist`, getToken),
  });

  const isWatched = watchlist?.some((item: any) => item.symbol === symbol);

  const toggleWatchlist = useMutation({
    mutationFn: async () => {
      if (isWatched) {
        return fetchWithAuth(`/watchlist/${symbol}`, getToken, { method: "DELETE" });
      } else {
        return fetchWithAuth(`/watchlist`, getToken, {
          method: "POST",
          body: JSON.stringify({ symbol, name: quote?.shortName || quote?.longName || symbol })
        });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["watchlist"] }),
  });

  const { data: searchFallback, isLoading: searchLoading } = useQuery({
    queryKey: ["searchFallback", symbol],
    queryFn: () => fetchWithAuth(`/market/search?q=${symbol}`, getToken),
    enabled: !!(quote?.error || !quote),
  });

  if (quoteLoading || companyLoading) {
    return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div></div>;
  }

  if (!quote || quote.error) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 max-w-2xl mx-auto">
        <AlertTriangle className="w-16 h-16 text-rose-500" />
        <h2 className="text-3xl font-black text-white">Asset Not Found</h2>
        <p className="text-zinc-400 text-lg mb-8">The symbol '{symbol}' is invalid or currently unavailable. Please check the exact ticker (e.g., RELIANCE.NS for Indian stocks).</p>
        
        {searchLoading ? (
          <div className="animate-pulse flex items-center gap-2 text-zinc-500 font-medium mt-4"><Search className="w-4 h-4" /> Searching for alternatives...</div>
        ) : searchFallback?.quotes?.length > 0 && (
          <div className="mt-8 p-6 bg-zinc-900 border border-zinc-800 rounded-3xl w-full text-left">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><SparklesIcon className="w-5 h-5 text-emerald-500" /> Did you mean?</h3>
            <div className="flex flex-col gap-2">
              {searchFallback.quotes.slice(0, 5).map((q: any) => (
                <Link key={q.symbol} to={`/company/${q.symbol}`} className="group flex items-center justify-between p-4 bg-black hover:bg-zinc-800 border border-zinc-800 hover:border-emerald-500/50 rounded-2xl transition-all">
                  <span className="font-black text-emerald-500 text-lg group-hover:text-emerald-400">{q.symbol}</span>
                  <span className="text-sm text-zinc-400 font-medium truncate ml-4 text-right">
                    {q.shortName || q.longName} <span className="ml-2 px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded text-xs">{q.exchDisp || q.exchange}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  const isPositive = quote.regularMarketChangePercent >= 0;
  
  const chartData = history?.map((h: any) => ({
    date: new Date(h.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: range.includes('y') || range === 'max' ? 'numeric' : undefined }),
    price: h.close,
    volume: h.volume
  })) || [];

  const profile = companyInfo?.summaryProfile || {};
  const stats = companyInfo?.defaultKeyStatistics || {};
  const financials = companyInfo?.financialData || {};
  const ccy = quote.currency === 'INR' ? '₹' : '$';

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500 pb-32 max-w-7xl mx-auto">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-zinc-900 border border-zinc-800 p-6 md:p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">{quote.longName || quote.shortName || symbol}</h1>
            <button onClick={() => toggleWatchlist.mutate()} disabled={toggleWatchlist.isPending} className={cn("p-2 rounded-full border transition-colors", isWatched ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-500" : "bg-black border-zinc-800 text-zinc-500 hover:text-white")}>
              <Star className={cn("w-5 h-5", isWatched ? "fill-emerald-500" : "")} />
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-3 md:gap-6 text-sm text-zinc-400 font-medium">
            <span className="px-3 py-1 rounded-lg bg-black border border-zinc-800 font-mono text-zinc-200">{quote.exchange} : {symbol}</span>
            {profile.sector && <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4" /> {profile.sector}</span>}
            {profile.industry && <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4" /> {profile.industry}</span>}
            {profile.country && <span className="flex items-center gap-1.5">📍 {profile.country}</span>}
          </div>
        </div>
        <div className="relative z-10 text-left md:text-right">
          <div className="text-sm font-medium text-zinc-500 mb-1">
            Market {quote.marketState === 'REGULAR' ? <span className="text-emerald-500">Open</span> : <span className="text-zinc-400">Closed</span>}
          </div>
          <div className="text-5xl font-black font-mono text-white tracking-tighter">
            {ccy}{quote.regularMarketPrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className={cn("flex items-center md:justify-end font-bold text-lg mt-1", isPositive ? "text-emerald-500" : "text-rose-500")}>
            {isPositive ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
            {quote.regularMarketChange?.toFixed(2)} ({quote.regularMarketChangePercent?.toFixed(2)}%)
          </div>
        </div>
      </header>

      {/* CHARTS */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2"><BarChart3 className="w-5 h-5 text-emerald-500"/> Interactive Chart</h2>
          <div className="flex flex-wrap gap-2 bg-black p-1.5 rounded-xl border border-zinc-800">
            {TIMEFRAMES.map(r => (
              <button key={r} onClick={() => setRange(r)} className={cn("px-4 py-1.5 text-xs font-bold rounded-lg transition-all", range === r ? "bg-emerald-500 text-black shadow-lg" : "text-zinc-400 hover:text-white hover:bg-zinc-800")}>
                {r.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div className="h-[450px]">
          {historyLoading ? (
            <div className="w-full h-full flex items-center justify-center text-emerald-500 animate-pulse">Loading market data...</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isPositive ? '#10b981' : '#f43f5e'} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={isPositive ? '#10b981' : '#f43f5e'} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="date" stroke="#525252" fontSize={12} tickLine={false} axisLine={false} minTickGap={40} dy={10} />
                <YAxis stroke="#525252" fontSize={12} tickLine={false} axisLine={false} domain={['auto', 'auto']} tickFormatter={(val) => `${ccy}${val}`} dx={-10} orientation="right" />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                  labelStyle={{ color: '#a1a1aa', marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="price" stroke={isPositive ? '#10b981' : '#f43f5e'} strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* FUNDAMENTALS GRID */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8">
        <h2 className="text-xl font-bold tracking-tight text-white mb-6">Market Fundamentals</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <StatBox label="Market Cap" value={formatLargeNumber(quote.marketCap, ccy)} />
          <StatBox label="Enterprise Value" value={formatLargeNumber(stats.enterpriseValue, ccy)} />
          <StatBox label="Volume" value={formatLargeNumber(quote.regularMarketVolume, '')} />
          <StatBox label="Avg Volume (3M)" value={formatLargeNumber(quote.averageDailyVolume3Month, '')} />
          <StatBox label="Revenue (TTM)" value={formatLargeNumber(financials.totalRevenue, ccy)} />
          <StatBox label="Net Profit" value={formatLargeNumber(financials.netIncomeToCommon, ccy)} />
          <StatBox label="Free Cash Flow" value={formatLargeNumber(financials.freeCashflow, ccy)} />
          <StatBox label="Total Debt" value={formatLargeNumber(financials.totalDebt, ccy)} />
          <StatBox label="Cash Balance" value={formatLargeNumber(financials.totalCash, ccy)} />
          <StatBox label="P/E Ratio" value={quote.trailingPE?.toFixed(2) || 'N/A'} />
          <StatBox label="P/B Ratio" value={stats.priceToBook?.toFixed(2) || 'N/A'} />
          <StatBox label="EPS (TTM)" value={stats.trailingEps?.toFixed(2) || 'N/A'} />
          <StatBox label="ROE" value={financials.returnOnEquity ? `${(financials.returnOnEquity * 100).toFixed(2)}%` : 'N/A'} />
          <StatBox label="Beta (5Y)" value={stats.beta?.toFixed(2) || 'N/A'} />
          <StatBox label="Dividend Yield" value={quote.trailingAnnualDividendYield ? `${(quote.trailingAnnualDividendYield * 100).toFixed(2)}%` : 'N/A'} />
          <StatBox label="52W High" value={`${ccy}${quote.fiftyTwoWeekHigh?.toFixed(2)}`} />
          <StatBox label="52W Low" value={`${ccy}${quote.fiftyTwoWeekLow?.toFixed(2)}`} />
          <StatBox label="Next Earnings" value={quote.earningsTimestamp ? new Date(quote.earningsTimestamp * 1000).toLocaleDateString() : 'N/A'} />
        </div>
      </div>

      {/* AI ADVANCED REPORT */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2">
          <SparklesIcon className="w-8 h-8 text-emerald-500" />
          <h2 className="text-3xl font-black text-white tracking-tight">Advanced AI Intelligence</h2>
        </div>

        {aiLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            <div className="h-64 bg-zinc-900 border border-zinc-800 rounded-3xl"></div>
            <div className="h-64 bg-zinc-900 border border-zinc-800 rounded-3xl md:col-span-2"></div>
            <div className="h-96 bg-zinc-900 border border-zinc-800 rounded-3xl md:col-span-3"></div>
          </div>
        ) : ai?.error ? (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-3xl p-8 text-center text-rose-500">
            <ShieldAlert className="w-12 h-12 mx-auto mb-4" />
            <p className="font-bold">{ai.error}</p>
          </div>
        ) : ai?.overallScore ? (
          <>
            {/* TOP ROW: RATING & FIT */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* RATING */}
              <div className="bg-gradient-to-br from-emerald-500/20 to-zinc-900 border border-emerald-500/30 rounded-3xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-transparent"></div>
                <div className="text-emerald-500 font-black text-7xl tracking-tighter mb-2">{ai.overallScore}</div>
                <div className="text-zinc-400 font-bold uppercase tracking-widest text-xs mb-6">AI Score</div>
                <div className={cn("px-6 py-2 rounded-full font-black text-xl mb-4 shadow-lg", 
                  ai.investmentRating.includes('Buy') ? "bg-emerald-500 text-black" : 
                  ai.investmentRating.includes('Hold') || ai.investmentRating.includes('Accumulate') ? "bg-amber-500 text-black" : 
                  "bg-rose-500 text-black"
                )}>
                  {ai.investmentRating}
                </div>
                <p className="text-sm text-zinc-300 font-medium">{ai.recommendationReasoning}</p>
              </div>

              {/* PORTFOLIO FIT */}
              <div className="md:col-span-2 bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Target className="w-5 h-5 text-emerald-500"/> Portfolio Fit</h3>
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-black border border-zinc-800">
                  <div className="p-3 bg-emerald-500/10 rounded-full">
                    {ai.portfolioFit?.fit.toLowerCase().includes('excellent') || ai.portfolioFit?.fit.toLowerCase().includes('good') ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <AlertTriangle className="w-6 h-6 text-amber-500" />}
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg mb-1">{ai.portfolioFit?.fit}</h4>
                    <p className="text-zinc-400 text-sm leading-relaxed">{ai.portfolioFit?.reasoning}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* SCENARIOS & HORIZONS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* SCENARIOS */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Activity className="w-5 h-5 text-emerald-500"/> Expected Scenarios</h3>
                <div className="space-y-4">
                  <ScenarioCard title="Optimistic" data={ai.scenarios?.optimistic} color="emerald" />
                  <ScenarioCard title="Expected" data={ai.scenarios?.expected} color="blue" />
                  <ScenarioCard title="Conservative" data={ai.scenarios?.conservative} color="rose" />
                </div>
              </div>

              {/* HORIZONS */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Clock className="w-5 h-5 text-emerald-500"/> Investment Horizon</h3>
                <div className="space-y-4">
                  <HorizonCard title="Short Term (1-3m)" data={ai.horizons?.shortTerm} />
                  <HorizonCard title="Medium Term (6-12m)" data={ai.horizons?.mediumTerm} />
                  <HorizonCard title="Long Term (3y+)" data={ai.horizons?.longTerm} />
                </div>
              </div>
            </div>

            {/* DEEP DIVE & RISKS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* DEEP DIVE */}
              <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2 border-b border-zinc-800 pb-4"><Info className="w-5 h-5 text-emerald-500"/> AI Deep Dive Report</h3>
                <ReportSection title="Business Model" content={ai.deepDive?.businessModel} />
                <ReportSection title="Economic Moat" content={ai.deepDive?.moat} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ReportSection title="Strengths" content={ai.deepDive?.strengths} />
                  <ReportSection title="Weaknesses" content={ai.deepDive?.weaknesses} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ReportSection title="Opportunities" content={ai.deepDive?.opportunities} />
                  <ReportSection title="Management & Sentiment" content={ai.deepDive?.management + " " + ai.deepDive?.sentiment} />
                </div>
              </div>

              {/* RISKS */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Shield className="w-5 h-5 text-rose-500"/> Risk Analysis</h3>
                <div className="text-center mb-6 p-4 bg-black rounded-2xl border border-zinc-800">
                  <div className="text-3xl font-black text-rose-500">{ai.riskAnalysis?.overall}/100</div>
                  <div className="text-xs text-zinc-500 font-bold uppercase">Overall Risk Score</div>
                </div>
                <div className="space-y-4 mb-6">
                  <RiskBar label="Business Risk" score={ai.riskAnalysis?.business} />
                  <RiskBar label="Financial Risk" score={ai.riskAnalysis?.financial} />
                  <RiskBar label="Market Risk" score={ai.riskAnalysis?.market} />
                  <RiskBar label="Sector Risk" score={ai.riskAnalysis?.sector} />
                  <RiskBar label="Geopolitical Risk" score={ai.riskAnalysis?.geopolitical} />
                  <RiskBar label="Volatility" score={ai.riskAnalysis?.volatility} />
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed p-4 bg-rose-500/5 rounded-xl border border-rose-500/10">
                  {ai.riskAnalysis?.explanation}
                </p>
              </div>
            </div>
          </>
        ) : null}
      </div>

      {/* ABOUT COMPANY (Fallback / Standard) */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
        <h2 className="text-xl font-bold tracking-tight text-white mb-4">About {quote.shortName || symbol}</h2>
        <p className="text-sm text-zinc-400 leading-relaxed columns-1 md:columns-2 gap-8">
          {profile.longBusinessSummary || "Business description not available."}
        </p>
        <div className="mt-8 pt-6 border-t border-zinc-800 flex flex-wrap gap-6">
          {profile.website && <a href={profile.website} target="_blank" rel="noreferrer" className="text-emerald-500 hover:text-emerald-400 text-sm font-bold flex items-center gap-1">Website <ArrowUpRight className="w-4 h-4" /></a>}
          {profile.address1 && <span className="text-sm text-zinc-500">HQ: {profile.address1}, {profile.city}, {profile.country}</span>}
          {profile.companyOfficers?.[0] && <span className="text-sm text-zinc-500">CEO: {profile.companyOfficers[0].name}</span>}
        </div>
      </div>

      {/* DISCLAIMER */}
      <div className="mt-16 pt-8 border-t border-zinc-800 text-xs text-zinc-500 leading-relaxed text-center max-w-4xl mx-auto">
        <p className="mb-2 uppercase tracking-wider font-bold text-zinc-600">Financial Disclaimer</p>
        <p>This advanced AI stock analysis is generated for educational purposes only and should not be considered personalized financial advice. Investing involves significant risk, and past performance does not guarantee future results. Market data is delayed by at least 15 minutes. Always conduct your own thorough research or consult a qualified, certified financial professional before making any investment decisions.</p>
      </div>
    </div>
  );
}

// Helpers
function StatBox({ label, value }: { label: string, value: string | number }) {
  return (
    <div className="bg-black border border-zinc-800 rounded-2xl p-4 flex flex-col justify-center transition-colors hover:border-zinc-600">
      <span className="text-xs font-medium text-zinc-500 mb-1">{label}</span>
      <span className="text-sm font-bold text-white truncate">{value}</span>
    </div>
  );
}

function ScenarioCard({ title, data, color }: { title: string, data: any, color: 'emerald' | 'blue' | 'rose' }) {
  if (!data) return null;
  const colors = {
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    rose: "text-rose-500 bg-rose-500/10 border-rose-500/20"
  };
  return (
    <div className="p-4 rounded-2xl bg-black border border-zinc-800">
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold text-white">{title}</span>
        <span className={cn("px-2 py-1 rounded-md text-xs font-bold border", colors[color])}>{data.projection}</span>
      </div>
      <p className="text-xs text-zinc-400">{data.assumptions}</p>
    </div>
  );
}

function HorizonCard({ title, data }: { title: string, data: any }) {
  if (!data) return null;
  return (
    <div className="p-4 rounded-2xl bg-black border border-zinc-800 border-l-4 border-l-emerald-500">
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold text-white text-sm">{title}</span>
        <span className="text-emerald-500 font-bold text-sm">{data.recommendation}</span>
      </div>
      <p className="text-xs text-zinc-400">{data.reasoning}</p>
    </div>
  );
}

function ReportSection({ title, content }: { title: string, content: string }) {
  if (!content) return null;
  return (
    <div>
      <h4 className="text-sm font-bold text-zinc-300 mb-2 uppercase tracking-wider">{title}</h4>
      <p className="text-sm text-zinc-400 leading-relaxed">{content}</p>
    </div>
  );
}

function RiskBar({ label, score }: { label: string, score: number }) {
  if (score === undefined || isNaN(score)) return null;
  let color = 'bg-emerald-500';
  if (score > 70) color = 'bg-rose-500';
  else if (score > 40) color = 'bg-amber-500';

  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-zinc-400 font-medium">{label}</span>
        <span className="font-bold text-white">{score}</span>
      </div>
      <div className="h-1.5 w-full bg-black rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function formatLargeNumber(num: number | undefined, prefix: string = '') {
  if (!num) return 'N/A';
  if (num >= 1e12) return `${prefix}${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `${prefix}${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${prefix}${(num / 1e6).toFixed(2)}M`;
  return `${prefix}${num.toLocaleString()}`;
}

function SparklesIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    </svg>
  );
}
