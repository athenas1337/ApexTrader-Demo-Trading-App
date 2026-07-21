import React, { useEffect, useRef, useState } from 'react';
import { useAtta } from '../context/AttaContext';
import { ChartStyle, TimeFrame } from '../types/trading';
import { formatBaseCurrency, formatPrice } from '../utils/formatters';
import { Maximize2, Minimize2, RefreshCw, Eye, EyeOff, Layers } from 'lucide-react';

declare global {
  interface Window {
    TradingView: any;
  }
}

export const TradingViewChart: React.FC = () => {
  const { selectedSymbol, positions, livePrices, baseCurrency } = useAtta();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showExecutionOverlay, setShowExecutionOverlay] = useState(true);

  // Timeframe and style controls
  const [timeframe, setTimeframe] = useState<TimeFrame>('1h');
  const [chartStyle, setChartStyle] = useState<ChartStyle>('candles');

  const currentPrice = livePrices[selectedSymbol.symbol] || selectedSymbol.basePrice;
  const activePositionsForSymbol = positions.filter((p) => p.symbol === selectedSymbol.symbol);

  // Map timeframe to TradingView interval string
  const getTimeframeInterval = (tf: TimeFrame): string => {
    switch (tf) {
      case '1m': return '1';
      case '5m': return '5';
      case '15m': return '15';
      case '1h': return '60';
      case '4h': return '240';
      case '1D': return 'D';
      case '1W': return 'W';
      case '1M': return 'M';
      default: return '60';
    }
  };

  // Map chart style to TradingView style integer
  const getTradingViewStyle = (style: ChartStyle): string => {
    switch (style) {
      case 'candles': return '1';
      case 'heikin_ashi': return '8';
      case 'line': return '2';
      default: return '1';
    }
  };

  useEffect(() => {
    setIsLoading(true);
    let widgetInstance: any = null;

    const createWidget = () => {
      if (window.TradingView && containerRef.current) {
        containerRef.current.innerHTML = '';

        widgetInstance = new window.TradingView.widget({
          autosize: true,
          symbol: selectedSymbol.tvSymbol,
          interval: getTimeframeInterval(timeframe),
          timezone: 'Etc/UTC',
          theme: 'dark',
          style: getTradingViewStyle(chartStyle),
          locale: 'en',
          toolbar_bg: '#121722',
          enable_publishing: false,
          hide_side_toolbar: false,
          allow_symbol_change: false,
          container_id: 'tradingview_chart_container',
          gridColor: 'rgba(255, 255, 255, 0.04)',
          studies: ['RSI@tv-basicstudies', 'MASimple@tv-basicstudies'],
          disabled_features: ['header_symbol_search'],
          enabled_features: ['study_templates', 'use_localstorage_for_settings'],
        });

        setTimeout(() => setIsLoading(false), 700);
      }
    };

    if (window.TradingView) {
      createWidget();
    } else {
      const interval = setInterval(() => {
        if (window.TradingView) {
          clearInterval(interval);
          createWidget();
        }
      }, 200);
      return () => clearInterval(interval);
    }
  }, [selectedSymbol.tvSymbol, timeframe, chartStyle]);

  return (
    <div
      className={`relative bg-dark-800 border border-dark-600/80 rounded-2xl overflow-hidden flex flex-col transition-all duration-300 ${
        isFullscreen ? 'fixed inset-2 z-50 rounded-none' : 'h-[620px] w-full'
      }`}
    >
      {/* Chart Control Bar */}
      <div className="bg-dark-900/90 px-4 py-2 border-b border-dark-600/60 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Asset info */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className={`w-2.5 h-2.5 rounded-full ${selectedSymbol.type === 'crypto' ? 'bg-amber-400' : 'bg-blue-400'} animate-pulse`} />
            <span className="text-xs font-bold text-white tracking-wide">{selectedSymbol.name}</span>
          </div>
          <span className="text-[11px] font-mono font-medium text-slate-300 bg-dark-700 px-2 py-0.5 rounded border border-dark-600">
            ${formatPrice(currentPrice, selectedSymbol.precision)}
          </span>
        </div>

        {/* Center: Timeframe & Chart Type quick toggles */}
        <div className="flex items-center space-x-2">
          {/* Timeframes */}
          <div className="flex items-center bg-dark-900 p-0.5 rounded-lg border border-dark-700">
            {(['1m', '5m', '15m', '1h', '4h', '1D', '1W', '1M'] as TimeFrame[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                  timeframe === tf ? 'bg-trade-accent text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Chart Style Switcher */}
          <div className="flex items-center bg-dark-900 p-0.5 rounded-lg border border-dark-700">
            <button
              onClick={() => setChartStyle('candles')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                chartStyle === 'candles' ? 'bg-dark-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Candles
            </button>
            <button
              onClick={() => setChartStyle('heikin_ashi')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                chartStyle === 'heikin_ashi' ? 'bg-dark-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Heikin Ashi
            </button>
            <button
              onClick={() => setChartStyle('line')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                chartStyle === 'line' ? 'bg-dark-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Line
            </button>
          </div>
        </div>

        {/* Right: Overlay toggle & Fullscreen */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowExecutionOverlay(!showExecutionOverlay)}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              showExecutionOverlay ? 'bg-trade-green/20 text-trade-green border border-trade-green/30' : 'bg-dark-700 text-slate-400'
            }`}
            title="Toggle Live Chart Execution Overlay Lines"
          >
            {showExecutionOverlay ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Execution Overlay</span>
          </button>

          {isLoading && (
            <div className="flex items-center space-x-1.5 text-xs text-trade-accent font-medium">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            </div>
          )}

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-slate-400 hover:text-white bg-dark-700 border border-dark-600 rounded-lg"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="relative flex-1 w-full bg-dark-900">
        <div id="tradingview_chart_container" ref={containerRef} className="w-full h-full" />

        {/* Interactive Execution Lines Overlay (HTML5 SVG Overlay) */}
        {showExecutionOverlay && activePositionsForSymbol.length > 0 && (
          <div className="absolute top-4 right-4 z-30 pointer-events-none max-w-sm space-y-2">
            {activePositionsForSymbol.map((pos) => {
              const isProfit = pos.floatingPnlInBaseCurrency >= 0;
              const isBuy = pos.side === 'buy';
              return (
                <div
                  key={pos.id}
                  className={`pointer-events-auto p-3 rounded-xl backdrop-blur-md border shadow-2xl transition-all ${
                    isBuy ? 'bg-emerald-950/80 border-emerald-500/50' : 'bg-rose-950/80 border-rose-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-xs font-bold mb-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${isBuy ? 'bg-trade-green text-dark-900' : 'bg-trade-red text-white'}`}>
                      {pos.side.toUpperCase()} POSITION
                    </span>
                    <span className={isProfit ? 'text-trade-green' : 'text-trade-red'}>
                      {isProfit ? '+' : ''}{formatBaseCurrency(pos.floatingPnlInBaseCurrency, baseCurrency)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-300 mt-2 border-t border-white/10 pt-1.5">
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase">Entry Price</span>
                      <span className="font-bold text-white">${formatPrice(pos.entryPrice, pos.symbolInfo.precision)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase">Mark Price</span>
                      <span className="font-bold text-white">${formatPrice(currentPrice, pos.symbolInfo.precision)}</span>
                    </div>
                  </div>

                  {/* TP & SL line targets */}
                  {(pos.takeProfit || pos.stopLoss) && (
                    <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1.5 pt-1 border-t border-white/5">
                      {pos.takeProfit && <span className="text-trade-green">TP: ${formatPrice(pos.takeProfit, pos.symbolInfo.precision)}</span>}
                      {pos.stopLoss && <span className="text-trade-red">SL: ${formatPrice(pos.stopLoss, pos.symbolInfo.precision)}</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
