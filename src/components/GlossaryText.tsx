/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { GLOSSARY } from '../content/glossary';
import { splitByTerms } from '../utils/glossaryText';
import { Term } from './Term';

/** Plain text in which the first mention of each glossary term gets a tooltip. */
export const GlossaryText: React.FC<{ text: string }> = ({ text }) => {
  const pieces = useMemo(() => splitByTerms(text, GLOSSARY), [text]);
  return (
    <>
      {pieces.map((p, i) =>
        typeof p === 'string' ? <React.Fragment key={i}>{p}</React.Fragment> : <Term key={i} id={p.id}>{p.text}</Term>
      )}
    </>
  );
};
