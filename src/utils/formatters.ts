/**
 * Formats a number as VST / USD currency.
 */
export const formatCurrency = (amount: number, decimals: number = 2): string => {
  if (isNaN(amount) || amount === null || amount === undefined) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount).replace('$', '') + ' VST';
};

/**
 * Formats standard price (Crypto or Forex).
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
  if (isNaN(percent)) return '0.00%';
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
