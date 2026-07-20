import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Position,
  LimitOrder,
  TradeHistoryItem,
  VSTTopUpRecord,
  WalletState,
  SymbolInfo,
  OrderSide,
  OrderType,
} from '../types/trading';
import { getFromStorage, saveToStorage, clearAllStorage } from '../utils/storage';
import { getSymbolDetails, SUPPORTED_SYMBOLS } from '../services/symbols';
import { priceFeed } from '../services/priceFeed';
import confetti from 'canvas-confetti';

const INITIAL_BALANCE = 10000;

interface VSTContextType {
  wallet: WalletState;
  selectedSymbol: SymbolInfo;
  setSelectedSymbol: (symbol: SymbolInfo) => void;
  positions: Position[];
  limitOrders: LimitOrder[];
  tradeHistory: TradeHistoryItem[];
  topUpHistory: VSTTopUpRecord[];
  livePrices: Record<string, number>;
  
  // Actions
  openPosition: (params: {
    symbolInfo: SymbolInfo;
    side: OrderSide;
    orderType: OrderType;
    margin: number;
    leverage: number;
    entryPrice: number;
    targetPrice?: number; // for limit order
    takeProfit?: number;
    stopLoss?: number;
  }) => { success: boolean; message: string };

  closePosition: (positionId: string, reason?: 'manual' | 'tp' | 'sl' | 'liquidation') => void;
  cancelLimitOrder: (orderId: string) => void;
  topUpVST: (amount: number, note?: string) => { success: boolean; message: string };
  resetAccount: () => void;
  
  // Computed values
  totalEquity: number;
  totalUnrealizedPnl: number;
  usedMargin: number;
  freeMargin: number;
}

const VSTContext = createContext<VSTContextType | undefined>(undefined);

