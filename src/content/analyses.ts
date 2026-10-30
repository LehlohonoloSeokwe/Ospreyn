import { parse } from 'yaml';
import gdp from '../../content/analysis/gdp.yml?raw';
import inflation from '../../content/analysis/inflation.yml?raw';
import interestRates from '../../content/analysis/interest-rates.yml?raw';
import unemployment from '../../content/analysis/unemployment.yml?raw';
import rand from '../../content/analysis/rand.yml?raw';
import debt from '../../content/analysis/debt.yml?raw';

export interface IndicatorAnalysisContent {
  title: string;
  trend: string;
  whyItMatters: string;
  whoIsAffected: string;
  sources: string[];
}

/** The YAML files in /content/analysis are the single source of truth, editable in the admin page. */
export function parseAnalysis(raw: string): IndicatorAnalysisContent {
  const d = parse(raw) ?? {};
  return {
    title: String(d.title ?? ''),
    trend: String(d.trend ?? '').trim(),
    whyItMatters: String(d.whyItMatters ?? '').trim(),
    whoIsAffected: String(d.whoIsAffected ?? '').trim(),
    sources: Array.isArray(d.sources) ? d.sources.map(String) : [],
  };
}

export const ANALYSES: Record<string, IndicatorAnalysisContent> = {
  gdp: parseAnalysis(gdp),
  inflation: parseAnalysis(inflation),
  'interest-rates': parseAnalysis(interestRates),
  unemployment: parseAnalysis(unemployment),
  rand: parseAnalysis(rand),
  debt: parseAnalysis(debt),
};
