/**
 * Writes public/rss.xml from the published articles in content/articles.
 * Runs on every build (see "prepare:site"), so the feed never needs editing by hand.
 */
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';
import { buildRss, RssItem } from '../src/utils/rss';

const root = process.cwd();
const dir = path.join(root, 'content/articles');
const site = parse(fs.readFileSync(path.join(root, 'content/site.yml'), 'utf-8')) ?? {};

const items: RssItem[] = [];
for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.md'))) {
  const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const fm = (m ? parse(m[1]) : {}) ?? {};
  if (fm.draft === true) continue;
  const date = typeof fm.date === 'string' ? fm.date : fm.date instanceof Date ? fm.date.toISOString().slice(0, 10) : '';
  if (!date) continue;
  items.push({
    slug: file.replace(/\.md$/, ''),
    title: String(fm.title ?? file),
    date,
    summary: String(fm.summary ?? ''),
    topic: String(fm.topic ?? ''),
  });
}

const xml = buildRss(items, {
  title: `${site.name ?? 'Ospreyn'}: ${site.tagline ?? ''}`.replace(/:\s*$/, ''),
  description: String(site.aboutCard ?? site.footerBlurb ?? ''),
  siteUrl: String(site.siteUrl || 'https://ospreyn.com'),
});
fs.writeFileSync(path.join(root, 'public/rss.xml'), xml);
console.log(`RSS feed written with ${items.length} published article(s)`);
