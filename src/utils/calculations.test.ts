/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateAbsoluteChange,
  calculatePercentageChange,
  calculateMovingAverage,
  calculateRealRate,
  filterTimeRange,
} from './calculations';

test('calculateAbsoluteChange computes correct difference', () => {
  assert.equal(calculateAbsoluteChange(5.2, 4.0), 1.2);
  assert.equal(calculateAbsoluteChange(32.1, 33.5), -1.4);
});

test('calculatePercentageChange computes exact relative change', () => {
  assert.equal(calculatePercentageChange(110, 100), 10.0);
  assert.equal(calculatePercentageChange(90, 100), -10.0);
  assert.equal(calculatePercentageChange(10, 0), 0);
});

test('calculateRealRate uses Fisher equation correctly', () => {
  // Nominal 8.0%, inflation 4.0% => (1.08 / 1.04 - 1) * 100 = 3.846% => 3.85%
  const real = calculateRealRate(8.0, 4.0);
  assert.equal(real, 3.85);
});

test('calculateMovingAverage computes 3-period rolling average', () => {
  const series = [
    { period: '2020', value: 10 },
    { period: '2021', value: 20 },
    { period: '2022', value: 30 },
    { period: '2023', value: 40 },
  ];
  const ma = calculateMovingAverage(series, 3);
  assert.equal(ma.length, 4);
  assert.equal(ma[2].value, 20); // (10 + 20 + 30) / 3 = 20
  assert.equal(ma[3].value, 30); // (20 + 30 + 40) / 3 = 30
});

test('filterTimeRange handles 5Y slicing', () => {
  const series = Array.from({ length: 12 }, (_, i) => ({
    period: `${2010 + i}`,
    value: i,
  }));
  const fiveYears = filterTimeRange(series, '5Y');
  assert.equal(fiveYears.length, 5);
  assert.equal(fiveYears[4].period, '2021');
});
