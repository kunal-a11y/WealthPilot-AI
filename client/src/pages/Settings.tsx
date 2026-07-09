import { useState } from "react";
import { useUser, SignOutButton } from "@clerk/clerk-react";
import { User, Shield, Key, LogOut, LayoutDashboard, Lock } from "lucide-react";
import { cn } from "../lib/utils";
import { useDashboardSettings } from "../lib/useSettings";

export function Settings() {
  const { user } = useUser();
  const { widgets, toggleWidget } = useDashboardSettings();
  const [activeTab, setActiveTab] = useState("Profile");

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500 pb-32 max-w-4xl mx-auto">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Settings & Profile</h1>
        <p className="text-muted mt-2 text-sm md:text-base">Manage your account, preferences, and API integrations.</p>
      </header>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Navigation / Tabs */}
        <div className="w-full md:w-64 flex flex-row md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar shrink-0">
          <SettingTab icon={User} label="Profile" active={activeTab === "Profile"} onClick={() => setActiveTab("Profile")} />
          <SettingTab icon={LayoutDashboard} label="Dashboard" active={activeTab === "Dashboard"} onClick={() => setActiveTab("Dashboard")} />
          <SettingTab icon={Shield} label="Security" active={activeTab === "Security"} onClick={() => setActiveTab("Security")} />
          <SettingTab icon={Key} label="API Keys" active={activeTab === "API Keys"} onClick={() => setActiveTab("API Keys")} />
        </div>

        {/* Content Area */}
        <div className="flex-1 space-y-6 min-w-0">
          
          {activeTab === "Profile" && (
            <div className="glass p-4 md:p-6 space-y-6">
              <h2 className="text-lg md:text-xl font-bold border-b border-border pb-4">Personal Details</h2>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-border bg-secondaryCard shrink-0">
                  <img src={user?.imageUrl} alt={user?.fullName || "User"} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{user?.fullName}</h3>
                  <p className="text-muted text-sm">{user?.primaryEmailAddress?.emailAddress}</p>
                  <div className="mt-2 flex gap-2">
                    <span className="px-2 py-0.5 rounded bg-brand-500/10 text-brand-500 border border-brand-500/20 text-xs font-bold uppercase tracking-wider">Free Plan</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted">First Name</label>
                    <input type="text" defaultValue={user?.firstName || ""} className="w-full bg-secondaryCard/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500" readOnly />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted">Last Name</label>
                    <input type="text" defaultValue={user?.lastName || ""} className="w-full bg-secondaryCard/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500" readOnly />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted">Email Address</label>
                  <input type="email" defaultValue={user?.primaryEmailAddress?.emailAddress || ""} className="w-full bg-secondaryCard/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500" readOnly />
                </div>
              </div>
            </div>
          )}

          {activeTab === "Dashboard" && (
            <div className="glass p-4 md:p-6 space-y-6">
              <h2 className="text-lg md:text-xl font-bold border-b border-border pb-4">Dashboard Customization</h2>
              <div className="space-y-4">
                <ToggleRow label="Portfolio Value Metric" enabled={widgets.portfolioValue} onChange={() => toggleWidget('portfolioValue')} />
                <ToggleRow label="Net Worth Metric" enabled={widgets.netWorth} onChange={() => toggleWidget('netWorth')} />
                <ToggleRow label="Portfolio Health Metric" enabled={widgets.portfolioHealth} onChange={() => toggleWidget('portfolioHealth')} />
                <ToggleRow label="Risk Score Metric" enabled={widgets.riskScore} onChange={() => toggleWidget('riskScore')} />
                <ToggleRow label="Market Historical Chart" enabled={widgets.marketChart} onChange={() => toggleWidget('marketChart')} />
                <ToggleRow label="Trending Stocks" enabled={widgets.trendingStocks} onChange={() => toggleWidget('trendingStocks')} />
              </div>
            </div>
          )}

          {activeTab === "Security" && (
            <div className="glass p-4 md:p-6 space-y-6">
              <h2 className="text-lg md:text-xl font-bold border-b border-border pb-4 text-destructive">Danger Zone</h2>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-sm">Sign Out</h3>
                  <p className="text-xs text-muted mt-1">Securely end your current session.</p>
                </div>
                <SignOutButton>
                  <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-secondaryCard border border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors text-sm font-medium whitespace-nowrap">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </SignOutButton>
              </div>
            </div>
          )}

          {activeTab === "API Keys" && (
            <div className="glass p-4 md:p-6 space-y-6">
              <div className="flex items-center gap-2 border-b border-border pb-4">
                <h2 className="text-lg md:text-xl font-bold">API Integrations</h2>
                <Lock className="w-5 h-5 text-yellow-500" />
              </div>
              <p className="text-sm text-muted">
                Connect external services by providing your API keys. Keys are stored locally and never sent to our servers.
              </p>
              
              <div className="space-y-4">
                <div className="space-y-1.5 relative">
                  <label className="text-xs font-medium text-muted">OpenAI API Key (Optional)</label>
                  <div className="relative">
                    <input type="password" placeholder="sk-..." className="w-full bg-secondaryCard/50 border border-border rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-brand-500 font-mono" />
                    <Key className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
                
                <div className="space-y-1.5 relative">
                  <label className="text-xs font-medium text-muted">AlphaVantage API Key (Optional)</label>
                  <div className="relative">
                    <input type="password" placeholder="Key..." className="w-full bg-secondaryCard/50 border border-border rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-brand-500 font-mono" />
                    <Key className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <button className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-black font-semibold transition-colors text-sm">
                  Save Keys
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function SettingTab({ icon: Icon, label, active = false, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 md:gap-3 px-4 py-2.5 md:py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap md:w-full md:text-left",
        active 
          ? "bg-secondaryCard border border-border text-foreground shadow-sm" 
          : "text-muted hover:text-foreground hover:bg-secondaryCard/50 border border-transparent"
      )}
    >
      <Icon className="w-4 h-4 shrink-0" /> {label}
    </button>
  );
}

function ToggleRow({ label, enabled, onChange }: { label: string, enabled: boolean, onChange: () => void }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-secondaryCard/30 transition-colors">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <button 
        onClick={onChange}
        className={cn("w-10 h-5 rounded-full relative transition-colors duration-200 shrink-0", enabled ? "bg-brand-500" : "bg-secondaryCard border border-border")}
      >
        <span className={cn("absolute top-[1px] left-[1px] w-4 h-4 bg-white rounded-full transition-transform duration-200 shadow-sm", enabled ? "translate-x-[20px]" : "translate-x-0")} />
      </button>
    </div>
  );
}
