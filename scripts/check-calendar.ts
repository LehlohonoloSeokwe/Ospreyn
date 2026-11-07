/**
 * Warns when the release calendar is about to run out of upcoming dates.
 * Writes low=true/false to the GitHub Actions output so the workflow can open an issue.
 */
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';
import { todaySA, upcomingEvents } from '../src/utils/now';
import type { CalendarEvent } from '../src/types';

const MIN_UPCOMING = 3;
const root = process.cwd();
const data = parse(fs.readFileSync(path.join(root, 'content/data/calendar.yml'), 'utf-8')) ?? {};
const events: CalendarEvent[] = Array.isArray(data.events) ? data.events : [];
const upcoming = upcomingEvents(events, todaySA());
const low = upcoming.length < MIN_UPCOMING;

console.log(`${upcoming.length} upcoming calendar event(s). Next: ${upcoming[0]?.date ?? 'none'}. low=${low}`);
if (process.env.GITHUB_OUTPUT) {
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `low=${low}\ncount=${upcoming.length}\n`);
}
