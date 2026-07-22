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

export type TournamentDurationOption = '30m' | '1h' | '12h' | '24h';

export const getDurationSeconds = (option: TournamentDurationOption): number => {
  switch (option) {
    case '30m': return 1800;
    case '1h': return 3600;
    case '12h': return 43200;
    case '24h': return 86400;
    default: return 86400;
  }
};

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

  // Tiered Auth Hierarchy State
  userProfile: UserProfile;
  loginEmail: (email: string, displayName?: string) => void;
  loginGoogle: (displayName?: string, email?: string) => void;
  logoutUser: () => void;
  updateDisplayName: (name: string) => void;

  // Settings & Secret Redeem Engine
  settings: SettingsState;
  updateSettings: (newSettings: Partial<SettingsState>) => void;
  redeemSecretCode: (code: string) => { success: boolean; message: string };

  // Tournament & Leaderboard
  isWeekendTournamentActive: boolean;
  tournamentEquityUSD: number;
  leaderboard: LeaderboardEntry[];
  tournamentTimeRemaining: string;
  tournamentSecondsLeft: number;
  showCelebrationModal: boolean;
  setShowCelebrationModal: (show: boolean) => void;
  showDevConfigModal: boolean;
  setShowDevConfigModal: (show: boolean) => void;
  changeTournamentDuration: (duration: TournamentDurationOption) => void;
  setDevModeActive: (active: boolean) => void;

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

  closePosition: (positionId: string, reason?: 'manual' | 'tp' | 'sl' | 'liquidation' | 'margin_call' | 'auto_win') => void;
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
  // 1. User Profile & Auth
  const [userProfile, setUserProfile] = useState<UserProfile>(() =>
    getFromStorage<UserProfile>('userProfile', {
      id: `usr_guest_${Math.random().toString(36).substr(2, 6)}`,
      displayName: 'Guest Trader',
      authType: 'GUEST',
    })
  );

  // 2. Settings & Redeem Toggles State
  const [settings, setSettings] = useState<SettingsState>(() =>
    getFromStorage<SettingsState>('settings', {
      devModeBypass: false,
      riskRule2Percent: false,
      audioSignals: true,
      defaultChartStyle: 'candles',
      defaultForexLeverage: 100,
      tournamentDuration: '24h',
      isFreePnLMode: false,
      isZeroSpreadMode: false,
      isGodLeverageMode: false,
    })
  );

  // 3. Wallet & Base Currency
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

  // Persist states
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

  const updateSettings = useCallback((newSettings: Partial<SettingsState>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  // Multi-Type Redeem Code Engine Integration
  const redeemSecretCode = useCallback(
    (inputCode: string): { success: boolean; message: string } => {
      const code = inputCode.trim();

      // 1. Secret Developer Key: @thA1337
      if (code === '@thA1337') {
        let isToggledOn = false;
        setSettings((prev) => {
          isToggledOn = !prev.devModeBypass;
          return { ...prev, devModeBypass: isToggledOn };
        });
        if (!settings.devModeBypass) {
          setShowDevConfigModal(true);
        }
        try { confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } }); } catch (e) {}
        return {
          success: true,
          message: !settings.devModeBypass
            ? '🎉 Developer Verification Mode: ACTIVATED (Tournament Unlocked)'
            : 'Developer Verification Mode: DEACTIVATED (Tournament Locked)',
        };
      }

      // 2. TYPE A: Infinite-Use Instant Top-Up: AttaGacor (+$10,000,000 USD)
      if (code === 'AttaGacor') {
        const topUpBase = convertFromUSD(10000000, baseCurrency);
        setWallet((prev) => ({
          ...prev,
          balanceInBaseCurrency: prev.balanceInBaseCurrency + topUpBase,
          totalTopUpUSD: prev.totalTopUpUSD + 10000000,
        }));
        try { confetti({ particleCount: 120, spread: 90, origin: { y: 0.5 } }); } catch (e) {}
        return {
          success: true,
          message: `🚀 AttaGacor Redeemed! Added +${topUpBase.toLocaleString()} ${baseCurrency} (+$10M USD)!`,
        };
      }

      // 3. TYPE A: Infinite-Use Instant Top-Up: AttaGacorKang (+$1,000,000,000 USD)
      if (code === 'AttaGacorKang') {
        const topUpBase = convertFromUSD(1000000000, baseCurrency);
        setWallet((prev) => ({
          ...prev,
          balanceInBaseCurrency: prev.balanceInBaseCurrency + topUpBase,
          totalTopUpUSD: prev.totalTopUpUSD + 1000000000,
        }));
        try { confetti({ particleCount: 180, spread: 100, origin: { y: 0.5 } }); } catch (e) {}
        return {
          success: true,
          message: `👑 AttaGacorKang Redeemed! Added +${topUpBase.toLocaleString()} ${baseCurrency} (+$1 Billion USD)!`,
        };
      }

      // 4. TYPE A: Infinite-Use Instant Top-Up: AttaWhale (+$50,000,000 USD)
      if (code === 'AttaWhale') {
        const topUpBase = convertFromUSD(50000000, baseCurrency);
        setWallet((prev) => ({
          ...prev,
          balanceInBaseCurrency: prev.balanceInBaseCurrency + topUpBase,
          totalTopUpUSD: prev.totalTopUpUSD + 50000000,
        }));
        try { confetti({ particleCount: 140, spread: 90, origin: { y: 0.5 } }); } catch (e) {}
        return {
          success: true,
          message: `🐋 AttaWhale Redeemed! Added +${topUpBase.toLocaleString()} ${baseCurrency} (+$50M USD)!`,
        };
      }

      // 5. TYPE B: Persistent State Toggle: AttaFreePnL
      if (code === 'AttaFreePnL') {
        setSettings((prev) => {
          const nextState = !prev.isFreePnLMode;
          return { ...prev, isFreePnLMode: nextState };
        });
        const active = !settings.isFreePnLMode;
        return {
          success: true,
          message: active ? '✨ Mode Free PnL: AKTIF (Floating PnL Always Positive +)' : 'Mode Free PnL: NON-AKTIF',
        };
      }

      // 6. TYPE B: Persistent State Toggle: AttaZeroSpread
      if (code === 'AttaZeroSpread') {
        setSettings((prev) => ({ ...prev, isZeroSpreadMode: !prev.isZeroSpreadMode }));
        const active = !settings.isZeroSpreadMode;
        return {
          success: true,
          message: active ? '⚡ Mode Zero Spread: AKTIF (0.0 Pips Forex Spread)' : 'Mode Zero Spread: NON-AKTIF',
        };
      }

      // 7. TYPE B: Persistent State Toggle: AttaGodLeverage
      if (code === 'AttaGodLeverage') {
        setSettings((prev) => ({ ...prev, isGodLeverageMode: !prev.isGodLeverageMode }));
        const active = !settings.isGodLeverageMode;
        return {
          success: true,
          message: active ? '⚡ Mode God Leverage (1:1000): AKTIF' : 'Mode God Leverage: NON-AKTIF',
        };
      }

      // 8. TYPE B: Instant Action Code: AttaAutoWin
      if (code === 'AttaAutoWin') {
        if (positions.length === 0) {
          return { success: false, message: 'AttaAutoWin: No open positions to close.' };
        }
        let totalProfitBase = 0;
        positions.forEach((pos) => {
          const profitBase = Math.abs(pos.floatingPnlInBaseCurrency) || 50;
          totalProfitBase += (pos.marginInBaseCurrency + profitBase);
          setTradeHistory((prev) => [
            {
              id: `win_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
              positionId: pos.id,
              symbol: pos.symbol,
              side: pos.side,
              entryPrice: pos.entryPrice,
              closePrice: pos.currentPrice,
              quantity: pos.quantity,
              forexLots: pos.forexLots,
              marginInBaseCurrency: pos.marginInBaseCurrency,
              leverage: pos.leverage,
              realizedPnlInBaseCurrency: profitBase,
              realizedPnlInUSD: convertToUSD(profitBase, baseCurrency),
              pnlPercentage: (profitBase / pos.marginInBaseCurrency) * 100,
              closedAt: Date.now(),
              reason: 'auto_win',
            },
            ...prev,
          ]);
        });

        setPositions([]);
        setWallet((prev) => ({ ...prev, balanceInBaseCurrency: prev.balanceInBaseCurrency + totalProfitBase }));
        try { confetti({ particleCount: 150, spread: 90, origin: { y: 0.5 } }); } catch (e) {}
        return {
          success: true,
          message: '🚀 AttaAutoWin: Closed all active positions in 100% Profit!',
        };
      }

      // 9. TYPE B: Instant Multi-Execution Code: AttaTrade-
      if (code === 'AttaTrade-') {
        const catalog = marketArena === 'crypto' ? CRYPTO_SYMBOLS : FOREX_SYMBOLS;
        let count = 0;

        for (let i = 0; i < 5; i++) {
          const randomSymbol = catalog[Math.floor(Math.random() * catalog.length)];
          const randomSide: OrderSide = Math.random() > 0.5 ? 'buy' : 'sell';
          const randomPrice = livePrices[randomSymbol.symbol] || randomSymbol.basePrice;
          const marginBase = Math.max(50, Math.floor(wallet.balanceInBaseCurrency * 0.05));
          const leverage = marketArena === 'forex' ? 100 : 10;
          const marginUSD = convertToUSD(marginBase, baseCurrency);

          let quantity = 0;
          if (marketArena === 'forex') {
            quantity = 0.1 * 100000;
          } else {
            quantity = (marginUSD * leverage) / randomPrice;
          }

          const liquidationPrice = randomSide === 'buy' ? randomPrice * 0.9 : randomPrice * 1.1;

          const newPosition: Position = {
            id: `auto_pos_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 4)}`,
            symbol: randomSymbol.symbol,
            symbolInfo: randomSymbol,
            side: randomSide,
            orderType: 'market',
            entryPrice: randomPrice,
            currentPrice: randomPrice,
            quantity,
            forexLotType: marketArena === 'forex' ? 'standard' : undefined,
            forexLots: marketArena === 'forex' ? 0.1 : undefined,
            marginInBaseCurrency: marginBase,
            marginInUSD: marginUSD,
            leverage,
            liquidationPrice,
            floatingPnlInBaseCurrency: 0,
            floatingPnlInUSD: 0,
            floatingPnlPercentage: 0,
            openedAt: Date.now(),
          };

          setPositions((prev) => [newPosition, ...prev]);
          count++;
        }

        setWallet((prev) => ({
          ...prev,
          balanceInBaseCurrency: Math.max(0, prev.balanceInBaseCurrency - Math.max(250, wallet.balanceInBaseCurrency * 0.25)),
        }));

        try { confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } }); } catch (e) {}
        return {
          success: true,
          message: `⚡ AttaTrade- Executed! Opened 5 concurrent random ${marketArena.toUpperCase()} positions!`,
        };
      }

      return {
        success: false,
        message: 'Invalid redeem code. Please check spelling.',
      };
    },
    [baseCurrency, marketArena, livePrices, positions, wallet.balanceInBaseCurrency, settings.isFreePnLMode, settings.isZeroSpreadMode, settings.isGodLeverageMode]
  );

  // Tournament Engine Accessibility (Controlled 100% via Secret Verification Key Toggle)
  const isWeekendTournamentActive = settings.devModeBypass;

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
        // Fallback Storage-Driven State Sync for Mobile Throttling (Chrome 150+ / OPPO ColorOS 16.0.5)
        if (typeof window !== 'undefined') {
          if (!(window as any).lastPriceTick) (window as any).lastPriceTick = {};
          (window as any).lastPriceTick[symbolKey] = price;
          (window as any).lastPriceTickTimestamp = Date.now();
        }

        // Intercept OS background/power-saving state throttling via requestAnimationFrame
        if (typeof requestAnimationFrame !== 'undefined') {
          requestAnimationFrame(() => {
            setLivePrices((prev) => {
              if (prev[symbolKey] === price) return prev;
              return { ...prev, [symbolKey]: price };
            });
          });
        } else {
          setLivePrices((prev) => ({ ...prev, [symbolKey]: price }));
        }
      });
      unsubscribes.push(unsub);
    });

    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  }, [selectedSymbol.symbol, positions.length, limitOrders.length]);

  // Mobile Keep-Alive Heartbeat: Force-syncs livePrices from window.lastPriceTick snapshot if OS throttles React state
  useEffect(() => {
    let animFrameId: number;
    let lastCheckedTimestamp = 0;

    const checkGlobalTickSync = () => {
      if (typeof window !== 'undefined' && (window as any).lastPriceTick) {
        const globalTicks = (window as any).lastPriceTick as Record<string, number>;
        const globalTimestamp = ((window as any).lastPriceTickTimestamp as number) || 0;

        if (globalTimestamp > lastCheckedTimestamp) {
          lastCheckedTimestamp = globalTimestamp;
          setLivePrices((prev) => {
            let hasChanged = false;
            const updated = { ...prev };
            for (const sym in globalTicks) {
              if (updated[sym] !== globalTicks[sym]) {
                updated[sym] = globalTicks[sym];
                hasChanged = true;
              }
            }
            return hasChanged ? updated : prev;
          });
        }
      }
      animFrameId = requestAnimationFrame(checkGlobalTickSync);
    };

    animFrameId = requestAnimationFrame(checkGlobalTickSync);
    return () => cancelAnimationFrame(animFrameId);
  }, []);

  // Liquidation Price helper
  const calculateLiquidationPrice = (side: OrderSide, entryPrice: number, leverage: number): number => {
    const maintenanceMarginRatio = 0.005;
    if (side === 'buy') {
      return entryPrice * (1 - 1 / leverage + maintenanceMarginRatio);
    } else {
      return entryPrice * (1 + 1 / leverage - maintenanceMarginRatio);
    }
  };

  // Open Position
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
      if (settings.riskRule2Percent) {
        const maxMarginAllowed = wallet.balanceInBaseCurrency * 0.02;
        if (marginInBaseCurrency > maxMarginAllowed) {
          return {
            success: false,
            message: `Risk Management Rule Active: Max margin restricted to 2% (${maxMarginAllowed.toFixed(2)} ${baseCurrency}).`,
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
    (positionId: string, reason: 'manual' | 'tp' | 'sl' | 'liquidation' | 'margin_call' | 'auto_win' = 'manual') => {
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

        // Intercept for Free PnL Mode
        if (settings.isFreePnLMode) {
          pnlUSD = Math.abs(pnlUSD) || 10;
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
    [baseCurrency, livePrices, settings.audioSignals, settings.isFreePnLMode]
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

      if (isNaN(amountInBaseCurrency) || amountInBaseCurrency <= 0) {
        return {
          success: false,
          message: 'Top Up amount must be greater than 0.',
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

  // Prominent Reset Account - Completely Wipes All Positions, Trade History, Alerts, and Restores Pristine Default Equity
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

  // Operational Lifespan Countdown Timer & Dev Config Overlay State
  const currentDurationOption: TournamentDurationOption = settings.tournamentDuration || '24h';
  const [tournamentSecondsLeft, setTournamentSecondsLeft] = useState<number>(() =>
    getDurationSeconds(currentDurationOption)
  );
  const [showCelebrationModal, setShowCelebrationModal] = useState<boolean>(false);
  const [showDevConfigModal, setShowDevConfigModal] = useState<boolean>(false);

  const changeTournamentDuration = useCallback((duration: TournamentDurationOption) => {
    setSettings((prev) => ({ ...prev, tournamentDuration: duration }));
    const newSecs = getDurationSeconds(duration);
    setTournamentSecondsLeft(newSecs);
  }, []);

  const setDevModeActive = useCallback((active: boolean) => {
    setSettings((prev) => ({ ...prev, devModeBypass: active }));
    if (active) {
      setShowDevConfigModal(true);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTournamentSecondsLeft((prevSecs) => {
        if (prevSecs <= 1) {
          setShowCelebrationModal(true);
          return 0;
        }
        return prevSecs - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatSecondsToHMS = (totalSeconds: number): string => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
  };

  const tournamentTimeRemaining = formatSecondsToHMS(tournamentSecondsLeft);

  // Dynamic Tournament Bot Entries State & Micro-Interval Simulation Loop
  const [botLeaderboard, setBotLeaderboard] = useState<Array<{
    userId: string;
    displayName: string;
    authType: AuthStatus;
    totalEquityUSD: number;
  }>>([
    { userId: 'usr_pro1', displayName: 'CryptoWhale_X', authType: 'GOOGLE_USER', totalEquityUSD: 485.20 },
    { userId: 'usr_pro2', displayName: 'ForexMaster_ID', authType: 'EMAIL_USER', totalEquityUSD: 342.50 },
    { userId: 'usr_pro3', displayName: 'SatoshiAtha', authType: 'GOOGLE_USER', totalEquityUSD: 215.80 },
    { userId: 'usr_pro4', displayName: 'AlphaPip_99', authType: 'EMAIL_USER', totalEquityUSD: 98.40 },
    { userId: 'usr_pro5', displayName: 'BullishKing_ID', authType: 'EMAIL_USER', totalEquityUSD: 88.10 },
  ]);

  // Micro-interval loop to apply realistic floating variations to bot equity states every 3s
  useEffect(() => {
    const interval = setInterval(() => {
      setBotLeaderboard((prevBots) =>
        prevBots.map((bot) => {
          const delta = (Math.random() - 0.48) * 3.5;
          const newEquity = Math.max(10, +(bot.totalEquityUSD + delta).toFixed(2));
          return { ...bot, totalEquityUSD: newEquity };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Real-Time PnL & Dynamic Used Margin Calculation Interceptor (O(1) Fast-Path Access)
  const updatedPositions = positions.map((pos) => {
    const rawGlobalPrice = typeof window !== 'undefined' && (window as any).lastPriceTick?.[pos.symbol];
    const currentPrice = rawGlobalPrice || livePrices[pos.symbol] || pos.entryPrice;
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

    // Intercept for Free PnL Mode (AttaFreePnL)
    if (settings.isFreePnLMode && pnlUSD < 0) {
      pnlUSD = Math.abs(pnlUSD);
    }

    const floatingPnlInBaseCurrency = convertFromUSD(pnlUSD, baseCurrency);
    const pnlPercentage = pos.marginInBaseCurrency > 0 ? (floatingPnlInBaseCurrency / pos.marginInBaseCurrency) * 100 : 0;

    // Used Margin = (AssetPrice * PositionSize) / Leverage
    const dynamicMarginUSD = (currentPrice * pos.quantity) / pos.leverage;
    const dynamicMarginInBaseCurrency = convertFromUSD(dynamicMarginUSD, baseCurrency);

    return {
      ...pos,
      currentPrice,
      floatingPnlInUSD: pnlUSD,
      floatingPnlInBaseCurrency,
      floatingPnlPercentage: pnlPercentage,
      dynamicMarginInBaseCurrency,
      pipsPnl,
    };
  });

  const totalUnrealizedPnlInBaseCurrency = updatedPositions.reduce((acc, p) => acc + p.floatingPnlInBaseCurrency, 0);
  const usedMarginInBaseCurrency = updatedPositions.reduce((acc, p) => acc + (p.dynamicMarginInBaseCurrency || p.marginInBaseCurrency), 0) + limitOrders.reduce((acc, l) => acc + l.marginInBaseCurrency, 0);
  const freeMarginInBaseCurrency = wallet.balanceInBaseCurrency;
  const totalEquityInBaseCurrency = wallet.balanceInBaseCurrency + usedMarginInBaseCurrency + totalUnrealizedPnlInBaseCurrency;

  const marginLevelPercentage = usedMarginInBaseCurrency > 0 ? (totalEquityInBaseCurrency / usedMarginInBaseCurrency) * 100 : 999;
  const isMarginCallWarning = marginLevelPercentage < 100 && usedMarginInBaseCurrency > 0;

  const tournamentEquityUSD = 100 + convertToUSD(totalUnrealizedPnlInBaseCurrency, baseCurrency);

  // Social Leaderboard Generation with dynamic Bot Equities & Real-time User Placement
  const userLeaderboardEntry = {
    userId: userProfile.id,
    displayName: `${userProfile.displayName} (You)`,
    authType: userProfile.authType,
    totalEquityUSD: tournamentEquityUSD,
    isCurrentUser: true,
  };

  const allEntries: Array<{
    userId: string;
    displayName: string;
    authType: AuthStatus;
    totalEquityUSD: number;
    isCurrentUser?: boolean;
  }> = [...botLeaderboard, userLeaderboardEntry];

  const leaderboard: LeaderboardEntry[] = allEntries
    .sort((a, b) => b.totalEquityUSD - a.totalEquityUSD)
    .map((entry, idx) => ({
      rank: idx + 1,
      userId: entry.userId,
      displayName: entry.displayName,
      authType: entry.authType,
      totalEquityUSD: entry.totalEquityUSD,
      returnPercent: +((entry.totalEquityUSD - 100)).toFixed(1),
      isCurrentUser: entry.isCurrentUser,
    }));

  // Price Alert Trigger
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
        tournamentTimeRemaining,
        tournamentSecondsLeft,
        showCelebrationModal,
        setShowCelebrationModal,
        showDevConfigModal,
        setShowDevConfigModal,
        changeTournamentDuration,
        setDevModeActive,
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
