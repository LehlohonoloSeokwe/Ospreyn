/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * "What matters now": a rotating banner of the figures and dates that matter this week.
 * Nothing here is typed in by hand. Rates, currencies and markets come from the Reserve Bank
 * feed (re-read every few minutes); trends come from the daily snapshot file; countdowns come
 * from the release calendar; indicators and the newest brief come from the site's own data.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ChevronLeft, ChevronRight, ExternalLink, Pause, Play } from 'lucide-react';
import type { CalendarEvent } from '../types';
import type { MetricCardData } from './MetricCard';
import { Sparkline } from './Sparkline';
import { Term } from './Term';
import { fetchLiveRates, LiveRate, LiveRateId, SARB_SOURCE_URL } from '../utils/sarbLive';
import { EMPTY_HISTORY, parseHistory, RatesHistory, rateChange, sparkValues } from '../utils/ratesHistory';
import { countdownLabel, daysBetween, decisionDay, nextOfCategory, todaySA } from '../utils/now';
import { checkStaleness } from '../utils/staleness';
import { formatNumber, formatUnitValue } from '../utils/formatters';
import { PUBLISHED_ARTICLES } from '../content/articles';

const ROTATE_MS = 8000;
const POLL_MS = 5 * 60 * 1000;
const POLL_DECISION_DAY_MS = 60 * 1000;

const TERM_FOR: Partial<Record<LiveRateId, string>> = {
  repo: 'repo-rate',
  prime: 'prime-rate',
  zaronia: 'zaronia',
  bond10: 'bond-yield',
  brent: 'brent',
  alsi: 'all-share',
};

function formatRate(rate: LiveRate): string {
  switch (rate.unit) {
    case 'ZAR': return `R ${formatNumber(rate.value, 4)}`;
    case 'USD': return `US$ ${formatNumber(rate.value, 2)}`;
    case 'pts': return formatNumber(rate.value, 0);
    default: return `${formatNumber(rate.value, 2)}%`;
  }
}

function formatDelta(rate: LiveRate, delta: number): string {
  const sign = delta > 0 ? '+' : delta < 0 ? '−' : '';
  const abs = Math.abs(delta);
  switch (rate.unit) {
    case 'ZAR': return `${sign}${formatNumber(abs, 4)}`;
    case 'USD': return `${sign}${formatNumber(abs, 2)}`;
    case 'pts': return `${sign}${formatNumber(abs, 0)}`;
    default: return `${sign}${formatNumber(abs, 2)} pts`;
  }
}

function formatAsAt(iso: string): string {
  if (!iso) return 'date not given';
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

function formatEventDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mq) return;
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

interface LiveState {
  status: 'loading' | 'ready' | 'unavailable';
  rates: LiveRate[];
  checkedAt: Date | null;
}

interface Slide {
  key: string;
  label: string;
  body: React.ReactNode;
  footer: React.ReactNode;
}

const Tile: React.FC<{ label: React.ReactNode; value: string; sub?: React.ReactNode; spark?: number[] }> = ({ label, value, sub, spark }) => (
  <div className="pr-4 min-w-0">
    <dt className="text-xs font-sans text-slate-500 dark:text-slate-400">{label}</dt>
    <dd className="mt-0.5 text-xl sm:text-2xl font-serif font-semibold text-slate-900 dark:text-slate-100 tabular-nums">{value}</dd>
    {sub && <dd className="text-xs font-mono text-slate-500 dark:text-slate-400">{sub}</dd>}
    {spark && spark.length >= 3 && (
      <dd className="mt-1" aria-label={`Trend over the last ${spark.length} recorded days`}>
        <Sparkline data={spark} width={96} height={24} />
      </dd>
    )}
  </div>
);

const RateGrid: React.FC<{ rates: LiveRate[]; history: RatesHistory; showTrend?: boolean }> = ({ rates, history, showTrend }) => (
  <dl className="grid grid-cols-2 lg:grid-cols-4 gap-y-4">
    {rates.map((rate) => {
      const change = rateChange(history, rate);
      const termId = TERM_FOR[rate.id];
      const label = termId ? <Term id={termId}>{rate.label}</Term> : rate.label;
      const moved = change && Math.abs(change.absolute) > 1e-9;
      return (
        <Tile
          key={rate.id}
          label={label}
          value={formatRate(rate)}
          spark={showTrend ? sparkValues(history, rate) : undefined}
          sub={
            <>
              As at {formatAsAt(rate.asAt)}
              {change && (
                <span className="block" aria-label={moved ? `Change since ${formatAsAt(change.since)}: ${formatDelta(rate, change.absolute)}` : 'Unchanged since the previous figure'}>
                  {moved ? `${change.absolute > 0 ? '▲' : '▼'} ${formatDelta(rate, change.absolute)} since ${formatAsAt(change.since)}` : 'Unchanged'}
                </span>
              )}
            </>
          }
        />
      );
    })}
  </dl>
);

