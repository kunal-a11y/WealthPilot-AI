
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { fetchWithAuth } from "../lib/api";
import { Printer, FileText, CheckCircle2 } from "lucide-react";
import { useNotifications } from "../lib/NotificationContext";
import { useEffect } from "react";

export const ReportGenerator = () => {
  const { getToken } = useAuth();
  const { addNotification } = useNotifications();

  const { data: user, isLoading: loadingUser, error: userError } = useQuery({ 
    queryKey: ["userProfile"], 
    queryFn: () => fetchWithAuth("/user/profile", getToken),
    retry: false
  });
  const { data: assets = [], isLoading: loadingAssets, error: assetsError } = useQuery({ 
    queryKey: ["assets"], 
    queryFn: () => fetchWithAuth("/finance/assets", getToken),
    retry: false
  });
  const { data: liabilities = [], isLoading: loadingLiab, error: liabError } = useQuery({ 
    queryKey: ["liabilities"], 
    queryFn: () => fetchWithAuth("/finance/liabilities", getToken),
    retry: false
  });

  useEffect(() => {
    if (userError || assetsError || liabError) {
      addNotification({
        type: 'error',
        title: 'Report Generation Failed',
        message: 'Failed to retrieve your financial data. Please try again later.'
      });
    }
  }, [userError, assetsError, liabError, addNotification]);

  const handlePrint = () => {
    window.print();
  };

  if (loadingUser || loadingAssets || loadingLiab) {
    return <div className="p-8 text-center text-zinc-400 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div></div>;
  }

  const totalAssets = assets.reduce((acc: number, val: any) => acc + val.value, 0);
  const totalLiab = liabilities.reduce((acc: number, val: any) => acc + val.value, 0);
  const netWorth = totalAssets - totalLiab;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      
      {/* Controls (Hidden when printing) */}
      <div className="flex justify-between items-center bg-zinc-900 border border-zinc-800 p-4 rounded-xl print:hidden">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><FileText className="w-5 h-5 text-emerald-500" /> Report Generator</h2>
          <p className="text-sm text-zinc-400">Generate a comprehensive PDF report of your wealth.</p>
        </div>
        <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-black font-semibold rounded-lg hover:bg-emerald-400 transition-colors">
          <Printer className="w-4 h-4" /> Save as PDF
        </button>
      </div>

      {/* The Report (Optimized for printing) */}
      <div id="report-content" className="bg-white text-black p-10 shadow-2xl rounded-sm min-h-[1056px] print:m-0 print:shadow-none print:p-0 print:text-black">
        
        <header className="border-b-4 border-emerald-600 pb-6 mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">WealthPilot AI</h1>
            <p className="text-gray-500 uppercase tracking-widest text-sm font-semibold mt-1">Comprehensive Wealth Report</p>
          </div>
          <div className="text-right text-gray-500 text-sm">
            <p>Generated on: {new Date().toLocaleDateString()}</p>
            <p className="font-semibold text-gray-900">{user?.firstName} {user?.lastName}</p>
          </div>
        </header>

        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 border-b border-gray-200 pb-2 mb-6">Executive Summary</h2>
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
              <p className="text-sm text-gray-500 font-medium uppercase tracking-wider mb-1">Total Assets</p>
              <p className="text-3xl font-bold text-gray-900">₹{totalAssets.toLocaleString()}</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
              <p className="text-sm text-gray-500 font-medium uppercase tracking-wider mb-1">Total Liabilities</p>
              <p className="text-3xl font-bold text-gray-900">₹{totalLiab.toLocaleString()}</p>
            </div>
            <div className="bg-emerald-50 p-6 rounded-lg border border-emerald-100">
              <p className="text-sm text-emerald-800 font-medium uppercase tracking-wider mb-1">Net Worth</p>
              <p className="text-3xl font-black text-emerald-600">₹{netWorth.toLocaleString()}</p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-10 mb-10">
          <section>
            <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">Asset Breakdown</h2>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200 text-gray-600">
                  <th className="py-2">Name</th>
                  <th className="py-2">Type</th>
                  <th className="py-2 text-right">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {assets.map((a: any) => (
                  <tr key={a.id}>
                    <td className="py-3 font-medium">{a.name}</td>
                    <td className="py-3 text-gray-500">{a.type}</td>
                    <td className="py-3 text-right font-semibold">₹{a.value.toLocaleString()}</td>
                  </tr>
                ))}
                {assets.length === 0 && <tr><td colSpan={3} className="py-4 text-center text-gray-500">No assets recorded</td></tr>}
              </tbody>
            </table>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">Liability Breakdown</h2>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200 text-gray-600">
                  <th className="py-2">Name</th>
                  <th className="py-2">Type</th>
                  <th className="py-2 text-right">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {liabilities.map((l: any) => (
                  <tr key={l.id}>
                    <td className="py-3 font-medium">{l.name}</td>
                    <td className="py-3 text-gray-500">{l.type}</td>
                    <td className="py-3 text-right font-semibold">₹{l.value.toLocaleString()}</td>
                  </tr>
                ))}
                {liabilities.length === 0 && <tr><td colSpan={3} className="py-4 text-center text-gray-500">No liabilities recorded</td></tr>}
              </tbody>
            </table>
          </section>
        </div>

        <section className="bg-gray-900 text-white p-8 rounded-xl print:border print:border-gray-300 print:bg-white print:text-black mb-10">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> AI Health Assessment</h2>
          <p className="text-gray-300 print:text-gray-700 leading-relaxed">
            Based on your profile, your debt-to-asset ratio is {((totalLiab / (totalAssets || 1)) * 100).toFixed(1)}%. 
            {totalLiab / (totalAssets || 1) > 0.4 ? " You have a high debt burden. Focus on paying down high-interest liabilities." : " Your debt levels are healthy. Focus on aggressive investing and diversification."}
          </p>
        </section>

        <footer className="mt-16 pt-6 border-t border-gray-200 text-center text-xs text-gray-400">
          <p>This report is generated by WealthPilot AI for informational purposes only and does not constitute guaranteed financial advice.</p>
          <p>© {new Date().getFullYear()} WealthPilot AI. All rights reserved.</p>
        </footer>
      </div>
      
    </div>
  );
};
