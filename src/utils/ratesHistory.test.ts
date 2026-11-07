import { test } from 'node:test';
import assert from 'node:assert/strict';
import { appendSnapshot, EMPTY_HISTORY, MAX_POINTS, parseHistory, rateChange, sparkValues } from './ratesHistory';
import type { LiveRate } from './sarbLive';

const rate = (value: number, asAt: string): LiveRate => ({
  id: 'usdzar', label: 'Rand per US dollar', group: 'currency', unit: 'ZAR', code: 'EXCX135D', value, asAt,
});

test('stores each as-at date once and keeps the latest value for a repeated date', () => {
  let h = appendSnapshot(EMPTY_HISTORY, [rate(17.5, '2026-11-05')], '2026-11-05T14:30:00Z');
  h = appendSnapshot(h, [rate(17.6, '2026-11-05')], '2026-11-05T15:00:00Z');
  h = appendSnapshot(h, [rate(17.4, '2026-11-06')], '2026-11-06T14:30:00Z');
  assert.deepEqual(h.series.usdzar, [{ d: '2026-11-05', v: 17.6 }, { d: '2026-11-06', v: 17.4 }]);
});

test('ignores a figure with no date and an older date than what is stored', () => {
  let h = appendSnapshot(EMPTY_HISTORY, [rate(17.5, '2026-11-05')], 'x');
  h = appendSnapshot(h, [rate(99, ''), rate(16, '2026-11-01')], 'y');
  assert.equal(h.series.usdzar.length, 1);
});

test('caps the stored history', () => {
  let h = EMPTY_HISTORY;
  for (let i = 0; i < MAX_POINTS + 20; i++) {
    const day = new Date(Date.UTC(2026, 0, 1 + i)).toISOString().slice(0, 10);
    h = appendSnapshot(h, [rate(17 + i / 100, day)], 'x');
  }
  assert.equal(h.series.usdzar.length, MAX_POINTS);
});

test('change is measured against the figure before the live one', () => {
  const h = appendSnapshot(EMPTY_HISTORY, [rate(17.5, '2026-11-05')], 'x');
  const change = rateChange(h, rate(17.3, '2026-11-06'));
  assert.equal(change?.since, '2026-11-05');
  assert.ok(Math.abs((change?.absolute ?? 0) + 0.2) < 1e-9);
  // Same date as the stored point: nothing earlier to compare with.
  assert.equal(rateChange(h, rate(17.5, '2026-11-05')), null);
});

test('sparkline adds the live figure when it is newer than the stored history', () => {
  const h = appendSnapshot(EMPTY_HISTORY, [rate(17.5, '2026-11-05')], 'x');
  assert.deepEqual(sparkValues(h, rate(17.3, '2026-11-06')), [17.5, 17.3]);
  assert.deepEqual(sparkValues(h, rate(17.5, '2026-11-05')), [17.5]);
});

test('parseHistory copes with junk', () => {
  assert.deepEqual(parseHistory(null), EMPTY_HISTORY);
  assert.deepEqual(parseHistory({ series: { usdzar: [{ d: '2026-01-01', v: 'x' }, { d: '2026-01-02', v: 18 }] } }).series.usdzar, [{ d: '2026-01-02', v: 18 }]);
});
