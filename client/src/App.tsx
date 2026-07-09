import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SignedIn, SignedOut, SignIn, SignUp } from "@clerk/clerk-react";

// Layout
import { MainLayout } from "./components/layout/MainLayout";
import { Dashboard } from "./pages/Dashboard";
import { Advisor } from "./pages/Advisor";
import { Company } from "./pages/Company";
import { Compare } from "./pages/Compare";
import { PortfolioBuilder } from "./pages/PortfolioBuilder";
import { Screener } from "./pages/Screener";
import { Watchlist } from "./pages/Watchlist";
import { Calculators } from "./pages/Calculators";
import { Settings } from "./pages/Settings";
import { NetWorth } from "./pages/NetWorth";
import { WealthManager } from "./pages/WealthManager";
import { GoalPlanner } from "./pages/GoalPlanner";
import { TransactionLedger } from "./pages/TransactionLedger";
import { MarketOverview } from "./pages/MarketOverview";
import { Simulator } from "./pages/Simulator";
import { ReportGenerator } from "./pages/ReportGenerator";
import { DocumentVault } from "./pages/DocumentVault";
import { OnboardingWizard } from "./pages/OnboardingWizard";
import { Profile } from "./pages/Profile";
import { RequireOnboarding } from "./components/RequireOnboarding";

const clerkAppearance = {
  elements: {
    card: "bg-zinc-900 border border-zinc-800 shadow-2xl rounded-[24px]",
    headerTitle: "text-white text-xl font-black",
    headerSubtitle: "text-zinc-400 font-medium",
    socialButtonsBlockButton: "bg-black border border-zinc-800 hover:bg-zinc-800 text-white transition-colors rounded-xl",
    socialButtonsBlockButtonText: "text-white font-bold",
    dividerLine: "bg-zinc-800",
    dividerText: "text-zinc-500 font-medium",
    formFieldLabel: "text-zinc-300 font-bold",
    formFieldInput: "bg-black border border-zinc-800 text-white rounded-xl focus:ring-emerald-500 focus:border-emerald-500",
    formButtonPrimary: "bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-colors shadow-lg shadow-emerald-500/20",
    footerActionText: "text-zinc-400",
    footerActionLink: "text-emerald-500 hover:text-emerald-400 font-bold",
    identityPreviewText: "text-white",
    identityPreviewEditButton: "text-emerald-500 hover:text-emerald-400",
    formFieldSuccessText: "text-emerald-500",
    formFieldErrorText: "text-rose-500"
  }
};

const CustomHeader = () => (
  <div className="absolute top-8 left-8 md:top-12 md:left-12 flex items-center gap-3 z-20">
    <img src="/logo.png" className="w-10 h-10 md:w-12 md:h-12 object-contain drop-shadow-[0_0_12px_rgba(16,185,129,0.5)]" alt="WealthPilot AI" />
    <span className="text-white font-black tracking-tight text-2xl md:text-3xl">WealthPilot AI</span>
  </div>
);

const SignInPage = () => (
  <div className="flex min-h-screen items-center justify-center bg-[#090909] relative overflow-hidden">
    <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-900/20 via-[#090909] to-[#090909] pointer-events-none z-0"></div>
    <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none -translate-x-1/2 translate-y-1/2 z-0"></div>
    <CustomHeader />
    <div className="z-10 p-4">
      <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" appearance={clerkAppearance} />
    </div>
  </div>
);

const SignUpPage = () => (
  <div className="flex min-h-screen items-center justify-center bg-[#090909] relative overflow-hidden">
    <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-900/20 via-[#090909] to-[#090909] pointer-events-none z-0"></div>
    <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none -translate-x-1/2 translate-y-1/2 z-0"></div>
    <CustomHeader />
    <div className="z-10 p-4">
      <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" appearance={clerkAppearance} />
    </div>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <div className="dark">
        <Routes>
          {/* Public Routes */}
          <Route path="/sign-in/*" element={<SignInPage />} />
          <Route path="/sign-up/*" element={<SignUpPage />} />

          {/* Protected Routes inside MainLayout */}
          <Route 
            element={
              <>
                <SignedIn>
                  <RequireOnboarding />
                </SignedIn>
                <SignedOut>
                  <Navigate to="/sign-in" replace />
                </SignedOut>
              </>
            }
          >
            <Route element={<MainLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/advisor" element={<Advisor />} />
            <Route path="/portfolio-builder" element={<PortfolioBuilder />} />
            <Route path="/wealth-manager" element={<WealthManager />} />
            <Route path="/goals" element={<GoalPlanner />} />
            <Route path="/ledger" element={<TransactionLedger />} />
            <Route path="/simulator" element={<Simulator />} />
            <Route path="/reports" element={<ReportGenerator />} />
            <Route path="/vault" element={<DocumentVault />} />
            <Route path="/overview" element={<MarketOverview />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/screener" element={<Screener />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/calculators" element={<Calculators />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/net-worth" element={<NetWorth />} />
              <Route path="/company/:symbol" element={<Company />} />
              <Route path="/compare" element={<Compare />} />
            </Route>
          </Route>

          <Route path="/onboarding" element={
            <>
              <SignedIn><OnboardingWizard /></SignedIn>
              <SignedOut><Navigate to="/sign-in" replace /></SignedOut>
            </>
          } />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
