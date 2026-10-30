/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { Download, Table as TableIcon, SlidersHorizontal, Info } from 'lucide-react';
import { IndicatorDataset } from '../types';
import { exportIndicatorToCsv } from '../utils/exportCsv';
import { calculateMovingAverage, filterTimeRange } from '../utils/calculations';
import { formatNumber } from '../utils/formatters';
import { DataTableModal } from './DataTableModal';

interface IndicatorChartProps {
  indicator: IndicatorDataset;
  defaultTimeRange?: '1Y' | '5Y' | '10Y' | 'ALL';
}

export const IndicatorChart: React.FC<IndicatorChartProps> = ({
  indicator,
  defaultTimeRange = '10Y',
}) => {
  const [timeRange, setTimeRange] = useState<'1Y' | '5Y' | '10Y' | 'ALL'>(defaultTimeRange);
  const [showMovingAverage, setShowMovingAverage] = useState(false);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);

  // Compute filtered dataset & moving average
  const chartData = useMemo(() => {
    const filtered = filterTimeRange(indicator.data, timeRange);
    const withMa = calculateMovingAverage(filtered, 3);
    return filtered.map((d, idx) => ({
      ...d,
      ma3: withMa[idx] ? withMa[idx].value : null,
    }));
  }, [indicator.data, timeRange]);

  // Collect annotations within current time range
  const visibleAnnotations = useMemo(() => {
    return chartData.filter((d) => d.annotation);
  }, [chartData]);

  // Compute min and max for chart domain
  const { minVal, maxVal } = useMemo(() => {
    const values = chartData.map((d) => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min) * 0.12 || 1;
    return {
      minVal: Number((min - padding).toFixed(1)),
      maxVal: Number((max + padding).toFixed(1)),
    };
  }, [chartData]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 my-6 shadow-xs">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-serif font-semibold text-slate-900 dark:text-slate-100">
              {indicator.shortName} Historical Time Series
            </h3>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              ({indicator.unit})
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
            Source: {indicator.sourceName} · Last Period: {indicator.lastPeriod}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Time Range Selector */}
          <div className="inline-flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-mono">
            {(['5Y', '10Y', 'ALL'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  timeRange === r
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Toggle Moving Average */}
          <button
            onClick={() => setShowMovingAverage(!showMovingAverage)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono rounded-lg border transition-colors ${
              showMovingAverage
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-medium'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
            }`}
            title="Toggle 3-period Simple Moving Average line"
          >
            <SlidersHorizontal size={12} />
            <span className="hidden sm:inline">3-Yr MA</span>
            <span className="sm:hidden">MA</span>
          </button>

          {/* Table View Modal Button */}
          <button
            onClick={() => setIsTableModalOpen(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            title="Open accessible data table"
          >
            <TableIcon size={12} aria-hidden="true" />
            <span>Data Table</span>
          </button>

          {/* Download CSV */}
          <button
            onClick={() => exportIndicatorToCsv(indicator)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            title="Download verified series CSV"
          >
            <Download size={12} aria-hidden="true" />
            <span className="hidden sm:inline">CSV</span>
          </button>
        </div>
      </div>

      {/* Main Chart Graphic */}
      <div className="w-full h-72 sm:h-88 pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 16, right: 16, left: -10, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="currentColor"
              className="text-slate-200 dark:text-slate-800/80"
            />
            <XAxis
              dataKey="period"
              tickLine={false}
              axisLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
              tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }}
              dy={6}
            />
            <YAxis
              domain={[minVal, maxVal]}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }}
              tickFormatter={(v) => formatNumber(v, indicator.unit === '%' ? 1 : 0)}
              dx={-4}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white dark:bg-slate-800 p-3 rounded-lg shadow-xl border border-slate-700 text-xs font-mono max-w-xs">
                      <div className="text-slate-400 font-semibold mb-1">Period: {label}</div>
                      <div className="text-emerald-400 font-bold text-sm">
                        {formatNumber(item.value, 2)} {indicator.unit}
                      </div>
                      {item.ma3 !== null && showMovingAverage && (
                        <div className="text-slate-300 text-[11px] mt-0.5">
                          3-Yr SMA: {formatNumber(item.ma3, 2)} {indicator.unit}
                        </div>
                      )}
                      {item.annotation && (
                        <div className="mt-2 pt-1.5 border-t border-slate-700 text-slate-300 font-sans text-[11px] leading-snug">
                          <span className="text-amber-400 font-semibold">Event:</span> {item.annotation}
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Zero or Reference Benchmark Line if applicable (e.g. 0% for growth, 3% inflation target) */}
            {indicator.id === 'gdp' && (
              <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: '0.0% Growth', fill: '#94a3b8', fontSize: 10, position: 'right' }} />
            )}
            {indicator.id === 'inflation' && (
              <ReferenceLine y={3} stroke="#059669" strokeDasharray="4 4" label={{ value: '3% SARB target (from Nov 2025)', fill: '#059669', fontSize: 10, position: 'right' }} />
            )}

            {/* Event Reference Lines */}
            {showAnnotations &&
              visibleAnnotations.map((anno) => (
                <ReferenceLine
                  key={anno.period}
                  x={anno.period}
                  stroke="#f59e0b"
                  strokeDasharray="2 2"
                  strokeWidth={1}
                />
              ))}

            {/* Primary Time Series Line */}
            <Line
              type="monotone"
              dataKey="value"
              name={indicator.shortName}
              stroke="#047857"
              strokeWidth={2.5}
              dot={{ r: 3.5, fill: '#047857', strokeWidth: 1, stroke: '#ffffff' }}
              activeDot={{ r: 6, fill: '#10b981', stroke: '#0f172a', strokeWidth: 2 }}
            />

            {/* Moving Average Line if enabled */}
            {showMovingAverage && (
              <Line
                type="monotone"
                dataKey="ma3"
                name="3-Yr Moving Average"
                stroke="#6366f1"
                strokeWidth={1.75}
                strokeDasharray="4 4"
                dot={false}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Historical Event Annotations Key */}
      {visibleAnnotations.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500 dark:text-slate-400 mb-1.5">
            <Info size={12} className="text-amber-500 shrink-0" />
            <span className="font-semibold uppercase tracking-wider">Historical Event Milestones in Window:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 font-mono text-xs">
            {visibleAnnotations.map((item) => (
              <div key={item.period} className="flex items-baseline gap-2 text-slate-700 dark:text-slate-300">
                <span className="text-amber-600 dark:text-amber-400 font-semibold shrink-0">
                  [{item.period}]
                </span>
                <span className="font-sans text-[12px] truncate">{item.annotation}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Accessible Data Table Modal */}
      <DataTableModal
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
        indicator={indicator}
      />
    </div>
  );
};
