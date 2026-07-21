import { BaseCurrencyCode, SUPPORTED_BASE_CURRENCIES } from '../services/fxRates';

/**
 * Formats a number in the chosen Virtual Base Currency (VUSD, VEUR, VJPY, VGBP, VIDR).
 */
export const formatBaseCurrency = (
  amount: number,
  currencyCode: BaseCurrencyCode = 'VUSD',
  overrideDecimals?: number
): string => {
  if (isNaN(amount) || amount === null || amount === undefined) return '$0.00';

  const config = SUPPORTED_BASE_CURRENCIES[currencyCode] || SUPPORTED_BASE_CURRENCIES.VUSD;
  const decimals = overrideDecimals !== undefined ? overrideDecimals : config.precision;

  const formattedNum = new Intl.NumberFormat(config.locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);

  return `${config.symbol}${formattedNum} ${config.code}`;
};

/**
 * Backward compatibility alias for currency formatting
 */
export const formatCurrency = (amount: number, decimals: number = 2): string => {
  return formatBaseCurrency(amount, 'VUSD', decimals);
};

/**
 * Formats standard price for Crypto or Forex pairs.
 */
export const formatPrice = (price: number, precision: number = 2): string => {
  if (isNaN(price) || price === null || price === undefined) return '0.00';
  return price.toLocaleString('en-US', {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  });
};

/**
 * Formats a percentage change with sign (+ / -).
 */
export const formatPercentage = (percent: number, decimals: number = 2): string => {
  if (isNaN(percent) || percent === null) return '0.00%';
  const prefix = percent > 0 ? '+' : '';
  return `${prefix}${percent.toFixed(decimals)}%`;
};

/**
 * Compact number formatter for Large Numbers (e.g., 1.5B, 450M)
 */
export const formatCompactNumber = (num: number): string => {
  if (isNaN(num) || num === null) return '0';
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 2,
  }).format(num);
};

/**
 * Format timestamp into readable date & time
 */
export const formatDateTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
};
