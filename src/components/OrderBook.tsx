import React, { useMemo } from 'react';
import { useAtta } from '../context/AttaContext';
import { formatPrice } from '../utils/formatters';
import { Layers } from 'lucide-react';

interface OrderBookProps {
  compact?: boolean;
}

export const OrderBook: React.FC<OrderBookProps> = ({ compact = false }) => {
  const { selectedSymbol, livePrices } = useAtta();

  const currentPrice = livePrices[selectedSymbol.symbol] || selectedSymbol.basePrice;
  const spread = selectedSymbol.spreadPips ? (selectedSymbol.spreadPips * (selectedSymbol.pipSize || 0.0001)) : (currentPrice * 0.0001);

  // Generate dynamic 8 ask levels and 8 bid levels centered around current price
  const { asks, bids, maxVolume } = useMemo(() => {
    const askLevels: { price: number; amount: number; total: number }[] = [];
    const bidLevels: { price: number; amount: number; total: number }[] = [];

    let accumAsk = 0;
    let accumBid = 0;

    const rowCount = compact ? 5 : 8;

    for (let i = rowCount; i >= 1; i--) {
      const step = currentPrice * (0.0002 * i);
      const price = currentPrice + step;
      const amount = Math.random() * 2.5 + 0.1;
      accumAsk += amount;
      askLevels.push({ price, amount, total: accumAsk });
    }

    for (let i = 1; i <= rowCount; i++) {
      const step = currentPrice * (0.0002 * i);
      const price = Math.max(0.00001, currentPrice - step);
      const amount = Math.random() * 2.5 + 0.1;
      accumBid += amount;
      bidLevels.push({ price, amount, total: accumBid });
    }

    const maxVol = Math.max(accumAsk, accumBid);

    return { asks: askLevels, bids: bidLevels, maxVolume: maxVol };
  }, [currentPrice, compact]);

  return (
    <div className="bg-dark-800 border border-dark-600/80 rounded-2xl p-3 flex flex-col h-full space-y-2 select-none font-mono text-xs">
      <div className="flex items-center justify-between border-b border-dark-700 pb-2 text-[11px] font-sans font-bold text-slate-400 uppercase tracking-wider">
        <span className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-trade-accent" />
          Order Book Depth
        </span>
        <span className="text-[10px] text-slate-400">Spread: {spread.toFixed(selectedSymbol.precision)}</span>
      </div>

      <div className="flex justify-between text-[10px] text-slate-400 font-sans uppercase tracking-wider px-1">
        <span>Price (USD)</span>
        <span>Size</span>
        <span>Depth</span>
      </div>

      {/* Asks (Sell Wall - Red) */}
      <div className="space-y-0.5 divide-y divide-dark-900">
        {asks.map((ask, idx) => {
          const widthPct = Math.min(100, (ask.total / maxVolume) * 100);
          return (
            <div key={`ask_${idx}`} className="relative flex justify-between items-center py-0.5 px-1 rounded overflow-hidden hover:bg-dark-700/60">
              <div
                className="absolute right-0 top-0 bottom-0 bg-trade-red/15 transition-all pointer-events-none"
                style={{ width: `${widthPct}%` }}
              />
              <span className="text-trade-red font-bold font-mono z-10">
                ${formatPrice(ask.price, selectedSymbol.precision)}
              </span>
              <span className="text-slate-300 z-10">{ask.amount.toFixed(3)}</span>
              <span className="text-slate-400 text-[10px] z-10">{ask.total.toFixed(2)}</span>
            </div>
          );
        })}
      </div>

      {/* Current Mid Price Banner */}
      <div className="my-1 py-1.5 px-2 bg-dark-900 border border-dark-700 rounded-xl flex items-center justify-between font-extrabold text-sm text-white">
        <span className="text-trade-gold font-mono">${formatPrice(currentPrice, selectedSymbol.precision)}</span>
        <span className="text-[10px] font-sans text-slate-400 uppercase">Live Tick</span>
      </div>

      {/* Bids (Buy Wall - Green) */}
      <div className="space-y-0.5 divide-y divide-dark-900">
        {bids.map((bid, idx) => {
          const widthPct = Math.min(100, (bid.total / maxVolume) * 100);
          return (
            <div key={`bid_${idx}`} className="relative flex justify-between items-center py-0.5 px-1 rounded overflow-hidden hover:bg-dark-700/60">
              <div
                className="absolute right-0 top-0 bottom-0 bg-trade-green/15 transition-all pointer-events-none"
                style={{ width: `${widthPct}%` }}
              />
              <span className="text-trade-green font-bold font-mono z-10">
                ${formatPrice(bid.price, selectedSymbol.precision)}
              </span>
              <span className="text-slate-300 z-10">{bid.amount.toFixed(3)}</span>
              <span className="text-slate-400 text-[10px] z-10">{bid.total.toFixed(2)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