const RatesFooter: React.FC<{ checkedAt: Date | null; extra?: React.ReactNode }> = ({ checkedAt, extra }) => (
  <>
    <a href={SARB_SOURCE_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 underline decoration-slate-300 hover:text-slate-900 dark:hover:text-slate-100">
      Source: SARB <ExternalLink size={11} aria-hidden="true" />
    </a>
    {checkedAt && <> · Read {checkedAt.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}, refreshed every few minutes</>}
    {' '}· These are the Reserve Bank’s published rates, not tick-by-tick prices. Not financial advice.
    {extra}
  </>
);

export const NowBanner: React.FC<{ metrics: MetricCardData[] }> = ({ metrics }) => {
  const [live, setLive] = useState<LiveState>({ status: 'loading', rates: [], checkedAt: null });
  const [history, setHistory] = useState<RatesHistory>(EMPTY_HISTORY);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [staticLoaded, setStaticLoaded] = useState(false);
  const [index, setIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const reducedMotion = useReducedMotion();

  const today = todaySA();
  const reviewedRepo = metrics.find((m) => m.id === 'interest-rates')?.latestValue;
  const liveRepo = live.rates.find((r) => r.id === 'repo')?.value ?? null;
  const decision = useMemo(() => decisionDay(events, today, liveRepo, reviewedRepo), [events, today, liveRepo, reviewedRepo]);

  // Calendar and rates history: read once.
  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([
      fetch('/data/calendar.json').then((r) => (r.ok ? r.json() : Promise.reject(r.status))),
      fetch('/data/rates_history.json').then((r) => (r.ok ? r.json() : Promise.reject(r.status))),
    ]).then(([cal, hist]) => {
      if (cancelled) return;
      if (cal.status === 'fulfilled' && Array.isArray(cal.value)) setEvents(cal.value as CalendarEvent[]);
      if (hist.status === 'fulfilled') setHistory(parseHistory(hist.value));
      setStaticLoaded(true);
    });
    return () => { cancelled = true; };
  }, []);

  // Live Reserve Bank figures: read now, then again every few minutes (every minute on a decision day).
  const pollMs = decision ? POLL_DECISION_DAY_MS : POLL_MS;
  useEffect(() => {
    let cancelled = false;
    const load = () => {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 8000);
      fetchLiveRates(controller.signal)
        .then((rates) => { if (!cancelled) setLive({ status: 'ready', rates, checkedAt: new Date() }); })
        .catch(() => { if (!cancelled) setLive((prev) => (prev.status === 'ready' ? prev : { status: 'unavailable', rates: [], checkedAt: null })); })
        .finally(() => window.clearTimeout(timeout));
    };
    load();
    const timer = window.setInterval(load, pollMs);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, [pollMs]);

  const slides = useMemo<Slide[]>(() => {
    const out: Slide[] = [];
    const rates = live.rates;
    const byGroup = (g: LiveRate['group']) => rates.filter((r) => r.group === g);

    if (decision) {
      const { event, liveRepo: repoNow, changed } = decision;
      out.push({
        key: 'decision',
        label: 'Decision day',
        body: (
          <div>
            <p className="text-lg sm:text-xl font-serif font-semibold text-slate-900 dark:text-slate-100">
              Today: <Term id="mpc">Monetary Policy Committee</Term> rate announcement{event.time ? ` at ${event.time}` : ''}
            </p>
            {repoNow !== null ? (
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                The Reserve Bank feed currently shows a <Term id="repo-rate">repo rate</Term> of <strong className="tabular-nums">{formatNumber(repoNow, 2)}%</strong>.
                {changed && reviewedRepo !== undefined && (
                  <> That differs from the last reviewed figure ({formatNumber(reviewedRepo, 2)}%), so the announcement may already be out.</>
                )}
              </p>
            ) : (
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">The live repo rate could not be read just now.</p>
            )}
          </div>
        ),
        footer: (
          <>
            <a href={event.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 underline decoration-slate-300 hover:text-slate-900 dark:hover:text-slate-100">
              Source: SARB MPC dates <ExternalLink size={11} aria-hidden="true" />
            </a>{' '}
            · Check the Reserve Bank’s statement for the decision itself.
          </>
        ),
      });
    }

    const policy = byGroup('rates');
    if (policy.length) {
      const repo = policy.find((r) => r.id === 'repo');
      const mismatch = !!repo && reviewedRepo !== undefined && Math.abs(repo.value - reviewedRepo) > 0.001;
      out.push({
        key: 'rates',
        label: 'Interest rates',
        body: (
          <>
            <RateGrid rates={policy} history={history} />
            {mismatch && repo && reviewedRepo !== undefined && (
              <p className="mt-3 flex items-start gap-2 rounded-md border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 px-3 py-2 text-xs text-amber-900 dark:text-amber-200">
                <AlertTriangle size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
                <span>The live repo rate ({formatNumber(repo.value, 2)}%) differs from the reviewed figure on this page ({formatNumber(reviewedRepo, 2)}%). The reviewed series is updated after each MPC decision.</span>
              </p>
            )}
          </>
        ),
        footer: <RatesFooter checkedAt={live.checkedAt} />,
      });
    }

    const currencies = byGroup('currency');
    if (currencies.length) {
      const haveTrend = currencies.some((r) => sparkValues(history, r).length >= 3);
      out.push({
        key: 'currency',
        label: 'The rand against major currencies',
        body: (
          <>
            <RateGrid rates={currencies} history={history} showTrend />
            {!haveTrend && (
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Trend lines appear once a few days of Reserve Bank figures have been recorded.</p>
            )}
          </>
        ),
        footer: <RatesFooter checkedAt={live.checkedAt} extra=" A higher number means a weaker rand." />,
      });
    }

    const markets = byGroup('market');
    if (markets.length) {
      out.push({
        key: 'markets',
        label: 'Markets and commodities',
        body: <RateGrid rates={markets} history={history} showTrend />,
        footer: <RatesFooter checkedAt={live.checkedAt} />,
      });
    }

    if (!decision) {
      const mpc = nextOfCategory(events, today, 'Monetary Policy');
      if (mpc) {
        const days = daysBetween(today, mpc.date);
        out.push({
          key: 'mpc',
          label: 'Next rate decision',
          body: (
            <div>
              <p className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 dark:text-slate-100">{countdownLabel(days)}</p>
              <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                <Term id="mpc">Monetary Policy Committee</Term> announcement · {formatEventDate(mpc.date)}
              </p>
              {!mpc.confirmed && <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">Date not yet confirmed by the institution.</p>}
            </div>
          ),
          footer: (
            <a href={mpc.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 underline decoration-slate-300 hover:text-slate-900 dark:hover:text-slate-100">
              Source: {mpc.institution} <ExternalLink size={11} aria-hidden="true" />
            </a>
          ),
        });
      }
    }

    const release = nextOfCategory(events, today, 'Statistical Release');
    if (release) {
      const days = daysBetween(today, release.date);
      out.push({
        key: 'release',
        label: 'Next data release',
        body: (
          <div>
            <p className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 dark:text-slate-100">{countdownLabel(days)}</p>
            <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{release.title} · {formatEventDate(release.date)}</p>
            {!release.confirmed && <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">Date not yet confirmed by the institution.</p>}
          </div>
        ),
        footer: (
          <a href={release.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 underline decoration-slate-300 hover:text-slate-900 dark:hover:text-slate-100">
            Source: {release.institution} <ExternalLink size={11} aria-hidden="true" />
          </a>
        ),
      });
    }

    const shown = ['unemployment', 'gdp', 'inflation', 'debt']
      .map((id) => metrics.find((m) => m.id === id))
      .filter((m): m is MetricCardData => !!m);
    if (shown.length) {
      out.push({
        key: 'indicators',
        label: 'Latest official figures',
        body: (
          <dl className="grid grid-cols-2 lg:grid-cols-4 gap-y-4">
            {shown.map((m) => {
              const stale = checkStaleness(m.lastPeriod).stale;
              return (
                <Tile
                  key={m.id}
                  label={m.shortName}
                  value={formatUnitValue(m.latestValue, m.unit)}
                  sub={
                    <>
                      Period {m.lastPeriod}
                      {stale && <span className="block text-amber-700 dark:text-amber-300">Older than usual</span>}
                    </>
                  }
                />
              );
            })}
          </dl>
        ),
        footer: (
          <>
            Reviewed series from the World Bank, Stats SA and the Reserve Bank ·{' '}
            <Link to="/verify" className="underline decoration-slate-300 hover:text-slate-900 dark:hover:text-slate-100">Sources and verification status</Link>
          </>
        ),
      });
    }

    const article = PUBLISHED_ARTICLES[0];
    if (article) {
      out.push({
        key: 'brief',
        label: 'Newest brief',
        body: (
          <div>
            <p className="text-lg sm:text-xl font-serif font-semibold text-slate-900 dark:text-slate-100 leading-snug">{article.title}</p>
            <p className="mt-2 text-sm text-slate-700 dark:text-slate-300 line-clamp-3">{article.summary}</p>
          </div>
        ),
        footer: (
          <Link to={`/briefs#${article.slug}`} className="underline decoration-slate-300 hover:text-slate-900 dark:hover:text-slate-100">
            Read the brief
          </Link>
        ),
      });
    }
    return out;
  }, [live, history, events, decision, today, reviewedRepo, metrics]);

  const count = slides.length;
  const rotating = count > 1 && !userPaused && !hovering && !focusWithin && !reducedMotion;

  useEffect(() => {
    if (!rotating) return;
    const t = window.setInterval(() => setIndex((i) => (i + 1) % count), ROTATE_MS);
    return () => window.clearInterval(t);
  }, [rotating, count]);

  // Keep the visitor on the same slide when slides appear or disappear around it.
  const current = count ? slides[((index % count) + count) % count] : null;
  const go = (delta: number) => setIndex((i) => (((i + delta) % count) + count) % count);

  const shell = 'mb-10 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900';
  const loading = live.status === 'loading' || !staticLoaded;

  if (loading) {
    return (
      <section className={shell} aria-label="What matters now" aria-busy="true">
        <div className="h-36 animate-pulse bg-slate-100/70 dark:bg-slate-800/40 rounded-lg" />
      </section>
    );
  }
  if (!current) return null;

  const btn = 'inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-emerald-600';

  return (
    <section
      className={shell}
      aria-roledescription="carousel"
      aria-label="What matters now"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocus={() => setFocusWithin(true)}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocusWithin(false); }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 pt-3">
        <h2 className="text-sm font-serif font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-60 motion-safe:animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600 dark:bg-emerald-400" />
          </span>
          What matters now
          <span className="font-mono text-xs font-normal uppercase tracking-wider text-slate-500 dark:text-slate-400">· {current.label}</span>
        </h2>
        {count > 1 && (
          <div className="flex items-center gap-1.5">
            <button type="button" className={btn} onClick={() => go(-1)} aria-label="Previous slide"><ChevronLeft size={14} aria-hidden="true" /></button>
            {!reducedMotion && (
              <button type="button" className={btn} onClick={() => setUserPaused((p) => !p)} aria-label={userPaused ? 'Start automatic rotation' : 'Pause automatic rotation'}>
                {userPaused ? <Play size={13} aria-hidden="true" /> : <Pause size={13} aria-hidden="true" />}
              </button>
            )}
            <button type="button" className={btn} onClick={() => go(1)} aria-label="Next slide"><ChevronRight size={14} aria-hidden="true" /></button>
          </div>
        )}
      </div>

      <div
        key={current.key}
        className="px-4 py-4 min-h-40"
        role="group"
        aria-roledescription="slide"
        aria-label={`${(((index % count) + count) % count) + 1} of ${count}: ${current.label}`}
        aria-live={rotating ? 'off' : 'polite'}
      >
        {current.body}
      </div>

      {live.status === 'unavailable' && (
        <p className="mx-4 mb-2 text-xs font-mono text-slate-500 dark:text-slate-400">
          Live Reserve Bank figures could not be loaded, so those slides are hidden. The rest is unaffected.
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800 px-4 py-2">
        <p className="text-xs font-mono text-slate-500 dark:text-slate-400 min-w-0 flex-1">{current.footer}</p>
        {count > 1 && (
          <div className="flex items-center gap-1" role="group" aria-label="Choose a slide">
            {slides.map((s, i) => {
              const active = s.key === current.key;
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Show slide ${i + 1}: ${s.label}`}
                  aria-current={active}
                  className="p-1 focus-visible:outline-2 focus-visible:outline-emerald-600 rounded"
                >
                  <span className={`block h-1.5 rounded-full transition-all ${active ? 'w-5 bg-emerald-600 dark:bg-emerald-400' : 'w-1.5 bg-slate-300 dark:bg-slate-600'}`} />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
