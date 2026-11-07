import { parse } from 'yaml';
import raw from '../../content/glossary.yml?raw';

export interface GlossaryEntry {
  id: string;
  term: string;
  aliases: string[];
  definition: string;
}

/** content/glossary.yml is editable in the admin page under "Glossary". */
export function parseGlossary(text: string): GlossaryEntry[] {
  const d = parse(text) ?? {};
  const list = Array.isArray(d.terms) ? d.terms : [];
  return list
    .filter((t: Record<string, unknown>) => t && t.id && t.term && t.definition)
    .map((t: Record<string, unknown>) => ({
      id: String(t.id),
      term: String(t.term),
      aliases: Array.isArray(t.aliases) ? t.aliases.map(String) : [],
      definition: String(t.definition).trim(),
    }));
}

export const GLOSSARY: GlossaryEntry[] = parseGlossary(raw);
export const GLOSSARY_BY_ID: Record<string, GlossaryEntry> = Object.fromEntries(GLOSSARY.map((g) => [g.id, g]));
