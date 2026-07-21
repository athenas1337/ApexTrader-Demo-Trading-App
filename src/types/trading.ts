import { BaseCurrencyCode } from '../services/fxRates';

export type MarketArena = 'crypto' | 'forex';
export type UIMode = 'noob' | 'lite' | 'pro';
export type ForexLotType = 'standard' | 'mini' | 'micro'; // Standard 100k, Mini 10k, Micro 1k units
export type ChartStyle = 'candles' | 'heikin_ashi' | 'line';
export type TimeFrame = '1m' | '5m' | '15m' | '1h' | '4h' | '1D' | '1W' | '1M';

export interface SymbolInfo {
  symbol: string;
  name: string;
  type: MarketArena;
  tvSymbol: string;
  basePrice: number;
  precision: number;
  category: string;
  description: string;
  quoteCurrency?: string; // e.g. USDT, USD, JPY, EUR
  pipSize?: number;       // e.g. 0.0001 or 0.01 for JPY pairs
  spreadPips?: number;    // Bid/Ask spread in pips (e.g., 0.8)
}

export type OrderSide = 'buy' | 'sell';
export type OrderType = 'market' | 'limit';
export type PositionStatus = 'open' | 'closed' | 'liquidated';

export interface Position {
  id: string;
  symbol: string;
  symbolInfo: SymbolInfo;
  side: OrderSide;
  orderType: OrderType;
  entryPrice: number;
  currentPrice: number;

  // Crypto vs Forex quantity mechanics
  quantity: number;        // Quantity in coin units (Crypto) or contract units (Forex)
  forexLotType?: ForexLotType;
  forexLots?: number;      // e.g. 1.5 lots

  // Margin & Leverage
  marginInBaseCurrency: number; // Margin collateral in user's active Base Currency (e.g. VIDR / VUSD)
  marginInUSD: number;
  leverage: number;         // Crypto: 1x-100x; Forex: 1:100 to 1:500

  // Risk limits
  takeProfit?: number;
  stopLoss?: number;
  liquidationPrice: number;

  // Real-time floating metrics
  floatingPnlInBaseCurrency: number;
  floatingPnlInUSD: number;
  floatingPnlPercentage: number;
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
  reason: 'manual' | 'tp' | 'sl' | 'liquidation' | 'margin_call';
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
  baseCurrency: BaseCurrencyCode; // VUSD, VEUR, VJPY, VGBP, VIDR
  balanceInBaseCurrency: number;  // Current available balance in active base currency
  initialBalanceUSD: number;      // Default $10,000 USD equivalent
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
