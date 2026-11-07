import { test } from 'node:test';
import assert from 'node:assert/strict';
import { countdownLabel, daysBetween, decisionDay, nextOfCategory, todaySA, upcomingEvents } from './now';
import type { CalendarEvent } from '../types';

const ev = (id: string, date: string, category: CalendarEvent['category']): CalendarEvent => ({
  id, date, category, title: id, institution: 'x', description: '', sourceUrl: '', confirmed: true,
});
const events = [
  ev('cpi', '2026-11-25', 'Statistical Release'),
  ev('mpc', '2026-11-19', 'Monetary Policy'),
  ev('old', '2026-10-01', 'Statistical Release'),
];

test('uses the South African date', () => {
  // 22:30 UTC on the 6th is already 00:30 on the 7th in South Africa.
  assert.equal(todaySA(new Date('2026-11-06T22:30:00Z')), '2026-11-07');
});

test('counts days between dates', () => {
  assert.equal(daysBetween('2026-11-07', '2026-11-19'), 12);
  assert.equal(daysBetween('2026-11-19', '2026-11-19'), 0);
});

test('lists only upcoming events, soonest first', () => {
  assert.deepEqual(upcomingEvents(events, '2026-11-07').map((e) => e.id), ['mpc', 'cpi']);
  assert.equal(nextOfCategory(events, '2026-11-07', 'Statistical Release')?.id, 'cpi');
  assert.equal(nextOfCategory(events, '2026-12-31', 'Monetary Policy'), null);
});

test('labels the countdown', () => {
  assert.equal(countdownLabel(0), 'Today');
  assert.equal(countdownLabel(1), 'Tomorrow');
  assert.equal(countdownLabel(12), 'In 12 days');
});

test('decision-day mode switches on only on the MPC date and flags a changed repo rate', () => {
  assert.equal(decisionDay(events, '2026-11-18', 7.25, 7.25), null);
  const same = decisionDay(events, '2026-11-19', 7.25, 7.25);
  assert.equal(same?.changed, false);
  const moved = decisionDay(events, '2026-11-19', 7.0, 7.25);
  assert.equal(moved?.changed, true);
  assert.equal(decisionDay(events, '2026-11-19', null, 7.25)?.changed, false);
});
