/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Rss } from 'lucide-react';
import { SITE } from '../content/site';

/** RSS link always; an email sign-up form only when a form address is set in Site settings. */
export const SubscribeBox: React.FC = () => (
  <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5" aria-labelledby="subscribe-heading">
    <h2 id="subscribe-heading" className="text-base font-serif font-semibold text-slate-900 dark:text-slate-100">
      Get new briefs
    </h2>
    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
      {SITE.subscribeUrl ? 'Join the email list, or follow the feed in your reader.' : 'Follow the feed in your news reader.'}
    </p>
    <div className="mt-3 flex flex-wrap items-center gap-3">
      {SITE.subscribeUrl && (
        <form action={SITE.subscribeUrl} method="post" target="_blank" className="flex flex-wrap items-center gap-2">
          <label htmlFor="subscribe-email" className="sr-only">Email address</label>
          <input
            id="subscribe-email"
            type="email"
            name="email"
            required
            placeholder="you@example.com"
            className="h-9 w-60 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 text-sm text-slate-900 dark:text-slate-100"
          />
          <input type="hidden" name="embed" value="1" />
          <button type="submit" className="inline-flex h-9 items-center gap-1.5 rounded-md bg-emerald-700 px-3 text-sm font-medium text-white hover:bg-emerald-800">
            <Mail size={14} aria-hidden="true" /> Subscribe
          </button>
        </form>
      )}
      <Link to="/feed" className="inline-flex h-9 items-center gap-1.5 rounded-md border border-slate-300 dark:border-slate-700 px-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800">
        <Rss size={14} aria-hidden="true" /> RSS feed
      </Link>
    </div>
  </section>
);
