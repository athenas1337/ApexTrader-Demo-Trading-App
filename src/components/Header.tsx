import React, { useState } from 'react';
import { useAtta } from '../context/AttaContext';
import { SUPPORTED_SYMBOLS, CRYPTO_SYMBOLS, FOREX_SYMBOLS } from '../services/symbols';
import { BaseCurrencyCode, SUPPORTED_BASE_CURRENCIES } from '../services/fxRates';
import { formatBaseCurrency, formatPrice } from '../utils/formatters';
import { UIMode, MarketArena } from '../types/trading';
import {
  TrendingUp,
  Wallet,
  PlusCircle,
  ShieldCheck,
  ChevronDown,
  BarChart2,
  PieChart,
  Layers,
  Settings,
  Trophy,
  Zap,
  Globe,
  User,
  Sparkles,
} from 'lucide-react';
import { TopUpModal } from './TopUpModal';
import { SecurityModal } from './SecurityModal';
import { SettingsModal } from './SettingsModal';

interface HeaderProps {
  activeTab: 'trading' | 'portfolio' | 'fundamentals' | 'tournament';
  setActiveTab: (tab: 'trading' | 'portfolio' | 'fundamentals' | 'tournament') => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const {
    wallet,
    baseCurrency,
    setBaseCurrency,
    uiMode,
    setUiMode,
    marketArena,
    setMarketArena,
    selectedSymbol,
    setSelectedSymbol,
    userProfile,
    isWeekendTournamentActive,
    livePrices,
  } = useAtta();

  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSymbolDropdownOpen, setIsSymbolDropdownOpen] = useState(false);
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);

  const currentPrice = livePrices[selectedSymbol.symbol] || selectedSymbol.basePrice;
  const currentSymbolsList = marketArena === 'crypto' ? CRYPTO_SYMBOLS : FOREX_SYMBOLS;

  return (
    <>
      <header className="bg-dark-800/95 backdrop-blur-md border-b border-dark-600/60 sticky top-0 z-40 px-4 py-2.5">
        <div className="max-w-[1920px] mx-auto flex flex-wrap items-center justify-between gap-3">
          
          {/* Left: Brand & Market Switcher */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => setActiveTab('trading')}>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-trade-green via-emerald-400 to-blue-500 flex items-center justify-center shadow-lg shadow-trade-green/20">
                <TrendingUp className="w-5 h-5 text-dark-900 stroke-[2.5]" />
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-tight text-white">
                  ATTA<span className="text-trade-green">TRADER</span>
                </span>
                <span className="ml-2 px-1.5 py-0.5 text-[9px] font-bold text-trade-green bg-trade-green/10 border border-trade-green/30 rounded uppercase tracking-wider">
                  DUAL-SIM
                </span>
              </div>
            </div>

            <div className="h-6 w-px bg-dark-600 hidden md:block" />

            {/* Crypto Arena vs Forex Hub */}
            <div className="flex items-center bg-dark-900/80 p-0.5 rounded-xl border border-dark-600">
              <button
                onClick={() => setMarketArena('crypto')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                  marketArena === 'crypto' ? 'bg-amber-500 text-dark-900 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Crypto Arena</span>
              </button>
              <button
                onClick={() => setMarketArena('forex')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                  marketArena === 'forex' ? 'bg-blue-500 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Forex Hub</span>
              </button>
            </div>

            {/* Asset Selector */}
            <div className="relative">
              <button
                onClick={() => setIsSymbolDropdownOpen(!isSymbolDropdownOpen)}
                className="flex items-center space-x-2 bg-dark-700 hover:bg-dark-600/80 border border-dark-600/80 rounded-xl px-3 py-1.5 transition-all text-xs font-semibold"
              >
                <span className="font-bold text-white">{selectedSymbol.name}</span>
                <span className="font-mono text-slate-300 font-bold ml-1">
                  ${formatPrice(currentPrice, selectedSymbol.precision)}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isSymbolDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-dark-800 border border-dark-600 rounded-xl shadow-2xl z-50 overflow-hidden py-1 max-h-80 overflow-y-auto">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase border-b border-dark-700">
                    Select {marketArena.toUpperCase()} Asset
                  </div>
                  {currentSymbolsList.map((item) => {
                    const itemPrice = livePrices[item.symbol] || item.basePrice;
                    const isSelected = item.symbol === selectedSymbol.symbol;
                    return (
                      <button
                        key={item.symbol}
                        onClick={() => {
                          setSelectedSymbol(item);
                          setIsSymbolDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2 flex items-center justify-between text-xs hover:bg-dark-700 transition-colors ${
                          isSelected ? 'bg-trade-accent/20 border-l-2 border-trade-accent font-bold text-white' : 'text-slate-300'
                        }`}
                      >
                        <div>
                          <span className="block font-bold">{item.name}</span>
                          <span className="text-[10px] text-slate-400">{item.category}</span>
                        </div>
                        <span className="font-mono">${formatPrice(itemPrice, item.precision)}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center bg-dark-900/60 p-1 rounded-xl border border-dark-600/50">
            <button
              onClick={() => setActiveTab('trading')}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'trading' ? 'bg-trade-accent text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Trade</span>
            </button>

            <button
              onClick={() => setActiveTab('portfolio')}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'portfolio' ? 'bg-trade-accent text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Portfolio</span>
            </button>

            <button
              onClick={() => setActiveTab('fundamentals')}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'fundamentals' ? 'bg-trade-accent text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <PieChart className="w-3.5 h-3.5" />
              <span>Analysis</span>
            </button>

            {/* Tournament Tab */}
            <button
              onClick={() => setActiveTab('tournament')}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all relative ${
                activeTab === 'tournament' ? 'bg-amber-500 text-dark-900 shadow' : 'text-amber-400 hover:text-amber-300'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Tournament</span>
              {isWeekendTournamentActive && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute -top-0.5 -right-0.5" />
              )}
            </button>
          </nav>

          {/* Right: Auth Profile Badge, Settings & Base Currency */}
          <div className="flex items-center space-x-2.5">
            {/* Auth Profile Badge */}
            <div
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center space-x-2 bg-dark-700 hover:bg-dark-600 border border-dark-600 rounded-xl px-2.5 py-1 cursor-pointer transition-all"
              title="Click to manage profile and auth settings"
            >
              <div className={`w-2 h-2 rounded-full ${userProfile.authType === 'GUEST' ? 'bg-slate-400' : 'bg-emerald-400 animate-pulse'}`} />
              <span className="text-xs font-bold text-white max-w-[100px] truncate">{userProfile.displayName}</span>
              <span className="text-[9px] uppercase px-1.5 py-0.2 font-mono rounded bg-dark-900 text-slate-400">
                {userProfile.authType === 'GUEST' ? 'GUEST' : userProfile.authType === 'EMAIL_USER' ? 'EMAIL' : 'GOOGLE'}
              </span>
            </div>

            {/* Base Currency Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
                className="bg-dark-700 hover:bg-dark-600 border border-dark-600 rounded-xl px-2.5 py-1.5 text-xs font-bold text-trade-gold flex items-center space-x-1"
              >
                <span>{baseCurrency}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isCurrencyDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-44 bg-dark-800 border border-dark-600 rounded-xl shadow-2xl z-50 py-1 font-mono text-xs">
                  <div className="px-3 py-1 text-[10px] font-sans font-bold text-slate-400 uppercase border-b border-dark-700">
                    Base Currency
                  </div>
                  {(Object.keys(SUPPORTED_BASE_CURRENCIES) as BaseCurrencyCode[]).map((code) => (
                    <button
                      key={code}
                      onClick={() => {
                        setBaseCurrency(code);
                        setIsCurrencyDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left hover:bg-dark-700 transition-colors flex justify-between ${
                        baseCurrency === code ? 'text-trade-gold font-bold bg-dark-700/50' : 'text-slate-300'
                      }`}
                    >
                      <span>{code}</span>
                      <span className="text-slate-400">{SUPPORTED_BASE_CURRENCIES[code].symbol}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Wallet Balance Pill */}
            <div className="flex items-center bg-dark-700 border border-dark-600/80 rounded-xl px-3 py-1 shadow-inner">
              <Wallet className="w-4 h-4 text-trade-gold mr-2" />
              <div className="flex flex-col">
                <span className="text-[9px] uppercase font-extrabold text-slate-400">Balance</span>
                <span className="text-xs font-mono font-bold text-white">
                  {formatBaseCurrency(wallet.balanceInBaseCurrency, baseCurrency)}
                </span>
              </div>

              <button
                onClick={() => setIsTopUpOpen(true)}
                className="ml-2.5 bg-trade-gold hover:bg-amber-500 text-dark-900 px-2 py-0.5 rounded-lg text-xs font-bold transition-all shadow"
              >
                <PlusCircle className="w-3.5 h-3.5 inline mr-0.5" />
                Top Up
              </button>
            </div>

            {/* Settings Trigger */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-slate-300 bg-dark-700 border border-dark-600 rounded-xl hover:text-white transition-all"
              title="AttaTrader Settings & Redeem Code"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Security Audit Trigger */}
            <button
              onClick={() => setIsSecurityOpen(true)}
              className="p-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-xl hover:bg-emerald-500/20 transition-all"
              title="AttaTrader Security Audit"
            >
              <ShieldCheck className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <TopUpModal isOpen={isTopUpOpen} onClose={() => setIsTopUpOpen(false)} />
      <SecurityModal isOpen={isSecurityOpen} onClose={() => setIsSecurityOpen(false)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
};
