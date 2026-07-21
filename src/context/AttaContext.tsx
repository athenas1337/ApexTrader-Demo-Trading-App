import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Position,
  LimitOrder,
  TradeHistoryItem,
  TopUpRecord,
  WalletState,
  SymbolInfo,
  OrderSide,
  OrderType,
  MarketArena,
  UIMode,
  ForexLotType,
  PriceAlert,
} from '../types/trading';
import { BaseCurrencyCode, convertCurrency, convertFromUSD, convertToUSD } from '../services/fxRates';
import { getFromStorage, saveToStorage, clearAllStorage } from '../utils/storage';
import { getSymbolDetails, SUPPORTED_SYMBOLS, CRYPTO_SYMBOLS, FOREX_SYMBOLS } from '../services/symbols';
import { priceFeed } from '../services/priceFeed';
import confetti from 'canvas-confetti';

const DEFAULT_INITIAL_BALANCE_USD = 10000;

interface AttaContextType {
  // Config & State
  wallet: WalletState;
  baseCurrency: BaseCurrencyCode;
  setBaseCurrency: (currency: BaseCurrencyCode) => void;
  uiMode: UIMode;
  setUiMode: (mode: UIMode) => void;
  marketArena: MarketArena;
  setMarketArena: (arena: MarketArena) => void;
  selectedSymbol: SymbolInfo;
  setSelectedSymbol: (symbol: SymbolInfo) => void;

  // Trading lists
  positions: Position[];
  limitOrders: LimitOrder[];
  tradeHistory: TradeHistoryItem[];
  topUpHistory: TopUpRecord[];
  priceAlerts: PriceAlert[];
  livePrices: Record<string, number>;

  // Execution actions
  openPosition: (params: {
    symbolInfo: SymbolInfo;
    side: OrderSide;
    orderType: OrderType;
    marginInBaseCurrency: number;
    leverage: number;
    entryPrice: number;
    targetPrice?: number;
    forexLotType?: ForexLotType;
    forexLots?: number;
    takeProfit?: number;
    stopLoss?: number;
  }) => { success: boolean; message: string };

  closePosition: (positionId: string, reason?: 'manual' | 'tp' | 'sl' | 'liquidation' | 'margin_call') => void;
  cancelLimitOrder: (orderId: string) => void;
  topUpAccount: (amountInBaseCurrency: number, note?: string) => { success: boolean; message: string };
  resetAccount: () => void;

  // Alerts management
  addPriceAlert: (symbol: string, targetPrice: number, condition: 'above' | 'below') => void;
  removePriceAlert: (id: string) => void;

  // Computed Financial Metrics
  totalEquityInBaseCurrency: number;
  totalUnrealizedPnlInBaseCurrency: number;
  usedMarginInBaseCurrency: number;
  freeMarginInBaseCurrency: number;
  marginLevelPercentage: number;
  isMarginCallWarning: boolean;
}

const AttaContext = createContext<AttaContextType | undefined>(undefined);

