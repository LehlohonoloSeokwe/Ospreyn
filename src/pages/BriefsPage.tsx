/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BookOpen, Calendar, Clock, ChevronDown, ChevronUp, Share2, Check, ArrowRight } from 'lucide-react';
import ReactMarkdown, { Components } from 'react-markdown';
import { PolicyBrief } from '../types';
import { PUBLISHED_ARTICLES, readMinutes } from '../content/articles';

const BRIEFS_DATA: PolicyBrief[] = PUBLISHED_ARTICLES.map((a) => ({
  id: a.slug,
  slug: a.slug,
  title: a.title,
  author: a.author,
  date: a.date.toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' }),
  topic: a.topic,
  readTime: `${readMinutes(a.body)} min read`,
  summary: a.summary,
  keyTakeaways: a.takeaways,
  content: a.body,
  citations: a.sources.map((c) => ({ authorOrOrg: c.org, title: c.title, year: c.year, url: c.url })),
}));

const MARKDOWN_COMPONENTS: Components = {
  h2: ({ children }) => <h4 className="text-lg font-serif font-bold text-slate-900 dark:text-slate-100 pt-3">{children}</h4>,
  h3: ({ children }) => <h4 className="text-base font-serif font-bold text-slate-900 dark:text-slate-100 pt-2">{children}</h4>,
  p: ({ children }) => <p>{children}</p>,
  ul: ({ children }) => <ul className="list-disc pl-5 space-y-1">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1">{children}</ol>,
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-emerald-700 dark:text-emerald-400 underline">
      {children}
    </a>
  ),
  blockquote: ({ children }) => <blockquote className="border-l-2 border-slate-300 dark:border-slate-700 pl-4 italic">{children}</blockquote>,
};

export const BriefsPage: React.FC = () => {
  const [expandedBriefId, setExpandedBriefId] = useState<string | null>(BRIEFS_DATA[0]?.id ?? null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedBriefId(expandedBriefId === id ? null : id);
  };

  const handleCopyCitation = (brief: PolicyBrief) => {
    const citation = `${brief.author || 'Ospreyn'} (${brief.date.split(' ')[1] || '2026'}). "${brief.title}". Ospreyn Policy Briefs. Retrieved from ${window.location.origin}/briefs#${brief.slug}`;
    navigator.clipboard.writeText(citation);
    setCopiedId(brief.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Editorial Title */}
      <div className="mb-8 max-w-3xl">
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-800 dark:text-emerald-400 font-semibold uppercase tracking-wider mb-2">
          <BookOpen size={14} />
          <span>Research & Policy Papers</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Policy Briefs & Regulatory Commentaries
        </h1>

        <p className="mt-3 text-base text-slate-600 dark:text-slate-300 font-sans leading-relaxed">
          Policy briefs and commentary on South African financial regulation and the economy. Written for decision-makers in commercial banking, asset management, multilateral bodies, and regulatory agencies.
        </p>
      </div>

      {BRIEFS_DATA.length === 0 && (
        <p className="text-sm text-slate-600 dark:text-slate-400">No articles have been published yet.</p>
      )}

      {/* Briefs Accordion Cards */}
      <div className="space-y-6">
        {BRIEFS_DATA.map((brief) => {
          const isExpanded = expandedBriefId === brief.id;

          return (
            <article
              key={brief.id}
              id={brief.slug}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs transition-colors"
            >
              {/* Header block */}
              <div className="p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-500 dark:text-slate-400 mb-3">
                  <span className="font-semibold text-emerald-800 dark:text-emerald-400">
                    {brief.topic}
                  </span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar size={12} />
                    {brief.date}
                  </span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock size={12} />
                    {brief.readTime}
                  </span>
                  <span>·</span>
                  <span>By {brief.author}</span>
                </div>

                <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 dark:text-slate-100 leading-snug mb-3">
                  {brief.title}
                </h2>

                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-sans leading-relaxed">
                  {brief.summary}
                </p>

                {/* Key takeaways bullet cards */}
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
                    Executive Key Takeaways:
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-sans">
                    {brief.keyTakeaways.map((point, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80 flex items-start gap-2"
                      >
                        <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">✓</span>
                        <span className="text-slate-700 dark:text-slate-300">{point}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions row */}
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                  <button
                    onClick={() => toggleExpand(brief.id)}
                    className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-emerald-800 dark:text-emerald-400 hover:text-emerald-950 dark:hover:text-emerald-300 transition-colors"
                  >
                    <span>{isExpanded ? 'Collapse Full Paper' : 'Read Full Policy Brief'}</span>
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  <button
                    onClick={() => handleCopyCitation(brief)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono rounded-md border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                  >
                    {copiedId === brief.id ? (
                      <>
                        <Check size={13} className="text-emerald-600" />
                        <span className="text-emerald-600 font-medium">Citation Copied!</span>
                      </>
                    ) : (
                      <>
                        <Share2 size={13} />
                        <span>Copy Academic Citation</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Collapsible Full Content Area */}
              {isExpanded && (
                <div className="bg-slate-50/70 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 p-6 sm:p-8 animate-in fade-in duration-200">
                  <div className="max-w-3xl mx-auto space-y-4 text-sm font-sans text-slate-700 dark:text-slate-300 leading-relaxed">
                    <ReactMarkdown components={MARKDOWN_COMPONENTS}>{brief.content}</ReactMarkdown>

                    {/* Citations Footer in Brief */}
                    <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 text-xs font-mono">
                      <h5 className="font-semibold text-slate-900 dark:text-slate-200 mb-2 uppercase tracking-wider">
                        Primary Institutional Citations & Evidence:
                      </h5>
                      <ul className="space-y-1.5 text-slate-600 dark:text-slate-400">
                        {brief.citations.map((c, cIdx) => (
                          <li key={cIdx} className="flex items-baseline gap-2">
                            <span>[{cIdx + 1}]</span>
                            <span>
                              {c.authorOrOrg} ({c.year}). <em>{c.title}</em>.{' '}
                              <a
                                href={c.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-700 dark:text-emerald-400 hover:underline"
                              >
                                [Source URL]
                              </a>
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
};
