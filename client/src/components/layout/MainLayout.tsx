import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { UserButton, useAuth } from "@clerk/clerk-react";
import { 
  LayoutDashboard, 
  MessageSquareText, 
  Search, 
  LineChart, 
  TrendingUp, 
  Settings,
  Briefcase,
  Wallet,
  Globe2,
  Bell,
  Check,
  X,
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
  Menu
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useNotifications } from "../../lib/NotificationContext";
import { useState, useRef, useEffect } from "react";
import { fetchWithAuth } from "../../lib/api";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Wealth Manager", href: "/wealth-manager", icon: Wallet },
  { name: "Market Overview", href: "/overview", icon: Globe2 },
  { name: "Transaction Ledger", href: "/ledger", icon: TrendingUp },
  { name: "Goal Planner", href: "/goals", icon: Briefcase },
  { name: "What-If Simulator", href: "/simulator", icon: TrendingUp },
  { name: "Reports", href: "/reports", icon: Globe2 },
  { name: "Document Vault", href: "/vault", icon: Wallet },
  { name: "Portfolio Builder", href: "/portfolio-builder", icon: Briefcase },
  { name: "AI Advisor", href: "/advisor", icon: MessageSquareText },
  { name: "Market Screener", href: "/screener", icon: Search },
  { name: "Compare Assets", href: "/compare", icon: ArrowLeftRight },
];

