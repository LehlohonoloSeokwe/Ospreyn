/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Download, ArrowUpDown } from 'lucide-react';
import { IndicatorDataset, DatasetRecord } from '../types';
import { exportIndicatorToCsv } from '../utils/exportCsv';
import { formatNumber } from '../utils/formatters';

interface DataTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  indicator: IndicatorDataset;
}

export const DataTableModal: React.FC<DataTableModalProps> = ({
  isOpen,
  onClose,
  indicator,
}) => {
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sortedData = [...indicator.data].sort((a, b) => {
    return sortOrder === 'desc'
      ? b.period.localeCompare(a.period)
      : a.period.localeCompare(b.period);
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="data-table-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-3xl max-h-[85vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
          <div>
            <h3 id="data-table-title" className="text-lg font-serif font-semibold text-slate-900 dark:text-slate-100">
              Raw Data Series: {indicator.shortName}
            </h3>
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
              Unit: {indicator.unit} · Frequency: {indicator.frequency} · Source: {indicator.sourceName}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportIndicatorToCsv(indicator)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors"
            >
              <Download size={13} aria-hidden="true" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={onClose}
              aria-label="Close data table"
              className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Table */}
        <div className="flex-1 overflow-auto p-6">
          <table className="w-full text-left border-collapse text-xs">
            <caption className="sr-only">
              Historical values and event annotations for {indicator.indicatorName}
            </caption>
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 font-mono text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50">
                <th scope="col" className="py-2.5 px-3 font-semibold">
                  <button
                    onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                    className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-slate-100"
                  >
                    <span>Period</span>
                    <ArrowUpDown size={12} />
                  </button>
                </th>
                <th scope="col" className="py-2.5 px-3 text-right font-semibold">
                  Value ({indicator.unit})
                </th>
                <th scope="col" className="py-2.5 px-3 font-semibold">
                  Historical Context / Annotation
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {sortedData.map((row: DatasetRecord) => (
                <tr
                  key={row.period}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-slate-100">
                    {row.period}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums font-semibold text-slate-900 dark:text-slate-100">
                    {formatNumber(row.value, 2)}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 font-sans">
                    {row.annotation || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>{indicator.data.length} historical observations recorded</span>
          <a
            href={indicator.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline text-emerald-700 dark:text-emerald-400"
          >
            Direct Source Link ↗
          </a>
        </div>
      </div>
    </div>
  );
};
