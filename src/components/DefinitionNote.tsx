/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BookOpen } from 'lucide-react';

interface DefinitionNoteProps {
  title?: string;
  definition: string;
  methodologyDetail?: string;
}

export const DefinitionNote: React.FC<DefinitionNoteProps> = ({
  title = 'Institutional Methodology & Definition Note',
  definition,
  methodologyDetail,
}) => {
  return (
    <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg p-5 my-6 text-sm">
      <div className="flex items-center gap-2 mb-2 font-mono text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 font-semibold">
        <BookOpen size={14} className="text-emerald-700 dark:text-emerald-400 shrink-0" aria-hidden="true" />
        <span>{title}</span>
      </div>

      <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-sans mb-2">
        {definition}
      </p>

      {methodologyDetail && (
        <p className="text-xs text-slate-500 dark:text-slate-400 font-sans border-t border-slate-200/60 dark:border-slate-800 pt-2.5 mt-2.5">
          <strong className="font-semibold text-slate-700 dark:text-slate-300">Technical Note:</strong> {methodologyDetail}
        </p>
      )}
    </div>
  );
};
