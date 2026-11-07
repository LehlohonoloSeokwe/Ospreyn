/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Splits a passage of text into plain pieces and glossary terms, so the first
 * mention of each term can get a tooltip. Nothing has to be tagged by hand.
 */

export interface TermLike {
  id: string;
  term: string;
  aliases: string[];
}

export type TextPiece = string | { id: string; text: string };

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function splitByTerms(text: string, entries: TermLike[]): TextPiece[] {
  // Longest names first, so "Monetary Policy Committee" wins over a shorter alias.
  const names: { name: string; id: string }[] = [];
  for (const e of entries) {
    for (const name of [e.term, ...e.aliases]) {
      if (name.trim()) names.push({ name: name.trim(), id: e.id });
    }
  }
  names.sort((a, b) => b.name.length - a.name.length);
  if (names.length === 0) return [text];

  const lookup = new Map(names.map((n) => [n.name.toLowerCase(), n.id]));
  const re = new RegExp(`(?<![\\p{L}\\p{N}])(${names.map((n) => escapeRe(n.name)).join('|')})(?![\\p{L}\\p{N}])`, 'giu');

  const pieces: TextPiece[] = [];
  const seen = new Set<string>();
  let last = 0;
  for (const m of text.matchAll(re)) {
    const id = lookup.get(m[1].toLowerCase());
    if (!id || seen.has(id)) continue; // only the first mention of each term
    seen.add(id);
    const start = m.index ?? 0;
    if (start > last) pieces.push(text.slice(last, start));
    pieces.push({ id, text: m[1] });
    last = start + m[1].length;
  }
  if (last < text.length) pieces.push(text.slice(last));
  return pieces;
}
