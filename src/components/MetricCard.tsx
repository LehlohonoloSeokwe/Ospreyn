/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowDownRight, Minus, ExternalLink } from 'lucide-react';
import { QualityBadge } from './QualityBadge';
import { Sparkline } from './Sparkline';
import { formatNumber } from '../utils/formatters';
import { DataQualityStatus } from '../types';

export interface MetricCardData {
  id: string;
  name: string;
  shortName: string;
  unit: string;
  latestValue: number;
  previousValue: number;
  changeAbsolute: number;
  changePercentage: number;
  directionFavorable: 'up' | 'down' | 'neutral';
  lastPeriod: string;
  retrievalDate: string;
  sourceName: string;
  sourceUrl: string;
  qualityStatus: DataQualityStatus;
  sparkline: number[];
}

interface MetricCardProps {
  metric: MetricCardData;
}

export const MetricCard: React.FC<MetricCardProps> = ({ metric }) => {
  const isPositiveDelta = metric.changeAbsolute > 0;
  const isNegativeDelta = metric.changeAbsolute < 0;
  const isZeroDelta = metric.changeAbsolute === 0;

  // Determine semantic color based on economic direction favorable
  // e.g. GDP going UP is positive; Inflation or Debt going DOWN is positive.
  let isFavorable = false;
  if (metric.directionFavorable === 'up') {
    isFavorable = isPositiveDelta;
  } else if (metric.directionFavorable === 'down') {
    isFavorable = isNegativeDelta;
  }

  const deltaColorClass = isZeroDelta
    ? 'text-slate-600 dark:text-slate-400'
    : isFavorable
    ? 'text-emerald-700 dark:text-emerald-400'
    : 'text-rose-700 dark:text-rose-400';

  const sparklineColor = isZeroDelta
    ? '#64748b'
    : isFavorable
    ? '#059669'
    : '#e11d48';

  // Format headline number
  let displayValue = formatNumber(metric.latestValue, metric.unit === '%' || metric.unit.includes('ZAR') ? 2 : 1);
  if (metric.unit.includes('ZAR')) {
    displayValue = `R ${displayValue}`;
  } else if (metric.unit === '%') {
    displayValue = `${displayValue}%`;
  }

  const deltaText = `${isPositiveDelta ? '+' : ''}${formatNumber(metric.changeAbsolute, 2)} (${isPositiveDelta ? '+' : ''}${formatNumber(metric.changePercentage, 1)}%)`;

  return (
    <div className="group relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-lg p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-150 flex flex-col justify-between">
      {/* Top Header Row */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <Link
            to={`/indicators/${metric.id}`}
            className="text-xs uppercase tracking-wider font-mono text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
          >
            {metric.shortName}
          </Link>
          <QualityBadge status={metric.qualityStatus} size="sm" />
        </div>

        {/* Primary Metric Number & Sparkline */}
        <div className="flex items-baseline justify-between gap-4 mt-1 mb-3">
          <div>
            <span className="text-3xl font-mono font-bold tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
              {displayValue}
            </span>
            <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
              Period: {metric.lastPeriod} · Unit: {metric.unit}
            </span>
          </div>

          <div className="shrink-0 pt-1" title="Recent historical trajectory">
            <Sparkline data={metric.sparkline} color={sparklineColor} width={96} height={32} />
          </div>
        </div>

        {/* Delta with explicit textual direction */}
        <div className="flex items-center gap-1.5 text-xs font-mono font-medium mb-4">
          {isPositiveDelta && (
            <span className={`inline-flex items-center gap-1 ${deltaColorClass}`}>
              <ArrowUpRight size={15} aria-hidden="true" />
              <span>Higher vs prev period</span>
              <span className="text-slate-400 dark:text-slate-600 font-normal">·</span>
              <span className="tabular-nums">{deltaText}</span>
            </span>
          )}
          {isNegativeDelta && (
            <span className={`inline-flex items-center gap-1 ${deltaColorClass}`}>
              <ArrowDownRight size={15} aria-hidden="true" />
              <span>Lower vs prev period</span>
              <span className="text-slate-400 dark:text-slate-600 font-normal">·</span>
              <span className="tabular-nums">{deltaText}</span>
            </span>
          )}
          {isZeroDelta && (
            <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400">
              <Minus size={14} aria-hidden="true" />
              <span>Unchanged</span>
              <span className="text-slate-400 dark:text-slate-600 font-normal">·</span>
              <span className="tabular-nums">0.00 (0.0%)</span>
            </span>
          )}
        </div>
      </div>

      {/* Footer Attribution Line */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
        <a
          href={metric.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="truncate max-w-[200px] hover:text-slate-900 dark:hover:text-slate-200 transition-colors inline-flex items-center gap-1"
          title={`Source: ${metric.sourceName}`}
        >
          <span>{metric.sourceName}</span>
          <ExternalLink size={10} className="shrink-0 text-slate-400" />
        </a>

        <Link
          to={`/indicators/${metric.id}`}
          className="text-emerald-700 dark:text-emerald-400 hover:underline font-sans font-medium shrink-0 ml-2"
        >
          Analysis →
        </Link>
      </div>
    </div>
  );
};
