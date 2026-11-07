/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { extractLiveRates, parseSarbDate, parseSarbNumber } from './sarbLive';

test('parseSarbNumber handles plain, comma-decimal and spaced numbers', () => {
  assert.equal(parseSarbNumber(7.25), 7.25);
  assert.equal(parseSarbNumber('7,25'), 7.25);
  assert.equal(parseSarbNumber('7.25%'), 7.25);
  assert.equal(parseSarbNumber('17\u00a0891,5'), 17891.5);
  assert.equal(parseSarbNumber('1,234.5'), 1234.5);
  assert.equal(parseSarbNumber(''), null);
  assert.equal(parseSarbNumber('n/a'), null);
  assert.equal(parseSarbNumber(null), null);
});

test('parseSarbDate handles ISO and .NET date strings', () => {
  assert.equal(parseSarbDate('2026-11-05T00:00:00'), '2026-11-05');
  assert.equal(parseSarbDate('/Date(1793836800000)/'), '2026-11-05');
  assert.equal(parseSarbDate('garbage'), null);
  assert.equal(parseSarbDate(undefined), null);
});

test('extractLiveRates matches by timeseries code in a sectioned payload', () => {
  const payload = [
    {
      SectionName: 'Interest rates',
      Items: [
        { Name: 'SARB Policy Rate', TimeseriesCode: 'MMRD002A', Date: '2026-11-05', Value: 7.25 },
        { Name: 'Prime lending rate', TimeseriesCode: 'MMRD000A', Date: '2026-11-05', Value: 10.75 },
        { Name: 'Zaronia', TimeseriesCode: 'MMRD855A', Date: '2026-11-04', Value: '6,853' },
      ],
    },
    {
      SectionName: 'Exchange rates',
      Items: [{ Name: 'Rand per US Dollar', TimeseriesCode: 'EXCX135D', Date: '2026-11-05', Value: 17.4321 }],
    },
  ];
  const rates = extractLiveRates([payload]);
  const byId = Object.fromEntries(rates.map((r) => [r.id, r]));
  assert.equal(byId.repo.value, 7.25);
  assert.equal(byId.prime.value, 10.75);
  assert.equal(byId.zaronia.value, 6.853);
  assert.equal(byId.usdzar.value, 17.4321);
  assert.equal(byId.zaronia.asAt, '2026-11-04');
});

test('extractLiveRates falls back to names and lower-case keys', () => {
  const payload = { rates: [{ name: 'Rand per US dollar', value: 17.5, date: '2026-11-05' }, { name: 'SARB Policy Rate', value: 7.25, date: '2026-11-05' }] };
  const rates = extractLiveRates([payload]);
  assert.deepEqual(rates.map((r) => r.id).sort(), ['repo', 'usdzar']);
});

test('extractLiveRates ignores implausible values and unknown shapes', () => {
  assert.deepEqual(extractLiveRates([{ foo: 'bar' }]), []);
  assert.deepEqual(extractLiveRates([[{ Name: 'SARB Policy Rate', Value: 725 }]]), []);
  assert.deepEqual(extractLiveRates([[{ Name: 'Rand per US Dollar', Value: 0.05 }]]), []);
  assert.deepEqual(extractLiveRates([]), []);
});

test('extractLiveRates prefers the first payload when both contain a rate', () => {
  const first = [{ Name: 'SARB Policy Rate', TimeseriesCode: 'MMRD002A', Value: 7.25, Date: '2026-11-05' }];
  const second = [{ Name: 'SARB Policy Rate', TimeseriesCode: 'MMRD002A', Value: 7.0, Date: '2026-11-01' }];
  const repo = extractLiveRates([first, second]).find((r) => r.id === 'repo');
  assert.equal(repo?.value, 7.25);
});
