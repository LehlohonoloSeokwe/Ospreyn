import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildRss, xmlEscape } from './rss';

const channel = { title: 'Ospreyn', description: 'SA economy', siteUrl: 'https://ospreyn.com/' };

test('escapes characters that would break the XML', () => {
  assert.equal(xmlEscape(`Tom & "Jerry" <b>`), 'Tom &amp; &quot;Jerry&quot; &lt;b&gt;');
});

test('builds a feed with newest first and links to the brief', () => {
  const xml = buildRss(
    [
      { slug: 'older', title: 'Older & wiser', date: '2026-08-01', summary: 'A', topic: 'Tax' },
      { slug: 'newer', title: 'Newer', date: '2026-10-01', summary: 'B', topic: '' },
    ],
    channel,
    new Date('2026-11-07T00:00:00Z')
  );
  assert.ok(xml.indexOf('Newer') < xml.indexOf('Older'));
  assert.ok(xml.includes('<link>https://ospreyn.com/briefs#newer</link>'));
  assert.ok(xml.includes('Older &amp; wiser'));
  assert.ok(xml.includes('href="https://ospreyn.com/rss.xml"'));
});

test('an empty feed is still valid', () => {
  const xml = buildRss([], channel);
  assert.ok(xml.includes('<channel>') && xml.includes('</rss>'));
});
