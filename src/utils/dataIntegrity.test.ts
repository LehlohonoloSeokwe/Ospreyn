import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';

const DATA_DIR = path.resolve(process.cwd(), 'public/data');
const DATASETS = ['gdp', 'inflation', 'interest_rates', 'unemployment', 'exchange_rate', 'debt_gdp'];
const REQUIRED = ['indicatorName', 'unit', 'frequency', 'sourceName', 'sourceUrl', 'retrievalDate', 'lastPeriod', 'latestValue'];

const load = (name: string) => JSON.parse(fs.readFileSync(path.join(DATA_DIR, `${name}.json`), 'utf-8'));

for (const name of DATASETS) {
  test(`${name}: has source, unit, dates and data`, () => {
    const d = load(name);
    for (const field of REQUIRED) {
      assert.ok(d[field] !== undefined && d[field] !== '', `${name} is missing "${field}"`);
    }
    assert.ok(Array.isArray(d.data) && d.data.length > 0, `${name} has no data points`);
  });

  test(`${name}: latest value and period match the last data point`, () => {
    const d = load(name);
    const last = d.data[d.data.length - 1];
    assert.equal(d.lastPeriod, last.period, `${name} lastPeriod does not match the last data point`);
    assert.equal(d.latestValue, last.value, `${name} latestValue does not match the last data point`);
  });

  test(`${name}: periods are unique and in order`, () => {
    const d = load(name);
    const periods = d.data.map((p: { period: string }) => p.period);
    assert.equal(new Set(periods).size, periods.length, `${name} has duplicate periods`);
    assert.deepEqual([...periods].sort(), periods, `${name} periods are not in order`);
  });
}

test('secondary series have a source and ordered, unique periods', () => {
  for (const name of DATASETS) {
    const s = load(name).secondarySeries;
    if (!s) continue;
    assert.ok(s.name && s.sourceName, `${name} secondary series needs a name and source`);
    const periods = s.data.map((p: { period: string }) => p.period);
    assert.equal(new Set(periods).size, periods.length, `${name} secondary has duplicate periods`);
    assert.deepEqual([...periods].sort(), periods, `${name} secondary periods are not in order`);
  }
});

test('indicators.json agrees with each dataset', () => {
  const idToFile: Record<string, string> = {
    gdp: 'gdp', inflation: 'inflation', 'interest-rates': 'interest_rates',
    unemployment: 'unemployment', rand: 'exchange_rate', debt: 'debt_gdp',
  };
  const indicators = load('indicators');
  for (const ind of indicators) {
    const d = load(idToFile[ind.id]);
    assert.equal(ind.latestValue, d.latestValue, `${ind.id}: latestValue differs from its dataset`);
    assert.equal(ind.lastPeriod, d.lastPeriod, `${ind.id}: lastPeriod differs from its dataset`);
  }
});

test('calendar entries have dates and a confirmed flag', () => {
  for (const e of load('calendar')) {
    assert.match(e.date, /^\d{4}-\d{2}-\d{2}$/, `bad date on ${e.title}`);
    assert.equal(typeof e.confirmed, 'boolean', `${e.title} needs a confirmed flag`);
  }
});

test('every indicator has an analysis file with the four parts and sources', () => {
  for (const f of ['gdp', 'inflation', 'interest-rates', 'unemployment', 'rand', 'debt']) {
    const d = parse(fs.readFileSync(path.resolve(process.cwd(), `content/analysis/${f}.yml`), 'utf-8'));
    for (const field of ['title', 'trend', 'whyItMatters', 'whoIsAffected']) {
      assert.ok(typeof d[field] === 'string' && d[field].trim().length > 0, `${f} is missing "${field}"`);
    }
    assert.ok(Array.isArray(d.sources) && d.sources.length > 0, `${f} has no sources listed`);
  }
});

test('published articles have a title, date, summary and at least one source', () => {
  const dir = path.resolve(process.cwd(), 'content/articles');
  for (const file of fs.readdirSync(dir).filter((n) => n.endsWith('.md'))) {
    const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
    const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    assert.ok(m, `${file} has no front matter`);
    const fm = parse(m![1]);
    assert.ok(fm.title && fm.date && fm.summary, `${file} needs a title, date and summary`);
    if (fm.draft !== true) {
      assert.ok(Array.isArray(fm.sources) && fm.sources.length > 0, `${file} is published but lists no sources`);
    }
  }
});

test('admin config points at files that exist and has no placeholder skipped silently', () => {
  const cfg = parse(fs.readFileSync(path.resolve(process.cwd(), 'public/admin/config.yml'), 'utf-8'));
  for (const col of cfg.collections) {
    if (col.folder) assert.ok(fs.existsSync(path.resolve(process.cwd(), col.folder)), `missing folder ${col.folder}`);
    for (const f of col.files ?? []) {
      assert.ok(fs.existsSync(path.resolve(process.cwd(), f.file)), `missing file ${f.file}`);
    }
  }
});

test('manual data builder rejects out-of-order periods', async () => {
  const { validatePoints } = await import('../../scripts/manual');
  assert.throws(() => validatePoints('x', [{ period: '2025-03', value: 1 }, { period: '2025-01', value: 2 }]));
  assert.throws(() => validatePoints('x', [{ period: '2025-01', value: 1 }, { period: '2025-01', value: 2 }]));
  assert.doesNotThrow(() => validatePoints('x', [{ period: '2025-01', value: 1 }, { period: '2025-03', value: 2 }]));
});
