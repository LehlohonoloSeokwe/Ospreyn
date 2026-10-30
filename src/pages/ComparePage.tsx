/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ArrowLeftRight, HelpCircle, Layers } from 'lucide-react';
import { IndicatorDataset } from '../types';
import { DualAxisCompare } from '../components/DualAxisCompare';

const INDICATOR_FILES = [
  { id: 'gdp', name: 'Real GDP Growth (%)', file: 'gdp.json' },
  { id: 'inflation', name: 'CPI Inflation (%)', file: 'inflation.json' },
  { id: 'interest-rates', name: 'SARB Repo Rate (%)', file: 'interest_rates.json' },
  { id: 'unemployment', name: 'Unemployment Rate (%)', file: 'unemployment.json' },
  { id: 'rand', name: 'Rand / USD (LCU)', file: 'exchange_rate.json' },
  { id: 'debt', name: 'Central Govt Debt (% of GDP)', file: 'debt_gdp.json' },
];

export const ComparePage: React.FC = () => {
  const [selectedA, setSelectedA] = useState('inflation');
  const [selectedB, setSelectedB] = useState('interest-rates');

  const [seriesA, setSeriesA] = useState<IndicatorDataset | null>(null);
  const [seriesB, setSeriesB] = useState<IndicatorDataset | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fileA = INDICATOR_FILES.find((f) => f.id === selectedA)?.file || 'inflation.json';
    const fileB = INDICATOR_FILES.find((f) => f.id === selectedB)?.file || 'interest_rates.json';

    Promise.all([
      fetch(`/data/${fileA}`).then((r) => r.json()),
      fetch(`/data/${fileB}`).then((r) => r.json()),
    ])
      .then(([dataA, dataB]) => {
        setSeriesA(dataA);
        setSeriesB(dataB);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load comparative datasets', err);
        setLoading(false);
      });
  }, [selectedA, selectedB]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Title */}
      <div className="mb-8 max-w-3xl">
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-800 dark:text-emerald-400 font-semibold uppercase tracking-wider mb-2">
          <ArrowLeftRight size={14} />
          <span>Cross-Series Econometric Comparison</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Macroeconomic Series Comparison
        </h1>

        <p className="mt-3 text-base text-slate-600 dark:text-slate-300 font-sans leading-relaxed">
          Plot two South African macroeconomic time series on a synchronized time axis. Evaluate policy lags, monetary transmission dynamics (e.g. CPI Inflation vs. SARB Repo Rate), and fiscal feedback loops.
        </p>
      </div>

      {/* Selectors Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 mb-8 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="indicator-a-select"
              className="block text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2"
            >
              Primary Series (Left Y-Axis):
            </label>
            <select
              id="indicator-a-select"
              value={selectedA}
              onChange={(e) => setSelectedA(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              {INDICATOR_FILES.map((ind) => (
                <option key={ind.id} value={ind.id} disabled={ind.id === selectedB}>
                  {ind.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="indicator-b-select"
              className="block text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2"
            >
              Secondary Series (Right Y-Axis):
            </label>
            <select
              id="indicator-b-select"
              value={selectedB}
              onChange={(e) => setSelectedB(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              {INDICATOR_FILES.map((ind) => (
                <option key={ind.id} value={ind.id} disabled={ind.id === selectedA}>
                  {ind.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick presets */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2 text-xs font-mono text-slate-500">
          <span className="text-slate-400">Quick Presets:</span>
          <button
            onClick={() => {
              setSelectedA('inflation');
              setSelectedB('interest-rates');
            }}
            className="px-2 py-0.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
          >
            Inflation vs Repo Rate
          </button>
          <span aria-hidden="true">·</span>
          <button
            onClick={() => {
              setSelectedA('gdp');
              setSelectedB('debt');
            }}
            className="px-2 py-0.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
          >
            GDP Growth vs Debt/GDP
          </button>
          <span aria-hidden="true">·</span>
          <button
            onClick={() => {
              setSelectedA('rand');
              setSelectedB('inflation');
            }}
            className="px-2 py-0.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
          >
            ZAR/USD vs Inflation
          </button>
        </div>
      </div>

      {/* Comparative Chart */}
      {loading || !seriesA || !seriesB ? (
        <div className="h-96 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
      ) : (
        <>
          <DualAxisCompare seriesA={seriesA} seriesB={seriesB} />

          {/* Policy Transmission Commentary */}
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 my-8 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              <Layers size={14} className="text-emerald-700 dark:text-emerald-400" />
              <span>Analytical Framework · Policy Lag Considerations</span>
            </div>

            <h3 className="text-xl font-serif font-bold text-slate-900 dark:text-slate-100 mb-4">
              Understanding Co-Movement and Monetary Transmission Lags
            </h3>

            <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300 font-sans leading-relaxed">
              <p>
                In emerging markets like South Africa, monetary policy adjustments by the Reserve Bank typically operate with a <strong>12- to 18-month transmission lag</strong> into the real economy. When examining the relationship between inflation and benchmark policy rates, rate hikes initially coincide with peak inflationary spikes before successfully guiding consumer inflation lower over subsequent quarters.
              </p>
              <p>
                Similarly, fiscal debt expansion exhibits an inverse feedback loop with potential GDP growth: when sovereign debt servicing crowds out capital formation, multiplier effects diminish, suppressing future tax revenues and perpetuating high borrowing requirements.
              </p>
            </div>
          </section>
        </>
      )}
    </div>
  );
};
