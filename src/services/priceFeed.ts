/**
 * Dynamic Pub/Sub Real-Time Ticker & Price Subscription Service
 * Optimizes network bandwidth by opening WebSocket connections ONLY for active symbols & open positions.
 */

type PriceCallback = (symbol: string, price: number) => void;

class DynamicPriceFeedService {
  private listeners: Map<string, Set<PriceCallback>> = new Map();
  private ws: WebSocket | null = null;
  private currentSubscribedCryptoStreams: Set<string> = new Set();
  private prices: Map<string, number> = new Map();
  private forexSimulationIntervals: Map<string, number> = new Map();

  public subscribe(symbol: string, initialPrice: number, callback: PriceCallback): () => void {
    if (!this.listeners.has(symbol)) {
      this.listeners.set(symbol, new Set());
    }
    this.listeners.get(symbol)!.add(callback);

    // Store initial price
    if (!this.prices.has(symbol)) {
      this.prices.set(symbol, initialPrice);
    } else {
      callback(symbol, this.prices.get(symbol)!);
    }

    // Re-evaluate active WebSocket connections dynamically
    this.syncSubscribedStreams();

    // Return un-subscribe function
    return () => {
      const callbacks = this.listeners.get(symbol);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.listeners.delete(symbol);
          if (this.forexSimulationIntervals.has(symbol)) {
            window.clearInterval(this.forexSimulationIntervals.get(symbol));
            this.forexSimulationIntervals.delete(symbol);
          }
        }
      }
      this.syncSubscribedStreams();
    };
  }

  public getPrice(symbol: string, defaultPrice: number): number {
    return this.prices.get(symbol) || defaultPrice;
  }

  public updatePrice(symbol: string, price: number) {
    this.prices.set(symbol, price);

    // Fallback Storage-Driven State Sync for Mobile Throttling (Chrome 150+ / OPPO ColorOS 16.0.5)
    if (typeof window !== 'undefined') {
      if (!(window as any).lastPriceTick) {
        (window as any).lastPriceTick = {};
      }
      (window as any).lastPriceTick[symbol] = price;
      (window as any).lastPriceTickTimestamp = Date.now();
    }

    const callbacks = this.listeners.get(symbol);
    if (callbacks) {
      callbacks.forEach((cb) => cb(symbol, price));
    }
  }

  /**
   * Dynamically syncs WebSocket stream connections so only active symbols are subscribed to
   */
  private syncSubscribedStreams() {
    const activeCryptoSymbols = new Set<string>();
    const activeForexSymbols = new Set<string>();

    this.listeners.forEach((_, symbol) => {
      if (symbol.endsWith('USDT') || symbol.endsWith('BTC')) {
        activeCryptoSymbols.add(symbol.toLowerCase());
      } else {
        activeForexSymbols.add(symbol);
      }
    });

    // Handle Forex simulation Ticks for active Forex symbols
    activeForexSymbols.forEach((forexSym) => {
      if (!this.forexSimulationIntervals.has(forexSym)) {
        this.startForexSimulation(forexSym);
      }
    });

    // Check if crypto streams changed
    const newCryptoStreams = Array.from(activeCryptoSymbols).map((s) => `${s}@ticker`);
    const streamKeys = new Set(newCryptoStreams);

    const isDifferent =
      streamKeys.size !== this.currentSubscribedCryptoStreams.size ||
      Array.from(streamKeys).some((s) => !this.currentSubscribedCryptoStreams.has(s));

    if (isDifferent) {
      this.currentSubscribedCryptoStreams = streamKeys;
      this.reconnectCryptoWebSocket(newCryptoStreams);
    }
  }

  private reconnectCryptoWebSocket(streams: string[]) {
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }

    if (streams.length === 0) return;

    try {
      const streamPath = streams.join('/');
      this.ws = new WebSocket(`wss://stream.binance.com:9443/ws/${streamPath}`);

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.s && data.c) {
            const symbol = data.s.toUpperCase();
            const price = parseFloat(data.c);
            this.updatePrice(symbol, price);
          }
        } catch (e) {
          // ignore
        }
      };

      this.ws.onerror = () => {
        // Safe fallback
      };
    } catch (e) {
      console.warn('Binance WebSocket dynamic connection error:', e);
    }
  }

  private startForexSimulation(symbol: string) {
    const basePrice = this.prices.get(symbol) || 1.0;
    let current = basePrice;

    const interval = window.setInterval(() => {
      const changePercent = (Math.random() - 0.495) * 0.0003;
      current = Math.max(0.0001, current * (1 + changePercent));
      this.updatePrice(symbol, current);
    }, 1200);

    this.forexSimulationIntervals.set(symbol, interval);
  }
}

export const priceFeed = new DynamicPriceFeedService();
