/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Works out whether a series is overdue for an update, so the site can say so
 * instead of quietly showing an old figure.
 *
 * A series is overdue when the NEXT period should already have been published:
 * the end of the next period, plus the usual publication lag, plus a short grace.
 */

export type PeriodKind = 'annual' | 'quarterly' | 'monthly';

const DAY = 24 * 60 * 60 * 1000;
/** Typical gap between a period ending and its figure being published. */
const PUBLICATION_LAG_DAYS: Record<PeriodKind, number> = { annual: 365, quarterly: 60, monthly: 45 };
const GRACE_DAYS = 14;

export function periodKind(period: string): PeriodKind | null {
  if (/^\d{4}$/.test(period)) return 'annual';
  if (/^\d{4}-Q[1-4]$/i.test(period)) return 'quarterly';
  if (/^\d{4}-(0[1-9]|1[0-2])$/.test(period)) return 'monthly';
  return null;
}

/** Last day of the period, in UTC. Null if the period is not in a format we know. */
export function periodEnd(period: string): Date | null {
  const kind = periodKind(period);
  if (kind === 'annual') return new Date(Date.UTC(Number(period), 12, 0));
  if (kind === 'quarterly') {
    const year = Number(period.slice(0, 4));
    const q = Number(period.slice(-1));
    return new Date(Date.UTC(year, q * 3, 0));
  }
  if (kind === 'monthly') {
    const year = Number(period.slice(0, 4));
    const month = Number(period.slice(5, 7));
    return new Date(Date.UTC(year, month, 0));
  }
  return null;
}

/** End of the period that follows this one. */
function nextPeriodEnd(period: string, kind: PeriodKind): Date | null {
  const end = periodEnd(period);
  if (!end) return null;
  const y = end.getUTCFullYear();
  const m = end.getUTCMonth(); // 0-based month of the last day
  if (kind === 'annual') return new Date(Date.UTC(y + 1, 12, 0));
  if (kind === 'quarterly') return new Date(Date.UTC(y, m + 1 + 3, 0));
  return new Date(Date.UTC(y, m + 1 + 1, 0));
}

export interface Staleness {
  stale: boolean;
  /** The date after which a newer figure was expected. Null if the period could not be read. */
  expectedBy: Date | null;
}

export function checkStaleness(lastPeriod: string, now: Date = new Date()): Staleness {
  const kind = periodKind(lastPeriod);
  if (!kind) return { stale: false, expectedBy: null };
  const next = nextPeriodEnd(lastPeriod, kind);
  if (!next) return { stale: false, expectedBy: null };
  const expectedBy = new Date(next.getTime() + (PUBLICATION_LAG_DAYS[kind] + GRACE_DAYS) * DAY);
  return { stale: now.getTime() > expectedBy.getTime(), expectedBy };
}
