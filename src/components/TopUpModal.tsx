import React, { useState } from 'react';
import { useVST } from '../context/VSTContext';
import { formatCurrency } from '../utils/formatters';
import { X, PlusCircle, Sparkles, CheckCircle2, AlertCircle, Coins } from 'lucide-react';

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TopUpModal: React.FC<TopUpModalProps> = ({ isOpen, onClose }) => {
  const { topUpVST, wallet } = useVST();
  const [customAmount, setCustomAmount] = useState<string>('5000');
  const [noteInput, setNoteInput] = useState<string>('Practice Seed Boost');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

  const presets = [100, 1000, 5000, 10000, 100000];

  const handleTopUp = (amountToUse?: number) => {
    setFeedback(null);
    const amount = amountToUse !== undefined ? amountToUse : parseFloat(customAmount);

    if (isNaN(amount) || amount < 100 || amount > 100000) {
      setFeedback({
        type: 'error',
        message: 'Top-Up amount must be between 100 VST and 100,000 VST.',
      });
      return;
    }

    const res = topUpVST(amount, noteInput || 'Manual VST Top Up');
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setTimeout(() => {
        setFeedback(null);
        onClose();
      }, 1800);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-dark-800 border border-dark-600 rounded-3xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden">
        {/* Background Ambient Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-trade-gold/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-dark-700 pb-4 mb-4 relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-trade-gold/20 border border-trade-gold/40 flex items-center justify-center text-trade-gold">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">Top Up VST Tokens</h3>
              <p className="text-xs text-slate-400">Simulated seed capital (100 to 100,000 VST)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-dark-700 hover:bg-dark-600 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Balance Display */}
        <div className="bg-dark-900/80 border border-dark-700 rounded-2xl p-4 mb-5 flex justify-between items-center">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Current Wallet</span>
            <span className="text-lg font-extrabold font-mono text-trade-gold">{formatCurrency(wallet.balance)}</span>
          </div>
          <span className="px-2.5 py-1 text-xs font-bold text-trade-green bg-trade-green/10 border border-trade-green/30 rounded-lg">
            Zero Real Risk
          </span>
        </div>

        {/* Quick Amount Presets */}
        <div className="space-y-2 mb-4">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-trade-gold" />
            Quick Presets
          </label>
          <div className="grid grid-cols-3 gap-2">
            {presets.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => {
                  setCustomAmount(amt.toString());
                  handleTopUp(amt);
                }}
                className="bg-dark-900 hover:bg-trade-gold hover:text-dark-900 border border-dark-700 text-slate-200 text-xs font-mono font-bold py-2 px-3 rounded-xl transition-all shadow-sm"
              >
                +{amt.toLocaleString()} VST
              </button>
            ))}
          </div>
        </div>

        {/* Custom Typing Number System Input */}
        <div className="space-y-3 mb-6">
          <label className="text-xs font-semibold text-slate-300 block">
            Custom Typed Amount (100 - 100,000 VST)
          </label>

          <div className="relative">
            <input
              type="number"
              min="100"
              max="100000"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="w-full bg-dark-900 border border-dark-600 rounded-2xl px-4 py-3 text-base font-mono text-white focus:outline-none focus:border-trade-gold transition-colors"
              placeholder="Enter amount e.g. 2500"
            />
            <span className="absolute right-4 top-3.5 text-sm font-bold text-trade-gold">VST</span>
          </div>

          <input
            type="text"
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
            className="w-full bg-dark-900/60 border border-dark-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-dark-500"
            placeholder="Top up note / reason (optional)"
          />
        </div>

        {/* Feedback Message */}
        {feedback && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold mb-4 flex items-center space-x-2 ${
              feedback.type === 'success'
                ? 'bg-trade-green/15 text-trade-green border border-trade-green/30'
                : 'bg-trade-red/15 text-trade-red border border-trade-red/30'
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
            onClick={onClose}
            className="flex-1 py-3 bg-dark-700 hover:bg-dark-600 text-slate-300 font-bold text-xs rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleTopUp()}
            className="flex-[2] py-3 bg-gradient-to-r from-trade-gold to-amber-500 hover:from-amber-500 hover:to-amber-600 text-dark-900 font-extrabold text-xs rounded-xl transition-all shadow-lg shadow-trade-gold/20 flex items-center justify-center space-x-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Confirm VST Top Up</span>
          </button>
        </div>
      </div>
    </div>
  );
};
