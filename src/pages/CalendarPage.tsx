/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ExternalLink, Filter, CheckCircle2 } from 'lucide-react';
import { CalendarEvent } from '../types';

export const CalendarPage: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/calendar.json')
      .then((res) => res.json())
      .then((data) => {
        setEvents(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load calendar events', err);
        setLoading(false);
      });
  }, []);

  const categories = [
    'All',
    'Monetary Policy',
    'Statistical Release',
    'Fiscal & Budget',
    'Parliamentary Deadline',
  ];

  const filteredEvents = events.filter((ev) => {
    if (selectedCategory === 'All') return true;
    return ev.category === selectedCategory;
  });

  const getDaysRemaining = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Editorial Title */}
      <div className="mb-8 max-w-3xl">
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-800 dark:text-emerald-400 font-semibold uppercase tracking-wider mb-2">
          <Calendar size={14} />
          <span>Institutional Milestones</span>
          <span aria-hidden="true">·</span>
          <span>Maintained in /public/data/calendar.json</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          South African Economic & Regulatory Calendar
        </h1>

        <p className="mt-3 text-base text-slate-600 dark:text-slate-300 font-sans leading-relaxed">
          Tracking forward-looking decision windows: SARB Monetary Policy Committee announcements, Statistics South Africa releases (GDP, CPI, QLFS), National Treasury Budget presentations, and parliamentary legislative comment deadlines.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-8 flex flex-wrap items-center gap-2 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="text-xs font-mono text-slate-500 mr-2 flex items-center gap-1">
          <Filter size={13} />
          <span>Category:</span>
        </div>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 text-xs font-mono rounded-md transition-colors ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map((ev) => {
            const daysLeft = getDaysRemaining(ev.date);
            const isImminent = daysLeft >= 0 && daysLeft <= 14;

            return (
              <div
                key={ev.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors flex flex-col md:flex-row md:items-start justify-between gap-6"
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-xs font-mono text-emerald-800 dark:text-emerald-400 font-semibold">
                      {ev.institution}
                    </span>
                    <span className="text-slate-400">·</span>
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                      {ev.category}
                    </span>
                    {ev.confirmed && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 size={11} />
                        <span>Confirmed Date</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg sm:text-xl font-serif font-bold text-slate-900 dark:text-slate-100 mb-2">
                    {ev.title}
                  </h3>

                  <p className="text-sm text-slate-600 dark:text-slate-300 font-sans leading-relaxed max-w-3xl">
                    {ev.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-4 text-xs font-mono text-slate-500 dark:text-slate-400">
                    <a
                      href={ev.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
                    >
                      <span>Institutional Source</span>
                      <ExternalLink size={11} />
                    </a>
                  </div>
                </div>

                {/* Date Capsule */}
                <div className="shrink-0 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg p-4 text-center min-w-[130px]">
                  <div className="text-xs font-mono text-slate-500 uppercase">Scheduled Date</div>
                  <div className="text-base font-mono font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                    {ev.date}
                  </div>
                  <div className="mt-2 text-[11px] font-mono flex items-center justify-center gap-1">
                    <Clock size={11} className={isImminent ? 'text-amber-500' : 'text-slate-400'} />
                    <span className={isImminent ? 'text-amber-600 dark:text-amber-400 font-semibold' : 'text-slate-500'}>
                      {daysLeft < 0 ? 'Concluded' : daysLeft === 0 ? 'Today' : `${daysLeft} days left`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
