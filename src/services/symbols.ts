import { SymbolInfo } from '../types/trading';

export const SUPPORTED_SYMBOLS: SymbolInfo[] = [
  // Crypto
  {
    symbol: 'BTCUSDT',
    name: 'Bitcoin / USDT',
    type: 'crypto',
    tvSymbol: 'BINANCE:BTCUSDT',
    basePrice: 65420.50,
    precision: 2,
    category: 'Crypto',
    description: 'The world\'s primary cryptocurrency and digital store of value.',
  },
  {
    symbol: 'ETHUSDT',
    name: 'Ethereum / USDT',
    type: 'crypto',
    tvSymbol: 'BINANCE:ETHUSDT',
    basePrice: 3480.20,
    precision: 2,
    category: 'Crypto',
    description: 'Decentralized smart contract platform powering DeFi and Web3.',
  },
  {
    symbol: 'SOLUSDT',
    name: 'Solana / USDT',
    type: 'crypto',
    tvSymbol: 'BINANCE:SOLUSDT',
    basePrice: 145.80,
    precision: 2,
    category: 'Crypto',
    description: 'High-throughput layer-1 blockchain built for speed and low cost.',
  },
  {
    symbol: 'BNBUSDT',
    name: 'Binance Coin / USDT',
    type: 'crypto',
    tvSymbol: 'BINANCE:BNBUSDT',
    basePrice: 580.40,
    precision: 2,
    category: 'Crypto',
    description: 'Utility token for BNB Chain ecosystem and trading discounts.',
  },
  {
    symbol: 'XRPUSDT',
    name: 'XRP / USDT',
    type: 'crypto',
    tvSymbol: 'BINANCE:XRPUSDT',
    basePrice: 0.5840,
    precision: 4,
    category: 'Crypto',
    description: 'Cross-border settlement token designed for institutional liquidity.',
  },
  {
    symbol: 'ADAUSDT',
    name: 'Cardano / USDT',
    type: 'crypto',
    tvSymbol: 'BINANCE:ADAUSDT',
    basePrice: 0.3820,
    precision: 4,
    category: 'Crypto',
    description: 'Proof-of-stake blockchain platform grounded in peer-reviewed research.',
  },
  {
    symbol: 'DOGEUSDT',
    name: 'Dogecoin / USDT',
    type: 'crypto',
    tvSymbol: 'BINANCE:DOGEUSDT',
    basePrice: 0.1240,
    precision: 4,
    category: 'Crypto',
    description: 'Popular decentralized peer-to-peer cryptocurrency meme asset.',
  },

  // Forex
  {
    symbol: 'EURUSD',
    name: 'Euro / US Dollar',
    type: 'forex',
    tvSymbol: 'FX:EURUSD',
    basePrice: 1.08750,
    precision: 5,
    category: 'Forex',
    description: 'Most liquid currency pair globally, representing EU & US economies.',
  },
  {
    symbol: 'GBPUSD',
    name: 'British Pound / US Dollar',
    type: 'forex',
    tvSymbol: 'FX:GBPUSD',
    basePrice: 1.29420,
    precision: 5,
    category: 'Forex',
    description: 'Cable currency pair measuring UK economy against the US Dollar.',
  },
  {
    symbol: 'USDJPY',
    name: 'US Dollar / Japanese Yen',
    type: 'forex',
    tvSymbol: 'FX:USDJPY',
    basePrice: 156.450,
    precision: 3,
    category: 'Forex',
    description: 'Major safe-haven currency pair bridging Western and Asian markets.',
  },
  {
    symbol: 'AUDUSD',
    name: 'Australian Dollar / US Dollar',
    type: 'forex',
    tvSymbol: 'FX:AUDUSD',
    basePrice: 0.66840,
    precision: 5,
    category: 'Forex',
    description: 'Commodity-linked currency pair sensitive to global economic cycles.',
  },
  {
    symbol: 'USDCHF',
    name: 'US Dollar / Swiss Franc',
    type: 'forex',
    tvSymbol: 'FX:USDCHF',
    basePrice: 0.89120,
    precision: 5,
    category: 'Forex',
    description: 'Safe-haven currency pair tied to Swiss financial stability.',
  }
];

export const getSymbolDetails = (symbol: string): SymbolInfo => {
  return (
    SUPPORTED_SYMBOLS.find((s) => s.symbol === symbol) || SUPPORTED_SYMBOLS[0]
  );
};
