import React from 'react';
import { useAtta } from '../context/AttaContext';
import { formatPercentage } from '../utils/formatters';
import { ShieldAlert, AlertTriangle } from 'lucide-react';

export const MarginCallBanner: React.FC = () => {
  const { marginLevelPercentage, isMarginCallWarning, usedMarginInBaseCurrency } = useAtta();

  if (!isMarginCallWarning || usedMarginInBaseCurrency <= 0) return null;

  return (
    <div className="bg-gradient-to-r from-rose-950 via-red-900 to-rose-950 border-y border-rose-500/80 px-4 py-2.5 shadow-2xl animate-pulse">
      <div className="max-w-[1920px] mx-auto flex flex-wrap items-center justify-between gap-3 text-xs text-white">
        <div className="flex items-center space-x-3">
          <div className="p-1 bg-rose-500 rounded-lg text-white">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold tracking-wide uppercase text-rose-200">
              ⚠️ MARGIN CALL WARNING: Margin Level at {formatPercentage(marginLevelPercentage)}
            </span>
            <span className="block text-[11px] text-rose-300">
              Account Equity has fallen below Required Margin. Close un-profitable positions immediately or top up balance. Auto-liquidation triggers at 50%.
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2 font-mono font-bold text-rose-200 bg-rose-900/60 px-3 py-1 rounded-xl border border-rose-500/40">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span>LIQUIDATION THRESHOLD: 50%</span>
        </div>
      </div>
    </div>
  );
};
