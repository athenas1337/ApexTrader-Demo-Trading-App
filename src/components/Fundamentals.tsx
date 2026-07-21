import React, { useEffect, useState } from 'react';
import { useAtta } from '../context/AttaContext';
import { CryptoFundamental } from '../types/trading';
import { fetchCryptoFundamental } from '../services/cryptoApi';
import { CRYPTO_SYMBOLS } from '../services/symbols';
import { formatPrice, formatPercentage, formatCompactNumber } from '../utils/formatters';
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
  Search,
} from 'lucide-react';

export const Fundamentals: React.FC = () => {
  const { selectedSymbol } = useAtta();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeSymbol, setActiveSymbol] = useState(
    selectedSymbol.type === 'crypto' ? selectedSymbol.symbol : CRYPTO_SYMBOLS[0].symbol
  );

  const [fundamental, setFundamental] = useState<CryptoFundamental | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const filteredCryptos = CRYPTO_SYMBOLS.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      {/* Top 100 Search & Asset Selection Chips */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-dark-800 border border-dark-600 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold text-white focus:outline-none focus:border-trade-accent"
            placeholder="Search crypto asset name or symbol..."
          />
        </div>

        {/* Crypto Chips */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {filteredCryptos.slice(0, 10).map((item) => {
            const isActive = item.symbol === activeSymbol;
            return (
              <button
                key={item.symbol}
                onClick={() => setActiveSymbol(item.symbol)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-trade-accent to-blue-600 text-white shadow border border-blue-400/30'
                    : 'bg-dark-800 text-slate-400 hover:text-white border border-dark-600/80'
                }`}
              >
                {item.name}
              </button>
            );
          })}
        </div>
      </div>

      {loading || !fundamental ? (
        <div className="bg-dark-800 border border-dark-600/80 rounded-2xl p-12 text-center">
          <RefreshCw className="w-8 h-8 text-trade-accent animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-300">Fetching CoinGecko Fundamental Data...</p>
        </div>
      ) : (
        <>
          {/* Main Asset Banner */}
          <div className="bg-dark-800 border border-dark-600/80 rounded-2xl p-6 relative overflow-hidden">
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
                  <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">{fundamental.description}</p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-extrabold font-mono text-white">${formatPrice(fundamental.current_price, 2)}</div>
                <div className={`text-sm font-bold flex items-center justify-end space-x-1 mt-1 ${is24hPositive ? 'text-trade-green' : 'text-trade-red'}`}>
                  {is24hPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span>{formatPercentage(fundamental.price_change_percentage_24h)} (24h)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Fundamentals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-dark-800 border border-dark-600/80 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
                <span>Market Cap</span>
                <Globe className="w-4 h-4 text-blue-400" />
              </div>
              <div className="mt-2 text-xl font-extrabold font-mono text-white">
                ${formatCompactNumber(fundamental.market_cap)}
              </div>
            </div>

            <div className="bg-dark-800 border border-dark-600/80 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
                <span>24h Volume</span>
                <Activity className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="mt-2 text-xl font-extrabold font-mono text-white">
                ${formatCompactNumber(fundamental.total_volume)}
              </div>
            </div>

            <div className="bg-dark-800 border border-dark-600/80 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
                <span>Circulating Supply</span>
                <Layers className="w-4 h-4 text-amber-400" />
              </div>
              <div className="mt-2 text-xl font-extrabold font-mono text-white">
                {formatCompactNumber(fundamental.circulating_supply)} {fundamental.symbol.toUpperCase()}
              </div>
            </div>

            <div className="bg-dark-800 border border-dark-600/80 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
                <span>All-Time High</span>
                <Award className="w-4 h-4 text-purple-400" />
              </div>
              <div className="mt-2 text-xl font-extrabold font-mono text-white">${formatPrice(fundamental.ath, 2)}</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