export const VSTProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Initial State from Storage
  const [wallet, setWallet] = useState<WalletState>(() =>
    getFromStorage<WalletState>('wallet', {
      balance: INITIAL_BALANCE,
      initialBalance: INITIAL_BALANCE,
      totalTopUp: 0,
      realizedPnl: 0,
    })
  );

  const [selectedSymbol, setSelectedSymbolState] = useState<SymbolInfo>(() =>
    getFromStorage<SymbolInfo>('selectedSymbol', SUPPORTED_SYMBOLS[0])
  );

  const [positions, setPositions] = useState<Position[]>(() =>
    getFromStorage<Position[]>('positions', [])
  );

  const [limitOrders, setLimitOrders] = useState<LimitOrder[]>(() =>
    getFromStorage<LimitOrder[]>('limitOrders', [])
  );

  const [tradeHistory, setTradeHistory] = useState<TradeHistoryItem[]>(() =>
    getFromStorage<TradeHistoryItem[]>('tradeHistory', [])
  );

  const [topUpHistory, setTopUpHistory] = useState<VSTTopUpRecord[]>(() =>
    getFromStorage<VSTTopUpRecord[]>('topUpHistory', [])
  );

  const [livePrices, setLivePrices] = useState<Record<string, number>>({});

  // 2. Persist state changes
  useEffect(() => saveToStorage('wallet', wallet), [wallet]);
  useEffect(() => saveToStorage('selectedSymbol', selectedSymbol), [selectedSymbol]);
  useEffect(() => saveToStorage('positions', positions), [positions]);
  useEffect(() => saveToStorage('limitOrders', limitOrders), [limitOrders]);
  useEffect(() => saveToStorage('tradeHistory', tradeHistory), [tradeHistory]);
  useEffect(() => saveToStorage('topUpHistory', topUpHistory), [topUpHistory]);

  const setSelectedSymbol = (symbol: SymbolInfo) => {
    setSelectedSymbolState(symbol);
  };

  // 3. Price Subscriptions for Active Positions & Selected Symbol
  useEffect(() => {
    const symbolsToTrack = new Set([
      selectedSymbol.symbol,
      ...positions.map((p) => p.symbol),
      ...limitOrders.map((l) => l.symbol),
      ...SUPPORTED_SYMBOLS.map((s) => s.symbol),
    ]);

    const unsubscribes: (() => void)[] = [];

    symbolsToTrack.forEach((sym) => {
      const details = getSymbolDetails(sym);
      const unsub = priceFeed.subscribe(sym, details.basePrice, (symbolKey, price) => {
        setLivePrices((prev) => ({ ...prev, [symbolKey]: price }));
      });
      unsubscribes.push(unsub);
    });

    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  }, [selectedSymbol.symbol, positions.length, limitOrders.length]);

  // 4. Calculate Liquidation Price helper
  const calculateLiquidationPrice = (side: OrderSide, entryPrice: number, leverage: number): number => {
    const maintenanceMarginRatio = 0.005; // 0.5% maintenance margin
    if (side === 'buy') {
      return entryPrice * (1 - 1 / leverage + maintenanceMarginRatio);
    } else {
      return entryPrice * (1 + 1 / leverage - maintenanceMarginRatio);
    }
  };

  // 5. Open Position or Create Limit Order
  const openPosition = useCallback(
    ({
      symbolInfo,
      side,
      orderType,
      margin,
      leverage,
      entryPrice,
      targetPrice,
      takeProfit,
      stopLoss,
    }: {
      symbolInfo: SymbolInfo;
      side: OrderSide;
      orderType: OrderType;
      margin: number;
      leverage: number;
      entryPrice: number;
      targetPrice?: number;
      takeProfit?: number;
      stopLoss?: number;
    }) => {
      if (margin <= 0) return { success: false, message: 'Margin must be greater than 0 VST.' };
      if (margin > wallet.balance)
        return { success: false, message: 'Insufficient VST balance for this margin amount.' };

      // Deduct margin from wallet
      setWallet((prev) => ({ ...prev, balance: prev.balance - margin }));

      const effectivePrice = orderType === 'limit' && targetPrice ? targetPrice : entryPrice;
      const totalNotional = margin * leverage;
      const quantity = totalNotional / effectivePrice;
      const liquidationPrice = calculateLiquidationPrice(side, effectivePrice, leverage);

      if (orderType === 'limit' && targetPrice) {
        const newLimitOrder: LimitOrder = {
          id: `ord_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          symbol: symbolInfo.symbol,
          symbolInfo,
          side,
          targetPrice,
          quantity,
          margin,
          leverage,
          takeProfit,
          stopLoss,
          createdAt: Date.now(),
          status: 'pending',
        };
        setLimitOrders((prev) => [newLimitOrder, ...prev]);
        return { success: true, message: `Limit Order created at ${targetPrice}` };
      } else {
        const newPosition: Position = {
          id: `pos_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          symbol: symbolInfo.symbol,
          symbolInfo,
          side,
          orderType,
          entryPrice: effectivePrice,
          currentPrice: effectivePrice,
          quantity,
          margin,
          leverage,
          takeProfit,
          stopLoss,
          liquidationPrice,
          floatingPnl: 0,
          floatingPnlPercentage: 0,
          openedAt: Date.now(),
        };
        setPositions((prev) => [newPosition, ...prev]);
        return { success: true, message: `Successfully opened ${side.toUpperCase()} ${symbolInfo.name} position` };
      }
    },
    [wallet.balance]
  );

  // 6. Close Position
  const closePosition = useCallback(
    (positionId: string, reason: 'manual' | 'tp' | 'sl' | 'liquidation' = 'manual') => {
      setPositions((prevPositions) => {
        const pos = prevPositions.find((p) => p.id === positionId);
        if (!pos) return prevPositions;

        const currentMarketPrice = livePrices[pos.symbol] || pos.currentPrice;
        
        let pnl = 0;
        if (pos.side === 'buy') {
          pnl = (currentMarketPrice - pos.entryPrice) * pos.quantity;
        } else {
          pnl = (pos.entryPrice - currentMarketPrice) * pos.quantity;
        }

        if (reason === 'liquidation') {
          pnl = -pos.margin; // Total margin lost on liquidation
        }

        const returnedAmount = Math.max(0, pos.margin + pnl);

        // Update Wallet
        setWallet((prev) => ({
          ...prev,
          balance: prev.balance + returnedAmount,
          realizedPnl: prev.realizedPnl + pnl,
        }));

        // Log Trade History
        const historyItem: TradeHistoryItem = {
          id: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          positionId: pos.id,
          symbol: pos.symbol,
          side: pos.side,
          entryPrice: pos.entryPrice,
          closePrice: currentMarketPrice,
          quantity: pos.quantity,
          margin: pos.margin,
          leverage: pos.leverage,
          realizedPnl: pnl,
          pnlPercentage: (pnl / pos.margin) * 100,
          closedAt: Date.now(),
          reason,
        };

        setTradeHistory((prevHistory) => [historyItem, ...prevHistory]);

        // Trigger victory celebration if profit > $50 VST!
        if (pnl > 50) {
          try {
            confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
          } catch (e) {
            // Ignore confetti error if unavailable
          }
        }

        return prevPositions.filter((p) => p.id !== positionId);
      });
    },
    [livePrices]
  );

  // 7. Cancel Limit Order
  const cancelLimitOrder = useCallback((orderId: string) => {
    setLimitOrders((prev) => {
      const order = prev.find((o) => o.id === orderId);
      if (order) {
        // Return margin to balance
        setWallet((w) => ({ ...w, balance: w.balance + order.margin }));
      }
      return prev.filter((o) => o.id !== orderId);
    });
  }, []);

  // 8. Top Up VST (Supports 100 VST to 100,000 VST)
  const topUpVST = useCallback((amount: number, note: string = 'Top up VST'): { success: boolean; message: string } => {
    if (isNaN(amount) || amount < 100 || amount > 100000) {
      return {
        success: false,
        message: 'Top up amount must be between 100 VST and 100,000 VST.',
      };
    }

    setWallet((prev) => ({
      ...prev,
      balance: prev.balance + amount,
      totalTopUp: prev.totalTopUp + amount,
    }));

    const record: VSTTopUpRecord = {
      id: `topup_${Date.now()}`,
      amount,
      timestamp: Date.now(),
      note,
    };

    setTopUpHistory((prev) => [record, ...prev]);

    try {
      confetti({ particleCount: 80, spread: 90, origin: { y: 0.6 } });
    } catch (e) {
      // ignore
    }

    return {
      success: true,
      message: `Successfully added +${amount.toLocaleString()} VST to your wallet!`,
    };
  }, []);

  // 9. Reset Account back to 10,000 VST
  const resetAccount = useCallback(() => {
    clearAllStorage();
    setWallet({
      balance: INITIAL_BALANCE,
      initialBalance: INITIAL_BALANCE,
      totalTopUp: 0,
      realizedPnl: 0,
    });
    setPositions([]);
    setLimitOrders([]);
    setTradeHistory([]);
    setTopUpHistory([]);
    setSelectedSymbolState(SUPPORTED_SYMBOLS[0]);
  }, []);

  // 10. Automated Check for TP / SL / Liquidation & Limit Orders Trigger
  useEffect(() => {
    positions.forEach((pos) => {
      const currentPrice = livePrices[pos.symbol];
      if (!currentPrice) return;

      // Check Liquidation
      if (
        (pos.side === 'buy' && currentPrice <= pos.liquidationPrice) ||
        (pos.side === 'sell' && currentPrice >= pos.liquidationPrice)
      ) {
        closePosition(pos.id, 'liquidation');
        return;
      }

      // Check Take Profit
      if (pos.takeProfit) {
        if (
          (pos.side === 'buy' && currentPrice >= pos.takeProfit) ||
          (pos.side === 'sell' && currentPrice <= pos.takeProfit)
        ) {
          closePosition(pos.id, 'tp');
          return;
        }
      }

      // Check Stop Loss
      if (pos.stopLoss) {
        if (
          (pos.side === 'buy' && currentPrice <= pos.stopLoss) ||
          (pos.side === 'sell' && currentPrice >= pos.stopLoss)
        ) {
          closePosition(pos.id, 'sl');
          return;
        }
      }
    });
  }, [livePrices, positions, closePosition]);

  // 11. Process Pending Limit Orders
  useEffect(() => {
    limitOrders.forEach((order) => {
      const currentPrice = livePrices[order.symbol];
      if (!currentPrice) return;

      const isBuyTriggered = order.side === 'buy' && currentPrice <= order.targetPrice;
      const isSellTriggered = order.side === 'sell' && currentPrice >= order.targetPrice;

      if (isBuyTriggered || isSellTriggered) {
        // Convert Limit order to Active Position
        const liquidationPrice = calculateLiquidationPrice(order.side, order.targetPrice, order.leverage);
        const newPosition: Position = {
          id: `pos_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          symbol: order.symbol,
          symbolInfo: order.symbolInfo,
          side: order.side,
          orderType: 'limit',
          entryPrice: order.targetPrice,
          currentPrice,
          quantity: order.quantity,
          margin: order.margin,
          leverage: order.leverage,
          takeProfit: order.takeProfit,
          stopLoss: order.stopLoss,
          liquidationPrice,
          floatingPnl: 0,
          floatingPnlPercentage: 0,
          openedAt: Date.now(),
        };

        setPositions((prev) => [newPosition, ...prev]);
        setLimitOrders((prev) => prev.filter((o) => o.id !== order.id));
      }
    });
  }, [livePrices, limitOrders]);

  // 12. Dynamic Calculated Totals
  const updatedPositions = positions.map((pos) => {
    const currentPrice = livePrices[pos.symbol] || pos.entryPrice;
    let pnl = 0;
    if (pos.side === 'buy') {
      pnl = (currentPrice - pos.entryPrice) * pos.quantity;
    } else {
      pnl = (pos.entryPrice - currentPrice) * pos.quantity;
    }
    const pnlPercentage = (pnl / pos.margin) * 100;
    return {
      ...pos,
      currentPrice,
      floatingPnl: pnl,
      floatingPnlPercentage: pnlPercentage,
    };
  });

  const totalUnrealizedPnl = updatedPositions.reduce((acc, p) => acc + p.floatingPnl, 0);
  const usedMargin = positions.reduce((acc, p) => acc + p.margin, 0) + limitOrders.reduce((acc, l) => acc + l.margin, 0);
  const freeMargin = wallet.balance;
  const totalEquity = wallet.balance + usedMargin + totalUnrealizedPnl;

  return (
    <VSTContext.Provider
      value={{
        wallet,
        selectedSymbol,
        setSelectedSymbol,
        positions: updatedPositions,
        limitOrders,
        tradeHistory,
        topUpHistory,
        livePrices,
        openPosition,
        closePosition,
        cancelLimitOrder,
        topUpVST,
        resetAccount,
        totalEquity,
        totalUnrealizedPnl,
        usedMargin,
        freeMargin,
      }}
    >
      {children}
    </VSTContext.Provider>
  );
};

export const useVST = (): VSTContextType => {
  const context = useContext(VSTContext);
  if (!context) {
    throw new Error('useVST must be used within a VSTProvider');
  }
  return context;
};
