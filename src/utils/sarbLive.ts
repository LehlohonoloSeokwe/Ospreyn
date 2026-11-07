/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Live rates from the South African Reserve Bank (SARB) Web API.
 *
 * Source: https://custom.resbank.co.za/SarbWebApi (WebIndicators/HomePageRates
 * and WebIndicators/CurrentMarketRates). The API is public and allows requests
 * from a browser.
 *
 * The parser is deliberately tolerant. It walks whatever JSON comes back, finds
 * objects that look like a rate (a code, a value and a date) and matches the
 * ones we want by SARB timeseries code, with a name match as a fallback. If the
 * shape ever changes and nothing matches, the page shows no live strip rather
 * than a wrong number.
 */

export const SARB_BASE = 'https://custom.resbank.co.za/SarbWebApi/WebIndicators';
export const SARB_ENDPOINTS = [`${SARB_BASE}/CurrentMarketRates`, `${SARB_BASE}/HomePageRates`];
export const SARB_SOURCE_URL = 'https://www.resbank.co.za/en/home/what-we-do/financial-markets/rates';

export type LiveRateId =
  | 'usdzar' | 'gbpzar' | 'eurzar'
  | 'repo' | 'prime' | 'zaronia'
  | 'gold' | 'platinum' | 'brent' | 'alsi' | 'bond10';
export type LiveRateGroup = 'rates' | 'currency' | 'market';
export type LiveRateUnit = '%' | 'ZAR' | 'USD' | 'pts';

export interface LiveRate {
  id: LiveRateId;
  label: string;
  group: LiveRateGroup;
  unit: LiveRateUnit;
  code: string;
  value: number;
  /** Date the SARB attaches to the figure, as YYYY-MM-DD where it can be read. */
  asAt: string;
}

interface RateSpec {
  id: LiveRateId;
  label: string;
  group: LiveRateGroup;
  unit: LiveRateUnit;
  /** SARB timeseries code. Empty where the code is not confirmed: the name match is used instead. */
  code: string;
  /** Match on the published name if the code is not present. */
  namePattern: RegExp;
  /** Plausible range. A figure outside it is ignored rather than shown. */
  min: number;
  max: number;
}

