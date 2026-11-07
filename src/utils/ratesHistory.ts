/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * A small, automatically maintained history of the Reserve Bank rates, kept in
 * public/data/rates_history.json by a scheduled GitHub job. It is what lets the site
 * draw a rand trend and show "up/down since the previous figure" without anyone typing numbers.
 *
 * Each series holds one point per distinct "as at" date the Reserve Bank gave the figure,
 * so a rate that has not changed (such as the repo rate) is stored once, not every day.
 */

import type { LiveRate } from './sarbLive';

export interface HistoryPoint {
  /** The date the Reserve Bank attached to the figure, YYYY-MM-DD. */
  d: string;
  v: number;
}

export interface RatesHistory {
  updated: string | null;
  series: Record<string, HistoryPoint[]>;
}

export const EMPTY_HISTORY: RatesHistory = { updated: null, series: {} };
export const MAX_POINTS = 180;

export function parseHistory(input: unknown): RatesHistory {
  if (!input || typeof input !== 'object') return EMPTY_HISTORY;
  const raw = input as { updated?: unknown; series?: unknown };
  const series: Record<string, HistoryPoint[]> = {};
  if (raw.series && typeof raw.series === 'object') {
    for (const [id, points] of Object.entries(raw.series as Record<string, unknown>)) {
      if (!Array.isArray(points)) continue;
      const clean = points.filter(
        (p): p is HistoryPoint =>
          !!p && typeof (p as HistoryPoint).d === 'string' && typeof (p as HistoryPoint).v === 'number' && Number.isFinite((p as HistoryPoint).v)
      );
      if (clean.length) series[id] = clean.sort((a, b) => a.d.localeCompare(b.d));
    }
  }
  return { updated: typeof raw.updated === 'string' ? raw.updated : null, series };
}

/** Adds today's figures. A figure whose "as at" date is already stored is not stored twice. */
export function appendSnapshot(history: RatesHistory, rates: LiveRate[], nowIso: string): RatesHistory {
  const series: Record<string, HistoryPoint[]> = {};
  for (const [id, pts] of Object.entries(history.series)) series[id] = [...pts];
  for (const rate of rates) {
    if (!rate.asAt) continue; // no date from the Reserve Bank, so we cannot place it on a timeline
    const pts = series[rate.id] ?? [];
    const last = pts[pts.length - 1];
    if (last && last.d === rate.asAt) {
      last.v = rate.value; // the Reserve Bank revised the same day's figure
    } else if (!last || rate.asAt > last.d) {
      pts.push({ d: rate.asAt, v: rate.value });
    }
    series[rate.id] = pts.slice(-MAX_POINTS);
  }
  return { updated: nowIso, series };
}

/** The most recent stored figure from before the live one's "as at" date. */
export function previousPoint(history: RatesHistory, rate: LiveRate): HistoryPoint | null {
  const pts = history.series[rate.id];
  if (!pts) return null;
  for (let i = pts.length - 1; i >= 0; i--) {
    if (!rate.asAt || pts[i].d < rate.asAt) return pts[i];
  }
  return null;
}

export interface RateChange {
  absolute: number;
  since: string;
}

export function rateChange(history: RatesHistory, rate: LiveRate): RateChange | null {
  const prev = previousPoint(history, rate);
  if (!prev) return null;
  return { absolute: rate.value - prev.v, since: prev.d };
}

/** Values for a sparkline, oldest first, with the live figure added at the end if it is newer. */
export function sparkValues(history: RatesHistory, rate: LiveRate, limit = 30): number[] {
  const pts = history.series[rate.id] ?? [];
  const values = pts.slice(-limit).map((p) => p.v);
  const last = pts[pts.length - 1];
  if (!last || (rate.asAt && rate.asAt > last.d)) values.push(rate.value);
  return values;
}
