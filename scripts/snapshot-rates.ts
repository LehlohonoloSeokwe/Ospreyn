/**
 * Records today's Reserve Bank figures in public/data/rates_history.json.
 * Run by the "Daily rates snapshot" GitHub workflow. Exits with an error if the Reserve Bank
 * feed cannot be read, so GitHub emails you instead of the history quietly going stale.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fetchLiveRates } from '../src/utils/sarbLive';
import { appendSnapshot, EMPTY_HISTORY, parseHistory } from '../src/utils/ratesHistory';

const file = path.join(process.cwd(), 'public/data/rates_history.json');
const existing = fs.existsSync(file) ? parseHistory(JSON.parse(fs.readFileSync(file, 'utf-8'))) : EMPTY_HISTORY;

const rates = await fetchLiveRates(AbortSignal.timeout(20_000));
const next = appendSnapshot(existing, rates, new Date().toISOString());
fs.writeFileSync(file, JSON.stringify(next, null, 1) + '\n');
console.log(`Stored ${rates.length} figure(s): ${rates.map((r) => `${r.id}=${r.value} (as at ${r.asAt || 'no date'})`).join(', ')}`);
