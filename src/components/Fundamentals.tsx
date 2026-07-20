import React, { useEffect, useState } from 'react';
import { useVST } from '../context/VSTContext';
import { CryptoFundamental } from '../types/trading';
import { fetchCryptoFundamental } from '../services/cryptoApi';
import { SUPPORTED_SYMBOLS } from '../services/symbols';
import { formatCurrency, formatPrice, formatPercentage, formatCompactNumber } from '../utils/formatters';
import {
  PieChart,
  TrendingUp,
  TrendingDown,
  Layers,
  Award,
  Activity,
  Flame,
  Globe,
  Info,
  RefreshCw,
  CheckCircle,
} from 'lucide-react';

export const Fundamentals: React.FC = () => {
  const { selectedSymbol } = useVST();

  const cryptoSymbols = SUPPORTED_SYMBOLS.filter((s) => s.type === 'crypto');
  const [activeSymbol, setActiveSymbol] = useState(
    selectedSymbol.type === 'crypto' ? selectedSymbol.symbol : cryptoSymbols[0].symbol
  );

  const [fundamental, setFundamental] = useState<CryptoFundamental | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchCryptoFundamental(activeSymbol).then((data) => {
      if (isMounted) {
        setFundamental(data);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [activeSymbol]);

  const is24hPositive = fundamental ? fundamental.price_change_percentage_24h >= 0 : true;

  return (
    <div className="space-y-6 max-w-[1920px] mx-auto pb-12">
      {/* Asset Selector Chips */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {cryptoSymbols.map((item) => {
          const isActive = item.symbol === activeSymbol;
          return (
            <button
              key={item.symbol}
              onClick={() => setActiveSymbol(item.symbol)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-gradient-to-r from-trade-accent to-blue-600 text-white shadow-lg shadow-trade-accent/30 border border-blue-400/30'
                  : 'bg-dark-800 text-slate-400 hover:text-white hover:bg-dark-700 border border-dark-600/80'
              }`}
            >
              <span>{item.name}</span>
            </button>
          );
        })}
      </div>

      {loading || !fundamental ? (
        <div className="bg-dark-800 border border-dark-600/80 rounded-2xl p-12 text-center">
          <RefreshCw className="w-8 h-8 text-trade-accent animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-300">Fetching CoinGecko Fundamental Analysis...</p>
        </div>
      ) : (
        <>
          {/* Main Asset Banner */}
          <div className="bg-dark-800 border border-dark-600/80 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-96 h-96 bg-trade-accent/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
            
            <div className="flex flex-wrap items-center justify-between gap-6 relative z-10">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-dark-900 border border-dark-600 p-2 flex items-center justify-center shadow-xl">
                  {fundamental.image ? (
                    <img src={fundamental.image} alt={fundamental.name} className="w-10 h-10 rounded-full" />
                  ) : (
                    <PieChart className="w-8 h-8 text-trade-gold" />
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-3">
                    <h2 className="text-2xl font-extrabold text-white tracking-tight">{fundamental.name}</h2>
                    <span className="uppercase text-xs font-bold px-2 py-0.5 bg-dark-700 text-trade-gold rounded border border-dark-600 font-mono">
                      {fundamental.symbol}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 bg-trade-accent/15 text-trade-accent rounded border border-trade-accent/30 font-sans">
                      Rank #{fundamental.market_cap_rank}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                    {fundamental.description}
                  </p>
                </div>
              </div>

              {/* Price & 24h Change */}
              <div className="text-right">
                <div className="text-2xl font-extrabold font-mono text-white">
                  ${formatPrice(fundamental.current_price, 2)}
                </div>
                <div className={`text-sm font-bold flex items-center justify-end space-x-1 mt-1 ${is24hPositive ? 'text-trade-green' : 'text-trade-red'}`}>
                  {is24hPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span>{formatPercentage(fundamental.price_change_percentage_24h)} (24h)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Key Fundamentals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Market Cap */}
            <div className="bg-dark-800 border border-dark-600/80 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <span>Market Cap</span>
                <Globe className="w-4 h-4 text-blue-400" />
              </div>
              <div className="mt-2">
                <div className="text-xl font-extrabold font-mono text-white">
                  ${formatCompactNumber(fundamental.market_cap)}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Exact: <span className="font-mono text-slate-300">${fundamental.market_cap.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* 24h Volume */}
            <div className="bg-dark-800 border border-dark-600/80 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <span>24h Volume</span>
                <Activity className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="mt-2">
                <div className="text-xl font-extrabold font-mono text-white">
                  ${formatCompactNumber(fundamental.total_volume)}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Trading activity past 24 hours</div>
              </div>
            </div>

            {/* Circulating Supply */}
            <div className="bg-dark-800 border border-dark-600/80 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <span>Circulating Supply</span>
                <Layers className="w-4 h-4 text-amber-400" />
              </div>
              <div className="mt-2">
                <div className="text-xl font-extrabold font-mono text-white">
                  {formatCompactNumber(fundamental.circulating_supply)} {fundamental.symbol.toUpperCase()}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Max: {fundamental.max_supply ? formatCompactNumber(fundamental.max_supply) : 'Infinite / Uncapped'}
                </div>
              </div>
            </div>

            {/* All-Time High */}
            <div className="bg-dark-800 border border-dark-600/80 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <span>All-Time High (ATH)</span>
                <Award className="w-4 h-4 text-purple-400" />
              </div>
              <div className="mt-2">
                <div className="text-xl font-extrabold font-mono text-white">
                  ${formatPrice(fundamental.ath, 2)}
                </div>
                <div className="text-[11px] text-rose-400 font-semibold mt-1">
                  {fundamental.ath_change_percentage ? `${fundamental.ath_change_percentage.toFixed(1)}% from ATH` : 'Near ATH'}
                </div>
              </div>
            </div>
          </div>

          {/* Tokenomics & Sentiment Detailed Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-dark-800 border border-dark-600/80 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Info className="w-4 h-4 text-trade-accent" />
                Tokenomics & Market Distribution
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
                <div className="bg-dark-900/60 p-3 rounded-xl border border-dark-700">
                  <span className="text-slate-400 block text-[11px] font-sans">Total Supply</span>
                  <span className="font-bold text-white text-sm mt-0.5 block">
                    {fundamental.total_supply ? fundamental.total_supply.toLocaleString() : 'N/A'}
                  </span>
                </div>

                <div className="bg-dark-900/60 p-3 rounded-xl border border-dark-700">
                  <span className="text-slate-400 block text-[11px] font-sans">Max Supply</span>
                  <span className="font-bold text-white text-sm mt-0.5 block">
                    {fundamental.max_supply ? fundamental.max_supply.toLocaleString() : 'Uncapped'}
                  </span>
                </div>

                <div className="bg-dark-900/60 p-3 rounded-xl border border-dark-700">
                  <span className="text-slate-400 block text-[11px] font-sans">24h High Price</span>
                  <span className="font-bold text-trade-green text-sm mt-0.5 block">
                    ${formatPrice(fundamental.high_24h, 2)}
                  </span>
                </div>

                <div className="bg-dark-900/60 p-3 rounded-xl border border-dark-700">
                  <span className="text-slate-400 block text-[11px] font-sans">24h Low Price</span>
                  <span className="font-bold text-trade-red text-sm mt-0.5 block">
                    ${formatPrice(fundamental.low_24h, 2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Bullish Sentiment Gauge */}
            <div className="bg-dark-800 border border-dark-600/80 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  Community Sentiment
                </h3>
                <p className="text-xs text-slate-400">Bullish sentiment votes ratio based on global market feedback.</p>
              </div>

              <div className="my-6">
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-trade-green">Bullish: {fundamental.sentiment_votes_up_percentage || 80}%</span>
                  <span className="text-trade-red">Bearish: {100 - (fundamental.sentiment_votes_up_percentage || 80)}%</span>
                </div>
                <div className="w-full h-3 bg-dark-900 rounded-full overflow-hidden flex border border-dark-700">
                  <div
                    className="bg-trade-green h-full transition-all"
                    style={{ width: `${fundamental.sentiment_votes_up_percentage || 80}%` }}
                  />
                  <div
                    className="bg-trade-red h-full transition-all"
                    style={{ width: `${100 - (fundamental.sentiment_votes_up_percentage || 80)}%` }}
                  />
                </div>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex items-center space-x-2 text-emerald-400 text-xs font-semibold">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>Fundamental metrics retrieved live via CoinGecko REST Data Schema.</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
