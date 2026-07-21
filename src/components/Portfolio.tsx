import React, { useState } from 'react';
import { useAtta } from '../context/AttaContext';
import { formatBaseCurrency, formatPercentage, formatPrice, formatDateTime } from '../utils/formatters';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Clock,
  Trash2,
  XCircle,
  PlusCircle,
  AlertTriangle,
  RotateCcw,
  RefreshCw,
  Layers,
  PieChart,
} from 'lucide-react';
import { TopUpModal } from './TopUpModal';

export const Portfolio: React.FC = () => {
  const {
    wallet,
    baseCurrency,
    positions,
    tradeHistory,
    topUpHistory,
    totalEquityInBaseCurrency,
    totalUnrealizedPnlInBaseCurrency,
    usedMarginInBaseCurrency,
    freeMarginInBaseCurrency,
    marginLevelPercentage,
    closePosition,
    resetAccount,
  } = useAtta();

  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleConfirmReset = () => {
    resetAccount();
    setShowResetConfirm(false);
  };

  return (
    <div className="space-y-6 max-w-[1920px] mx-auto pb-12">
      
      {/* PROMINENT FACTORY RESET BANNER & BUTTON */}
      <div className="bg-gradient-to-r from-rose-950/80 via-dark-800 to-rose-950/80 border border-rose-500/50 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">Factory Data Reset Engine</h3>
            <p className="text-xs text-slate-300">
              Instantly wipe all active positions, clear trade history (0 entries), delete alerts, and restore pristine default balance ($10,000 VUSD eq).
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowResetConfirm(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-rose-600/30 transition-all flex items-center space-x-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Semua Data & Riwayat</span>
        </button>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-dark-800 border border-dark-600 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-extrabold text-white">Konfirmasi Reset Semua Data</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Apakah Anda yakin ingin menghapus seluruh posisi trading, riwayat transaksi, dan mengembalikan saldo akun ke setup awal default ($10,000 VUSD)? Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-slate-300 font-bold text-xs rounded-xl transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmReset}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl transition-all shadow"
              >
                Ya, Reset Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Equity & Margin Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="bg-dark-800 border border-dark-600/80 rounded-2xl p-4 shadow-xl">
          <span className="text-[10px] uppercase font-sans font-bold text-slate-400 block">Total Account Equity</span>
          <span className="text-xl font-extrabold text-white mt-1 block">
            {formatBaseCurrency(totalEquityInBaseCurrency, baseCurrency)}
          </span>
          <span className="text-[11px] font-sans text-slate-400 block mt-1">
            Available: {formatBaseCurrency(freeMarginInBaseCurrency, baseCurrency)}
          </span>
        </div>

        <div className="bg-dark-800 border border-dark-600/80 rounded-2xl p-4 shadow-xl">
          <span className="text-[10px] uppercase font-sans font-bold text-slate-400 block">Unrealized PnL</span>
          <span className={`text-xl font-extrabold mt-1 block ${
            totalUnrealizedPnlInBaseCurrency >= 0 ? 'text-trade-green' : 'text-trade-red'
          }`}>
            {totalUnrealizedPnlInBaseCurrency >= 0 ? '+' : ''}
            {formatBaseCurrency(totalUnrealizedPnlInBaseCurrency, baseCurrency)}
          </span>
          <span className="text-[11px] font-sans text-slate-400 block mt-1">
            Active Open Positions: {positions.length}
          </span>
        </div>

        <div className="bg-dark-800 border border-dark-600/80 rounded-2xl p-4 shadow-xl">
          <span className="text-[10px] uppercase font-sans font-bold text-slate-400 block">Used Margin</span>
          <span className="text-xl font-extrabold text-white mt-1 block">
            {formatBaseCurrency(usedMarginInBaseCurrency, baseCurrency)}
          </span>
          <span className="text-[11px] font-sans text-slate-400 block mt-1">
            Margin Level: {usedMarginInBaseCurrency > 0 ? `${marginLevelPercentage.toFixed(1)}%` : 'N/A'}
          </span>
        </div>

        <div className="bg-dark-800 border border-dark-600/80 rounded-2xl p-4 shadow-xl flex flex-col justify-between">
          <div>
            <span className="text-[10px] uppercase font-sans font-bold text-slate-400 block">Capital Top Up</span>
            <span className="text-sm font-bold text-slate-200 mt-0.5 block">
              Multi-Currency Wallet
            </span>
          </div>

          <button
            onClick={() => setIsTopUpOpen(true)}
            className="w-full py-2 bg-trade-gold hover:bg-amber-500 text-dark-900 font-extrabold font-sans text-xs rounded-xl transition-all shadow flex items-center justify-center space-x-1 mt-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Top Up Capital</span>
          </button>
        </div>
      </div>

      {/* Active Open Positions Table */}
      <div className="bg-dark-800 border border-dark-600/80 rounded-2xl p-5 shadow-xl font-mono text-xs">
        <div className="flex items-center justify-between border-b border-dark-700 pb-3 mb-4">
          <div className="flex items-center space-x-2 font-sans font-bold text-white text-sm">
            <Layers className="w-4 h-4 text-trade-accent" />
            <span>Active Positions ({positions.length})</span>
          </div>
        </div>

        {positions.length === 0 ? (
          <div className="py-8 text-center text-slate-400 font-sans text-xs">
            No active positions currently open.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-dark-700 text-[10px] uppercase font-sans text-slate-400">
                  <th className="py-2.5 px-3">Asset</th>
                  <th className="py-2.5 px-3">Side</th>
                  <th className="py-2.5 px-3">Entry Price</th>
                  <th className="py-2.5 px-3">Current Price</th>
                  <th className="py-2.5 px-3">Margin ({baseCurrency})</th>
                  <th className="py-2.5 px-3">Floating PnL</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700/60">
                {positions.map((pos) => (
                  <tr key={pos.id} className="hover:bg-dark-700/40 transition-colors">
                    <td className="py-3 px-3">
                      <span className="font-bold text-white block">{pos.symbolInfo.name}</span>
                      <span className="text-[10px] text-slate-400 uppercase">{pos.symbolInfo.type}</span>
                    </td>

                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded font-extrabold uppercase text-[10px] ${
                        pos.side === 'buy' ? 'bg-trade-green/20 text-trade-green border border-trade-green/40' : 'bg-trade-red/20 text-trade-red border border-trade-red/40'
                      }`}>
                        {pos.side} {pos.leverage}x
                      </span>
                    </td>

                    <td className="py-3 px-3 text-slate-300">
                      ${formatPrice(pos.entryPrice, pos.symbolInfo.precision)}
                    </td>

                    <td className="py-3 px-3 font-bold text-white">
                      ${formatPrice(pos.currentPrice, pos.symbolInfo.precision)}
                    </td>

                    <td className="py-3 px-3 text-slate-300">
                      {formatBaseCurrency(pos.marginInBaseCurrency, baseCurrency)}
                    </td>

                    <td className="py-3 px-3">
                      <span className={`font-bold block ${pos.floatingPnlInBaseCurrency >= 0 ? 'text-trade-green' : 'text-trade-red'}`}>
                        {pos.floatingPnlInBaseCurrency >= 0 ? '+' : ''}
                        {formatBaseCurrency(pos.floatingPnlInBaseCurrency, baseCurrency)}
                      </span>
                      <span className={`text-[10px] ${pos.floatingPnlPercentage >= 0 ? 'text-trade-green' : 'text-trade-red'}`}>
                        {formatPercentage(pos.floatingPnlPercentage)}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => closePosition(pos.id, 'manual')}
                        className="px-3 py-1 bg-trade-red hover:bg-rose-600 text-white font-sans font-extrabold rounded-lg text-xs transition-all shadow"
                      >
                        Close
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Trade History Log Table */}
      <div className="bg-dark-800 border border-dark-600/80 rounded-2xl p-5 shadow-xl font-mono text-xs">
        <div className="flex items-center justify-between border-b border-dark-700 pb-3 mb-4">
          <div className="flex items-center space-x-2 font-sans font-bold text-white text-sm">
            <Clock className="w-4 h-4 text-trade-accent" />
            <span>Closed Transaction History ({tradeHistory.length})</span>
          </div>
        </div>

        {tradeHistory.length === 0 ? (
          <div className="py-8 text-center text-slate-400 font-sans text-xs">
            Transaction history log is empty (0 entries).
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-dark-700 text-[10px] uppercase font-sans text-slate-400">
                  <th className="py-2.5 px-3">Asset / Time</th>
                  <th className="py-2.5 px-3">Side</th>
                  <th className="py-2.5 px-3">Entry / Close</th>
                  <th className="py-2.5 px-3">Margin</th>
                  <th className="py-2.5 px-3">Realized PnL</th>
                  <th className="py-2.5 px-3 text-right">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700/60">
                {tradeHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-dark-700/40 transition-colors">
                    <td className="py-3 px-3">
                      <span className="font-bold text-white block">{item.symbol}</span>
                      <span className="text-[10px] text-slate-400 font-sans">{formatDateTime(item.closedAt)}</span>
                    </td>

                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded font-extrabold uppercase text-[10px] ${
                        item.side === 'buy' ? 'bg-trade-green/20 text-trade-green' : 'bg-trade-red/20 text-trade-red'
                      }`}>
                        {item.side} {item.leverage}x
                      </span>
                    </td>

                    <td className="py-3 px-3 text-slate-300">
                      <div>Entry: ${item.entryPrice.toFixed(2)}</div>
                      <div className="text-white font-bold">Close: ${item.closePrice.toFixed(2)}</div>
                    </td>

                    <td className="py-3 px-3 text-slate-300">
                      {formatBaseCurrency(item.marginInBaseCurrency, baseCurrency)}
                    </td>

                    <td className="py-3 px-3">
                      <span className={`font-bold block ${item.realizedPnlInBaseCurrency >= 0 ? 'text-trade-green' : 'text-trade-red'}`}>
                        {item.realizedPnlInBaseCurrency >= 0 ? '+' : ''}
                        {formatBaseCurrency(item.realizedPnlInBaseCurrency, baseCurrency)}
                      </span>
                      <span className={`text-[10px] ${item.pnlPercentage >= 0 ? 'text-trade-green' : 'text-trade-red'}`}>
                        {formatPercentage(item.pnlPercentage)}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right font-sans font-bold uppercase text-[10px]">
                      <span className={`px-2 py-0.5 rounded ${
                        item.reason === 'auto_win' ? 'bg-trade-gold/20 text-trade-gold' : 'bg-dark-700 text-slate-300'
                      }`}>
                        {item.reason}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <TopUpModal isOpen={isTopUpOpen} onClose={() => setIsTopUpOpen(false)} />
    </div>
  );
};
