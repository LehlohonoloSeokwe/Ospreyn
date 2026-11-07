/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface RssItem {
  slug: string;
  title: string;
  date: string; // YYYY-MM-DD
  summary: string;
  topic: string;
}

export interface RssChannel {
  title: string;
  description: string;
  siteUrl: string;
}

export const xmlEscape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

/** Builds an RSS 2.0 feed. Items are sorted newest first and capped at 30. */
export function buildRss(items: RssItem[], channel: RssChannel, now: Date = new Date()): string {
  const base = channel.siteUrl.replace(/\/+$/, '');
  const sorted = [...items].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 30);
  const entries = sorted
    .map((it) => {
      const link = `${base}/briefs#${encodeURIComponent(it.slug)}`;
      const pub = new Date(`${it.date}T08:00:00Z`);
      return [
        '    <item>',
        `      <title>${xmlEscape(it.title)}</title>`,
        `      <link>${xmlEscape(link)}</link>`,
        `      <guid isPermaLink="true">${xmlEscape(link)}</guid>`,
        Number.isNaN(pub.getTime()) ? '' : `      <pubDate>${pub.toUTCString()}</pubDate>`,
        it.topic ? `      <category>${xmlEscape(it.topic)}</category>` : '',
        `      <description>${xmlEscape(it.summary)}</description>`,
        '    </item>',
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xmlEscape(channel.title)}</title>
    <link>${xmlEscape(base)}</link>
    <description>${xmlEscape(channel.description)}</description>
    <language>en-ZA</language>
    <lastBuildDate>${now.toUTCString()}</lastBuildDate>
    <atom:link href="${xmlEscape(base)}/rss.xml" rel="self" type="application/rss+xml" />
${entries}
  </channel>
</rss>
`;
}
