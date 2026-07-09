import { useState } from "react";
import { Wallet, Plus, Trash2, ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

type Item = {
  id: string;
  name: string;
  amount: number;
  type: 'asset' | 'liability';
};

const COLORS = ['#22C55E', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B'];

export function NetWorth() {
  const [items, setItems] = useState<Item[]>([
    { id: '1', name: 'Monthly Salary', amount: 8000, type: 'asset' },
    { id: '2', name: 'Savings Account', amount: 15000, type: 'asset' },
    { id: '3', name: 'Stock Portfolio', amount: 25000, type: 'asset' },
    { id: '4', name: 'Home Loan EMI', amount: 2000, type: 'liability' },
    { id: '5', name: 'Credit Card', amount: 500, type: 'liability' },
  ]);

  const [newItem, setNewItem] = useState({ name: '', amount: '', type: 'asset' });

  const totalAssets = items.filter(i => i.type === 'asset').reduce((acc, curr) => acc + curr.amount, 0);
  const totalLiabilities = items.filter(i => i.type === 'liability').reduce((acc, curr) => acc + curr.amount, 0);
  const netWorth = totalAssets - totalLiabilities;

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.amount) return;
    
    setItems([...items, {
      id: Math.random().toString(36).substring(7),
      name: newItem.name,
      amount: Number(newItem.amount),
      type: newItem.type as 'asset' | 'liability'
    }]);
    setNewItem({ name: '', amount: '', type: 'asset' });
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const pieData = [
    { name: 'Assets', value: totalAssets },
    { name: 'Liabilities', value: totalLiabilities }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-32">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <Wallet className="w-8 h-8 text-brand-500" /> Net Worth Manager
        </h1>
        <p className="text-muted mt-2">Track your true wealth by managing your assets and liabilities dynamically.</p>
      </header>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-6 border-brand-500/30 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 text-brand-500/10">
            <TrendingUp className="w-32 h-32" />
          </div>
          <h3 className="text-sm font-medium text-muted">Total Net Worth</h3>
          <p className="text-4xl font-black text-brand-500 mt-2 tracking-tighter">₹{netWorth.toLocaleString()}</p>
        </div>
        <div className="glass p-6">
          <h3 className="text-sm font-medium text-muted flex items-center gap-2">
            <ArrowUpRight className="w-4 h-4 text-emerald-500" /> Total Assets
          </h3>
          <p className="text-2xl font-bold text-foreground mt-2">₹{totalAssets.toLocaleString()}</p>
        </div>
        <div className="glass p-6">
          <h3 className="text-sm font-medium text-muted flex items-center gap-2">
            <ArrowDownRight className="w-4 h-4 text-destructive" /> Total Liabilities
          </h3>
          <p className="text-2xl font-bold text-foreground mt-2">₹{totalLiabilities.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Add new item */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass p-6">
            <h3 className="text-lg font-bold mb-4">Add Entry</h3>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted">Type</label>
                <div className="flex bg-secondaryCard p-1 rounded-lg">
                  <button 
                    type="button"
                    onClick={() => setNewItem({...newItem, type: 'asset'})}
                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${newItem.type === 'asset' ? 'bg-emerald-500/20 text-emerald-500' : 'text-muted hover:text-foreground'}`}
                  >
                    Asset
                  </button>
                  <button 
                    type="button"
                    onClick={() => setNewItem({...newItem, type: 'liability'})}
                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${newItem.type === 'liability' ? 'bg-destructive/20 text-destructive' : 'text-muted hover:text-foreground'}`}
                  >
                    Liability
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted">Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Salary, Home Loan" 
                  value={newItem.name}
                  onChange={e => setNewItem({...newItem, name: e.target.value})}
                  className="w-full bg-secondaryCard border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-brand-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted">Amount (₹)</label>
                <input 
                  type="number" 
                  placeholder="0.00" 
                  value={newItem.amount}
                  onChange={e => setNewItem({...newItem, amount: e.target.value})}
                  className="w-full bg-secondaryCard border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-brand-500"
                  required
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-2 mt-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-black font-bold transition-colors flex justify-center items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Entry
              </button>
            </form>
          </div>

          <div className="glass p-6">
            <h3 className="text-lg font-bold mb-4">Breakdown</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    <Cell fill="#22C55E" />
                    <Cell fill="#EF4444" />
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#161616', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                    formatter={(value: number) => `₹${value.toLocaleString()}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Lists */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Assets List */}
            <div className="glass p-6">
              <h3 className="text-lg font-bold text-emerald-500 mb-4 border-b border-border pb-2 flex items-center justify-between">
                Assets <span className="text-sm bg-emerald-500/10 px-2 py-0.5 rounded">₹{totalAssets.toLocaleString()}</span>
              </h3>
              <div className="space-y-3 mt-4">
                {items.filter(i => i.type === 'asset').length === 0 && <p className="text-muted text-sm text-center py-4">No assets added.</p>}
                {items.filter(i => i.type === 'asset').map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-secondaryCard/50 border border-transparent hover:border-border transition-colors group">
                    <span className="font-medium">{item.name}</span>
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-emerald-400">+₹{item.amount.toLocaleString()}</span>
                      <button onClick={() => removeItem(item.id)} className="text-muted hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Liabilities List */}
            <div className="glass p-6">
              <h3 className="text-lg font-bold text-destructive mb-4 border-b border-border pb-2 flex items-center justify-between">
                Liabilities <span className="text-sm bg-destructive/10 px-2 py-0.5 rounded">₹{totalLiabilities.toLocaleString()}</span>
              </h3>
              <div className="space-y-3 mt-4">
                {items.filter(i => i.type === 'liability').length === 0 && <p className="text-muted text-sm text-center py-4">No liabilities added.</p>}
                {items.filter(i => i.type === 'liability').map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-secondaryCard/50 border border-transparent hover:border-border transition-colors group">
                    <span className="font-medium">{item.name}</span>
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-destructive">-₹{item.amount.toLocaleString()}</span>
                      <button onClick={() => removeItem(item.id)} className="text-muted hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
