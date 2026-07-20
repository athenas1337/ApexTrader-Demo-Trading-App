import React, { useState } from 'react';
import { useVST } from '../context/VSTContext';
import { SUPPORTED_SYMBOLS } from '../services/symbols';
import { formatCurrency, formatPrice, formatPercentage } from '../utils/formatters';
import {
  TrendingUp,
  Wallet,
  PlusCircle,
  ShieldCheck,
  ChevronDown,
  BarChart2,
  PieChart,
  Layers,
  RefreshCw,
} from 'lucide-react';
import { TopUpModal } from './TopUpModal';
import { SecurityModal } from './SecurityModal';

interface HeaderProps {
  activeTab: 'trading' | 'portfolio' | 'fundamentals';
  setActiveTab: (tab: 'trading' | 'portfolio' | 'fundamentals') => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const {
    wallet,
    selectedSymbol,
    setSelectedSymbol,
    livePrices,
    totalEquity,
    totalUnrealizedPnl,
    resetAccount,
  } = useVST();

  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  const [isSymbolDropdownOpen, setIsSymbolDropdownOpen] = useState(false);

  const currentPrice = livePrices[selectedSymbol.symbol] || selectedSymbol.basePrice;
  const isPnlPositive = totalUnrealizedPnl >= 0;

  return (
    <>
      <header className="bg-dark-800/90 backdrop-blur-md border-b border-dark-600/60 sticky top-0 z-40 px-4 py-2.5">
        <div className="max-w-[1920px] mx-auto flex flex-wrap items-center justify-between gap-3">
          
          {/* Left Section: Logo & Asset Selector */}
          <div className="flex items-center space-x-4">
            {/* Brand Logo */}
            <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => setActiveTab('trading')}>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-trade-green to-emerald-400 flex items-center justify-center shadow-lg shadow-trade-green/20">
                <TrendingUp className="w-5 h-5 text-dark-900 stroke-[2.5]" />
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  APEX<span className="text-trade-green">TRADER</span>
                </span>
                <span className="ml-2 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-trade-green bg-trade-green/10 border border-trade-green/30 rounded uppercase">
                  VST DEMO
                </span>
              </div>
            </div>

            <div className="h-6 w-px bg-dark-600 hidden md:block" />

            {/* Asset Pair Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsSymbolDropdownOpen(!isSymbolDropdownOpen)}
                className="flex items-center space-x-2 bg-dark-700 hover:bg-dark-600/80 border border-dark-600/80 rounded-xl px-3 py-1.5 transition-all text-sm font-medium"
              >
                <div className="flex items-center space-x-2">
                  <span className={`w-2 h-2 rounded-full ${selectedSymbol.type === 'crypto' ? 'bg-amber-400' : 'bg-blue-400'}`} />
                  <span className="font-bold text-white tracking-wide">{selectedSymbol.name}</span>
                </div>
                <span className="font-mono text-slate-300 font-semibold ml-1">
                  ${formatPrice(currentPrice, selectedSymbol.precision)}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {/* Symbol Selector Dropdown Menu */}
              {isSymbolDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-dark-800 border border-dark-600 rounded-xl shadow-2xl z-50 overflow-hidden py-1">
                  <div className="px-3 py-1.5 text-[11px] font-bold tracking-wider text-slate-400 uppercase border-b border-dark-700 flex justify-between">
                    <span>Select Market</span>
                    <span>Pair Type</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-dark-700/50">
                    {SUPPORTED_SYMBOLS.map((item) => {
                      const itemPrice = livePrices[item.symbol] || item.basePrice;
                      const isSelected = item.symbol === selectedSymbol.symbol;
                      return (
                        <button
                          key={item.symbol}
                          onClick={() => {
                            setSelectedSymbol(item);
                            setIsSymbolDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 flex items-center justify-between hover:bg-dark-700/80 transition-colors ${
                            isSelected ? 'bg-trade-accent/15 border-l-2 border-trade-accent' : ''
                          }`}
                        >
                          <div className="text-left">
                            <div className="font-bold text-xs text-white flex items-center gap-1.5">
                              {item.name}
                            </div>
                            <div className="text-[10px] text-slate-400">{item.category}</div>
                          </div>
                          <div className="text-right font-mono text-xs font-semibold text-slate-200">
                            ${formatPrice(itemPrice, item.precision)}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="flex items-center bg-dark-900/60 p-1 rounded-xl border border-dark-600/50">
            <button
              onClick={() => setActiveTab('trading')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'trading'
                  ? 'bg-trade-accent text-white shadow-lg shadow-trade-accent/30'
                  : 'text-slate-400 hover:text-white hover:bg-dark-700/50'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Chart & Trade</span>
            </button>

            <button
              onClick={() => setActiveTab('portfolio')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'portfolio'
                  ? 'bg-trade-accent text-white shadow-lg shadow-trade-accent/30'
                  : 'text-slate-400 hover:text-white hover:bg-dark-700/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Portfolio</span>
            </button>

            <button
              onClick={() => setActiveTab('fundamentals')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'fundamentals'
                  ? 'bg-trade-accent text-white shadow-lg shadow-trade-accent/30'
                  : 'text-slate-400 hover:text-white hover:bg-dark-700/50'
              }`}
            >
              <PieChart className="w-3.5 h-3.5" />
              <span>Fundamentals</span>
            </button>
          </nav>

          {/* Right Section: VST Wallet, Top-Up & Security Badges */}
          <div className="flex items-center space-x-3">
            {/* Unrealized PnL Indicator */}
            <div className="hidden lg:flex flex-col text-right px-2">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Floating PnL</span>
              <span className={`text-xs font-mono font-bold ${isPnlPositive ? 'text-trade-green' : 'text-trade-red'}`}>
                {isPnlPositive ? '+' : ''}{formatCurrency(totalUnrealizedPnl)}
              </span>
            </div>

            {/* VST Wallet Balance Pill */}
            <div className="flex items-center bg-dark-700 border border-dark-600/80 rounded-xl px-3 py-1.5 shadow-inner">
              <Wallet className="w-4 h-4 text-trade-gold mr-2" />
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">VST Balance</span>
                <span className="text-xs font-mono font-bold text-white">{formatCurrency(wallet.balance)}</span>
              </div>

              {/* Top Up Button */}
              <button
                onClick={() => setIsTopUpOpen(true)}
                className="ml-3 flex items-center space-x-1 bg-trade-gold hover:bg-amber-500 text-dark-900 px-2.5 py-1 rounded-lg text-xs font-bold transition-all shadow-md shadow-trade-gold/20"
                title="Top Up Virtual Tokens (100 - 100,000 VST)"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Top Up</span>
              </button>
            </div>

            {/* Security Audit Button */}
            <button
              onClick={() => setIsSecurityOpen(true)}
              className="p-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-xl hover:bg-emerald-500/20 transition-all"
              title="Security & Persistence Details"
            >
              <ShieldCheck className="w-4 h-4" />
            </button>

            {/* Reset Demo Account */}
            <button
              onClick={() => {
                if (window.confirm('Reset demo portfolio back to 10,000 VST initial state?')) {
                  resetAccount();
                }
              }}
              className="p-2 text-slate-400 bg-dark-700 border border-dark-600 rounded-xl hover:text-trade-red hover:border-trade-red/40 transition-all"
              title="Reset Demo Portfolio (10,000 VST)"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Top-Up Modal */}
      <TopUpModal isOpen={isTopUpOpen} onClose={() => setIsTopUpOpen(false)} />

      {/* Security Modal */}
      <SecurityModal isOpen={isSecurityOpen} onClose={() => setIsSecurityOpen(false)} />
    </>
  );
};
