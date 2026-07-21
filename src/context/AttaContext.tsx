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
  AuthStatus,
  UserProfile,
  SettingsState,
  LeaderboardEntry,
} from '../types/trading';
import { BaseCurrencyCode, convertCurrency, convertFromUSD, convertToUSD } from '../services/fxRates';
import { getFromStorage, saveToStorage, clearAllStorage } from '../utils/storage';
import { getSymbolDetails, SUPPORTED_SYMBOLS, CRYPTO_SYMBOLS, FOREX_SYMBOLS } from '../services/symbols';
import { priceFeed } from '../services/priceFeed';
import { soundFx } from '../utils/audio';
import confetti from 'canvas-confetti';

const DEFAULT_INITIAL_BALANCE_USD = 10000;
const TOURNAMENT_BALANCE_USD = 100;

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

  // Execution Step 1: 3-Tier Auth Hierarchy State
  userProfile: UserProfile;
  loginEmail: (email: string, displayName?: string) => void;
  loginGoogle: (displayName?: string, email?: string) => void;
  logoutUser: () => void;
  updateDisplayName: (name: string) => void;

  // Execution Step 2: Settings & Secret Redeem (@thA1337)
  settings: SettingsState;
  updateSettings: (newSettings: Partial<SettingsState>) => void;
  redeemSecretCode: (code: string) => { success: boolean; message: string };

  // Execution Step 3: Tournament & Leaderboard
  isWeekendTournamentActive: boolean;
  tournamentEquityUSD: number;
  leaderboard: LeaderboardEntry[];

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
  // 1. User Profile & Tiered Auth Hydration
  const [userProfile, setUserProfile] = useState<UserProfile>(() =>
    getFromStorage<UserProfile>('userProfile', {
      id: `usr_guest_${Math.random().toString(36).substr(2, 6)}`,
      displayName: 'Guest Trader',
      authType: 'GUEST',
    })
  );

  // 2. Settings & Dev Mode Hydration
  const [settings, setSettings] = useState<SettingsState>(() =>
    getFromStorage<SettingsState>('settings', {
      devModeBypass: false,
      riskRule2Percent: false,
      audioSignals: true,
      defaultChartStyle: 'candles',
      defaultForexLeverage: 100,
    })
  );

  // 3. Wallet & Currency State
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

  // 4. Persistence Effect
  useEffect(() => saveToStorage('userProfile', userProfile), [userProfile]);
  useEffect(() => saveToStorage('settings', settings), [settings]);
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

  // Auth Tier Handlers
  const loginEmail = useCallback((email: string, displayName?: string) => {
    setUserProfile({
      id: `usr_${Math.random().toString(36).substr(2, 6)}`,
      displayName: displayName || email.split('@')[0] || 'Email Trader',
      email,
      authType: 'EMAIL_USER',
    });
  }, []);

  const loginGoogle = useCallback((displayName?: string, email?: string) => {
    setUserProfile({
      id: `usr_g_${Math.random().toString(36).substr(2, 6)}`,
      displayName: displayName || 'Google Trader',
      email: email || 'trader@gmail.com',
      authType: 'GOOGLE_USER',
    });
  }, []);

  const logoutUser = useCallback(() => {
    setUserProfile({
      id: `usr_guest_${Math.random().toString(36).substr(2, 6)}`,
      displayName: 'Guest Trader',
      authType: 'GUEST',
    });
  }, []);

  const updateDisplayName = useCallback((name: string) => {
    if (!name.trim()) return;
    setUserProfile((prev) => ({ ...prev, displayName: name.trim() }));
  }, []);

  // Settings & Secret Code Redeem (@thA1337)
  const updateSettings = useCallback((newSettings: Partial<SettingsState>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const redeemSecretCode = useCallback((code: string) => {
    if (code.trim() === '@thA1337') {
      setSettings((prev) => ({ ...prev, devModeBypass: true }));
      try { confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } }); } catch (e) {}
      return {
        success: true,
        message: '🎉 Secret Code @thA1337 Redeemed! Developer Mode Bypass Unlocked!',
      };
    }
    return {
      success: false,
      message: 'Invalid secret code. Please check case-sensitivity (@thA1337).',
    };
  }, []);

  // Weekend Tournament Calendar Evaluation
  const todayDay = new Date().getDay();
  const isWeekendCalendar = todayDay === 0 || todayDay === 6; // Sunday = 0, Saturday = 6
  const isWeekendTournamentActive = isWeekendCalendar || settings.devModeBypass;

  // Base Currency Switcher
  const setBaseCurrency = useCallback(
    (newCurrency: BaseCurrencyCode) => {
      if (newCurrency === baseCurrency) return;
      setBaseCurrencyState(newCurrency);

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

  // Price Feed Subscription
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

  // Liquidation Price helper
  const calculateLiquidationPrice = (side: OrderSide, entryPrice: number, leverage: number): number => {
    const maintenanceMarginRatio = 0.005;
    if (side === 'buy') {
      return entryPrice * (1 - 1 / leverage + maintenanceMarginRatio);
    } else {
      return entryPrice * (1 + 1 / leverage - maintenanceMarginRatio);
    }
  };

  // Open Position or Create Limit Order
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
      // 2% Risk Limit Rule check if enabled
      if (settings.riskRule2Percent) {
        const maxMarginAllowed = wallet.balanceInBaseCurrency * 0.02;
        if (marginInBaseCurrency > maxMarginAllowed) {
          return {
            success: false,
            message: `Risk Management Rule Active: Max margin per trade is restricted to 2% (${maxMarginAllowed.toFixed(2)} ${baseCurrency}).`,
          };
        }
      }

      if (marginInBaseCurrency <= 0) return { success: false, message: 'Margin must be greater than 0.' };
      if (marginInBaseCurrency > wallet.balanceInBaseCurrency)
        return { success: false, message: `Insufficient ${baseCurrency} balance for this margin.` };

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
        if (settings.audioSignals) soundFx.playOrderFilledSound();
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
        if (settings.audioSignals) soundFx.playOrderFilledSound();
        return { success: true, message: `Opened ${side.toUpperCase()} ${symbolInfo.name} position` };
      }
    },
    [baseCurrency, wallet.balanceInBaseCurrency, settings.riskRule2Percent, settings.audioSignals]
  );

  // Close Position
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
          const pipValueUSD = pos.quantity * pipSize;
          pnlUSD = pips * pipValueUSD;
        } else {
          pnlUSD = pos.side === 'buy' ? (currentMarketPrice - pos.entryPrice) * pos.quantity : (pos.entryPrice - currentMarketPrice) * pos.quantity;
        }

        if (reason === 'liquidation' || reason === 'margin_call') {
          pnlUSD = -pos.marginInUSD;
        }

        const pnlInBaseCurrency = convertFromUSD(pnlUSD, baseCurrency);
        const returnedMargin = Math.max(0, pos.marginInBaseCurrency + pnlInBaseCurrency);

        setWallet((prev) => ({
          ...prev,
          balanceInBaseCurrency: prev.balanceInBaseCurrency + returnedMargin,
          realizedPnlUSD: prev.realizedPnlUSD + pnlUSD,
        }));

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

        if (settings.audioSignals) soundFx.playOrderFilledSound();
        if (pnlUSD > 50) {
          try { confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } }); } catch (e) {}
        }

        return prevPositions.filter((p) => p.id !== positionId);
      });
    },
    [baseCurrency, livePrices, settings.audioSignals]
  );

  // Cancel Limit Order
  const cancelLimitOrder = useCallback((orderId: string) => {
    setLimitOrders((prev) => {
      const order = prev.find((o) => o.id === orderId);
      if (order) {
        setWallet((w) => ({ ...w, balanceInBaseCurrency: w.balanceInBaseCurrency + order.marginInBaseCurrency }));
      }
      return prev.filter((o) => o.id !== orderId);
    });
  }, []);

  // Top Up Account
  const topUpAccount = useCallback(
    (amountInBaseCurrency: number, note: string = 'AttaTrader Capital Top Up') => {
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

  // Reset Account
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

  // Price Alerts
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

  // Real-Time PnL Calculation
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

  const marginLevelPercentage = usedMarginInBaseCurrency > 0 ? (totalEquityInBaseCurrency / usedMarginInBaseCurrency) * 100 : 999;
  const isMarginCallWarning = marginLevelPercentage < 100 && usedMarginInBaseCurrency > 0;

  const tournamentEquityUSD = 100 + convertToUSD(totalUnrealizedPnlInBaseCurrency, baseCurrency);

  // Social Leaderboard Generation
  const leaderboard: LeaderboardEntry[] = [
    { rank: 1, userId: 'usr_pro1', displayName: 'CryptoWhale_X', authType: 'GOOGLE_USER' as AuthStatus, totalEquityUSD: 485.20, returnPercent: 385.2 },
    { rank: 2, userId: 'usr_pro2', displayName: 'ForexMaster_ID', authType: 'EMAIL_USER' as AuthStatus, totalEquityUSD: 342.50, returnPercent: 242.5 },
    { rank: 3, userId: 'usr_pro3', displayName: 'SatoshiAtha', authType: 'GOOGLE_USER' as AuthStatus, totalEquityUSD: 215.80, returnPercent: 115.8 },
    { rank: 4, userId: userProfile.id, displayName: `${userProfile.displayName} (You)`, authType: userProfile.authType, totalEquityUSD: tournamentEquityUSD, returnPercent: (tournamentEquityUSD - 100), isCurrentUser: true },
    { rank: 5, userId: 'usr_pro4', displayName: 'AlphaPip_99', authType: 'EMAIL_USER' as AuthStatus, totalEquityUSD: 98.40, returnPercent: -1.6 },
  ].sort((a, b) => b.totalEquityUSD - a.totalEquityUSD).map((entry, idx) => ({ ...entry, rank: idx + 1 }));

  // Price Alert Trigger Notification
  useEffect(() => {
    priceAlerts.forEach((alert) => {
      if (!alert.active) return;
      const currentPrice = livePrices[alert.symbol];
      if (!currentPrice) return;

      const isTriggered = alert.condition === 'above' ? currentPrice >= alert.targetPrice : currentPrice <= alert.targetPrice;
      if (isTriggered) {
        setPriceAlerts((prev) => prev.map((a) => (a.id === alert.id ? { ...a, active: false, triggeredAt: Date.now() } : a)));
        if (settings.audioSignals) soundFx.playPriceAlertSound();
      }
    });
  }, [livePrices, priceAlerts, settings.audioSignals]);

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
        userProfile,
        loginEmail,
        loginGoogle,
        logoutUser,
        updateDisplayName,
        settings,
        updateSettings,
        redeemSecretCode,
        isWeekendTournamentActive,
        tournamentEquityUSD,
        leaderboard,
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

export const useVST = useAtta;
