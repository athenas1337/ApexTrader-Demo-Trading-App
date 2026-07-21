import React, { useState } from 'react';
import { useAtta } from '../context/AttaContext';
import { formatPrice } from '../utils/formatters';
import { Bell, X, Trash2, PlusCircle, CheckCircle2 } from 'lucide-react';

interface PriceAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PriceAlertsModal: React.FC<PriceAlertsModalProps> = ({ isOpen, onClose }) => {
  const { selectedSymbol, priceAlerts, addPriceAlert, removePriceAlert, livePrices } = useAtta();

  const currentPrice = livePrices[selectedSymbol.symbol] || selectedSymbol.basePrice;

  const [targetInput, setTargetInput] = useState<string>(currentPrice.toString());
  const [condition, setCondition] = useState<'above' | 'below'>('above');

  if (!isOpen) return null;

  const handleAddAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(targetInput);
    if (isNaN(price) || price <= 0) return;

    addPriceAlert(selectedSymbol.symbol, price, condition);

    // Request notification permission if available
    try {
      if ('Notification' in window && Notification.permission !== 'granted') {
        Notification.requestPermission();
      }
    } catch (err) {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-dark-800 border border-dark-600 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-dark-700 pb-3 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">Price Alerts Manager</h3>
              <p className="text-xs text-slate-400">Local trigger notifications</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white bg-dark-700 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form to create new alert */}
        <form onSubmit={handleAddAlert} className="space-y-3 bg-dark-900/80 p-4 rounded-2xl border border-dark-700 mb-4 text-xs font-mono">
          <div className="flex justify-between items-center text-slate-300 font-sans font-bold">
            <span>Asset: {selectedSymbol.name}</span>
            <span className="text-trade-gold font-mono">${formatPrice(currentPrice, selectedSymbol.precision)}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 font-sans font-semibold">
            <button
              type="button"
              onClick={() => setCondition('above')}
              className={`py-2 rounded-xl transition-all ${condition === 'above' ? 'bg-trade-green text-dark-900' : 'bg-dark-700 text-slate-400'}`}
            >
              Price Rises Above (≥)
            </button>
            <button
              type="button"
              onClick={() => setCondition('below')}
              className={`py-2 rounded-xl transition-all ${condition === 'below' ? 'bg-trade-red text-white' : 'bg-dark-700 text-slate-400'}`}
            >
              Price Drops Below (≤)
            </button>
          </div>

          <div>
            <label className="text-slate-400 block mb-1 font-sans font-semibold">Target Price Threshold</label>
            <input
              type="number"
              step="any"
              value={targetInput}
              onChange={(e) => setTargetInput(e.target.value)}
              className="w-full bg-dark-800 border border-dark-600 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-dark-900 font-extrabold rounded-xl transition-all flex items-center justify-center space-x-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Price Alert</span>
          </button>
        </form>

        {/* Existing Alerts List */}
        <div className="space-y-2 max-h-56 overflow-y-auto font-mono text-xs">
          <span className="text-[11px] font-sans font-bold text-slate-400 uppercase tracking-wider block">Active Alerts</span>
          {priceAlerts.length === 0 ? (
            <p className="text-center py-6 text-slate-500 font-sans">No active price alerts set.</p>
          ) : (
            priceAlerts.map((alert) => (
              <div key={alert.id} className="bg-dark-900 p-3 rounded-xl border border-dark-700 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">{alert.symbol}</span>
                  <span className="text-[10px] text-slate-400">
                    {alert.condition.toUpperCase()} ${formatPrice(alert.targetPrice, 2)}
                  </span>
                </div>
                <button
                  onClick={() => removePriceAlert(alert.id)}
                  className="p-1.5 text-slate-400 hover:text-trade-red transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
