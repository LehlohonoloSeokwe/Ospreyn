/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Calendar, FileText, CheckCircle2, TrendingUp, AlertCircle } from 'lucide-react';
import { MetricCard, MetricCardData } from '../components/MetricCard';
import { parse } from 'yaml';
import overviewRaw from '../../content/overview.yml?raw';

interface OverviewContent {
  updated: string;
  headline: string;
  summary: string;
  points: { title: string; text: string }[];
}
const OVERVIEW = parse(overviewRaw) as OverviewContent;
const DOT_COLOURS = [
  'bg-emerald-600 dark:bg-emerald-400',
  'bg-amber-600 dark:bg-amber-400',
  'bg-rose-600 dark:bg-rose-400',
  'bg-indigo-600 dark:bg-indigo-400',
];

export const OverviewPage: React.FC = () => {
  const [metrics, setMetrics] = useState<MetricCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/data/indicators.json')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load indicators dataset');
        return res.json();
      })
      .then((data) => {
        setMetrics(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Unable to load indicators from /data/indicators.json');
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Editorial Headline Hero */}
      <section className="mb-10 max-w-4xl">
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-emerald-800 dark:text-emerald-400 font-semibold uppercase tracking-wider mb-2">
          <span>South African Economic & Regulatory Monitor</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
          State of the South African Economy
        </h1>

        <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
          A high-fidelity intelligence console tracking South Africa’s sovereign macroeconomic performance, central bank monetary policy, labour dynamics, and structural market reforms. Built on primary data from the World Bank, South African Reserve Bank, Statistics South Africa, and National Treasury.
        </p>

        {/* Data Quality Guarantee Bar */}
        <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-200 dark:border-slate-800">
          <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
            <CheckCircle2 size={14} className="shrink-0" />
            <span>Sources cited on every indicator</span>
          </span>
          <span aria-hidden="true">·</span>
          <span>Data and analysis kept separate</span>
          <span aria-hidden="true">·</span>
          <Link to="/about" className="hover:text-slate-900 dark:hover:text-slate-100 underline decoration-slate-300">
            Methodology & Citations
          </Link>
          <span aria-hidden="true">·</span>
          <Link to="/verify" className="hover:text-slate-900 dark:hover:text-slate-100 underline decoration-slate-300">
            VERIFY.md Register
          </Link>
        </div>
      </section>

      {/* 6 Core Metric Cards Grid */}
      <section className="mb-14" aria-labelledby="core-indicators-heading">
        <div className="flex items-baseline justify-between mb-4">
          <h2 id="core-indicators-heading" className="text-xl sm:text-2xl font-serif font-semibold text-slate-900 dark:text-slate-100">
            Headline Economic Indicators
          </h2>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
            Click any metric for full time series & policy analysis
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-44 bg-slate-100 dark:bg-slate-800/50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-lg text-rose-800 dark:text-rose-300 text-sm flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {metrics.map((metric) => (
              <MetricCard key={metric.id} metric={metric} />
            ))}
          </div>
        )}
      </section>

      {/* Written Policy Commentary & Executive Synthesis */}
      <section className="mb-14 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
          <FileText size={14} className="text-emerald-700 dark:text-emerald-400" />
          <span>Written analysis · Updated {OVERVIEW.updated}</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-slate-100 mb-6">
          {OVERVIEW.headline}
        </h2>

        <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 font-sans text-sm sm:text-base leading-relaxed space-y-4">
          <p>
            {OVERVIEW.summary}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            {OVERVIEW.points.map((pt, idx) => (
              <div key={pt.title} className="space-y-2">
                <h3 className="text-base font-serif font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${DOT_COLOURS[idx % DOT_COLOURS.length]}`} />
                  {idx + 1}. {pt.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-normal">{pt.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
            Independent analysis of South African economic policy and regulation
          </div>

          <Link
            to="/about"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-emerald-800 dark:text-emerald-400 hover:underline"
          >
            <span>Read the full methodology</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </section>

      {/* Feature Navigation Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6" aria-label="Exploration panels">
        <Link
          to="/compare"
          className="group p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
              <BarChart3 size={20} className="text-emerald-700 dark:text-emerald-400" />
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="text-base font-serif font-semibold text-slate-900 dark:text-slate-100 mb-1">
              Dual-Axis Series Comparison
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
              Compare any two macroeconomic indicators on a synchronized time axis with automated scale divergence warnings.
            </p>
          </div>
          <span className="mt-4 text-xs font-mono text-emerald-700 dark:text-emerald-400 font-medium">
            Launch Comparison →
          </span>
        </Link>

        <Link
          to="/sectors"
          className="group p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
              <TrendingUp size={20} className="text-emerald-700 dark:text-emerald-400" />
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="text-base font-serif font-semibold text-slate-900 dark:text-slate-100 mb-1">
              Sector Profiles & Regulation
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
              Deep dives into Banking, Mining, Retail, and Telecoms. GDP contributions, governing legislation, and regulatory debates.
            </p>
          </div>
          <span className="mt-4 text-xs font-mono text-emerald-700 dark:text-emerald-400 font-medium">
            Explore 4 Key Sectors →
          </span>
        </Link>

        <Link
          to="/calendar"
          className="group p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
              <Calendar size={20} className="text-emerald-700 dark:text-emerald-400" />
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="text-base font-serif font-semibold text-slate-900 dark:text-slate-100 mb-1">
              Policy & Release Calendar
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
              Upcoming SARB MPC announcements, Stats SA statistical releases, National Treasury budget milestones, and parliamentary deadlines.
            </p>
          </div>
          <span className="mt-4 text-xs font-mono text-emerald-700 dark:text-emerald-400 font-medium">
            View Upcoming Dates →
          </span>
        </Link>
      </section>
    </div>
  );
};
