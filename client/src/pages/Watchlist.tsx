import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { fetchWithAuth } from "../lib/api";
import { Star, ArrowUpRight, ArrowDownRight, Trash2, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../lib/utils";

export function Watchlist() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const { data: watchlist, isLoading } = useQuery({
    queryKey: ["watchlist"],
    queryFn: () => fetchWithAuth(`/watchlist`, getToken),
  });

  const removeMutation = useMutation({
    mutationFn: (symbol: string) => fetchWithAuth(`/watchlist/${symbol}`, getToken, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["watchlist"] }),
  });

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 pb-32 max-w-7xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <Star className="w-8 h-8 text-brand-500 fill-brand-500/20" /> Watchlist
        </h1>
        <p className="text-muted mt-2">Track live prices and AI scores of your favorite companies.</p>
      </header>

      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-secondaryCard/30 text-xs text-muted uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Asset</th>
                <th className="px-6 py-4 font-medium text-right">Price</th>
                <th className="px-6 py-4 font-medium text-right">Change</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                      Loading your watchlist...
                    </div>
                  </td>
                </tr>
              ) : watchlist?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted">
                    <Star className="w-8 h-8 mx-auto mb-3 opacity-50" />
                    <p>Your watchlist is empty.</p>
                    <Link to="/screener" className="text-brand-500 hover:underline mt-2 inline-block text-sm">Discover assets in the Market Screener</Link>
                  </td>
                </tr>
              ) : (
                watchlist?.map((item: any) => {
                  const isPositive = item.change >= 0;
                  return (
                    <tr key={item.symbol} className="hover:bg-secondaryCard/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground group-hover:text-brand-500 transition-colors">{item.symbol}</span>
                          <span className="text-xs text-muted max-w-[200px] truncate">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-mono font-medium">
                          {item.price ? `${item.currency === 'INR' ? '₹' : '$'}${item.price.toLocaleString()}` : '---'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {item.change ? (
                          <div className={cn(
                            "inline-flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-md",
                            isPositive ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                          )}>
                            {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {item.changePercent.toFixed(2)}%
                          </div>
                        ) : '---'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button 
                            onClick={() => removeMutation.mutate(item.symbol)}
                            disabled={removeMutation.isPending}
                            className="text-muted hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove from Watchlist"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <Link 
                            to={`/company/${item.symbol}`}
                            className="inline-flex items-center gap-1 text-sm font-medium text-brand-500 hover:text-brand-400"
                          >
                            Analyze <ChevronRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
