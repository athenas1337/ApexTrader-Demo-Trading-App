export type AssetType = 'crypto' | 'forex';

export interface SymbolInfo {
  symbol: string;
  name: string;
  type: AssetType;
  tvSymbol: string; // TradingView Symbol ID (e.g. BINANCE:BTCUSDT, OANDA:EURUSD)
  basePrice: number;
  precision: number;
  category: string;
  description: string;
}

export type OrderSide = 'buy' | 'sell'; // Buy = Long, Sell = Short
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
  quantity: number; // Position size in asset units (e.g. 0.5 BTC)
  margin: number; // Margin used in VST
  leverage: number; // 1x to 100x
  takeProfit?: number;
  stopLoss?: number;
  liquidationPrice: number;
  floatingPnl: number;
  floatingPnlPercentage: number;
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
  margin: number;
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
  margin: number;
  leverage: number;
  realizedPnl: number;
  pnlPercentage: number;
  closedAt: number;
  reason: 'manual' | 'tp' | 'sl' | 'liquidation';
}

export interface VSTTopUpRecord {
  id: string;
  amount: number;
  timestamp: number;
  note: string;
}

export interface WalletState {
  balance: number; // Current available VST balance
  initialBalance: number; // Default 10,000 VST
  totalTopUp: number;
  realizedPnl: number;
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
