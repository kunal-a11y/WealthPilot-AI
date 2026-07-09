import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { fetchWithAuth } from "../lib/api";
import { Search, X, BarChart2, AlertTriangle, Target, TrendingUp } from "lucide-react";
import { cn } from "../lib/utils";

export function Compare() {
  const { getToken } = useAuth();
  const [symbols, setSymbols] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const { data: quotes, isLoading: quotesLoading } = useQuery({
    queryKey: ["compare-quotes", symbols],
    queryFn: () => fetchWithAuth(`/market/quotes?symbols=${symbols.join(',')}`, getToken),
    enabled: symbols.length > 0,
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim() || symbols.length >= 5) return;
    
    setIsSearching(true);
    try {
      const results = await fetchWithAuth(`/market/search?q=${searchInput}`, getToken);
      if (results && results.quotes && results.quotes.length > 0) {
        const match = results.quotes[0].symbol;
        if (!symbols.includes(match)) {
          setSymbols([...symbols, match]);
        }
      } else {
        const upper = searchInput.trim().toUpperCase();
        if (!symbols.includes(upper)) setSymbols([...symbols, upper]);
      }
    } catch (err) {
      const upper = searchInput.trim().toUpperCase();
      if (!symbols.includes(upper)) setSymbols([...symbols, upper]);
    } finally {
      setIsSearching(false);
      setSearchInput("");
    }
  };

  const removeSymbol = (sym: string) => {
    setSymbols(symbols.filter(s => s !== sym));
  };

  // Helper for displaying large numbers
  const formatNum = (num: number | undefined) => {
    if (!num) return 'N/A';
    if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    return num.toLocaleString();
  };

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-32">
      <header className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
          <BarChart2 className="w-8 h-8 text-emerald-500" />
          Compare Assets
        </h1>
        <p className="text-zinc-400 mt-2">Add up to 5 assets to compare their fundamentals side-by-side.</p>
      </header>

      {/* SEARCH BAR */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
        <form onSubmit={handleSearch} className="relative max-w-xl">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input 
            type="text" 
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            disabled={symbols.length >= 5 || isSearching}
            placeholder={symbols.length >= 5 ? "Maximum of 5 assets reached." : "Search symbol to add (e.g. AAPL, BTC-USD)..."} 
            className="w-full pl-12 pr-4 py-3 bg-black border border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-shadow text-white placeholder:text-zinc-600 disabled:opacity-50"
          />
        </form>
        
        {/* CHIPS */}
        <div className="flex flex-wrap gap-3 mt-6">
          {symbols.map(sym => (
            <div key={sym} className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 px-4 py-2 rounded-lg font-bold">
              {sym}
              <button onClick={() => removeSymbol(sym)} className="hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          {symbols.length === 0 && <div className="text-sm text-zinc-500 italic">No assets selected yet.</div>}
        </div>
      </div>

      {/* MATRIX */}
      {symbols.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden overflow-x-auto">
          {quotesLoading ? (
            <div className="p-12 text-center text-emerald-500 animate-pulse font-bold">Fetching comparison data...</div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr>
                  <th className="p-6 border-b border-zinc-800 bg-black/50 text-zinc-400 font-bold uppercase tracking-wider text-xs">Metric</th>
                  {symbols.map(sym => {
                    const q = quotes?.quotes?.find((q: any) => q.symbol === sym);
                    return (
                      <th key={sym} className="p-6 border-b border-l border-zinc-800 bg-black/50 w-1/5">
                        <div className="font-black text-xl text-white">{sym}</div>
                        <div className="text-sm text-zinc-500 mt-1">{q?.shortName || 'Unknown'}</div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                <ComparisonRow label="Price" symbols={symbols} quotes={quotes?.quotes} field="regularMarketPrice" isCurrency />
                <ComparisonRow label="1D Change" symbols={symbols} quotes={quotes?.quotes} field="regularMarketChangePercent" isPercent />
                <ComparisonRow label="Market Cap" symbols={symbols} quotes={quotes?.quotes} field="marketCap" isLargeNum />
                <ComparisonRow label="Volume" symbols={symbols} quotes={quotes?.quotes} field="regularMarketVolume" isLargeNum />
                <ComparisonRow label="P/E Ratio (TTM)" symbols={symbols} quotes={quotes?.quotes} field="trailingPE" />
                <ComparisonRow label="Dividend Yield" symbols={symbols} quotes={quotes?.quotes} field="trailingAnnualDividendYield" isPercent />
                <ComparisonRow label="52W High" symbols={symbols} quotes={quotes?.quotes} field="fiftyTwoWeekHigh" isCurrency />
                <ComparisonRow label="52W Low" symbols={symbols} quotes={quotes?.quotes} field="fiftyTwoWeekLow" isCurrency />
                <ComparisonRow label="Beta" symbols={symbols} quotes={quotes?.quotes} field="beta" />
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

function ComparisonRow({ label, symbols, quotes, field, isCurrency, isPercent, isLargeNum }: any) {
  return (
    <tr className="hover:bg-zinc-800/30 transition-colors">
      <td className="p-4 pl-6 text-sm font-medium text-zinc-400">{label}</td>
      {symbols.map((sym: string) => {
        const q = quotes?.find((q: any) => q.symbol === sym);
        if (!q || q[field] === undefined) return <td key={sym} className="p-4 border-l border-zinc-800 text-zinc-600 font-medium">N/A</td>;
        
        let val = q[field];
        let color = "text-white";
        
        if (isPercent) {
          color = val >= 0 ? "text-emerald-500" : "text-rose-500";
          val = `${(field === 'trailingAnnualDividendYield' ? val * 100 : val).toFixed(2)}%`;
        } else if (isLargeNum) {
          if (val >= 1e12) val = `${(val / 1e12).toFixed(2)}T`;
          else if (val >= 1e9) val = `${(val / 1e9).toFixed(2)}B`;
          else if (val >= 1e6) val = `${(val / 1e6).toFixed(2)}M`;
          else val = val.toLocaleString();
        } else if (typeof val === 'number') {
          val = val.toFixed(2);
        }

        return (
          <td key={sym} className={cn("p-4 border-l border-zinc-800 font-bold", color)}>
            {isCurrency && q.currency === 'INR' ? '₹' : isCurrency ? '$' : ''}{val}
          </td>
        );
      })}
    </tr>
  );
}
