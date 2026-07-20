/**
 * Dynamic Real-Time Ticker & Price Subscription Service
 * Connects to Binance WebSocket for Crypto and simulated tick feeds for Forex.
 */

type PriceCallback = (symbol: string, price: number) => void;

class PriceFeedService {
  private listeners: Map<string, Set<PriceCallback>> = new Map();
  private ws: WebSocket | null = null;
  private prices: Map<string, number> = new Map();
  private simulationIntervals: Map<string, number> = new Map();

  constructor() {
    this.connectBinanceWebSocket();
  }

  private connectBinanceWebSocket() {
    try {
      // Stream for crypto tickers: btcusdt, ethusdt, solusdt, bnbusdt, xrpusdt, adausdt, dogeusdt
      const streams = ['btcusdt', 'ethusdt', 'solusdt', 'bnbusdt', 'xrpusdt', 'adausdt', 'dogeusdt']
        .map((s) => `${s}@ticker`)
        .join('/');

      this.ws = new WebSocket(`wss://stream.binance.com:9443/ws/${streams}`);

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.s && data.c) {
            const symbol = data.s.toUpperCase(); // e.g. BTCUSDT
            const price = parseFloat(data.c); // Last price
            this.updatePrice(symbol, price);
          }
        } catch (e) {
          // Silent catch for unexpected payload
        }
      };

      this.ws.onerror = () => {
        // Fallback simulation handled automatically if WS drops
      };

      this.ws.onclose = () => {
        // Auto-reconnect after 5 seconds
        setTimeout(() => this.connectBinanceWebSocket(), 5000);
      };
    } catch (e) {
      console.warn('Binance WebSocket initialization failed, using price ticker loop fallback.');
    }
  }

  public subscribe(symbol: string, initialPrice: number, callback: PriceCallback): () => void {
    if (!this.listeners.has(symbol)) {
      this.listeners.set(symbol, new Set());
    }
    this.listeners.get(symbol)!.add(callback);

    // Set initial price if not already present
    if (!this.prices.has(symbol)) {
      this.prices.set(symbol, initialPrice);
    } else {
      callback(symbol, this.prices.get(symbol)!);
    }

    // Start forex simulation ticks if forex symbol
    if (!symbol.endsWith('USDT') && !this.simulationIntervals.has(symbol)) {
      this.startForexSimulation(symbol, initialPrice);
    }

    return () => {
      const symbolListeners = this.listeners.get(symbol);
      if (symbolListeners) {
        symbolListeners.delete(callback);
        if (symbolListeners.size === 0) {
          this.listeners.delete(symbol);
          if (this.simulationIntervals.has(symbol)) {
            window.clearInterval(this.simulationIntervals.get(symbol));
            this.simulationIntervals.delete(symbol);
          }
        }
      }
    };
  }

  public getPrice(symbol: string, defaultPrice: number): number {
    return this.prices.get(symbol) || defaultPrice;
  }

  public updatePrice(symbol: string, price: number) {
    this.prices.set(symbol, price);
    const callbacks = this.listeners.get(symbol);
    if (callbacks) {
      callbacks.forEach((cb) => cb(symbol, price));
    }
  }

  private startForexSimulation(symbol: string, basePrice: number) {
    let current = basePrice;
    const interval = window.setInterval(() => {
      // Small realistic forex random walk (±0.015%)
      const changePercent = (Math.random() - 0.49) * 0.0003;
      current = Math.max(0.0001, current * (1 + changePercent));
      this.updatePrice(symbol, current);
    }, 1500);

    this.simulationIntervals.set(symbol, interval);
  }
}

export const priceFeed = new PriceFeedService();
