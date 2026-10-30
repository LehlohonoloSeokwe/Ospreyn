/**
 * Builds the hand-maintained datasets (repo rate, QLFS series, calendar, sectors)
 * from the YAML files in /content/data, which are editable in the admin page.
 * Runs on every build and at the end of the weekly data job, so edits are never overwritten.
 */
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';

type Point = { period: string; value: number; annotation?: string };

const read = (root: string, file: string) => parse(fs.readFileSync(path.join(root, 'content/data', file), 'utf-8'));
const readJson = (p: string) => JSON.parse(fs.readFileSync(p, 'utf-8'));
const writeJson = (p: string, v: unknown) => fs.writeFileSync(p, JSON.stringify(v, null, 2));
const round2 = (n: number) => Math.round(n * 100) / 100;

export function validatePoints(label: string, points: Point[]): void {
  if (!Array.isArray(points) || points.length === 0) throw new Error(`${label}: no data points`);
  const seen = new Set<string>();
  let prev = '';
  for (const p of points) {
    if (typeof p.value !== 'number' || Number.isNaN(p.value)) throw new Error(`${label}: bad value for ${p.period}`);
    if (seen.has(p.period)) throw new Error(`${label}: duplicate period ${p.period}`);
    if (p.period < prev) throw new Error(`${label}: periods out of order at ${p.period}`);
    seen.add(p.period);
    prev = p.period;
  }
}

export function applyManualData(root: string, dataDir: string): void {
  // ---- Repo rate ----
  const repo = read(root, 'repo_rate.yml');
  const decisions: Point[] = repo.decisions;
  validatePoints('repo_rate.decisions', decisions);
  const annual: Point[] = [...repo.annual];
  validatePoints('repo_rate.annual', annual);
  const lastDecision = decisions[decisions.length - 1];
  const lastYear = lastDecision.period.slice(0, 4);
  if (!annual.some((p) => p.period === lastYear)) {
    annual.push({
      period: lastYear,
      value: lastDecision.value,
      annotation: `Value as at the latest MPC decision (${lastDecision.period})`,
    });
  }
  const latest = annual[annual.length - 1];
  const previous = annual[annual.length - 2];
  const dataset = {
    ...repo.meta,
    retrievalDate: String(repo.meta.lastReviewed),
    lastPeriod: latest.period,
    latestValue: latest.value,
    previousValue: previous.value,
    changeAbsolute: round2(latest.value - previous.value),
    changePercentage: round2(((latest.value - previous.value) / previous.value) * 100),
    data: annual,
    secondarySeries: { ...repo.decisionsMeta, data: decisions },
  };
  delete (dataset as Record<string, unknown>).lastReviewed;
  writeJson(path.join(dataDir, 'interest_rates.json'), dataset);

  // ---- QLFS secondary series on the unemployment dataset ----
  const qlfs = read(root, 'qlfs.yml');
  validatePoints('qlfs', qlfs.data);
  const unemploymentPath = path.join(dataDir, 'unemployment.json');
  if (fs.existsSync(unemploymentPath)) {
    const u = readJson(unemploymentPath);
    const { lastReviewed: _ignored, ...qMeta } = qlfs.meta;
    u.secondarySeries = { ...qMeta, data: qlfs.data };
    writeJson(unemploymentPath, u);
  }

  // ---- indicators.json: keep the repo-rate card in step ----
  const indicatorsPath = path.join(dataDir, 'indicators.json');
  if (fs.existsSync(indicatorsPath)) {
    const list = readJson(indicatorsPath);
    for (const item of list) {
      if (item.id === 'interest-rates') {
        item.latestValue = dataset.latestValue;
        item.previousValue = dataset.previousValue;
        item.changeAbsolute = dataset.changeAbsolute;
        item.changePercentage = dataset.changePercentage;
        item.lastPeriod = dataset.lastPeriod;
        item.retrievalDate = dataset.retrievalDate;
        item.sparkline = annual.slice(-8).map((p) => p.value);
      }
    }
    writeJson(indicatorsPath, list);
  }

  // ---- Calendar and sectors ----
  const calendar = read(root, 'calendar.yml').events as { date: string; confirmed: boolean }[];
  for (const e of calendar) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(e.date))) throw new Error(`calendar: bad date ${e.date}`);
  }
  calendar.sort((a, b) => String(a.date).localeCompare(String(b.date)));
  writeJson(path.join(dataDir, 'calendar.json'), calendar);
  writeJson(path.join(dataDir, 'sectors.json'), read(root, 'sectors.yml').sectors);
}