export const AttaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Storage Hydration with In-Memory Fallbacks
  const [baseCurrency, setBaseCurrencyState] = useState<BaseCurrencyCode>(() =>
    getFromStorage<BaseCurrencyCode>('baseCurrency', 'VUSD')
  );

  const [wallet, setWallet] = useState<WalletState>(() =>
    getFromStorage<WalletState>('wallet', {
      baseCurrency: 'VUSD',
      balanceInBaseCurrency: DEFAULT_INITIAL_BALANCE_USD,
      initialBalanceUSD: DEFAULT_INITIAL_BALANCE_USD,
      totalTopUpUSD: 0,
      realizedPnlUSD: 0,
    })
  );

  const [uiMode, setUiModeState] = useState<UIMode>(() =>
    getFromStorage<UIMode>('uiMode', 'lite')
  );

  const [marketArena, setMarketArenaState] = useState<MarketArena>(() =>
    getFromStorage<MarketArena>('marketArena', 'crypto')
  );

  const [selectedSymbol, setSelectedSymbolState] = useState<SymbolInfo>(() =>
    getFromStorage<SymbolInfo>('selectedSymbol', CRYPTO_SYMBOLS[0])
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

  const [topUpHistory, setTopUpHistory] = useState<TopUpRecord[]>(() =>
    getFromStorage<TopUpRecord[]>('topUpHistory', [])
  );

  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>(() =>
    getFromStorage<PriceAlert[]>('priceAlerts', [])
  );

  const [livePrices, setLivePrices] = useState<Record<string, number>>({});

  // 2. Persist states
  useEffect(() => saveToStorage('baseCurrency', baseCurrency), [baseCurrency]);
  useEffect(() => saveToStorage('wallet', wallet), [wallet]);
  useEffect(() => saveToStorage('uiMode', uiMode), [uiMode]);
  useEffect(() => saveToStorage('marketArena', marketArena), [marketArena]);
  useEffect(() => saveToStorage('selectedSymbol', selectedSymbol), [selectedSymbol]);
  useEffect(() => saveToStorage('positions', positions), [positions]);
  useEffect(() => saveToStorage('limitOrders', limitOrders), [limitOrders]);
  useEffect(() => saveToStorage('tradeHistory', tradeHistory), [tradeHistory]);
  useEffect(() => saveToStorage('topUpHistory', topUpHistory), [topUpHistory]);
  useEffect(() => saveToStorage('priceAlerts', priceAlerts), [priceAlerts]);

  // Handle Base Currency Switching
  const setBaseCurrency = useCallback(
    (newCurrency: BaseCurrencyCode) => {
      if (newCurrency === baseCurrency) return;
      setBaseCurrencyState(newCurrency);

      // Convert available wallet balance to new base currency
      setWallet((prev) => {
        const newBalance = convertCurrency(prev.balanceInBaseCurrency, prev.baseCurrency, newCurrency);
        return {
          ...prev,
          baseCurrency: newCurrency,
          balanceInBaseCurrency: newBalance,
        };
      });
    },
    [baseCurrency]
  );

  const setUiMode = useCallback((mode: UIMode) => setUiModeState(mode), []);
  
  const setMarketArena = useCallback((arena: MarketArena) => {
    setMarketArenaState(arena);
    if (arena === 'crypto' && selectedSymbol.type !== 'crypto') {
      setSelectedSymbolState(CRYPTO_SYMBOLS[0]);
    } else if (arena === 'forex' && selectedSymbol.type !== 'forex') {
      setSelectedSymbolState(FOREX_SYMBOLS[0]);
    }
  }, [selectedSymbol.type]);

  const setSelectedSymbol = useCallback((symbol: SymbolInfo) => {
    setSelectedSymbolState(symbol);
    setMarketArenaState(symbol.type);
  }, []);

  // 3. Dynamic Pub/Sub Price Feeds
  useEffect(() => {
    const symbolsToSub = new Set<string>([
      selectedSymbol.symbol,
      ...positions.map((p) => p.symbol),
      ...limitOrders.map((l) => l.symbol),
    ]);

    const unsubscribes: (() => void)[] = [];

    symbolsToSub.forEach((sym) => {
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

  // 4. Liquidation Price Calculator
  const calculateLiquidationPrice = (side: OrderSide, entryPrice: number, leverage: number): number => {
    const maintenanceMarginRatio = 0.005; // 0.5%
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
      marginInBaseCurrency,
      leverage,
      entryPrice,
      targetPrice,
      forexLotType = 'standard',
      forexLots = 1,
      takeProfit,
      stopLoss,
    }: {
      symbolInfo: SymbolInfo;
      side: OrderSide;
      orderType: OrderType;
      marginInBaseCurrency: number;
      leverage: number;
      entryPrice: number;
      targetPrice?: number;
      forexLotType?: ForexLotType;
      forexLots?: number;
      takeProfit?: number;
      stopLoss?: number;
    }) => {
      if (marginInBaseCurrency <= 0) return { success: false, message: 'Margin must be greater than 0.' };
      if (marginInBaseCurrency > wallet.balanceInBaseCurrency)
        return { success: false, message: `Insufficient ${baseCurrency} balance for this margin.` };

      // Deduct margin from wallet
      setWallet((prev) => ({ ...prev, balanceInBaseCurrency: prev.balanceInBaseCurrency - marginInBaseCurrency }));

      const effectivePrice = orderType === 'limit' && targetPrice ? targetPrice : entryPrice;
      const marginInUSD = convertToUSD(marginInBaseCurrency, baseCurrency);

      let quantity = 0;
      if (symbolInfo.type === 'forex') {
        const multiplier = forexLotType === 'standard' ? 100000 : forexLotType === 'mini' ? 10000 : 1000;
        quantity = forexLots * multiplier;
      } else {
        const notionalUSD = marginInUSD * leverage;
        quantity = notionalUSD / effectivePrice;
      }

      const liquidationPrice = calculateLiquidationPrice(side, effectivePrice, leverage);

      if (orderType === 'limit' && targetPrice) {
        const newLimitOrder: LimitOrder = {
          id: `ord_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          symbol: symbolInfo.symbol,
          symbolInfo,
          side,
          targetPrice,
          quantity,
          forexLotType,
          forexLots,
          marginInBaseCurrency,
          marginInUSD,
          leverage,
          takeProfit,
          stopLoss,
          createdAt: Date.now(),
          status: 'pending',
        };
        setLimitOrders((prev) => [newLimitOrder, ...prev]);
        return { success: true, message: `Limit order placed at ${targetPrice}` };
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
          forexLotType,
          forexLots,
          marginInBaseCurrency,
          marginInUSD,
          leverage,
          takeProfit,
          stopLoss,
          liquidationPrice,
          floatingPnlInBaseCurrency: 0,
          floatingPnlInUSD: 0,
          floatingPnlPercentage: 0,
          openedAt: Date.now(),
        };
        setPositions((prev) => [newPosition, ...prev]);
        return { success: true, message: `Opened ${side.toUpperCase()} ${symbolInfo.name} position` };
      }
    },
    [baseCurrency, wallet.balanceInBaseCurrency]
  );

  // 6. Close Position
  const closePosition = useCallback(
    (positionId: string, reason: 'manual' | 'tp' | 'sl' | 'liquidation' | 'margin_call' = 'manual') => {
      setPositions((prevPositions) => {
        const pos = prevPositions.find((p) => p.id === positionId);
        if (!pos) return prevPositions;

        const currentMarketPrice = livePrices[pos.symbol] || pos.currentPrice;

        let pnlUSD = 0;
        if (pos.symbolInfo.type === 'forex') {
          const pipSize = pos.symbolInfo.pipSize || 0.0001;
          const pips = pos.side === 'buy' ? (currentMarketPrice - pos.entryPrice) / pipSize : (pos.entryPrice - currentMarketPrice) / pipSize;
          const pipValueUSD = (pos.quantity * pipSize);
          pnlUSD = pips * pipValueUSD;
        } else {
          pnlUSD = pos.side === 'buy' ? (currentMarketPrice - pos.entryPrice) * pos.quantity : (pos.entryPrice - currentMarketPrice) * pos.quantity;
        }

        if (reason === 'liquidation' || reason === 'margin_call') {
          pnlUSD = -pos.marginInUSD;
        }

        const pnlInBaseCurrency = convertFromUSD(pnlUSD, baseCurrency);
        const returnedMargin = Math.max(0, pos.marginInBaseCurrency + pnlInBaseCurrency);

        // Update Wallet
        setWallet((prev) => ({
          ...prev,
          balanceInBaseCurrency: prev.balanceInBaseCurrency + returnedMargin,
          realizedPnlUSD: prev.realizedPnlUSD + pnlUSD,
        }));

        // Log History
        const historyItem: TradeHistoryItem = {
          id: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          positionId: pos.id,
          symbol: pos.symbol,
          side: pos.side,
          entryPrice: pos.entryPrice,
          closePrice: currentMarketPrice,
          quantity: pos.quantity,
          forexLots: pos.forexLots,
          marginInBaseCurrency: pos.marginInBaseCurrency,
          leverage: pos.leverage,
          realizedPnlInBaseCurrency: pnlInBaseCurrency,
          realizedPnlInUSD: pnlUSD,
          pnlPercentage: (pnlInBaseCurrency / pos.marginInBaseCurrency) * 100,
          closedAt: Date.now(),
          reason,
        };

        setTradeHistory((prev) => [historyItem, ...prev]);

        if (pnlUSD > 50) {
          try { confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } }); } catch (e) {}
        }

        return prevPositions.filter((p) => p.id !== positionId);
      });
    },
    [baseCurrency, livePrices]
  );

  // 7. Cancel Limit Order
  const cancelLimitOrder = useCallback((orderId: string) => {
    setLimitOrders((prev) => {
      const order = prev.find((o) => o.id === orderId);
      if (order) {
        setWallet((w) => ({ ...w, balanceInBaseCurrency: w.balanceInBaseCurrency + order.marginInBaseCurrency }));
      }
      return prev.filter((o) => o.id !== orderId);
    });
  }, []);

  // 8. Top Up Account (Supports up to $1,000,000 USD equivalent in any base currency)
  const topUpAccount = useCallback(
    (amountInBaseCurrency: number, note: string = 'AttaTrader Balance Top Up') => {
      const amountInUSD = convertToUSD(amountInBaseCurrency, baseCurrency);

      if (isNaN(amountInBaseCurrency) || amountInBaseCurrency <= 0 || amountInUSD > 1000000) {
        return {
          success: false,
          message: 'Top Up amount must be greater than 0 and up to $1,000,000 USD equivalent.',
        };
      }

      setWallet((prev) => ({
        ...prev,
        balanceInBaseCurrency: prev.balanceInBaseCurrency + amountInBaseCurrency,
        totalTopUpUSD: prev.totalTopUpUSD + amountInUSD,
      }));

      const record: TopUpRecord = {
        id: `topup_${Date.now()}`,
        amountInBaseCurrency,
        baseCurrency,
        amountInUSD,
        timestamp: Date.now(),
        note,
      };

      setTopUpHistory((prev) => [record, ...prev]);

      try { confetti({ particleCount: 80, spread: 90, origin: { y: 0.6 } }); } catch (e) {}

      return {
        success: true,
        message: `Added +${amountInBaseCurrency.toLocaleString()} ${baseCurrency} to account!`,
      };
    },
    [baseCurrency]
  );

  // 9. Reset Account
  const resetAccount = useCallback(() => {
    clearAllStorage();
    setBaseCurrencyState('VUSD');
    setWallet({
      baseCurrency: 'VUSD',
      balanceInBaseCurrency: DEFAULT_INITIAL_BALANCE_USD,
      initialBalanceUSD: DEFAULT_INITIAL_BALANCE_USD,
      totalTopUpUSD: 0,
      realizedPnlUSD: 0,
    });
    setPositions([]);
    setLimitOrders([]);
    setTradeHistory([]);
    setTopUpHistory([]);
    setPriceAlerts([]);
    setUiModeState('lite');
    setMarketArenaState('crypto');
    setSelectedSymbolState(CRYPTO_SYMBOLS[0]);
  }, []);

  // 10. Price Alerts Management
  const addPriceAlert = useCallback((symbol: string, targetPrice: number, condition: 'above' | 'below') => {
    const alert: PriceAlert = {
      id: `alert_${Date.now()}`,
      symbol,
      targetPrice,
      condition,
      active: true,
      createdAt: Date.now(),
    };
    setPriceAlerts((prev) => [alert, ...prev]);
  }, []);

  const removePriceAlert = useCallback((id: string) => {
    setPriceAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  // 11. Real-Time PnL & Cross-Currency Calculations
  const updatedPositions = positions.map((pos) => {
    const currentPrice = livePrices[pos.symbol] || pos.entryPrice;
    let pnlUSD = 0;
    let pipsPnl = 0;

    if (pos.symbolInfo.type === 'forex') {
      const pipSize = pos.symbolInfo.pipSize || 0.0001;
      pipsPnl = pos.side === 'buy' ? (currentPrice - pos.entryPrice) / pipSize : (pos.entryPrice - currentPrice) / pipSize;
      const pipValueUSD = pos.quantity * pipSize;
      pnlUSD = pipsPnl * pipValueUSD;
    } else {
      pnlUSD = pos.side === 'buy' ? (currentPrice - pos.entryPrice) * pos.quantity : (pos.entryPrice - currentPrice) * pos.quantity;
    }

    const floatingPnlInBaseCurrency = convertFromUSD(pnlUSD, baseCurrency);
    const pnlPercentage = (floatingPnlInBaseCurrency / pos.marginInBaseCurrency) * 100;

    return {
      ...pos,
      currentPrice,
      floatingPnlInUSD: pnlUSD,
      floatingPnlInBaseCurrency,
      floatingPnlPercentage: pnlPercentage,
      pipsPnl,
    };
  });

  const totalUnrealizedPnlInBaseCurrency = updatedPositions.reduce((acc, p) => acc + p.floatingPnlInBaseCurrency, 0);
  const usedMarginInBaseCurrency = positions.reduce((acc, p) => acc + p.marginInBaseCurrency, 0) + limitOrders.reduce((acc, l) => acc + l.marginInBaseCurrency, 0);
  const freeMarginInBaseCurrency = wallet.balanceInBaseCurrency;
  const totalEquityInBaseCurrency = wallet.balanceInBaseCurrency + usedMarginInBaseCurrency + totalUnrealizedPnlInBaseCurrency;

  // Margin Call Level (%) = (Total Equity / Used Margin) * 100
  const marginLevelPercentage = usedMarginInBaseCurrency > 0 ? (totalEquityInBaseCurrency / usedMarginInBaseCurrency) * 100 : 999;
  const isMarginCallWarning = marginLevelPercentage < 100 && usedMarginInBaseCurrency > 0;

  // Automated Margin Call Liquidation check (<= 50%)
  useEffect(() => {
    if (usedMarginInBaseCurrency > 0 && marginLevelPercentage <= 50 && positions.length > 0) {
      // Find worst performing position and liquidate it automatically
      const worstPosition = [...updatedPositions].sort((a, b) => a.floatingPnlInBaseCurrency - b.floatingPnlInBaseCurrency)[0];
      if (worstPosition) {
        closePosition(worstPosition.id, 'margin_call');
      }
    }
  }, [marginLevelPercentage, usedMarginInBaseCurrency, positions.length, updatedPositions, closePosition]);

  // Automated TP / SL triggers
  useEffect(() => {
    positions.forEach((pos) => {
      const currentPrice = livePrices[pos.symbol];
      if (!currentPrice) return;

      if ((pos.side === 'buy' && currentPrice <= pos.liquidationPrice) || (pos.side === 'sell' && currentPrice >= pos.liquidationPrice)) {
        closePosition(pos.id, 'liquidation');
        return;
      }

      if (pos.takeProfit) {
        if ((pos.side === 'buy' && currentPrice >= pos.takeProfit) || (pos.side === 'sell' && currentPrice <= pos.takeProfit)) {
          closePosition(pos.id, 'tp');
          return;
        }
      }

      if (pos.stopLoss) {
        if ((pos.side === 'buy' && currentPrice <= pos.stopLoss) || (pos.side === 'sell' && currentPrice >= pos.stopLoss)) {
          closePosition(pos.id, 'sl');
          return;
        }
      }
    });
  }, [livePrices, positions, closePosition]);

  // Automated Price Alert evaluation
  useEffect(() => {
    priceAlerts.forEach((alert) => {
      if (!alert.active) return;
      const currentPrice = livePrices[alert.symbol];
      if (!currentPrice) return;

      const isTriggered = alert.condition === 'above' ? currentPrice >= alert.targetPrice : currentPrice <= alert.targetPrice;
      if (isTriggered) {
        // Mark alert triggered
        setPriceAlerts((prev) => prev.map((a) => (a.id === alert.id ? { ...a, active: false, triggeredAt: Date.now() } : a)));
        try {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`AttaTrader Price Alert: ${alert.symbol}`, {
              body: `${alert.symbol} hit target price of ${alert.targetPrice}!`,
            });
          }
        } catch (e) {}
      }
    });
  }, [livePrices, priceAlerts]);

  return (
    <AttaContext.Provider
      value={{
        wallet,
        baseCurrency,
        setBaseCurrency,
        uiMode,
        setUiMode,
        marketArena,
        setMarketArena,
        selectedSymbol,
        setSelectedSymbol,
        positions: updatedPositions,
        limitOrders,
        tradeHistory,
        topUpHistory,
        priceAlerts,
        livePrices,
        openPosition,
        closePosition,
        cancelLimitOrder,
        topUpAccount,
        resetAccount,
        addPriceAlert,
        removePriceAlert,
        totalEquityInBaseCurrency,
        totalUnrealizedPnlInBaseCurrency,
        usedMarginInBaseCurrency,
        freeMarginInBaseCurrency,
        marginLevelPercentage,
        isMarginCallWarning,
      }}
    >
      {children}
    </AttaContext.Provider>
  );
};

export const useAtta = (): AttaContextType => {
  const context = useContext(AttaContext);
  if (!context) {
    throw new Error('useAtta must be used within an AttaProvider');
  }
  return context;
};

// Backward compatibility alias hook
export const useVST = useAtta;
