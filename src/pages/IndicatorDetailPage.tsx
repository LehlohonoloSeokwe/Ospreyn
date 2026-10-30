/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  HelpCircle,
  Users,
  Calendar,
  Layers,
  ArrowLeft,
  ChevronRight,
  Database,
} from 'lucide-react';
import { IndicatorDataset } from '../types';
import { IndicatorChart } from '../components/IndicatorChart';
import { DefinitionNote } from '../components/DefinitionNote';
import { QualityBadge } from '../components/QualityBadge';
import { formatNumber } from '../utils/formatters';
import { ANALYSES } from '../content/analyses';


const ALL_INDICATORS_NAV = [
  { id: 'gdp', name: 'Real GDP Growth' },
  { id: 'inflation', name: 'CPI Inflation' },
  { id: 'interest-rates', name: 'SARB Repo Rate' },
  { id: 'unemployment', name: 'Unemployment' },
  { id: 'rand', name: 'ZAR / USD' },
  { id: 'debt', name: 'Govt Debt % GDP' },
];

export const IndicatorDetailPage: React.FC = () => {
  const { indicatorId } = useParams<{ indicatorId: string }>();
  const id = indicatorId || 'gdp';

  const [indicator, setIndicator] = useState<IndicatorDataset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
      const DATA_FILES: Record<string, string> = {
     'interest-rates': 'interest_rates.json',
     debt: 'debt_gdp.json',
     rand: 'exchange_rate.json',
   };
   const filename = DATA_FILES[id] ?? `${id}.json`;

    fetch(`/data/${filename}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load dataset for ${id}`);
        return res.json();
      })
      .then((data: IndicatorDataset) => {
        setIndicator(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(`Unable to load dataset for indicator "${id}".`);
        setLoading(false);
      });
  }, [id]);

  const analysis = ANALYSES[id] || {
    trend: 'Trend analysis undergoing review.',
    whyItMatters: 'Policy relevance details in progress.',
    whoIsAffected: 'Key stakeholders under assessment.',
    title: '',
    sources: [],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
        <Link to="/" className="hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-1">
          <ArrowLeft size={13} />
          <span>Overview</span>
        </Link>
        <ChevronRight size={13} className="text-slate-400" />
        <span className="text-slate-700 dark:text-slate-200 font-semibold">{indicator?.shortName || id.toUpperCase()}</span>
      </nav>

      {/* Horizontal Indicator Switcher Tabs */}
      <div className="mb-8 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 min-w-max">
          {ALL_INDICATORS_NAV.map((item) => (
            <Link
              key={item.id}
              to={`/indicators/${item.id}`}
              className={`px-3 py-1.5 text-xs font-mono rounded-md transition-colors ${
                item.id === id
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
          <div className="h-96 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
        </div>
      ) : error || !indicator ? (
        <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-slate-100 mb-2">Indicator Not Found</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{error || 'Unknown indicator ID.'}</p>
          <Link to="/" className="text-xs font-mono text-emerald-700 dark:text-emerald-400 font-semibold hover:underline">
            ← Return to Overview
          </Link>
        </div>
      ) : (
        <>
          {/* Header Title & Key Metric Row */}
          <section className="mb-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Official Time Series #{indicator.seriesCode || indicator.id}
                  </span>
                  <QualityBadge status={indicator.qualityStatus} size="sm" />
                </div>

                <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  {indicator.indicatorName}
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-mono mt-1">
                  Unit: {indicator.unit} · Frequency: {indicator.frequency} · Last Verified Period: {indicator.lastPeriod}
                </p>
              </div>

              {/* Latest Figure Capsule */}
              <div className="shrink-0 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 text-right">
                <div className="text-xs font-mono text-slate-500 dark:text-slate-400">Latest Recorded Value</div>
                <div className="text-3xl sm:text-4xl font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                  {formatNumber(indicator.latestValue, 2)}
                  <span className="text-lg font-sans text-slate-500 dark:text-slate-400 ml-1 font-normal">
                    {indicator.unit}
                  </span>
                </div>
                <div className="text-xs font-mono text-slate-600 dark:text-slate-400 mt-1">
                  Prior Period: {formatNumber(indicator.previousValue, 2)} {indicator.unit} (
                  <span className={indicator.changeAbsolute > 0 ? 'text-emerald-700 dark:text-emerald-400 font-semibold' : 'text-rose-700 dark:text-rose-400 font-semibold'}>
                    {indicator.changeAbsolute > 0 ? '+' : ''}{indicator.changeAbsolute}
                  </span>
                  )
                </div>
              </div>
            </div>
          </section>

          {/* Interactive Chart Graphic */}
          <IndicatorChart indicator={indicator} defaultTimeRange="10Y" />

          {/* Institutional Definition & Methodology Note */}
          <DefinitionNote
            definition={indicator.definitionNote}
            methodologyDetail={indicator.methodologyDetail}
          />

          {/* "What This Means" Policy Analysis Block (Separated from Data) */}
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 my-8 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              <ShieldCheck size={14} className="text-emerald-700 dark:text-emerald-400" />
              <span>Written Policy Analysis · Ospreyn</span>
            </div>

            <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-slate-100 mb-6">
              What This Means: Three-Tier Strategic Assessment
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">
              {/* Part 1: Trend */}
              <div className="pt-4 md:pt-0 md:pr-6 space-y-2">
                <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-serif font-semibold text-base">
                  <TrendingUp size={16} className="text-emerald-700 dark:text-emerald-400" />
                  <span>1. The Trend</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                  {analysis.trend}
                </p>
              </div>

              {/* Part 2: Why it matters */}
              <div className="pt-4 md:pt-0 md:px-6 space-y-2">
                <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-serif font-semibold text-base">
                  <HelpCircle size={16} className="text-amber-600 dark:text-amber-400" />
                  <span>2. Why It Matters</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                  {analysis.whyItMatters}
                </p>
              </div>

              {/* Part 3: Who is affected */}
              <div className="pt-4 md:pt-0 md:pl-6 space-y-2">
                <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-serif font-semibold text-base">
                  <Users size={16} className="text-indigo-600 dark:text-indigo-400" />
                  <span>3. Who Is Affected</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                  {analysis.whoIsAffected}
                </p>
              </div>
            </div>

            {analysis.sources.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                <h3 className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 mb-2">Sources for this analysis</h3>
                <ul className="list-disc pl-5 space-y-1 text-xs font-mono text-slate-500 dark:text-slate-400">
                  {analysis.sources.map((src) => (
                    <li key={src}>{src}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* Secondary Series Section if available (e.g. Monthly Stats SA CPI or QLFS breakdown) */}
          {indicator.secondarySeries && (
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 my-8 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                <Layers size={14} className="text-indigo-600 dark:text-indigo-400" />
                <span>Complementary Domestic Series · {indicator.secondarySeries.sourceName}</span>
              </div>

              <h3 className="text-xl font-serif font-bold text-slate-900 dark:text-slate-100 mb-2">
                {indicator.secondarySeries.name}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-sans mb-4">
                {indicator.secondarySeries.definitionNote}
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left font-mono border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400">
                      <th className="py-2 px-3 font-semibold">Period</th>
                      <th className="py-2 px-3 text-right font-semibold">Value ({indicator.secondarySeries.unit})</th>
                      <th className="py-2 px-3 font-semibold">Institutional Annotation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {indicator.secondarySeries.data.slice(-8).map((row) => (
                      <tr key={row.period} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                        <td className="py-2 px-3 font-medium text-slate-900 dark:text-slate-100">{row.period}</td>
                        <td className="py-2 px-3 text-right font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                          {formatNumber(row.value, 2)}
                        </td>
                        <td className="py-2 px-3 text-slate-500 dark:text-slate-400 font-sans">{row.annotation || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Primary Source Panel */}
          <section className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 my-8 text-xs font-mono">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold uppercase tracking-wider mb-3">
              <Database size={14} className="text-emerald-700 dark:text-emerald-400" />
              <span>Primary Source Verification Panel</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-slate-600 dark:text-slate-400">
              <div>
                <span className="block text-slate-400 dark:text-slate-500">Institution:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{indicator.sourceName}</span>
              </div>
              <div>
                <span className="block text-slate-400 dark:text-slate-500">Catalog Code:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{indicator.seriesCode || 'Domestic Official'}</span>
              </div>
              <div>
                <span className="block text-slate-400 dark:text-slate-500">Harvest Date:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{indicator.retrievalDate}</span>
              </div>
              <div>
                <span className="block text-slate-400 dark:text-slate-500">Attribution Link:</span>
                <a
                  href={indicator.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
                >
                  <span>Open Official Source</span>
                  <ExternalLink size={11} />
                </a>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
};
