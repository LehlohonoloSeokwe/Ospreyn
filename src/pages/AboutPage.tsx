/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Mail, ShieldCheck, Database, Scale, BookOpen, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SITE } from '../content/site';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Hero Section */}
      <div className="mb-12 max-w-3xl">
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-800 dark:text-emerald-400 font-semibold uppercase tracking-wider mb-2">
          <BookOpen size={15} />
          <span>Methodology & Standards</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          {SITE.aboutTitle}
        </h1>

        <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 font-sans leading-relaxed">
          {SITE.aboutIntro}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: About card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center text-emerald-800 dark:text-emerald-300 font-serif font-bold text-2xl mb-4">
              {SITE.name.charAt(0)}
            </div>

            <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-slate-100">
              {SITE.name}
            </h2>
            <div className="text-xs font-mono text-emerald-800 dark:text-emerald-400 font-medium mt-0.5">
              {SITE.tagline}
            </div>

            <p className="mt-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-sans leading-relaxed">
              {SITE.aboutCard}
            </p>

            {SITE.contactEmail && (
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-mono">
                <a
                  href={`mailto:${SITE.contactEmail}`}
                  className="flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
                >
                  <Mail size={14} className="text-slate-400" />
                  <span>{SITE.contactEmail}</span>
                </a>
              </div>
            )}
          </div>


          {/* Quick links to verification register */}
          <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-6 text-xs font-mono space-y-3">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
              <ShieldCheck size={14} className="text-emerald-700 dark:text-emerald-400" />
              <span>Data Audit Register</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 font-sans leading-normal">
              Review every raw source URL, retrieval date, and hand-verification status log in our audit registry.
            </p>
            <Link
              to="/verify"
              className="inline-block text-emerald-700 dark:text-emerald-400 font-semibold hover:underline"
            >
              Open verification register →
            </Link>
          </div>
        </div>

        {/* Right 2 Columns: Methodology, Mathematical Formulas & Legal Terms */}
        <div className="lg:col-span-2 space-y-10">
          {/* Section 1: Methodology & Principles */}
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              <Database size={14} className="text-emerald-700 dark:text-emerald-400" />
              <span>Empirical Standards</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 dark:text-slate-100 mb-4">
              Data Sourcing Methodology & Integrity Rules
            </h2>

            <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300 font-sans leading-relaxed">
              <p>
                <strong>Sourced data:</strong> Every quantitative metric on Ospreyn comes from a cited public source. If a figure cannot be checked against its primary source, it is marked with status <code className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">TO_VERIFY</code> and listed in the verification register (VERIFY.md).
              </p>
              <p>
                <strong>Separation of Data and Analysis:</strong> Quantitative series are retrieved directly via <code className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">/scripts/fetch-data.ts</code> into normalized JSON schemas. All policy conclusions, risk assessments, and executive summaries are authored as distinct qualitative commentary in <code className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">/content/*.md</code>.
              </p>
              <p>
                <strong>No Scraped Market Data:</strong> To respect intellectual property and data provider terms of use, Ospreyn does not scrape live JSE stock prices, commercial exchange feeds, or proprietary private index data. All metrics are published under open government and multilateral public data licenses.
              </p>
            </div>
          </section>

          {/* Section 2: Mathematical Formulations */}
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              <Scale size={14} className="text-indigo-600 dark:text-indigo-400" />
              <span>Formulas & Calculations</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 dark:text-slate-100 mb-4">
              Derived Economic Formulas
            </h2>

            <div className="space-y-6 text-sm text-slate-700 dark:text-slate-300 font-sans leading-relaxed">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800 font-mono text-xs">
                <div className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  1. Percentage Delta (% Change)
                </div>
                <div className="text-emerald-700 dark:text-emerald-400 font-bold mb-1">
                  % Delta = ((Value_t - Value_t-1) / |Value_t-1|) × 100
                </div>
                <p className="text-slate-500 font-sans text-xs">
                  Measures the proportional shift between consecutive reporting periods (annual or quarterly).
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800 font-mono text-xs">
                <div className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  2. Fisher Real Interest Rate Equation
                </div>
                <div className="text-emerald-700 dark:text-emerald-400 font-bold mb-1">
                  r = [ (1 + i / 100) / (1 + π / 100) - 1 ] × 100
                </div>
                <p className="text-slate-500 font-sans text-xs">
                  Where <em>i</em> is the nominal SARB Repo Rate and <em>π</em> is the headline CPI inflation rate. Preferred over the simple linear approximation (i - π) for higher fidelity in emerging markets.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800 font-mono text-xs">
                <div className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  3. Simple Moving Average (3-Period SMA)
                </div>
                <div className="text-emerald-700 dark:text-emerald-400 font-bold mb-1">
                  SMA_t = (Y_t + Y_t-1 + Y_t-2) / 3
                </div>
                <p className="text-slate-500 font-sans text-xs">
                  Smooths high-frequency cyclical volatility in commodity price spikes and currency swings.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Data Sources Table */}
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              <BookOpen size={14} className="text-emerald-700 dark:text-emerald-400" />
              <span>Data Catalog</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 dark:text-slate-100 mb-4">
              Official Data Sources & Terms of Attribution
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400">
                    <th className="py-2.5 px-3">Dataset</th>
                    <th className="py-2.5 px-3">Institution</th>
                    <th className="py-2.5 px-3">Identifier / Series</th>
                    <th className="py-2.5 px-3">License / Terms</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-100">GDP Growth</td>
                    <td className="py-2.5 px-3">World Bank</td>
                    <td className="py-2.5 px-3 text-emerald-700 dark:text-emerald-400">NY.GDP.MKTP.KD.ZG</td>
                    <td className="py-2.5 px-3 text-slate-500">CC-BY 4.0 Open Data</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-100">CPI Inflation</td>
                    <td className="py-2.5 px-3">World Bank / Stats SA</td>
                    <td className="py-2.5 px-3 text-emerald-700 dark:text-emerald-400">FP.CPI.TOTL.ZG (P0141)</td>
                    <td className="py-2.5 px-3 text-slate-500">Open Public Release</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-100">Repo Rate</td>
                    <td className="py-2.5 px-3">SARB</td>
                    <td className="py-2.5 px-3 text-emerald-700 dark:text-emerald-400">SARB.REPO (MPC Statements)</td>
                    <td className="py-2.5 px-3 text-slate-500">Public Domain / SARB Act</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-100">Unemployment</td>
                    <td className="py-2.5 px-3">World Bank / Stats SA</td>
                    <td className="py-2.5 px-3 text-emerald-700 dark:text-emerald-400">SL.UEM.TOTL.ZS (P0211)</td>
                    <td className="py-2.5 px-3 text-slate-500">Official Statistics Act</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-100">ZAR / USD</td>
                    <td className="py-2.5 px-3">World Bank / SARB</td>
                    <td className="py-2.5 px-3 text-emerald-700 dark:text-emerald-400">PA.NUS.FCRF</td>
                    <td className="py-2.5 px-3 text-slate-500">IMF IFS / Open Data</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-100">Govt Debt % GDP</td>
                    <td className="py-2.5 px-3">World Bank / Treasury</td>
                    <td className="py-2.5 px-3 text-emerald-700 dark:text-emerald-400">GC.DOD.TOTL.GD.ZS</td>
                    <td className="py-2.5 px-3 text-slate-500">PFMA / Budget Review</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 4: Legal Disclaimer */}
          <section className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 rounded-xl p-6 text-xs font-mono text-amber-900 dark:text-amber-300">
            <div className="flex items-center gap-2 font-bold mb-2 uppercase tracking-wider">
              <AlertCircle size={15} className="text-amber-600 dark:text-amber-400" />
              <span>Statutory Legal & Policy Disclaimer</span>
            </div>
            <p className="leading-relaxed font-sans text-xs">
              This publication and dashboard platform are developed strictly for educational, academic, and policy analysis purposes. The content does not constitute financial, investment, legal, or tax advice, nor should it be relied upon as a solicitation to execute transactions in financial instruments, currency pairs, or sovereign securities. Ospreyn and its contributors do not accept liability for losses arising from actions taken based on the information published herein.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
