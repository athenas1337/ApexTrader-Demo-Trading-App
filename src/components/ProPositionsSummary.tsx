import React from 'react';
import { useAtta } from '../context/AttaContext';
import { formatBaseCurrency, formatPercentage, formatPrice } from '../utils/formatters';
import { Layers, XCircle, TrendingUp, TrendingDown, Zap } from 'lucide-react';

export const ProPositionsSummary: React.FC = () => {
  const { positions, selectedSymbol, baseCurrency, closePosition } = useAtta();

  // Filter positions matching selected symbol first, then all other active positions
  const currentSymbolPositions = positions.filter((p) => p.symbol === selectedSymbol.symbol);
  const otherPositions = positions.filter((p) => p.symbol !== selectedSymbol.symbol);
  const allActivePositions = [...currentSymbolPositions, ...otherPositions];

  if (allActivePositions.length === 0) {
    return (
      <div className="bg-dark-800 border border-dark-600/80 rounded-2xl p-4 shadow-xl text-center font-mono text-xs text-slate-400">
        <div className="flex items-center justify-center space-x-2 text-slate-300 font-sans font-bold mb-1">
          <Layers className="w-4 h-4 text-trade-accent" />
          <span>Pro Dashboard Direct Execution Terminal</span>
        </div>
        <span className="text-[11px] font-sans">No active open positions for {selectedSymbol.name}.</span>
      </div>
    );
  }

  return (
    <div className="bg-dark-800 border border-dark-600/80 rounded-2xl p-4 shadow-xl font-mono text-xs space-y-3">
      <div className="flex items-center justify-between border-b border-dark-700 pb-2.5">
        <div className="flex items-center space-x-2 font-sans font-bold text-white text-xs">
          <Zap className="w-4 h-4 text-trade-gold animate-pulse" />
          <span>Open Positions Summary ({allActivePositions.length})</span>
        </div>
        <span className="text-[10px] font-sans text-slate-400 uppercase">Instant Direct Close</span>
      </div>

      <div className="divide-y divide-dark-700/60 max-h-60 overflow-y-auto pr-1">
        {allActivePositions.map((pos) => {
          const isCurrentAsset = pos.symbol === selectedSymbol.symbol;
          return (
            <div
              key={pos.id}
              className={`py-2 px-1.5 flex items-center justify-between rounded-xl transition-colors ${
                isCurrentAsset ? 'bg-trade-accent/10 border-l-2 border-trade-accent' : 'hover:bg-dark-700/30'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-white font-sans text-xs">{pos.symbolInfo.name}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded font-extrabold uppercase text-[9px] ${
                        pos.side === 'buy'
                          ? 'bg-trade-green/20 text-trade-green border border-trade-green/40'
                          : 'bg-trade-red/20 text-trade-red border border-trade-red/40'
                      }`}
                    >
                      {pos.side} {pos.leverage}x
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                    Entry: ${formatPrice(pos.entryPrice, pos.symbolInfo.precision)} | Now: ${formatPrice(pos.currentPrice, pos.symbolInfo.precision)}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <span
                    className={`font-bold text-xs block ${
                      pos.floatingPnlInBaseCurrency >= 0 ? 'text-trade-green' : 'text-trade-red'
                    }`}
                  >
                    {pos.floatingPnlInBaseCurrency >= 0 ? '+' : ''}
                    {formatBaseCurrency(pos.floatingPnlInBaseCurrency, baseCurrency)}
                  </span>
                  <span
                    className={`text-[9px] block ${
                      pos.floatingPnlPercentage >= 0 ? 'text-trade-green' : 'text-trade-red'
                    }`}
                  >
                    {formatPercentage(pos.floatingPnlPercentage)}
                  </span>
                </div>

                <button
                  onClick={() => closePosition(pos.id, 'manual')}
                  className="px-2.5 py-1 bg-trade-red hover:bg-rose-600 text-white font-sans font-extrabold rounded-lg text-xs transition-all shadow flex items-center space-x-1"
                  title="Direct Close Position"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Close</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
