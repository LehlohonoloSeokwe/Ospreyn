/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Date helpers for the "What matters now" banner. South African dates are used throughout,
 * so a visitor abroad still sees the countdown to the date in South Africa.
 */

import type { CalendarEvent } from '../types';

export function todaySA(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Johannesburg', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

/** Whole days from one YYYY-MM-DD date to another. */
export function daysBetween(from: string, to: string): number {
  const a = Date.parse(`${from}T00:00:00Z`);
  const b = Date.parse(`${to}T00:00:00Z`);
  return Math.round((b - a) / 86_400_000);
}

/** Events on or after today, soonest first. */
export function upcomingEvents(events: CalendarEvent[], today: string): CalendarEvent[] {
  return events
    .filter((e) => typeof e.date === 'string' && e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function nextOfCategory(events: CalendarEvent[], today: string, category: CalendarEvent['category']): CalendarEvent | null {
  return upcomingEvents(events, today).find((e) => e.category === category) ?? null;
}

export function countdownLabel(days: number): string {
  if (days <= 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `In ${days} days`;
}

export interface DecisionDay {
  event: CalendarEvent;
  /** Live repo rate, and whether it already differs from the last reviewed rate. */
  liveRepo: number | null;
  changed: boolean;
}

/**
 * Decision-day mode: true when a Monetary Policy event is dated today. If the live repo rate
 * differs from the reviewed one, the Reserve Bank has probably already announced a move.
 */
export function decisionDay(
  events: CalendarEvent[],
  today: string,
  liveRepo: number | null,
  reviewedRepo: number | undefined
): DecisionDay | null {
  const event = events.find((e) => e.category === 'Monetary Policy' && e.date === today);
  if (!event) return null;
  const changed = liveRepo !== null && reviewedRepo !== undefined && Math.abs(liveRepo - reviewedRepo) > 0.001;
  return { event, liveRepo, changed };
}
