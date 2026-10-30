/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type DataQualityStatus = 'VERIFIED' | 'STALE' | 'TO_VERIFY';

export interface DatasetRecord {
  period: string; // e.g., "2024", "2024-Q3", "2024-10"
  value: number;
  label?: string;
  isEstimate?: boolean;
  annotation?: string;
}

export interface IndicatorDataset {
  id: string;
  indicatorName: string;
  shortName: string;
  unit: string;
  frequency: 'Annual' | 'Quarterly' | 'Monthly';
  sourceName: string;
  sourceUrl: string;
  retrievalDate: string;
  lastPeriod: string;
  latestValue: number;
  previousValue: number;
  changeAbsolute: number;
  changePercentage: number;
  qualityStatus: DataQualityStatus;
  directionFavorable: 'up' | 'down' | 'neutral';
  seriesCode?: string;
  definitionNote: string;
  methodologyDetail?: string;
  data: DatasetRecord[];
  secondarySeries?: {
    name: string;
    unit: string;
    sourceName: string;
    sourceUrl: string;
    definitionNote: string;
    data: DatasetRecord[];
  };
}

export interface SectorPublication {
  title: string;
  publisher: string;
  url: string;
  date: string;
  type: 'Gazette' | 'Regulatory Framework' | 'Industry Report' | 'Parliamentary Paper';
}

export interface SectorProfile {
  id: string;
  name: string;
  headlineSummary: string;
  gdpSharePercent: number | null;
  formalEmployment: string;
  gdpSource: string;
  gdpSourceUrl: string;
  lastPeriod: string;
  retrievalDate: string;
  keyRegulators: string[];
  keyLegislation: string[];
  policyIssues: {
    topic: string;
    summary: string;
    stakeholders: string;
  }[];
  officialPublications: SectorPublication[];
}

export interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  time?: string;
  title: string;
  institution: string;
  category: 'Monetary Policy' | 'Statistical Release' | 'Fiscal & Budget' | 'Parliamentary Deadline';
  description: string;
  sourceUrl: string;
  confirmed: boolean;
}

export interface PolicyBrief {
  id: string;
  slug: string;
  title: string;
  author: string;
  date: string;
  topic: string;
  readTime: string;
  summary: string;
  keyTakeaways: string[];
  content: string;
  citations: {
    authorOrOrg: string;
    title: string;
    year: string;
    url: string;
  }[];
}

export interface IndicatorAnalysis {
  trend: string;
  whyItMatters: string;
  whoIsAffected: string;
}
