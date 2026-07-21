import React, { useState } from 'react';
import { AttaProvider, useAtta } from './context/AttaContext';
import { Header } from './components/Header';
import { TradingViewChart } from './components/TradingViewChart';
import { OrderPanel } from './components/OrderPanel';
import { OrderBook } from './components/OrderBook';
import { Portfolio } from './components/Portfolio';
import { Fundamentals } from './components/Fundamentals';
import { MarginCallBanner } from './components/MarginCallBanner';
import { formatBaseCurrency, formatPrice } from './utils/formatters';
import { ShieldCheck, Activity, ArrowUpRight, ArrowDownRight, Sparkles, Heart } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { uiMode, selectedSymbol, livePrices, baseCurrency, totalEquityInBaseCurrency, openPosition } = useAtta();
  const [activeTab, setActiveTab] = useState<'trading' | 'portfolio' | 'fundamentals'>('trading');

  const currentPrice = livePrices[selectedSymbol.symbol] || selectedSymbol.basePrice;

  return (
    <div className="min-h-screen bg-dark-900 text-slate-100 flex flex-col selection:bg-trade-accent selection:text-white">
      {/* Margin Call Warning Overlay Banner */}
      <MarginCallBanner />

      {/* Main Header */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main View Area */}
      <main className="flex-1 max-w-[1920px] w-full mx-auto p-4 sm:p-6">
        {activeTab === 'trading' && (
          <>
            {/* NOOB MODE: Gamified, ultra-clean UI, big targets, no technical jargon */}
            {uiMode === 'noob' && (
              <div className="max-w-4xl mx-auto space-y-6 text-center py-6">
                <div className="bg-dark-800 border border-dark-600/80 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                  <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1 rounded-full text-xs font-bold mb-4">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Noob Mode - Gamified Simplified Trading</span>
                  </div>

                  <h1 className="text-3xl font-extrabold text-white tracking-tight">{selectedSymbol.name}</h1>
                  <div className="text-4xl font-extrabold font-mono text-trade-gold my-3">
                    ${formatPrice(currentPrice, selectedSymbol.precision)}
                  </div>
                  <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
                    Predict market direction with zero complex jargon. Your account equity is {formatBaseCurrency(totalEquityInBaseCurrency, baseCurrency)}.
                  </p>

                  <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
                    <button
                      onClick={() =>
                        openPosition({
                          symbolInfo: selectedSymbol,
                          side: 'buy',
                          orderType: 'market',
                          marginInBaseCurrency: 500,
                          leverage: 10,
                          entryPrice: currentPrice,
                        })
                      }
                      className="py-5 bg-gradient-to-r from-trade-green to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white font-extrabold text-lg rounded-2xl shadow-xl shadow-trade-green/20 flex flex-col items-center justify-center space-y-1 transition-all"
                    >
                      <ArrowUpRight className="w-8 h-8 stroke-[3]" />
                      <span>PREDICT UP (BUY)</span>
                      <span className="text-[10px] font-normal opacity-80">Margin: 500 {baseCurrency} (10x)</span>
                    </button>

                    <button
                      onClick={() =>
                        openPosition({
                          symbolInfo: selectedSymbol,
                          side: 'sell',
                          orderType: 'market',
                          marginInBaseCurrency: 500,
                          leverage: 10,
                          entryPrice: currentPrice,
                        })
                      }
                      className="py-5 bg-gradient-to-r from-trade-red to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-extrabold text-lg rounded-2xl shadow-xl shadow-trade-red/20 flex flex-col items-center justify-center space-y-1 transition-all"
                    >
                      <ArrowDownRight className="w-8 h-8 stroke-[3]" />
                      <span>PREDICT DOWN (SELL)</span>
                      <span className="text-[10px] font-normal opacity-80">Margin: 500 {baseCurrency} (10x)</span>
                    </button>
                  </div>
                </div>

                <div className="bg-dark-800 border border-dark-600/80 rounded-2xl p-4">
                  <TradingViewChart />
                </div>
              </div>
            )}

            {/* LITE MODE: Standard modernized layout */}
            {uiMode === 'lite' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
                <div className="lg:col-span-8 flex flex-col space-y-6">
                  <TradingViewChart />
                </div>
                <div className="lg:col-span-4 flex flex-col">
                  <OrderPanel />
                </div>
              </div>
            )}

            {/* PRO MODE: Dense financial workstation with Order Book depth wall */}
            {uiMode === 'pro' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full">
                <div className="lg:col-span-7 flex flex-col space-y-4">
                  <TradingViewChart />
                </div>

                <div className="lg:col-span-2 flex flex-col">
                  <OrderBook />
                </div>

                <div className="lg:col-span-3 flex flex-col">
                  <OrderPanel />
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'portfolio' && <Portfolio />}
        {activeTab === 'fundamentals' && <Fundamentals />}
      </main>

      {/* AttaTrader Footer with explicit credit */}
      <footer className="bg-dark-800/90 border-t border-dark-600/60 py-3 px-4 text-xs text-slate-400 mt-auto">
        <div className="max-w-[1920px] mx-auto flex flex-wrap items-center justify-between gap-3 font-mono">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5 text-trade-green">
              <span className="w-2 h-2 rounded-full bg-trade-green animate-pulse" />
              <span className="font-bold text-[11px] text-white">AttaTrader Dual Engine: Active</span>
            </div>
            <span className="text-dark-600">|</span>
            <div className="flex items-center space-x-1 text-slate-400">
              <Activity className="w-3.5 h-3.5 text-trade-accent" />
              <span>Dynamic WebSocket Stream</span>
            </div>
          </div>

          {/* Subtle Professional Footer Credit */}
          <div className="flex items-center space-x-4 text-[11px]">
            <span className="flex items-center space-x-1.5 text-slate-300 font-sans font-semibold">
              <span>Created by</span>
              <span className="font-extrabold bg-gradient-to-r from-trade-green via-emerald-400 to-blue-400 bg-clip-text text-transparent">
                Atha
              </span>
            </span>
            <span className="text-dark-600">|</span>
            <span className="flex items-center space-x-1 text-emerald-400 font-sans font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Fault-Tolerant Multi-Currency Engine</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <AttaProvider>
      <MainLayout />
    </AttaProvider>
  );
}

export default App;
