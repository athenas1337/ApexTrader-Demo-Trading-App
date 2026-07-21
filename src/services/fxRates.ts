/**
 * Cross-Currency FX Bridge Rates Service
 * Base Reference: VUSD (US Dollar = 1.0)
 * USD to IDR calibrated to 17,500 IDR base market range.
 */

export type BaseCurrencyCode = 'VUSD' | 'VEUR' | 'VJPY' | 'VGBP' | 'VIDR';

export interface BaseCurrencyConfig {
  code: BaseCurrencyCode;
  name: string;
  symbol: string;
  rateToUSD: number; // Units of this currency per 1 USD
  usdValue: number;  // USD value per 1 unit of this currency
  precision: number;
  locale: string;
}

export const SUPPORTED_BASE_CURRENCIES: Record<BaseCurrencyCode, BaseCurrencyConfig> = {
  VUSD: {
    code: 'VUSD',
    name: 'US Dollar (Virtual)',
    symbol: '$',
    rateToUSD: 1.0,
    usdValue: 1.0,
    precision: 2,
    locale: 'en-US',
  },
  VEUR: {
    code: 'VEUR',
    name: 'Euro (Virtual)',
    symbol: '€',
    rateToUSD: 0.92,
    usdValue: 1.087,
    precision: 2,
    locale: 'de-DE',
  },
  VGBP: {
    code: 'VGBP',
    name: 'British Pound (Virtual)',
    symbol: '£',
    rateToUSD: 0.77,
    usdValue: 1.294,
    precision: 2,
    locale: 'en-GB',
  },
  VJPY: {
    code: 'VJPY',
    name: 'Japanese Yen (Virtual)',
    symbol: '¥',
    rateToUSD: 156.45,
    usdValue: 0.00639,
    precision: 0,
    locale: 'ja-JP',
  },
  VIDR: {
    code: 'VIDR',
    name: 'Indonesian Rupiah (Virtual)',
    symbol: 'Rp ',
    rateToUSD: 17500.0, // Calibrated to 17,500 IDR base range
    usdValue: 0.00005714,
    precision: 0,
    locale: 'id-ID',
  },
};

/**
 * Converts an amount from one virtual base currency to another via USD Bridge.
 */
export const convertCurrency = (
  amount: number,
  from: BaseCurrencyCode,
  to: BaseCurrencyCode
): number => {
  if (from === to || isNaN(amount)) return amount;

  const fromConfig = SUPPORTED_BASE_CURRENCIES[from] || SUPPORTED_BASE_CURRENCIES.VUSD;
  const toConfig = SUPPORTED_BASE_CURRENCIES[to] || SUPPORTED_BASE_CURRENCIES.VUSD;

  // 1. Convert source currency amount to USD
  const amountInUSD = amount * fromConfig.usdValue;

  // 2. Convert USD amount to target currency
  return amountInUSD * toConfig.rateToUSD;
};

export const convertFromUSD = (amountInUSD: number, target: BaseCurrencyCode): number => {
  return convertCurrency(amountInUSD, 'VUSD', target);
};

export const convertToUSD = (amountInTarget: number, source: BaseCurrencyCode): number => {
  return convertCurrency(amountInTarget, source, 'VUSD');
};
