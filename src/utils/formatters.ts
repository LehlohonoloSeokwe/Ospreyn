/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function formatNumber(value: number, decimals = 2): string {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPercentage(value: number, decimals = 2): string {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  const prefix = value > 0 ? '+' : '';
  return `${prefix}${formatNumber(value, decimals)}%`;
}

export function formatCurrencyZAR(value: number, decimals = 2): string {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  return `R ${formatNumber(value, decimals)}`;
}

export function formatUnitValue(value: number, unit: string): string {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  if (unit === '%') return `${formatNumber(value, 2)}%`;
  if (unit === '% of GDP') return `${formatNumber(value, 1)}% of GDP`;
  if (unit === '% YoY') return `${formatNumber(value, 2)}% YoY`;
  if (unit.includes('ZAR') || unit.includes('Rand')) return `R ${formatNumber(value, 2)}`;
  return `${formatNumber(value, 2)} ${unit}`;
}
