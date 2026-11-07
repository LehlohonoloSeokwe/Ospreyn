/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { CORRECTIONS } from '../content/corrections';
import { SITE } from '../content/site';

const fmt = (iso: string) => {
  const d = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
};

export const CorrectionsPage: React.FC = () => (
  <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
    <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 dark:text-slate-100">Corrections and methods</h1>
    <p className="mt-4 text-slate-600 dark:text-slate-300 leading-relaxed">
      When a figure or statement on {SITE.name} is wrong, it is corrected on the page and recorded here, with what it said before and why it changed.
    </p>

    <section className="mt-10" aria-labelledby="methods-heading">
      <h2 id="methods-heading" className="text-xl font-serif font-semibold text-slate-900 dark:text-slate-100">How figures are sourced</h2>
      <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-300 list-disc pl-5 leading-relaxed">
        <li>Every indicator cites its source, the period it covers and the date it was checked.</li>
        <li>Live rates, currencies and market figures are read from the Reserve Bank’s public feed. They are the Reserve Bank’s published figures, not tick-by-tick prices.</li>
        <li>Some series are entered by hand after each release. If a series is overdue for an update, the Overview page says so.</li>
        <li>
          Anything that could not be checked against its primary source is flagged in the{' '}
          <Link to="/verify" className="underline">verification register</Link>. The full approach is in{' '}
          <Link to="/about" className="underline">Methodology and citations</Link>.
        </li>
      </ul>
    </section>

    <section className="mt-10" aria-labelledby="report-heading">
      <h2 id="report-heading" className="text-xl font-serif font-semibold text-slate-900 dark:text-slate-100">Report an error</h2>
      {SITE.contactEmail ? (
        <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">
          Please say which page and figure, and where you checked it.{' '}
          <a href={`mailto:${SITE.contactEmail}`} className="inline-flex items-center gap-1 underline"><Mail size={13} aria-hidden="true" />{SITE.contactEmail}</a>
        </p>
      ) : (
        <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">Contact details are not published yet.</p>
      )}
    </section>

    <section className="mt-10" aria-labelledby="log-heading">
      <h2 id="log-heading" className="text-xl font-serif font-semibold text-slate-900 dark:text-slate-100">Corrections log</h2>
      {CORRECTIONS.length === 0 ? (
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">No corrections have been published.</p>
      ) : (
        <ol className="mt-4 space-y-5">
          {CORRECTIONS.map((c, i) => (
            <li key={`${c.date}-${i}`} className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-sm">
              <p className="font-mono text-xs text-slate-500 dark:text-slate-400">{fmt(c.date)} · {c.where}</p>
              {c.was && <p className="mt-2 text-slate-700 dark:text-slate-300"><strong>Said:</strong> {c.was}</p>}
              {c.now && <p className="mt-1 text-slate-700 dark:text-slate-300"><strong>Now says:</strong> {c.now}</p>}
              {c.reason && <p className="mt-1 text-slate-600 dark:text-slate-400"><strong>Why:</strong> {c.reason}</p>}
            </li>
          ))}
        </ol>
      )}
    </section>
  </div>
);
