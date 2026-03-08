import React, { useState } from "react";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import ResultsDashboard from "./pages/ResultsDashboard";
import HistoryPage from "./pages/HistoryPage";
import { motion, AnimatePresence } from "motion/react";
import { LayoutDashboard, History, LogOut, User, Sparkles } from "lucide-react";
import { Button } from "./components/UI";

type Page = "landing" | "dashboard" | "results" | "history";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("landing");
  const [analysisData, setAnalysisData] = useState<any>(null);

  const navigate = (page: Page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleAnalysisComplete = (data: any) => {
    setAnalysisData(data);
    navigate("results");
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white font-sans selection:bg-indigo-500/30">
      {/* Navigation */}
      {currentPage !== "landing" && (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[#030303]/80 backdrop-blur-md border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div 
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => navigate("landing")}
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight">CareerAI</span>
            </div>

            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                onClick={() => navigate("dashboard")}
                className={currentPage === "dashboard" ? "bg-white/5 text-white" : ""}
              >
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => navigate("history")}
                className={currentPage === "history" ? "bg-white/5 text-white" : ""}
              >
                <History className="w-4 h-4" /> History
              </Button>
              <div className="w-px h-6 bg-white/10 mx-2" />
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors">
                <User className="w-4 h-4" />
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className={currentPage !== "landing" ? "pt-16" : ""}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {currentPage === "landing" && (
              <LandingPage onStart={() => navigate("dashboard")} />
            )}
            {currentPage === "dashboard" && (
              <Dashboard onAnalysisComplete={handleAnalysisComplete} />
            )}
            {currentPage === "results" && analysisData && (
              <ResultsDashboard 
                data={analysisData} 
                onBack={() => navigate("dashboard")} 
              />
            )}
            {currentPage === "history" && (
              <HistoryPage onSelect={(data) => {
                setAnalysisData(data);
                navigate("results");
              }} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      {currentPage !== "landing" && (
        <footer className="py-12 border-t border-white/5 mt-20">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-white/40 text-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>© 2026 CareerAI Platform. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-8">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Contact Support</a>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
