/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Check, Copy, ExternalLink, Rss } from 'lucide-react';
import { SITE } from '../content/site';
import { PUBLISHED_ARTICLES } from '../content/articles';

export const FeedPage: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const feedUrl = `${window.location.origin}/rss.xml`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(feedUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <div className="flex items-center gap-2 text-xs font-mono text-emerald-800 dark:text-emerald-400 font-semibold uppercase tracking-wider mb-2">
        <Rss size={14} aria-hidden="true" />
        <span>Follow {SITE.name}</span>
      </div>
      <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 dark:text-slate-100">Get new briefs in your reader</h1>
      <p className="mt-4 text-slate-600 dark:text-slate-300 leading-relaxed">
        An RSS feed lets a reader app such as Feedly or Inoreader check for new briefs for you. The feed address is meant for those apps, so opening it in a browser only shows code. Copy it and paste it into your reader.
      </p>

      <div className="mt-6 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mb-2">Feed address</p>
        <div className="flex flex-wrap items-center gap-2">
          <code className="flex-1 min-w-0 truncate rounded bg-slate-100 dark:bg-slate-800 px-3 py-2 text-sm font-mono text-slate-800 dark:text-slate-200">{feedUrl}</code>
          <button
            type="button"
            onClick={copy}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-emerald-700 px-3 text-sm font-medium text-white hover:bg-emerald-800"
          >
            {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <a
          href={`https://feedly.com/i/subscription/feed/${encodeURIComponent(feedUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-sm text-slate-700 dark:text-slate-300 underline decoration-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
        >
          Open in Feedly <ExternalLink size={12} aria-hidden="true" />
        </a>
      </div>

      {SITE.subscribeUrl && (
        <p className="mt-6 text-sm text-slate-600 dark:text-slate-400">
          Prefer email? Use the sign-up box on the <a href="/briefs" className="underline">Briefs page</a>.
        </p>
      )}

      {PUBLISHED_ARTICLES.length > 0 && (
        <section className="mt-10" aria-labelledby="in-feed-heading">
          <h2 id="in-feed-heading" className="text-base font-serif font-semibold text-slate-900 dark:text-slate-100">Currently in the feed</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-300">
            {PUBLISHED_ARTICLES.slice(0, 10).map((a) => (
              <li key={a.slug}>
                <a href={`/briefs#${a.slug}`} className="underline decoration-slate-300 hover:text-slate-900 dark:hover:text-slate-100">{a.title}</a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};