export function MainLayout() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        try {
          const results = await fetchWithAuth(`/market/search?q=${searchQuery}`, getToken);
          if (results && results.quotes) {
            setSearchResults(results.quotes.slice(0, 6));
            setShowSearchDropdown(true);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowSearchDropdown(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, getToken]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      setShowSearchDropdown(false);
      navigate(`/company/${searchResults[0].symbol}`);
      setSearchQuery("");
    } else if (searchQuery.trim()) {
      setShowSearchDropdown(false);
      navigate(`/company/${searchQuery.trim().toUpperCase()}`);
      setSearchQuery("");
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className={cn("border-r border-border bg-card/50 flex flex-col hidden md:flex transition-all duration-300", isCollapsed ? "w-20" : "w-64")}>
        <div className={cn("h-16 flex items-center border-b border-border", isCollapsed ? "justify-center px-0" : "justify-between px-4")}>
          {!isCollapsed && (
            <div className="flex items-center gap-2 overflow-hidden">
              <img src="/logo.png" alt="WealthPilot AI" className="w-8 h-8 object-contain drop-shadow-md shrink-0" />
              <span className="font-bold text-lg tracking-tight whitespace-nowrap">WealthPilot AI</span>
            </div>
          )}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg hover:bg-secondaryCard text-muted hover:text-foreground transition-colors shrink-0"
          >
            {isCollapsed ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              title={isCollapsed ? item.name : undefined}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-brand-500/10 text-brand-500 border border-brand-500/20" 
                    : "text-muted hover:text-foreground hover:bg-secondaryCard",
                  isCollapsed && "md:justify-center md:px-0"
                )
              }
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!isCollapsed && <span className="whitespace-nowrap">{item.name}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-border mt-auto">
          <NavLink
            to="/settings"
            title={isCollapsed ? "Settings" : undefined}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-brand-500/10 text-brand-500 border border-brand-500/20" 
                  : "text-muted hover:text-foreground hover:bg-secondaryCard",
                isCollapsed && "md:justify-center md:px-0"
              )
            }
          >
            <Settings className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span>Settings</span>}
          </NavLink>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
          <div 
            className="fixed inset-y-0 left-0 w-72 bg-card border-r border-border shadow-2xl flex flex-col transform transition-transform duration-300 translate-x-0"
            onClick={e => e.stopPropagation()}
          >
            <div className="h-16 flex items-center justify-between px-6 border-b border-border">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="WealthPilot AI" className="w-8 h-8 object-contain drop-shadow-md shrink-0" />
                <span className="font-bold text-lg tracking-tight">WealthPilot AI</span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-full hover:bg-secondaryCard text-muted">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-colors",
                      isActive 
                        ? "bg-brand-500/10 text-brand-500 border border-brand-500/20" 
                        : "text-muted hover:text-foreground hover:bg-secondaryCard"
                    )
                  }
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </nav>

            <div className="p-4 border-t border-border mt-auto">
              <NavLink
                to="/settings"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-colors",
                    isActive 
                      ? "bg-brand-500/10 text-brand-500 border border-brand-500/20" 
                      : "text-muted hover:text-foreground hover:bg-secondaryCard"
                  )
                }
              >
                <Settings className="w-5 h-5 shrink-0" />
                <span>Settings</span>
              </NavLink>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative min-w-0">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-4 md:px-8 border-b border-border bg-background/80 backdrop-blur-md z-10 sticky top-0">
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-secondaryCard text-muted transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="relative" ref={searchRef}>
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setShowSearchDropdown(true); }}
                  onFocus={() => { if (searchResults.length > 0) setShowSearchDropdown(true); }}
                  placeholder="Search symbol..." 
                  className="pl-9 pr-4 py-1.5 bg-secondaryCard border border-border rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 transition-shadow w-36 sm:w-64 md:w-96 text-foreground placeholder:text-muted disabled:opacity-50"
                />
                {isSearching && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>}
              </form>
              
              {/* Autocomplete Dropdown */}
              {showSearchDropdown && searchResults.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col">
                  {searchResults.map((result: any) => (
                    <button 
                      key={result.symbol}
                      onClick={() => {
                        setShowSearchDropdown(false);
                        setSearchQuery("");
                        navigate(`/company/${result.symbol}`);
                      }}
                      className="flex items-center justify-between p-3 text-left hover:bg-secondaryCard transition-colors border-b border-border last:border-0"
                    >
                      <div className="min-w-0 flex-1 pr-4">
                        <div className="font-bold text-foreground truncate">{result.shortName || result.longName || result.symbol}</div>
                        <div className="text-xs text-muted truncate">{result.exchangeDisp || result.exchange} &bull; {result.quoteType}</div>
                      </div>
                      <div className="font-bold text-brand-500 shrink-0">{result.symbol}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-full bg-secondaryCard border border-border hover:bg-secondaryCard/80 transition-colors"
              >
                <Bell className="w-5 h-5 text-muted-foreground" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 border-2 border-background rounded-full" />
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-card border border-border rounded-xl shadow-2xl z-50 flex flex-col">
                  <div className="p-4 border-b border-border flex items-center justify-between sticky top-0 bg-card z-10">
                    <h3 className="font-bold">Notifications</h3>
                    {unreadCount > 0 && (
                      <button onClick={markAllAsRead} className="text-xs text-brand-500 hover:text-brand-400 font-medium">Mark all as read</button>
                    )}
                  </div>
                  <div className="flex flex-col divide-y divide-border">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-muted text-sm">No notifications yet.</div>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          className={cn("p-4 transition-colors flex gap-3", n.read ? "opacity-75 bg-background" : "bg-secondaryCard/50 hover:bg-secondaryCard")}
                          onClick={() => !n.read && markAsRead(n.id)}
                        >
                          <div className="shrink-0 mt-0.5">
                            {n.type === 'error' && <X className="w-4 h-4 text-rose-500" />}
                            {n.type === 'success' && <Check className="w-4 h-4 text-emerald-500" />}
                            {n.type === 'info' && <Bell className="w-4 h-4 text-blue-500" />}
                            {n.type === 'warning' && <Bell className="w-4 h-4 text-yellow-500" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn("text-sm font-medium", !n.read && "text-foreground")}>{n.title}</p>
                            <p className="text-xs text-muted mt-1 break-words">{n.message}</p>
                            <p className="text-[10px] text-muted-foreground mt-2">{new Date(n.createdAt).toLocaleTimeString()}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <UserButton afterSignOutUrl="/sign-in" appearance={{
              elements: {
                userButtonAvatarBox: "w-8 h-8 rounded-full border border-border"
              }
            }} />
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-x-hidden overflow-y-auto bg-[#090909] selection:bg-emerald-500/30 selection:text-emerald-200">
          <LiveMarketStrip />
          <div className="mx-auto max-w-7xl px-2 sm:px-4 md:px-8 py-4 md:py-8 animate-in fade-in duration-500">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}

function LiveMarketStrip() {
  const indices = [
    { name: "S&P 500", val: "5,523.11", change: "+0.85%" },
    { name: "NASDAQ", val: "17,890.30", change: "+1.12%" },
    { name: "NIFTY 50", val: "24,502.15", change: "+0.45%" },
    { name: "SENSEX", val: "81,332.72", change: "+0.62%" },
    { name: "BTC-USD", val: "$64,210", change: "-1.24%" },
    { name: "GOLD", val: "$2,410.50", change: "+0.30%" },
    { name: "CRUDE OIL", val: "$82.10", change: "-0.50%" },
    { name: "US 10Y", val: "4.21%", change: "-0.02%" },
    { name: "FTSE 100", val: "8,123.40", change: "+0.20%" },
    { name: "DAX", val: "18,450.20", change: "+0.75%" },
    { name: "NIKKEI", val: "41,200.10", change: "-0.15%" }
  ];

  return (
    <div className="w-full bg-[#151515] border-b border-zinc-800 overflow-hidden flex items-center h-10 text-xs font-bold text-zinc-400">
      <div className="flex animate-[marquee_30s_linear_infinite] whitespace-nowrap">
        {indices.map((idx, i) => (
          <div key={i} className="flex items-center gap-2 mx-6">
            <span className="text-white tracking-widest">{idx.name}</span>
            <span>{idx.val}</span>
            <span className={idx.change.startsWith('+') ? "text-emerald-500" : "text-rose-500"}>{idx.change}</span>
          </div>
        ))}
        {/* Duplicate for seamless loop */}
        {indices.map((idx, i) => (
          <div key={i + 'dup'} className="flex items-center gap-2 mx-6">
            <span className="text-white tracking-widest">{idx.name}</span>
            <span>{idx.val}</span>
            <span className={idx.change.startsWith('+') ? "text-emerald-500" : "text-rose-500"}>{idx.change}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
