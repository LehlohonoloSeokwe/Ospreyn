import { parse } from 'yaml';
import raw from '../../content/site.yml?raw';

export interface SiteSettings {
  name: string;
  tagline: string;
  footerBlurb: string;
  contactEmail: string;
  disclaimer: string;
  aboutTitle: string;
  aboutIntro: string;
  aboutCard: string;
}

/** content/site.yml is editable in the admin page under "Site settings". */
export function parseSite(text: string): SiteSettings {
  const d = parse(text) ?? {};
  const s = (v: unknown, fallback = '') => (v == null ? fallback : String(v).trim());
  return {
    name: s(d.name, 'Ospreyn'),
    tagline: s(d.tagline),
    footerBlurb: s(d.footerBlurb),
    contactEmail: s(d.contactEmail),
    disclaimer: s(d.disclaimer),
    aboutTitle: s(d.aboutTitle, 'About'),
    aboutIntro: s(d.aboutIntro),
    aboutCard: s(d.aboutCard),
  };
}

export const SITE: SiteSettings = parseSite(raw);
