/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DatasetRecord } from '../types';

/**
 * Calculates the absolute change between two periods.
 * Delta = Current - Previous
 */
export function calculateAbsoluteChange(current: number, previous: number): number {
  return Number((current - previous).toFixed(4));
}

/**
 * Calculates the percentage change between two periods.
 * % Delta = ((Current - Previous) / |Previous|) * 100
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return Number((((current - previous) / Math.abs(previous)) * 100).toFixed(2));
}

/**
 * Computes a Simple Moving Average (SMA) over a given rolling window size.
 */
export function calculateMovingAverage(data: DatasetRecord[], windowSize: number): DatasetRecord[] {
  if (!data || data.length === 0 || windowSize <= 1) {
    return data;
  }

  const result: DatasetRecord[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < windowSize - 1) {
      result.push({
        ...data[i],
        label: `${data[i].period} (Insufficient data for ${windowSize}-period MA)`,
      });
      continue;
    }

    const windowSlice = data.slice(i - windowSize + 1, i + 1);
    const sum = windowSlice.reduce((acc, curr) => acc + curr.value, 0);
    const avg = Number((sum / windowSize).toFixed(2));

    result.push({
      period: data[i].period,
      value: avg,
      label: `${data[i].period} (${windowSize}-period SMA)`,
      annotation: data[i].annotation,
    });
  }

  return result;
}

/**
 * Calculates the Real Interest Rate using the exact Fisher equation:
 * (1 + r) = (1 + i) / (1 + pi)
 * => r = ((1 + i/100) / (1 + pi/100) - 1) * 100
 */
export function calculateRealRate(nominalRate: number, inflationRate: number): number {
  const nom = 1 + nominalRate / 100;
  const inf = 1 + inflationRate / 100;
  if (inf === 0) return nominalRate;
  const realRate = (nom / inf - 1) * 100;
  return Number(realRate.toFixed(2));
}

/**
 * Filters dataset records within a given year span (e.g., last 5 years, 10 years, or all).
 */
export function filterTimeRange(data: DatasetRecord[], range: '1Y' | '5Y' | '10Y' | 'ALL'): DatasetRecord[] {
  if (!data || data.length === 0 || range === 'ALL') return data;

  const count = range === '1Y' ? 4 : range === '5Y' ? 5 : 10;
  // If data length is less than requested count, return all
  if (data.length <= count) return data;

  return data.slice(-count);
}
