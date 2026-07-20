import React, { useState } from 'react';
import { VSTProvider } from './context/VSTContext';
import { Header } from './components/Header';
import { TradingViewChart } from './components/TradingViewChart';
import { OrderPanel } from './components/OrderPanel';
import { Portfolio } from './components/Portfolio';
import { Fundamentals } from './components/Fundamentals';
import { ShieldCheck, Activity, Terminal } from 'lucide-react';

const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'trading' | 'portfolio' | 'fundamentals'>('trading');

  return (
    <div className="min-h-screen bg-dark-900 text-slate-100 flex flex-col selection:bg-trade-accent selection:text-white">
      {/* Top Application Header */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main View Area */}
      <main className="flex-1 max-w-[1920px] w-full mx-auto p-4 sm:p-6">
        {activeTab === 'trading' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
            {/* Chart Column (8 cols on desktop) */}
            <div className="lg:col-span-8 flex flex-col space-y-6">
              <TradingViewChart />
            </div>

            {/* Order Panel Column (4 cols on desktop) */}
            <div className="lg:col-span-4 flex flex-col">
              <OrderPanel />
            </div>
          </div>
        )}

        {activeTab === 'portfolio' && <Portfolio />}

        {activeTab === 'fundamentals' && <Fundamentals />}
      </main>

      {/* Status Bar / Footer */}
      <footer className="bg-dark-800/80 border-t border-dark-600/60 py-2.5 px-4 text-xs text-slate-400 mt-auto">
        <div className="max-w-[1920px] mx-auto flex flex-wrap items-center justify-between gap-3 font-mono">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5 text-trade-green">
              <span className="w-2 h-2 rounded-full bg-trade-green animate-pulse" />
              <span className="font-semibold text-[11px]">System Status: Operational</span>
            </div>
            <span className="text-dark-600">|</span>
            <div className="flex items-center space-x-1 text-slate-400">
              <Activity className="w-3.5 h-3.5" />
              <span>WebSocket Stream Active</span>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-[11px]">
            <span className="flex items-center space-x-1 text-emerald-400 font-sans font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Guest Local Persistence & Sanitized State</span>
            </span>
            <span className="text-dark-600">|</span>
            <span className="text-slate-400 font-bold">VST Capital Engine v1.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <VSTProvider>
      <MainLayout />
    </VSTProvider>
  );
}

export default App;
