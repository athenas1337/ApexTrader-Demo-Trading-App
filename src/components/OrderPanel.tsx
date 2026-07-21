import React, { useState, useEffect } from 'react';
import { useAtta } from '../context/AttaContext';
import { OrderSide, OrderType, ForexLotType } from '../types/trading';
import { formatBaseCurrency, formatPrice } from '../utils/formatters';
import { convertToUSD, convertFromUSD } from '../services/fxRates';
import { ArrowUpRight, ArrowDownRight, Zap, AlertCircle, ShieldAlert, Target, Globe } from 'lucide-react';

export const OrderPanel: React.FC = () => {
  const { selectedSymbol, livePrices, wallet, baseCurrency, openPosition } = useAtta();

  const [side, setSide] = useState<OrderSide>('buy');
  const [orderType, setOrderType] = useState<OrderType>('market');
  const [leverage, setLeverage] = useState<number>(selectedSymbol.type === 'forex' ? 100 : 10);
  const [marginInput, setMarginInput] = useState<string>('500');
  const [limitPriceInput, setLimitPriceInput] = useState<string>('');
  
  // Forex Lot mechanics
  const [forexLotType, setForexLotType] = useState<ForexLotType>('standard');
  const [forexLotsInput, setForexLotsInput] = useState<string>('0.10');

  const [tpInput, setTpInput] = useState<string>('');
  const [slInput, setSlInput] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const currentPrice = livePrices[selectedSymbol.symbol] || selectedSymbol.basePrice;

  useEffect(() => {
    if (orderType === 'limit' && !limitPriceInput) {
      setLimitPriceInput((currentPrice * (side === 'buy' ? 0.98 : 1.02)).toFixed(selectedSymbol.precision));
    }
  }, [side, orderType, currentPrice, selectedSymbol.precision]);

  const isForex = selectedSymbol.type === 'forex';
  const numericMargin = parseFloat(marginInput) || 0;
  const targetPrice = orderType === 'limit' ? parseFloat(limitPriceInput) || currentPrice : currentPrice;

  // Forex Lot Units Calculation
  const forexMultiplier = forexLotType === 'standard' ? 100000 : forexLotType === 'mini' ? 10000 : 1000;
  const numForexLots = parseFloat(forexLotsInput) || 0.1;
  const totalUnits = isForex ? numForexLots * forexMultiplier : 0;

  // Calculate Notional and Margin
  let calculatedMarginBase = numericMargin;
  let notionalUSD = 0;

  if (isForex) {
    notionalUSD = (totalUnits * targetPrice);
    const requiredMarginUSD = notionalUSD / leverage;
    calculatedMarginBase = convertFromUSD(requiredMarginUSD, baseCurrency);
  } else {
    const marginUSD = convertToUSD(numericMargin, baseCurrency);
    notionalUSD = marginUSD * leverage;
  }

  const coinQuantity = !isForex && targetPrice > 0 ? notionalUSD / targetPrice : totalUnits;

  // Liquidation Price calculation
  const maintenanceMargin = 0.005;
  const estLiquidationPrice =
    side === 'buy'
      ? targetPrice * (1 - 1 / leverage + maintenanceMargin)
      : targetPrice * (1 + 1 / leverage - maintenanceMargin);

  const handleQuickMarginPercent = (percent: number) => {
    const amount = (wallet.balanceInBaseCurrency * (percent / 100)).toFixed(2);
    setMarginInput(amount);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    const marginToUse = isForex ? calculatedMarginBase : parseFloat(marginInput);

    if (isNaN(marginToUse) || marginToUse <= 0) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid margin / lot amount.' });
      return;
    }

    if (marginToUse > wallet.balanceInBaseCurrency) {
      setStatusMessage({ type: 'error', text: `Insufficient ${baseCurrency} balance for this trade margin.` });
      return;
    }

    const tp = tpInput ? parseFloat(tpInput) : undefined;
    const sl = slInput ? parseFloat(slInput) : undefined;

    const result = openPosition({
      symbolInfo: selectedSymbol,
      side,
      orderType,
      marginInBaseCurrency: marginToUse,
      leverage,
      entryPrice: currentPrice,
      targetPrice: orderType === 'limit' ? targetPrice : undefined,
      forexLotType: isForex ? forexLotType : undefined,
      forexLots: isForex ? numForexLots : undefined,
      takeProfit: tp,
      stopLoss: sl,
    });

    if (result.success) {
      setStatusMessage({ type: 'success', text: result.message });
      setTimeout(() => setStatusMessage(null), 3500);
    } else {
      setStatusMessage({ type: 'error', text: result.message });
    }
  };

  const isBuy = side === 'buy';

  return (
    <div className="bg-dark-800 border border-dark-600/80 rounded-2xl p-4 flex flex-col h-full space-y-4">
      {/* Order Side Switcher */}
      <div className="grid grid-cols-2 gap-2 bg-dark-900/80 p-1 rounded-xl border border-dark-600/60">
        <button
          type="button"
          onClick={() => setSide('buy')}
          className={`flex items-center justify-center space-x-1.5 py-2.5 rounded-lg text-xs font-bold transition-all ${
            isBuy ? 'bg-trade-green text-white shadow-lg' : 'text-slate-400 hover:text-white'
          }`}
        >
          <ArrowUpRight className="w-4 h-4 stroke-[3]" />
          <span>BUY / LONG</span>
        </button>

        <button
          type="button"
          onClick={() => setSide('sell')}
          className={`flex items-center justify-center space-x-1.5 py-2.5 rounded-lg text-xs font-bold transition-all ${
            !isBuy ? 'bg-trade-red text-white shadow-lg' : 'text-slate-400 hover:text-white'
          }`}
        >
          <ArrowDownRight className="w-4 h-4 stroke-[3]" />
          <span>SELL / SHORT</span>
        </button>
      </div>

      {/* Order Type (Market vs Limit) */}
      <div className="flex items-center justify-between bg-dark-900/40 p-1 rounded-xl border border-dark-700 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setOrderType('market')}
          className={`flex-1 py-1.5 rounded-lg transition-all ${orderType === 'market' ? 'bg-dark-700 text-white' : 'text-slate-400'}`}
        >
          Market Order
        </button>
        <button
          type="button"
          onClick={() => setOrderType('limit')}
          className={`flex-1 py-1.5 rounded-lg transition-all ${orderType === 'limit' ? 'bg-dark-700 text-white' : 'text-slate-400'}`}
        >
          Limit Order
        </button>
      </div>

      {/* Limit Price Input */}
      {orderType === 'limit' && (
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex justify-between">
            <span>Target Price</span>
            <span className="font-mono text-slate-300">${formatPrice(currentPrice, selectedSymbol.precision)}</span>
          </label>
          <div className="relative">
            <input
              type="number"
              step="any"
              value={limitPriceInput}
              onChange={(e) => setLimitPriceInput(e.target.value)}
              className="w-full bg-dark-900 border border-dark-600 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-trade-accent"
            />
          </div>
        </div>
      )}

      {/* Leverage Selector */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-semibold">
          <span className="text-slate-300 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-trade-gold" />
            Leverage ({isForex ? 'Forex 1:100 to 1:500' : 'Crypto 1x to 100x'})
          </span>
          <span className="font-mono font-bold text-trade-gold text-sm bg-trade-gold/10 px-2 py-0.5 rounded border border-trade-gold/30">
            {isForex ? `1:${leverage}` : `${leverage}x`}
          </span>
        </div>

        <input
          type="range"
          min="1"
          max={isForex ? 500 : 100}
          step={isForex ? 50 : 1}
          value={leverage}
          onChange={(e) => setLeverage(parseInt(e.target.value))}
          className="w-full h-1.5 bg-dark-900 rounded-lg appearance-none cursor-pointer accent-trade-gold"
        />

        <div className="flex justify-between gap-1">
          {(isForex ? [100, 200, 300, 400, 500] : [1, 5, 10, 25, 50, 100]).map((lev) => (
            <button
              key={lev}
              type="button"
              onClick={() => setLeverage(lev)}
              className={`flex-1 py-1 rounded text-[10px] font-bold font-mono transition-all ${
                leverage === lev ? 'bg-trade-gold text-dark-900 shadow' : 'bg-dark-900 text-slate-400 hover:text-white'
              }`}
            >
              {isForex ? `1:${lev}` : `${lev}x`}
            </button>
          ))}
        </div>
      </div>

      {/* FOREX HUB SPECIFIC LOT MECHANICS */}
      {isForex ? (
        <div className="space-y-2 bg-dark-900/60 p-3 rounded-xl border border-dark-700">
          <div className="flex justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              Forex Lot Contract Size
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setForexLotType('standard')}
              className={`py-1.5 rounded-lg border transition-all ${
                forexLotType === 'standard' ? 'bg-blue-500 text-white border-blue-400' : 'bg-dark-900 text-slate-400 border-dark-700'
              }`}
            >
              Standard (100k)
            </button>
            <button
              type="button"
              onClick={() => setForexLotType('mini')}
              className={`py-1.5 rounded-lg border transition-all ${
                forexLotType === 'mini' ? 'bg-blue-500 text-white border-blue-400' : 'bg-dark-900 text-slate-400 border-dark-700'
              }`}
            >
              Mini (10k)
            </button>
            <button
              type="button"
              onClick={() => setForexLotType('micro')}
              className={`py-1.5 rounded-lg border transition-all ${
                forexLotType === 'micro' ? 'bg-blue-500 text-white border-blue-400' : 'bg-dark-900 text-slate-400 border-dark-700'
              }`}
            >
              Micro (1k)
            </button>
          </div>

          <div className="space-y-1 pt-1">
            <label className="text-[11px] text-slate-400 font-semibold block">Number of Lots</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={forexLotsInput}
              onChange={(e) => setForexLotsInput(e.target.value)}
              className="w-full bg-dark-900 border border-dark-600 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-blue-400"
              placeholder="0.10"
            />
          </div>
        </div>
      ) : (
        /* CRYPTO ARENA MARGIN INPUT */
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <label className="font-semibold text-slate-300">Margin ({baseCurrency})</label>
            <span className="text-[11px] text-slate-400">
              Avail: <span className="font-mono text-white font-semibold">{formatBaseCurrency(wallet.balanceInBaseCurrency, baseCurrency)}</span>
            </span>
          </div>

          <div className="relative">
            <input
              type="number"
              min="1"
              step="any"
              value={marginInput}
              onChange={(e) => setMarginInput(e.target.value)}
              className="w-full bg-dark-900 border border-dark-600 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-trade-accent"
              placeholder="500"
            />
            <span className="absolute right-3 top-2.5 text-xs text-trade-gold font-bold">{baseCurrency}</span>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {[25, 50, 75, 100].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => handleQuickMarginPercent(pct)}
                className="bg-dark-900 hover:bg-dark-700 text-slate-400 hover:text-white text-[10px] font-bold py-1 rounded-lg border border-dark-700 transition-colors"
              >
                {pct}%
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Take Profit & Stop Loss inputs */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <div>
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1">
            <Target className="w-3 h-3 text-trade-green" /> Take Profit
          </label>
          <input
            type="number"
            step="any"
            value={tpInput}
            onChange={(e) => setTpInput(e.target.value)}
            className="w-full bg-dark-900 border border-dark-600 rounded-xl px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-trade-green"
            placeholder="TP Price"
          />
        </div>
        <div>
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1">
            <ShieldAlert className="w-3 h-3 text-trade-red" /> Stop Loss
          </label>
          <input
            type="number"
            step="any"
            value={slInput}
            onChange={(e) => setSlInput(e.target.value)}
            className="w-full bg-dark-900 border border-dark-600 rounded-xl px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-trade-red"
            placeholder="SL Price"
          />
        </div>
      </div>

      {/* Execution Metrics Summary */}
      <div className="bg-dark-900/70 border border-dark-700 rounded-xl p-3 text-xs space-y-2 font-mono">
        <div className="flex justify-between text-slate-400">
          <span>Required Margin ({baseCurrency}):</span>
          <span className="font-bold text-white">
            {formatBaseCurrency(isForex ? calculatedMarginBase : numericMargin, baseCurrency)}
          </span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>Est. Contract/Coin Size:</span>
          <span className="font-bold text-slate-200">
            {coinQuantity.toFixed(isForex ? 0 : selectedSymbol.precision + 2)} {isForex ? 'units' : selectedSymbol.symbol.replace('USDT', '')}
          </span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>Est. Liquidation Price:</span>
          <span className="font-bold text-amber-400">${formatPrice(estLiquidationPrice, selectedSymbol.precision)}</span>
        </div>
      </div>

      {/* Feedback Message */}
      {statusMessage && (
        <div
          className={`p-3 rounded-xl text-xs font-semibold flex items-center space-x-2 ${
            statusMessage.type === 'success' ? 'bg-trade-green/15 text-trade-green border border-trade-green/30' : 'bg-trade-red/15 text-trade-red border border-trade-red/30'
          }`}
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="button"
        onClick={handleSubmit}
        className={`w-full py-3 rounded-xl font-bold text-sm tracking-wider uppercase transition-all shadow-xl ${
          isBuy
            ? 'bg-gradient-to-r from-trade-green to-emerald-500 hover:from-trade-green-hover hover:to-emerald-600 text-white shadow-trade-green/20'
            : 'bg-gradient-to-r from-trade-red to-rose-600 hover:from-trade-red-hover hover:to-rose-700 text-white shadow-trade-red/20'
        }`}
      >
        Execute {side.toUpperCase()} {isForex ? `1:${leverage}` : `${leverage}X`} ({orderType.toUpperCase()})
      </button>
    </div>
  );
};
