import React, { useState } from 'react';
import { useAtta } from '../context/AttaContext';
import { formatBaseCurrency, formatPrice } from '../utils/formatters';
import { Calculator, X, Zap, Target } from 'lucide-react';

interface FinancialCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FinancialCalculator: React.FC<FinancialCalculatorProps> = ({ isOpen, onClose }) => {
  const { selectedSymbol, baseCurrency, livePrices } = useAtta();

  const [mode, setMode] = useState<'crypto' | 'forex'>(selectedSymbol.type === 'crypto' ? 'crypto' : 'forex');
  const [accountBalance, setAccountBalance] = useState<string>('10000');
  const [riskPercent, setRiskPercent] = useState<string>('2');
  const [stopLossPips, setStopLossPips] = useState<string>('30');
  const [leverage, setLeverage] = useState<number>(100);

  if (!isOpen) return null;

  const currentPrice = livePrices[selectedSymbol.symbol] || selectedSymbol.basePrice;
  const balance = parseFloat(accountBalance) || 10000;
  const riskPct = parseFloat(riskPercent) || 2;
  const riskAmount = balance * (riskPct / 100);

  // Forex Calculation
  const pipSize = selectedSymbol.pipSize || 0.0001;
  const pipsSL = parseFloat(stopLossPips) || 30;
  const pipValuePerStandardLotUSD = 10; // $10 per pip per 100k standard lot on USD quote
  const requiredLots = pipsSL > 0 ? riskAmount / (pipsSL * pipValuePerStandardLotUSD) : 0;
  const requiredMarginBase = (requiredLots * 100000 * currentPrice) / leverage;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-dark-800 border border-dark-600 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-dark-700 pb-3 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-trade-accent/20 border border-trade-accent/40 flex items-center justify-center text-trade-accent">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">Financial Risk Calculator</h3>
              <p className="text-xs text-slate-400">Position & Lot Size Calculator ({baseCurrency})</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white bg-dark-700 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="grid grid-cols-2 gap-2 bg-dark-900 p-1 rounded-xl border border-dark-700 mb-4 text-xs font-bold">
          <button
            onClick={() => setMode('crypto')}
            className={`py-2 rounded-lg transition-all ${mode === 'crypto' ? 'bg-trade-accent text-white' : 'text-slate-400'}`}
          >
            Crypto Risk Calculator
          </button>
          <button
            onClick={() => setMode('forex')}
            className={`py-2 rounded-lg transition-all ${mode === 'forex' ? 'bg-trade-accent text-white' : 'text-slate-400'}`}
          >
            Forex Lot/Pip Calculator
          </button>
        </div>

        {/* Input Form */}
        <div className="space-y-3 font-mono text-xs">
          <div>
            <label className="text-slate-400 block mb-1 font-sans font-semibold">Account Balance ({baseCurrency})</label>
            <input
              type="number"
              value={accountBalance}
              onChange={(e) => setAccountBalance(e.target.value)}
              className="w-full bg-dark-900 border border-dark-600 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-trade-accent"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 block mb-1 font-sans font-semibold">Risk Per Trade (%)</label>
              <input
                type="number"
                value={riskPercent}
                onChange={(e) => setRiskPercent(e.target.value)}
                className="w-full bg-dark-900 border border-dark-600 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-trade-accent"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1 font-sans font-semibold">
                {mode === 'forex' ? 'Stop Loss (Pips)' : 'Stop Loss Distance (%)'}
              </label>
              <input
                type="number"
                value={stopLossPips}
                onChange={(e) => setStopLossPips(e.target.value)}
                className="w-full bg-dark-900 border border-dark-600 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-trade-accent"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1 font-sans font-semibold">Leverage ({leverage}x)</label>
            <input
              type="range"
              min="1"
              max="500"
              value={leverage}
              onChange={(e) => setLeverage(parseInt(e.target.value))}
              className="w-full accent-trade-gold"
            />
          </div>
        </div>

        {/* Calculated Results Card */}
        <div className="bg-dark-900/80 border border-dark-700 rounded-2xl p-4 mt-5 space-y-2 font-mono text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Allowed Risk Amount:</span>
            <span className="font-bold text-trade-red">{formatBaseCurrency(riskAmount, baseCurrency)}</span>
          </div>

          {mode === 'forex' ? (
            <>
              <div className="flex justify-between text-slate-400">
                <span>Recommended Standard Lots:</span>
                <span className="font-bold text-trade-gold">{requiredLots.toFixed(2)} Lots (100k)</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Est. Required Margin:</span>
                <span className="font-bold text-white">{formatBaseCurrency(requiredMarginBase, baseCurrency)}</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between text-slate-400">
                <span>Max Position Notional:</span>
                <span className="font-bold text-trade-gold">{formatBaseCurrency(riskAmount * leverage, baseCurrency)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Est. Coin Position Size:</span>
                <span className="font-bold text-white font-mono">
                  {((riskAmount * leverage) / currentPrice).toFixed(4)} {selectedSymbol.symbol.replace('USDT', '')}
                </span>
              </div>
            </>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 py-3 bg-trade-accent hover:bg-blue-600 text-white font-extrabold text-xs rounded-xl transition-all"
        >
          Close Calculator
        </button>
      </div>
    </div>
  );
};
