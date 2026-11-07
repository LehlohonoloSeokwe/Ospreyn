import { parse } from 'yaml';
import raw from '../../content/corrections.yml?raw';

export interface Correction {
  date: string;
  where: string;
  was: string;
  now: string;
  reason: string;
}

/** content/corrections.yml is editable in the admin page under "Glossary and corrections". */
export function parseCorrections(text: string): Correction[] {
  const d = parse(text) ?? {};
  const list = Array.isArray(d.items) ? d.items : [];
  return list
    .filter((c: Record<string, unknown>) => c && c.date && c.where)
    .map((c: Record<string, unknown>) => ({
      date: String(c.date),
      where: String(c.where),
      was: String(c.was ?? ''),
      now: String(c.now ?? ''),
      reason: String(c.reason ?? ''),
    }))
    .sort((a: Correction, b: Correction) => b.date.localeCompare(a.date));
}

export const CORRECTIONS: Correction[] = parseCorrections(raw);
