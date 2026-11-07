/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import type { MetricCardData } from './MetricCard';
import { checkStaleness } from '../utils/staleness';

export function staleMetrics(metrics: MetricCardData[], now: Date = new Date()): MetricCardData[] {
  return metrics.filter((m) => checkStaleness(m.lastPeriod, now).stale);
}

/** Lists the headline series whose next figure should already be out. Renders nothing when all are current. */
export const StaleNotice: React.FC<{ metrics: MetricCardData[] }> = ({ metrics }) => {
  const stale = staleMetrics(metrics);
  if (stale.length === 0) return null;
  return (
    <aside
      className="mb-10 flex items-start gap-3 rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 text-sm text-amber-900 dark:text-amber-200"
      aria-label="Figures older than usual"
    >
      <Clock size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
      <p className="leading-snug">
        <strong className="font-semibold">Older than usual:</strong>{' '}
        {stale.map((m, i) => (
          <span key={m.id}>
            {m.shortName} (latest period {m.lastPeriod}){i < stale.length - 1 ? '; ' : '. '}
          </span>
        ))}
        A newer figure should be out by now. Either the source has not published it yet, or the series is entered by hand and is due for an update.{' '}
        <Link to="/verify" className="underline">See the verification register</Link>.
      </p>
    </aside>
  );
};
