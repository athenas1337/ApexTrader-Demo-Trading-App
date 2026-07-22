import { BaseCurrencyCode } from '../services/fxRates';

export type MarketArena = 'crypto' | 'forex';
export type UIMode = 'noob' | 'lite' | 'pro';
export type ForexLotType = 'standard' | 'mini' | 'micro';
export type ChartStyle = 'candles' | 'heikin_ashi' | 'line';
export type TimeFrame = '1m' | '5m' | '15m' | '1h' | '4h' | '1D' | '1W' | '1M';

export type AuthStatus = 'GUEST' | 'EMAIL_USER' | 'GOOGLE_USER';

export interface UserProfile {
  id: string;
  displayName: string;
  email?: string;
  authType: AuthStatus;
  avatarUrl?: string;
}

export interface SettingsState {
  devModeBypass: boolean;       // Developer Verification Engine Mode
  riskRule2Percent: boolean;    // 2% Capital Risk Limit Rule toggle
  audioSignals: boolean;        // Audio chimes for filled orders & price alarms
  defaultChartStyle: ChartStyle;
  defaultForexLeverage: number;
  tournamentDuration: '30m' | '1h' | '12h' | '24h'; // Configurable operational tournament lifespan
  
  // Redeem Code Toggles
  isFreePnLMode: boolean;       // Flips PnL to absolute positive profit (+ Math.abs) via AttaFreePnL
  isZeroSpreadMode: boolean;    // Eliminates Forex spreads via AttaZeroSpread
  isGodLeverageMode: boolean;   // Unlocks 1:1000 leverage via AttaGodLeverage
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  authType: AuthStatus;
  totalEquityUSD: number;
  returnPercent: number;
  isCurrentUser?: boolean;
}

export interface SymbolInfo {
  symbol: string;
  name: string;
  type: MarketArena;
  tvSymbol: string;
  basePrice: number;
  precision: number;
  category: string;
  description: string;
  quoteCurrency?: string;
  pipSize?: number;
  spreadPips?: number;
}

export type OrderSide = 'buy' | 'sell';
export type OrderType = 'market' | 'limit';

export interface Position {
  id: string;
  symbol: string;
  symbolInfo: SymbolInfo;
  side: OrderSide;
  orderType: OrderType;
  entryPrice: number;
  currentPrice: number;

  quantity: number;
  forexLotType?: ForexLotType;
  forexLots?: number;

  marginInBaseCurrency: number;
  marginInUSD: number;
  leverage: number;

  takeProfit?: number;
  stopLoss?: number;
  liquidationPrice: number;

  floatingPnlInBaseCurrency: number;
  floatingPnlInUSD: number;
  floatingPnlPercentage: number;
  dynamicMarginInBaseCurrency?: number;
  pipsPnl?: number;

  openedAt: number;
  closedAt?: number;
  closePrice?: number;
}

export interface LimitOrder {
  id: string;
  symbol: string;
  symbolInfo: SymbolInfo;
  side: OrderSide;
  targetPrice: number;
  quantity: number;
  forexLotType?: ForexLotType;
  forexLots?: number;
  marginInBaseCurrency: number;
  marginInUSD: number;
  leverage: number;
  takeProfit?: number;
  stopLoss?: number;
  createdAt: number;
  status: 'pending' | 'filled' | 'cancelled';
}

export interface TradeHistoryItem {
  id: string;
  positionId: string;
  symbol: string;
  side: OrderSide;
  entryPrice: number;
  closePrice: number;
  quantity: number;
  forexLots?: number;
  marginInBaseCurrency: number;
  leverage: number;
  realizedPnlInBaseCurrency: number;
  realizedPnlInUSD: number;
  pnlPercentage: number;
  closedAt: number;
  reason: 'manual' | 'tp' | 'sl' | 'liquidation' | 'margin_call' | 'auto_win';
}

export interface TopUpRecord {
  id: string;
  amountInBaseCurrency: number;
  baseCurrency: BaseCurrencyCode;
  amountInUSD: number;
  timestamp: number;
  note: string;
}

export interface WalletState {
  baseCurrency: BaseCurrencyCode;
  balanceInBaseCurrency: number;
  initialBalanceUSD: number;
  totalTopUpUSD: number;
  realizedPnlUSD: number;
}

export interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
  active: boolean;
  createdAt: number;
  triggeredAt?: number;
}

export interface CryptoFundamental {
  id: string;
  symbol: string;
  name: string;
  image?: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number | null;
  max_supply: number | null;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  description?: string;
  sentiment_votes_up_percentage?: number;
}
