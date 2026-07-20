import React, { useState } from 'react';
import { useVST } from '../context/VSTContext';
import { formatCurrency, formatPrice, formatPercentage, formatDateTime } from '../utils/formatters';
import {
  Layers,
  Clock,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  XCircle,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  History,
  DollarSign,
} from 'lucide-react';

export const Portfolio: React.FC = () => {
  const {
    wallet,
    positions,
    limitOrders,
    tradeHistory,
    topUpHistory,
    closePosition,
    cancelLimitOrder,
    totalEquity,
    totalUnrealizedPnl,
    usedMargin,
  } = useVST();

  const [activeTab, setActiveTab] = useState<'positions' | 'orders' | 'history' | 'topups'>('positions');

  const isPnlPositive = totalUnrealizedPnl >= 0;

  return (
    <div className="space-y-6 max-w-[1920px] mx-auto pb-12">
      {/* Portfolio Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Equity */}
        <div className="bg-dark-800 border border-dark-600/80 rounded-2xl p-4 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Total Equity</span>
            <DollarSign className="w-4 h-4 text-trade-accent" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-extrabold font-mono text-white">{formatCurrency(totalEquity)}</div>
            <div className="text-[11px] text-slate-400 mt-1">Balance + Margin + Floating PnL</div>
          </div>
        </div>

        {/* Available VST Balance */}
        <div className="bg-dark-800 border border-dark-600/80 rounded-2xl p-4 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Available Balance</span>
            <span className="w-2 h-2 rounded-full bg-trade-gold" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-extrabold font-mono text-trade-gold">{formatCurrency(wallet.balance)}</div>
            <div className="text-[11px] text-slate-400 mt-1">Free VST ready to trade</div>
          </div>
        </div>

        {/* Floating PnL */}
        <div className="bg-dark-800 border border-dark-600/80 rounded-2xl p-4 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Floating PnL</span>
            {isPnlPositive ? (
              <TrendingUp className="w-4 h-4 text-trade-green" />
            ) : (
              <TrendingDown className="w-4 h-4 text-trade-red" />
            )}
          </div>
          <div className="mt-2">
            <div className={`text-xl font-extrabold font-mono ${isPnlPositive ? 'text-trade-green' : 'text-trade-red'}`}>
              {isPnlPositive ? '+' : ''}{formatCurrency(totalUnrealizedPnl)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Real-time open positions PnL</div>
          </div>
        </div>

        {/* Realized PnL */}
        <div className="bg-dark-800 border border-dark-600/80 rounded-2xl p-4 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Realized PnL</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <div className={`text-xl font-extrabold font-mono ${wallet.realizedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {wallet.realizedPnl >= 0 ? '+' : ''}{formatCurrency(wallet.realizedPnl)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Total closed trades profit</div>
          </div>
        </div>

        {/* Margin In Use */}
        <div className="bg-dark-800 border border-dark-600/80 rounded-2xl p-4 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Locked Margin</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-extrabold font-mono text-slate-200">{formatCurrency(usedMargin)}</div>
            <div className="text-[11px] text-slate-400 mt-1">Margin collateral allocated</div>
          </div>
        </div>
      </div>

      {/* Main Tabs Header */}
      <div className="bg-dark-800 border border-dark-600/80 rounded-2xl p-4">
        <div className="flex items-center justify-between border-b border-dark-600/60 pb-3">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('positions')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'positions'
                  ? 'bg-trade-accent text-white shadow-lg shadow-trade-accent/30'
                  : 'text-slate-400 hover:text-white hover:bg-dark-700'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Active Positions ({positions.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'orders'
                  ? 'bg-trade-accent text-white shadow-lg shadow-trade-accent/30'
                  : 'text-slate-400 hover:text-white hover:bg-dark-700'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Pending Orders ({limitOrders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'history'
                  ? 'bg-trade-accent text-white shadow-lg shadow-trade-accent/30'
                  : 'text-slate-400 hover:text-white hover:bg-dark-700'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Trade History ({tradeHistory.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('topups')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'topups'
                  ? 'bg-trade-accent text-white shadow-lg shadow-trade-accent/30'
                  : 'text-slate-400 hover:text-white hover:bg-dark-700'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>Top-Up Log ({topUpHistory.length})</span>
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        <div className="pt-4 overflow-x-auto">
          {/* TAB 1: ACTIVE POSITIONS */}
          {activeTab === 'positions' && (
            positions.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Layers className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p className="text-sm font-semibold">No active positions open.</p>
                <p className="text-xs text-slate-600 mt-1">Use the order panel to execute long or short trades.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-dark-700 text-slate-400 text-[11px] font-sans uppercase">
                    <th className="pb-3 px-2">Symbol</th>
                    <th className="pb-3 px-2">Side</th>
                    <th className="pb-3 px-2">Margin / Leverage</th>
                    <th className="pb-3 px-2">Entry Price</th>
                    <th className="pb-3 px-2">Mark Price</th>
                    <th className="pb-3 px-2">Est. Liquidation</th>
                    <th className="pb-3 px-2">Floating PnL</th>
                    <th className="pb-3 px-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-700/60">
                  {positions.map((pos) => {
                    const isPositive = pos.floatingPnl >= 0;
                    return (
                      <tr key={pos.id} className="hover:bg-dark-700/40 transition-colors">
                        <td className="py-3 px-2 font-bold font-sans text-white">
                          {pos.symbolInfo.name}
                          <span className="block text-[10px] text-slate-400 font-mono">{pos.symbol}</span>
                        </td>
                        <td className="py-3 px-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold uppercase font-sans ${
                              pos.side === 'buy'
                                ? 'bg-trade-green/20 text-trade-green border border-trade-green/30'
                                : 'bg-trade-red/20 text-trade-red border border-trade-red/30'
                            }`}
                          >
                            {pos.side === 'buy' ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                            {pos.side.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-slate-200">
                          {formatCurrency(pos.margin)}
                          <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-dark-900 text-trade-gold rounded border border-dark-600">
                            {pos.leverage}x
                          </span>
                        </td>
                        <td className="py-3 px-2 text-slate-300">
                          ${formatPrice(pos.entryPrice, pos.symbolInfo.precision)}
                        </td>
                        <td className="py-3 px-2 font-bold text-white">
                          ${formatPrice(pos.currentPrice, pos.symbolInfo.precision)}
                        </td>
                        <td className="py-3 px-2 text-amber-400">
                          ${formatPrice(pos.liquidationPrice, pos.symbolInfo.precision)}
                        </td>
                        <td className="py-3 px-2 font-bold">
                          <span className={isPositive ? 'text-trade-green' : 'text-trade-red'}>
                            {isPositive ? '+' : ''}{formatCurrency(pos.floatingPnl)} ({formatPercentage(pos.floatingPnlPercentage)})
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <button
                            onClick={() => closePosition(pos.id, 'manual')}
                            className="bg-trade-red/20 hover:bg-trade-red hover:text-white text-trade-red px-3 py-1 rounded-lg text-[11px] font-bold font-sans transition-all"
                          >
                            Close Position
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )
          )}

          {/* TAB 2: PENDING LIMIT ORDERS */}
          {activeTab === 'orders' && (
            limitOrders.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p className="text-sm font-semibold">No pending limit orders.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-dark-700 text-slate-400 text-[11px] font-sans uppercase">
                    <th className="pb-3 px-2">Symbol</th>
                    <th className="pb-3 px-2">Side</th>
                    <th className="pb-3 px-2">Target Price</th>
                    <th className="pb-3 px-2">Margin / Leverage</th>
                    <th className="pb-3 px-2">Created At</th>
                    <th className="pb-3 px-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-700/60">
                  {limitOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-dark-700/40 transition-colors">
                      <td className="py-3 px-2 font-bold font-sans text-white">{ord.symbolInfo.name}</td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${ord.side === 'buy' ? 'bg-trade-green/20 text-trade-green' : 'bg-trade-red/20 text-trade-red'}`}>
                          {ord.side.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-2 font-bold text-trade-gold">
                        ${formatPrice(ord.targetPrice, ord.symbolInfo.precision)}
                      </td>
                      <td className="py-3 px-2 text-slate-200">
                        {formatCurrency(ord.margin)} ({ord.leverage}x)
                      </td>
                      <td className="py-3 px-2 text-slate-400 text-[11px] font-sans">
                        {formatDateTime(ord.createdAt)}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <button
                          onClick={() => cancelLimitOrder(ord.id)}
                          className="bg-dark-700 hover:bg-dark-600 text-slate-300 px-3 py-1 rounded-lg text-[11px] font-bold font-sans transition-all"
                        >
                          Cancel Order
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}

          {/* TAB 3: CLOSED TRADE HISTORY */}
          {activeTab === 'history' && (
            tradeHistory.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <History className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p className="text-sm font-semibold">No trade history recorded yet.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-dark-700 text-slate-400 text-[11px] font-sans uppercase">
                    <th className="pb-3 px-2">Symbol</th>
                    <th className="pb-3 px-2">Side</th>
                    <th className="pb-3 px-2">Entry / Exit</th>
                    <th className="pb-3 px-2">Margin / Leverage</th>
                    <th className="pb-3 px-2">Realized PnL</th>
                    <th className="pb-3 px-2">Reason</th>
                    <th className="pb-3 px-2 text-right">Closed Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-700/60">
                  {tradeHistory.map((item) => {
                    const isWin = item.realizedPnl >= 0;
                    return (
                      <tr key={item.id} className="hover:bg-dark-700/40 transition-colors">
                        <td className="py-3 px-2 font-bold font-sans text-white">{item.symbol}</td>
                        <td className="py-3 px-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.side === 'buy' ? 'bg-trade-green/20 text-trade-green' : 'bg-trade-red/20 text-trade-red'}`}>
                            {item.side.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-slate-300">
                          ${formatPrice(item.entryPrice, 2)} → ${formatPrice(item.closePrice, 2)}
                        </td>
                        <td className="py-3 px-2 text-slate-300">
                          {formatCurrency(item.margin)} ({item.leverage}x)
                        </td>
                        <td className="py-3 px-2 font-bold">
                          <span className={isWin ? 'text-trade-green' : 'text-trade-red'}>
                            {isWin ? '+' : ''}{formatCurrency(item.realizedPnl)} ({formatPercentage(item.pnlPercentage)})
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <span className="px-2 py-0.5 bg-dark-900 text-slate-400 rounded border border-dark-700 text-[10px] uppercase">
                            {item.reason}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right text-slate-400 text-[11px] font-sans">
                          {formatDateTime(item.closedAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )
          )}

          {/* TAB 4: TOP-UP HISTORY */}
          {activeTab === 'topups' && (
            topUpHistory.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p className="text-sm font-semibold">No VST top-ups recorded.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-dark-700 text-slate-400 text-[11px] font-sans uppercase">
                    <th className="pb-3 px-2">Top-Up ID</th>
                    <th className="pb-3 px-2">Amount Added</th>
                    <th className="pb-3 px-2">Note</th>
                    <th className="pb-3 px-2 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-700/60">
                  {topUpHistory.map((rec) => (
                    <tr key={rec.id} className="hover:bg-dark-700/40 transition-colors">
                      <td className="py-3 px-2 font-sans text-slate-400">{rec.id}</td>
                      <td className="py-3 px-2 font-bold text-trade-gold">
                        +{formatCurrency(rec.amount)}
                      </td>
                      <td className="py-3 px-2 text-slate-300 font-sans">{rec.note}</td>
                      <td className="py-3 px-2 text-right text-slate-400 text-[11px] font-sans">
                        {formatDateTime(rec.timestamp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}
        </div>
      </div>
    </div>
  );
};
