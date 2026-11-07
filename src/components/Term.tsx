/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useId, useState } from 'react';
import { GLOSSARY_BY_ID } from '../content/glossary';

interface TermProps {
  id: string;
  children?: React.ReactNode;
}

/** A word with a plain-language definition on hover, focus or tap. Definitions live in content/glossary.yml. */
export const Term: React.FC<TermProps> = ({ id, children }) => {
  const entry = GLOSSARY_BY_ID[id];
  const [open, setOpen] = useState(false);
  const tipId = useId();
  if (!entry) return <>{children}</>;

  return (
    <span className="relative inline-block" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        aria-describedby={open ? tipId : undefined}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setOpen(false);
        }}
        className="cursor-help underline decoration-dotted decoration-slate-400 underline-offset-2 hover:decoration-slate-700 dark:hover:decoration-slate-200 text-inherit font-inherit text-left"
      >
        {children ?? entry.term}
      </button>
      {open && (
        <span
          role="tooltip"
          id={tipId}
          className="absolute left-0 top-full z-30 mt-1.5 w-64 max-w-[80vw] rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-left text-xs font-sans font-normal normal-case tracking-normal leading-snug text-slate-700 dark:text-slate-200 shadow-lg"
        >
          <span className="block font-semibold text-slate-900 dark:text-slate-100 mb-0.5">{entry.term}</span>
          {entry.definition}
        </span>
      )}
    </span>
  );
};
