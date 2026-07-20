import React, { useEffect, useRef, useState } from 'react';
import { useVST } from '../context/VSTContext';
import { Maximize2, Minimize2, RefreshCw } from 'lucide-react';

declare global {
  interface Window {
    TradingView: any;
  }
}

export const TradingViewChart: React.FC = () => {
  const { selectedSymbol } = useVST();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    let widgetInstance: any = null;

    const createWidget = () => {
      if (window.TradingView && containerRef.current) {
        containerRef.current.innerHTML = ''; // Clear previous widget DOM

        widgetInstance = new window.TradingView.widget({
          autosize: true,
          symbol: selectedSymbol.tvSymbol,
          interval: '60',
          timezone: 'Etc/UTC',
          theme: 'dark',
          style: '1',
          locale: 'en',
          toolbar_bg: '#121722',
          enable_publishing: false,
          hide_side_toolbar: false,
          allow_symbol_change: false,
          container_id: 'tradingview_chart_container',
          gridColor: 'rgba(255, 255, 255, 0.04)',
          studies: [
            'RSI@tv-basicstudies',
            'MASimple@tv-basicstudies',
          ],
          disabled_features: ['header_symbol_search'],
          enabled_features: ['study_templates', 'use_localstorage_for_settings'],
        });

        setTimeout(() => setIsLoading(false), 800);
      }
    };

    // If script is already loaded
    if (window.TradingView) {
      createWidget();
    } else {
      // Retry loading if script tag is still resolving
      const interval = setInterval(() => {
        if (window.TradingView) {
          clearInterval(interval);
          createWidget();
        }
      }, 200);

      return () => clearInterval(interval);
    }
  }, [selectedSymbol.tvSymbol]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div
      className={`relative bg-dark-800 border border-dark-600/80 rounded-2xl overflow-hidden flex flex-col transition-all duration-300 ${
        isFullscreen ? 'fixed inset-2 z-50 rounded-none' : 'h-[620px] w-full'
      }`}
    >
      {/* Chart Control Bar */}
      <div className="bg-dark-900/80 px-4 py-2 border-b border-dark-600/60 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-trade-green animate-pulse" />
            <span className="text-xs font-bold text-slate-200 tracking-wide">
              {selectedSymbol.name}
            </span>
          </div>
          <span className="text-[11px] font-mono font-medium text-slate-400 bg-dark-700 px-2 py-0.5 rounded border border-dark-600">
            {selectedSymbol.tvSymbol}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {isLoading && (
            <div className="flex items-center space-x-1.5 text-xs text-trade-accent font-medium mr-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Loading Feed...</span>
            </div>
          )}

          <button
            onClick={toggleFullscreen}
            className="p-1.5 text-slate-400 hover:text-white bg-dark-700/80 hover:bg-dark-700 border border-dark-600 rounded-lg transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Chart'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* TradingView Widget Container */}
      <div className="relative flex-1 w-full bg-dark-900">
        <div
          id="tradingview_chart_container"
          ref={containerRef}
          className="w-full h-full"
        />
      </div>
    </div>
  );
};
