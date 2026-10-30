/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { AlertCircle } from 'lucide-react';
import { IndicatorDataset } from '../types';
import { formatNumber } from '../utils/formatters';

interface DualAxisCompareProps {
  seriesA: IndicatorDataset;
  seriesB: IndicatorDataset;
}

export const DualAxisCompare: React.FC<DualAxisCompareProps> = ({
  seriesA,
  seriesB,
}) => {
  // Join data on shared period
  const mapB = new Map(seriesB.data.map((d) => [d.period, d.value]));
  
  const mergedData = seriesA.data
    .filter((dA) => mapB.has(dA.period))
    .map((dA) => ({
      period: dA.period,
      valA: dA.value,
      valB: mapB.get(dA.period)!,
      annotationA: dA.annotation,
    }));

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 my-6 shadow-xs">
      <div className="mb-4">
        <h3 className="text-base sm:text-lg font-serif font-semibold text-slate-900 dark:text-slate-100">
          Comparative Analysis: {seriesA.shortName} vs. {seriesB.shortName}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
          Shared historical time axis ({mergedData[0]?.period} – {mergedData[mergedData.length - 1]?.period})
        </p>
      </div>

      {/* Mandatory Dual-Axis Warning Note */}
      <div className="flex items-start gap-2.5 p-3.5 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-lg text-xs font-mono text-amber-900 dark:text-amber-300 mb-5">
        <AlertCircle size={16} className="shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="font-semibold uppercase tracking-wider">Dual-Axis Scale Caution:</strong> The left Y-axis plots{' '}
          <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{seriesA.shortName} ({seriesA.unit})</span>,
          while the right Y-axis plots{' '}
          <span className="text-indigo-700 dark:text-indigo-400 font-semibold">{seriesB.shortName} ({seriesB.unit})</span>.
          Axes are independently scaled to illustrate directional co-movement; absolute values must not be compared directly.
        </p>
      </div>

      {/* Chart Graphic */}
      <div className="w-full h-72 sm:h-88">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={mergedData}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
            <XAxis
              dataKey="period"
              tickLine={false}
              axisLine={{ stroke: '#94a3b8' }}
              tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }}
              dy={6}
            />
            {/* Left Axis for Series A */}
            <YAxis
              yAxisId="left"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#047857', fontSize: 11, fontFamily: 'monospace' }}
              tickFormatter={(v) => formatNumber(v, 1)}
              dx={-4}
            />
            {/* Right Axis for Series B */}
            <YAxis
              yAxisId="right"
              orientation="right"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#4f46e5', fontSize: 11, fontFamily: 'monospace' }}
              tickFormatter={(v) => formatNumber(v, 1)}
              dx={4}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-slate-900 text-white p-3 rounded-lg border border-slate-700 text-xs font-mono shadow-xl">
                      <div className="text-slate-400 font-semibold mb-1.5">Period: {label}</div>
                      <div className="text-emerald-400 font-bold mb-1">
                        {seriesA.shortName}: {formatNumber(payload[0]?.value as number, 2)} {seriesA.unit}
                      </div>
                      <div className="text-indigo-300 font-bold">
                        {seriesB.shortName}: {formatNumber(payload[1]?.value as number, 2)} {seriesB.unit}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: '12px', fontSize: '12px', fontFamily: 'monospace' }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="valA"
              name={`${seriesA.shortName} (${seriesA.unit})`}
              stroke="#047857"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#047857' }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="valB"
              name={`${seriesB.shortName} (${seriesB.unit})`}
              stroke="#4f46e5"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#4f46e5' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
