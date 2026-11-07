import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkStaleness, periodEnd, periodKind } from './staleness';

test('reads annual, quarterly and monthly periods', () => {
  assert.equal(periodKind('2025'), 'annual');
  assert.equal(periodKind('2026-Q2'), 'quarterly');
  assert.equal(periodKind('2026-09'), 'monthly');
  assert.equal(periodKind('last year'), null);
});

test('finds the last day of each period', () => {
  assert.equal(periodEnd('2025')?.toISOString().slice(0, 10), '2025-12-31');
  assert.equal(periodEnd('2026-Q2')?.toISOString().slice(0, 10), '2026-06-30');
  assert.equal(periodEnd('2024-02')?.toISOString().slice(0, 10), '2024-02-29');
});

test('quarterly figure is not overdue while the next one is still being compiled', () => {
  // Q2 2026 is the latest on 7 Nov 2026; Q3 is normally published in mid November.
  assert.equal(checkStaleness('2026-Q2', new Date('2026-11-07T08:00:00Z')).stale, false);
});

test('quarterly figure is overdue once the next one should be out', () => {
  assert.equal(checkStaleness('2026-Q2', new Date('2027-01-15T08:00:00Z')).stale, true);
});

test('annual figure is overdue only after the next year plus the usual lag', () => {
  assert.equal(checkStaleness('2024', new Date('2026-11-07T08:00:00Z')).stale, false);
  assert.equal(checkStaleness('2024', new Date('2027-02-01T08:00:00Z')).stale, true);
});

test('an unreadable period is never flagged', () => {
  const r = checkStaleness('n/a', new Date('2030-01-01T00:00:00Z'));
  assert.equal(r.stale, false);
  assert.equal(r.expectedBy, null);
});