export const RATE_SPECS: RateSpec[] = [
  { id: 'repo', label: 'Repo rate', group: 'rates', unit: '%', code: 'MMRD002A', namePattern: /policy rate|repo/i, min: 0.01, max: 50 },
  { id: 'prime', label: 'Prime lending rate', group: 'rates', unit: '%', code: 'MMRD000A', namePattern: /prime/i, min: 0.01, max: 50 },
  { id: 'zaronia', label: 'ZARONIA', group: 'rates', unit: '%', code: 'MMRD855A', namePattern: /zaronia/i, min: 0.01, max: 50 },
  { id: 'usdzar', label: 'Rand per US dollar', group: 'currency', unit: 'ZAR', code: 'EXCX135D', namePattern: /rand per u\.?s\.? ?dollar|rand per us\b|zar\/usd|usd\/zar/i, min: 5, max: 60 },
  { id: 'gbpzar', label: 'Rand per British pound', group: 'currency', unit: 'ZAR', code: '', namePattern: /rand per (british )?pound|rand per gbp|gbp\/zar|zar\/gbp/i, min: 5, max: 90 },
  { id: 'eurzar', label: 'Rand per euro', group: 'currency', unit: 'ZAR', code: '', namePattern: /rand per euro|rand per eur\b|eur\/zar|zar\/eur/i, min: 5, max: 90 },
  { id: 'gold', label: 'Gold (US$ per ounce)', group: 'market', unit: 'USD', code: '', namePattern: /^gold\b|gold price|gold \(/i, min: 500, max: 20000 },
  { id: 'platinum', label: 'Platinum (US$ per ounce)', group: 'market', unit: 'USD', code: '', namePattern: /platinum/i, min: 300, max: 8000 },
  { id: 'brent', label: 'Brent crude (US$ per barrel)', group: 'market', unit: 'USD', code: '', namePattern: /brent/i, min: 10, max: 300 },
  { id: 'alsi', label: 'JSE All Share index', group: 'market', unit: 'pts', code: '', namePattern: /all[- ]?share|alsi/i, min: 10000, max: 500000 },
  { id: 'bond10', label: '10-year government bond yield', group: 'market', unit: '%', code: '', namePattern: /10[- ]?year.*(bond|yield)|r2035|r2040|government bond/i, min: 1, max: 30 },
];

const norm = (k: string) => k.toLowerCase().replace(/[^a-z0-9]/g, '');

function pick(obj: Record<string, unknown>, candidates: string[]): unknown {
  const byNorm = new Map<string, unknown>();
  for (const [k, v] of Object.entries(obj)) byNorm.set(norm(k), v);
  for (const c of candidates) {
    if (byNorm.has(c)) return byNorm.get(c);
  }
  return undefined;
}

/** Reads numbers like "7.25", "7,25", "17 891" or "17\u00a0891,5". Returns null if not a number. */
export function parseSarbNumber(input: unknown): number | null {
  if (typeof input === 'number') return Number.isFinite(input) ? input : null;
  if (typeof input !== 'string') return null;
  let s = input.replace(/[\s\u00a0]/g, '').replace(/%$/, '');
  if (s === '') return null;
  // A lone comma is a decimal comma; commas before a dot are thousands separators.
  if (s.includes(',') && !s.includes('.')) s = s.replace(',', '.');
  else s = s.replace(/,/g, '');
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/** Returns YYYY-MM-DD for ISO strings, "/Date(ms)/" strings and plain dates. Null if unreadable. */
export function parseSarbDate(input: unknown): string | null {
  if (typeof input === 'number' && input > 1e11) return new Date(input).toISOString().slice(0, 10);
  if (typeof input !== 'string') return null;
  const ms = input.match(/\/Date\((-?\d+)/);
  if (ms) return new Date(Number(ms[1])).toISOString().slice(0, 10);
  const iso = input.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const t = Date.parse(input);
  return Number.isNaN(t) ? null : new Date(t).toISOString().slice(0, 10);
}

interface Candidate {
  code: string;
  name: string;
  value: number;
  asAt: string;
}

function collect(node: unknown, out: Candidate[], depth = 0): void {
  if (depth > 8 || node === null || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    for (const item of node) collect(item, out, depth + 1);
    return;
  }
  const obj = node as Record<string, unknown>;
  const rawValue = pick(obj, ['value', 'latestvalue', 'rate', 'currentvalue']);
  const value = parseSarbNumber(rawValue);
  if (value !== null) {
    const code = String(pick(obj, ['timeseriescode', 'seriescode', 'code', 'timeseries']) ?? '');
    const name = String(pick(obj, ['name', 'description', 'title', 'indicatorname', 'displayname']) ?? '');
    const asAt = parseSarbDate(pick(obj, ['date', 'latestdate', 'valuedate', 'lastperiod', 'period'])) ?? '';
    if (code || name) out.push({ code, name, value, asAt });
  }
  for (const v of Object.values(obj)) collect(v, out, depth + 1);
}

/** Finds the rates we show in one or more SARB responses. Earlier payloads win ties. */
export function extractLiveRates(payloads: unknown[]): LiveRate[] {
  const candidates: Candidate[] = [];
  for (const p of payloads) collect(p, candidates);

  const rates: LiveRate[] = [];
  for (const spec of RATE_SPECS) {
    const inRange = (c: Candidate) => c.value >= spec.min && c.value <= spec.max;
    const byCode = spec.code ? candidates.find((c) => c.code.toUpperCase() === spec.code && inRange(c)) : undefined;
    const byName = candidates.find((c) => spec.namePattern.test(c.name) && inRange(c));
    const hit = byCode ?? byName;
    if (!hit) continue;
    rates.push({ id: spec.id, label: spec.label, group: spec.group, unit: spec.unit, code: spec.code, value: hit.value, asAt: hit.asAt });
  }
  return rates;
}

/** Fetches the SARB boards. Resolves with whatever succeeded; throws only if every request failed. */
export async function fetchLiveRates(signal?: AbortSignal): Promise<LiveRate[]> {
  const results = await Promise.allSettled(
    SARB_ENDPOINTS.map(async (url) => {
      const res = await fetch(url, { signal, headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(`SARB ${res.status}`);
      return res.json();
    })
  );
  const payloads = results.flatMap((r) => (r.status === 'fulfilled' ? [r.value] : []));
  if (payloads.length === 0) throw new Error('SARB feed unreachable');
  const rates = extractLiveRates(payloads);
  if (rates.length === 0) throw new Error('SARB feed returned no recognisable rates');
  return rates;
}
