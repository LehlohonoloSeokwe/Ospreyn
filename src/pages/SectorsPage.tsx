/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Building2, Pickaxe, ShoppingBag, Radio, ExternalLink, ShieldCheck, FileText, Scale } from 'lucide-react';
import { SectorProfile } from '../types';

export const SectorsPage: React.FC = () => {
  const [sectors, setSectors] = useState<SectorProfile[]>([]);
  const [activeSectorId, setActiveSectorId] = useState<string>('banking');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/sectors.json')
      .then((res) => res.json())
      .then((data) => {
        setSectors(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load sectors', err);
        setLoading(false);
      });
  }, []);

  const activeSector = sectors.find((s) => s.id === activeSectorId) || sectors[0];

  const getSectorIcon = (id: string) => {
    switch (id) {
      case 'banking':
        return <Building2 size={18} />;
      case 'mining':
        return <Pickaxe size={18} />;
      case 'retail':
        return <ShoppingBag size={18} />;
      case 'telecoms':
        return <Radio size={18} />;
      default:
        return <Building2 size={18} />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Editorial Title */}
      <div className="mb-8 max-w-3xl">
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-800 dark:text-emerald-400 font-semibold uppercase tracking-wider mb-2">
          <span>Structural Sector Intelligence</span>
          <span aria-hidden="true">·</span>
          <span>Stats SA GDP P0441 by Industry</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          South African Business Sectors & Regulatory Frameworks
        </h1>

        <p className="mt-3 text-base text-slate-600 dark:text-slate-300 font-sans leading-relaxed">
          In-depth policy and regulatory profiles of four key pillars of the South African economy. Evaluates value-added GDP contributions, primary statutory oversight, compliance bottlenecks, and current policy debates. Excludes market speculation and licensed equity prices.
        </p>
      </div>

      {loading ? (
        <div className="h-96 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sector Navigation Sidebar / Tab buttons */}
          <div className="lg:col-span-1 space-y-2">
            <h2 className="text-xs uppercase tracking-wider font-mono text-slate-500 dark:text-slate-400 font-semibold mb-3">
              Sector Profiles
            </h2>

            {sectors.map((sec) => (
              <button
                key={sec.id}
                onClick={() => setActiveSectorId(sec.id)}
                className={`w-full text-left p-3.5 rounded-lg border transition-all flex items-center justify-between ${
                  sec.id === activeSectorId
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-900 dark:border-slate-100 font-semibold shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={sec.id === activeSectorId ? 'text-emerald-400 dark:text-emerald-700' : 'text-slate-400'}>
                    {getSectorIcon(sec.id)}
                  </span>
                  <div>
                    <div className="text-sm font-sans">{sec.name}</div>
                    <div className="text-xs font-mono opacity-80">{sec.gdpSharePercent !== null ? `${sec.gdpSharePercent}% of GDP` : 'GDP share to be verified'}</div>
                  </div>
                </div>
              </button>
            ))}

            {/* Note on data integrity */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-500 dark:text-slate-400 space-y-1">
              <div>Source: Stats SA GDP P0441</div>
              <div>Frequency: Quarterly / Annual</div>
              <div>Attribution: Licensed official gazettes</div>
            </div>
          </div>

          {/* Active Sector Content Area */}
          <div className="lg:col-span-3 space-y-8">
            {activeSector && (
              <>
                {/* Sector Header Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <div className="text-xs font-mono text-emerald-800 dark:text-emerald-400 uppercase tracking-wider mb-1">
                        Sector Deep Dive
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-slate-100">
                        {activeSector.name}
                      </h2>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 rounded-lg p-3">
                        <div className="text-xs font-mono text-slate-500">Share of National GDP</div>
                        <div className="text-2xl font-mono font-bold text-emerald-700 dark:text-emerald-400">
                          {activeSector.gdpSharePercent !== null ? `${activeSector.gdpSharePercent}%` : 'To be verified'}
                        </div>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 rounded-lg p-3 text-left">
                        <div className="text-xs font-mono text-slate-500">Employment Scale</div>
                        <div className="text-xs font-mono font-semibold text-slate-900 dark:text-slate-200 mt-1">
                          {activeSector.formalEmployment}
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="mt-6 text-base text-slate-700 dark:text-slate-300 font-sans leading-relaxed">
                    {activeSector.headlineSummary}
                  </p>
                </div>

                {/* Key Regulators & Governing Statutes Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Regulators */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs">
                    <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                      <ShieldCheck size={14} className="text-emerald-700 dark:text-emerald-400" />
                      <span>Primary Regulatory Authorities</span>
                    </div>

                    <ul className="space-y-2 text-sm text-slate-800 dark:text-slate-200 font-sans">
                      {activeSector.keyRegulators.map((reg, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-emerald-600 dark:text-emerald-400 font-mono text-xs mt-0.5">•</span>
                          <span>{reg}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Statutes */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs">
                    <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                      <Scale size={14} className="text-indigo-600 dark:text-indigo-400" />
                      <span>Key Governing Legislation & Codes</span>
                    </div>

                    <ul className="space-y-2 text-sm text-slate-800 dark:text-slate-200 font-sans">
                      {activeSector.keyLegislation.map((leg, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-indigo-600 dark:text-indigo-400 font-mono text-xs mt-0.5">•</span>
                          <span>{leg}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Current Regulatory & Policy Issues */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
                    <FileText size={14} className="text-amber-600 dark:text-amber-400" />
                    <span>Active Regulatory Debates & Policy Issues</span>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800 space-y-6">
                    {activeSector.policyIssues.map((issue, idx) => (
                      <div key={idx} className={idx > 0 ? 'pt-6' : ''}>
                        <h4 className="text-base font-serif font-bold text-slate-900 dark:text-slate-100 mb-1">
                          {issue.topic}
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-300 font-sans leading-relaxed mb-2">
                          {issue.summary}
                        </p>
                        <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
                          <strong className="text-slate-700 dark:text-slate-300">Key Stakeholders:</strong> {issue.stakeholders}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Official Regulator & Industry Publications */}
                <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-6 text-xs font-mono">
                  <h4 className="font-semibold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-3">
                    Curated Official Publications & Regulators Whitepapers
                  </h4>

                  <div className="space-y-2">
                    {activeSector.officialPublications.map((pub, idx) => (
                      <a
                        key={idx}
                        href={pub.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-lg hover:border-slate-300 flex items-center justify-between gap-4 transition-colors group"
                      >
                        <div className="truncate">
                          <span className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                            {pub.title}
                          </span>
                          <span className="text-slate-400 ml-2">
                            ({pub.publisher} · {pub.date})
                          </span>
                        </div>
                        <ExternalLink size={13} className="shrink-0 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-100" />
                      </a>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
