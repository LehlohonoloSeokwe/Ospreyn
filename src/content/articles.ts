import { parse } from 'yaml';

export interface ArticleSource {
  org: string;
  title: string;
  year: string;
  url: string;
}

export interface Article {
  slug: string;
  title: string;
  date: Date;
  topic: string;
  author: string;
  summary: string;
  takeaways: string[];
  sources: ArticleSource[];
  draft: boolean;
  body: string;
}

const files = import.meta.glob('../../content/articles/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

export function parseArticle(path: string, raw: string): Article {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  const fm = (m ? parse(m[1]) : {}) ?? {};
  const slug = path.split('/').pop()!.replace(/\.md$/, '');
  const date = new Date(fm.date ?? 0);
  return {
    slug,
    title: String(fm.title ?? slug),
    date: Number.isNaN(date.getTime()) ? new Date(0) : date,
    topic: String(fm.topic ?? ''),
    author: String(fm.author ?? ''),
    summary: String(fm.summary ?? ''),
    takeaways: Array.isArray(fm.takeaways) ? fm.takeaways.map(String) : [],
    sources: Array.isArray(fm.sources)
      ? fm.sources.map((s: Record<string, unknown>) => ({
          org: String(s.org ?? ''),
          title: String(s.title ?? ''),
          year: String(s.year ?? ''),
          url: String(s.url ?? ''),
        }))
      : [],
    draft: fm.draft === true,
    body: (m ? m[2] : raw).trim(),
  };
}

/** Published articles only, newest first. Drafts stay in the admin page. */
export const PUBLISHED_ARTICLES: Article[] = Object.entries(files)
  .map(([path, raw]) => parseArticle(path, raw))
  .filter((a) => !a.draft)
  .sort((a, b) => b.date.getTime() - a.date.getTime());

export function readMinutes(body: string): number {
  return Math.max(1, Math.round(body.split(/\s+/).filter(Boolean).length / 220));
}
