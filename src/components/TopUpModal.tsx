import React, { useState } from 'react';
import { useAtta } from '../context/AttaContext';
import { formatBaseCurrency } from '../utils/formatters';
import { BaseCurrencyCode, SUPPORTED_BASE_CURRENCIES, convertFromUSD } from '../services/fxRates';
import { X, PlusCircle, Sparkles, CheckCircle2, AlertCircle, Coins, RefreshCw } from 'lucide-react';

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TopUpModal: React.FC<TopUpModalProps> = ({ isOpen, onClose }) => {
  const { topUpAccount, wallet, baseCurrency, resetAccount } = useAtta();

  const [customAmount, setCustomAmount] = useState<string>('10000');
  const [noteInput, setNoteInput] = useState<string>('Capital Boost');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

  const currentConfig = SUPPORTED_BASE_CURRENCIES[baseCurrency];
  const presetsUSD = [1000, 5000, 10000, 50000, 100000, 1000000];

  const handleTopUp = (amountToUse?: number) => {
    setFeedback(null);
    const amount = amountToUse !== undefined ? amountToUse : parseFloat(customAmount);

    if (isNaN(amount) || amount <= 0) {
      setFeedback({ type: 'error', message: 'Please enter a valid top-up amount.' });
      return;
    }

    const res = topUpAccount(amount, noteInput || 'Manual Account Top Up');
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setTimeout(() => {
        setFeedback(null);
        onClose();
      }, 1600);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-dark-800 border border-dark-600 rounded-3xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-trade-gold/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-dark-700 pb-4 mb-4 relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-trade-gold/20 border border-trade-gold/40 flex items-center justify-center text-trade-gold">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">AttaTrader Capital Top Up</h3>
              <p className="text-xs text-slate-400">Multi-Currency Demo Engine ({baseCurrency})</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white bg-dark-700 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Balance Display */}
        <div className="bg-dark-900/80 border border-dark-700 rounded-2xl p-4 mb-5 flex justify-between items-center">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Available Balance</span>
            <span className="text-lg font-extrabold font-mono text-trade-gold">
              {formatBaseCurrency(wallet.balanceInBaseCurrency, baseCurrency)}
            </span>
          </div>
          <span className="px-2.5 py-1 text-xs font-bold text-trade-green bg-trade-green/10 border border-trade-green/30 rounded-lg">
            Pegged 1:1 Fiat
          </span>
        </div>

        {/* Quick Amount Presets */}
        <div className="space-y-2 mb-4">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-trade-gold" />
            Quick Presets ({baseCurrency})
          </label>
          <div className="grid grid-cols-3 gap-2">
            {presetsUSD.map((usdAmt) => {
              const localAmt = Math.round(convertFromUSD(usdAmt, baseCurrency));
              return (
                <button
                  key={usdAmt}
                  type="button"
                  onClick={() => {
                    setCustomAmount(localAmt.toString());
                    handleTopUp(localAmt);
                  }}
                  className="bg-dark-900 hover:bg-trade-gold hover:text-dark-900 border border-dark-700 text-slate-200 text-xs font-mono font-bold py-2 px-2 rounded-xl transition-all"
                >
                  +{currentConfig.symbol}{localAmt >= 1000000 ? `${(localAmt / 1000000).toFixed(1)}M` : localAmt >= 1000 ? `${(localAmt / 1000).toFixed(0)}k` : localAmt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Typing Number Input */}
        <div className="space-y-3 mb-6">
          <label className="text-xs font-semibold text-slate-300 block">
            Custom Typed Amount (Up to $1,000,000 USD Equiv)
          </label>
          <div className="relative">
            <input
              type="number"
              min="1"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="w-full bg-dark-900 border border-dark-600 rounded-2xl px-4 py-3 text-base font-mono text-white focus:outline-none focus:border-trade-gold"
              placeholder="Enter amount"
            />
            <span className="absolute right-4 top-3.5 text-sm font-bold text-trade-gold">{baseCurrency}</span>
          </div>

          <input
            type="text"
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
            className="w-full bg-dark-900/60 border border-dark-700 rounded-xl px-3 py-2 text-xs text-slate-300"
            placeholder="Top up note / reason (optional)"
          />
        </div>

        {/* Feedback Message */}
        {feedback && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold mb-4 flex items-center space-x-2 ${
              feedback.type === 'success' ? 'bg-trade-green/15 text-trade-green border border-trade-green/30' : 'bg-trade-red/15 text-trade-red border border-trade-red/30'
            }`}
          >
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Reset demo portfolio back to $10,000 initial VUSD state?')) {
                resetAccount();
                onClose();
              }
            }}
            className="flex-1 py-3 bg-dark-700 hover:bg-dark-600 text-slate-300 font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-1"
          >
            <RefreshCw className="w-3.5 h-3.5 text-rose-400" />
            <span>Reset Demo</span>
          </button>
          <button
            type="button"
            onClick={() => handleTopUp()}
            className="flex-[2] py-3 bg-gradient-to-r from-trade-gold to-amber-500 hover:from-amber-500 hover:to-amber-600 text-dark-900 font-extrabold text-xs rounded-xl transition-all shadow-lg flex items-center justify-center space-x-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Confirm Top Up</span>
          </button>
        </div>
      </div>
    </div>
  );
};
