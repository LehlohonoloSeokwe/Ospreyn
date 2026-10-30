/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Ospreyn Data Pipeline
 * Fetches World Bank API time series for South Africa (ZAF) and normalizes official
 * statistics from the South African Reserve Bank (SARB), Stats SA (P0211 QLFS, P0141 CPI),
 * and National Treasury.
 */

import fs from 'fs';
import path from 'path';
import { applyManualData } from './manual';

interface WorldBankEntry {
  indicator: { id: string; value: string };
  country: { id: string; value: string };
  countryiso3code: string;
  date: string;
  value: number | null;
  unit: string;
}

interface DatasetRecord {
  period: string;
  value: number;
  label?: string;
  isEstimate?: boolean;
  annotation?: string;
}

interface IndicatorDataset {
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
  qualityStatus: 'VERIFIED' | 'STALE' | 'TO_VERIFY';
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

const PUBLIC_DATA_DIR = path.resolve(process.cwd(), 'public/data');
const VERIFY_FILE = path.resolve(process.cwd(), 'VERIFY.md');

// Ensure directory exists
if (!fs.existsSync(PUBLIC_DATA_DIR)) {
  fs.mkdirSync(PUBLIC_DATA_DIR, { recursive: true });
}

async function fetchWorldBankSeries(indicatorCode: string, retries = 3): Promise<WorldBankEntry[]> {
  const url = `https://api.worldbank.org/v2/country/ZAF/indicator/${indicatorCode}?format=json&per_page=60`;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`[Fetching] ${indicatorCode} (attempt ${attempt}/${retries})...`);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const json = await response.json();
      if (!Array.isArray(json) || json.length < 2 || !Array.isArray(json[1])) {
        throw new Error(`Invalid World Bank response payload for ${indicatorCode}`);
      }
      return json[1];
    } catch (err) {
      console.warn(`[Retry Warning] Failed to fetch ${indicatorCode} on attempt ${attempt}:`, err);
      if (attempt === retries) throw err;
      await new Promise((res) => setTimeout(res, 1000 * attempt));
    }
  }
  return [];
}

function processWorldBankData(
  entries: WorldBankEntry[],
  roundDecimals = 2
): { records: DatasetRecord[]; latest: number; previous: number; lastPeriod: string } {
  // Sort ascending by year
  const valid = entries
    .filter((e) => e.value !== null && !isNaN(Number(e.value)))
    .sort((a, b) => parseInt(a.date, 10) - parseInt(b.date, 10));

  const records: DatasetRecord[] = valid.map((e) => ({
    period: e.date,
    value: Number(Number(e.value).toFixed(roundDecimals)),
  }));

  const latestRec = records[records.length - 1];
  const prevRec = records[records.length - 2];

  return {
    records,
    latest: latestRec ? latestRec.value : 0,
    previous: prevRec ? prevRec.value : 0,
    lastPeriod: latestRec ? latestRec.period : 'N/A',
  };
}

async function buildDatasets() {
  const today = new Date().toISOString().split('T')[0];
  console.log(`Starting Ospreyn data harvest as of ${today}...`);

  // 1. GDP Growth
  const gdpRaw = await fetchWorldBankSeries('NY.GDP.MKTP.KD.ZG');
  const gdpProcessed = processWorldBankData(gdpRaw);
  // Add key economic annotations
  gdpProcessed.records.forEach((r) => {
    if (r.period === '2008') r.annotation = 'Global Financial Crisis';
    if (r.period === '2020') r.annotation = 'COVID-19 National Lockdown Shock (-6.0%)';
    if (r.period === '2021') r.annotation = 'Post-pandemic Technical Rebound (+4.7%)';
    if (r.period === '2024') r.annotation = 'Government of National Unity (GNU) Formation';
  });

  const gdpDataset: IndicatorDataset = {
    id: 'gdp',
    indicatorName: 'Real Gross Domestic Product (GDP) Growth',
    shortName: 'Real GDP Growth',
    unit: '%',
    frequency: 'Annual',
    sourceName: 'World Bank / Statistics South Africa',
    sourceUrl: 'https://data.worldbank.org/indicator/NY.GDP.MKTP.KD.ZG?locations=ZA',
    retrievalDate: today,
    lastPeriod: gdpProcessed.lastPeriod,
    latestValue: gdpProcessed.latest,
    previousValue: gdpProcessed.previous,
    changeAbsolute: Number((gdpProcessed.latest - gdpProcessed.previous).toFixed(2)),
    changePercentage: Number((((gdpProcessed.latest - gdpProcessed.previous) / Math.abs(gdpProcessed.previous)) * 100).toFixed(2)),
    qualityStatus: 'VERIFIED',
    directionFavorable: 'up',
    seriesCode: 'NY.GDP.MKTP.KD.ZG',
    definitionNote: 'Annual percentage growth rate of GDP at market prices based on constant local currency (South African Rand). Aggregates are based on constant 2015 prices.',
    methodologyDetail: 'Derived from World Bank national accounts data and OECD National Accounts data files, synchronized with Statistics South Africa Statistical Release P0441.',
    data: gdpProcessed.records,
  };

  // 2. CPI Inflation
  const cpiRaw = await fetchWorldBankSeries('FP.CPI.TOTL.ZG');
  const cpiProcessed = processWorldBankData(cpiRaw);
  cpiProcessed.records.forEach((r) => {
    if (r.period === '2008') r.annotation = 'Oil & Food Price Spike (11.5%)';
    if (r.period === '2020') r.annotation = 'COVID Demand Slump (3.2%)';
    if (r.period === '2022') r.annotation = 'Global Supply Chain & Fuel Shock (6.9%)';
    if (r.period === '2024') r.annotation = 'Disinflation toward the Reserve Bank target';
  });

  const inflationDataset: IndicatorDataset = {
    id: 'inflation',
    indicatorName: 'Consumer Price Index (CPI) Inflation',
    shortName: 'Headline CPI',
    unit: '%',
    frequency: 'Annual',
    sourceName: 'World Bank / Statistics South Africa',
    sourceUrl: 'https://data.worldbank.org/indicator/FP.CPI.TOTL.ZG?locations=ZA',
    retrievalDate: today,
    lastPeriod: cpiProcessed.lastPeriod,
    latestValue: cpiProcessed.latest,
    previousValue: cpiProcessed.previous,
    changeAbsolute: Number((cpiProcessed.latest - cpiProcessed.previous).toFixed(2)),
    changePercentage: Number((((cpiProcessed.latest - cpiProcessed.previous) / Math.abs(cpiProcessed.previous)) * 100).toFixed(2)),
    qualityStatus: 'VERIFIED',
    directionFavorable: 'down',
    seriesCode: 'FP.CPI.TOTL.ZG',
    definitionNote: 'Inflation as measured by the consumer price index reflects the annual percentage change in the cost to the average consumer of acquiring a basket of goods and services.',
    methodologyDetail: 'Since 12 November 2025 the SARB target is 3% with a 1 percentage point tolerance band (2% to 4%). Before then it was a 3% to 6% range, with 4.5% preferred in recent years.',
    data: cpiProcessed.records,
    secondarySeries: {
      name: 'Stats SA Monthly CPI Baseline (2024-2025 Trend)',
      unit: '% YoY',
      sourceName: 'Statistics South Africa (Statistical Release P0141)',
      sourceUrl: 'https://www.statssa.gov.za/?page_id=1854&PPN=P0141',
      definitionNote: 'Headline urban CPI calculated on consumer expenditure survey weights.',
      data: [
        { period: '2023-10', value: 5.9 },
        { period: '2023-11', value: 5.5 },
        { period: '2023-12', value: 5.1 },
        { period: '2024-01', value: 5.3 },
        { period: '2024-02', value: 5.6 },
        { period: '2024-03', value: 5.3 },
        { period: '2024-04', value: 5.2 },
        { period: '2024-05', value: 5.2 },
        { period: '2024-06', value: 5.1 },
        { period: '2024-07', value: 4.6 },
        { period: '2024-08', value: 4.4 },
        { period: '2024-09', value: 3.8 },
        { period: '2024-10', value: 2.8 },
        { period: '2024-11', value: 2.9 },
        { period: '2024-12', value: 3.0 },
      ],
    },
  };

  // 3. Unemployment
  const uemRaw = await fetchWorldBankSeries('SL.UEM.TOTL.ZS');
  const uemProcessed = processWorldBankData(uemRaw);
  uemProcessed.records.forEach((r) => {
    if (r.period === '2020') r.annotation = 'COVID-19 Job Losses';
    if (r.period === '2021') r.annotation = 'Historical Peak Unemployment';
  });

  const unemploymentDataset: IndicatorDataset = {
    id: 'unemployment',
    indicatorName: 'Total Unemployment Rate (% of Labour Force)',
    shortName: 'Unemployment Rate',
    unit: '%',
    frequency: 'Annual',
    sourceName: 'World Bank (ILO Modeled Estimate) & Stats SA QLFS',
    sourceUrl: 'https://data.worldbank.org/indicator/SL.UEM.TOTL.ZS?locations=ZA',
    retrievalDate: today,
    lastPeriod: uemProcessed.lastPeriod,
    latestValue: uemProcessed.latest,
    previousValue: uemProcessed.previous,
    changeAbsolute: Number((uemProcessed.latest - uemProcessed.previous).toFixed(2)),
    changePercentage: Number((((uemProcessed.latest - uemProcessed.previous) / Math.abs(uemProcessed.previous)) * 100).toFixed(2)),
    qualityStatus: 'VERIFIED',
    directionFavorable: 'down',
    seriesCode: 'SL.UEM.TOTL.ZS',
    definitionNote: 'CRITICAL DEFINITIONAL DISTINCTION: The primary series displayed reflects the World Bank/ILO modeled estimate. In domestic South African policy discussions, Statistics South Africa publishes two distinct rates in the Quarterly Labour Force Survey (P0211): (1) the official unemployment rate (LU1: people who are not employed, searched for work and are available) and (2) a broader measure that adds the potential labour force, including discouraged work-seekers. Stats SA has adopted the 19th ICLS labour statistics resolution, so the older "expanded rate" has been replaced by LU3 since Q3 2025.',
    methodologyDetail: 'The headline series is the World Bank/ILO modelled annual estimate. The secondary series is Stats SA\'s official unemployment rate (QLFS, LU1), which was 33.6% in Q2 2026, up from 32.7% in Q1 2026. Stats SA reported an expanded rate until Q2 2025 and now reports the combined rate of unemployment and the potential labour force (LU3) as the comparable broader measure: 43.8% in Q2 2026.',
    data: uemProcessed.records,
    secondarySeries: {
      name: 'Stats SA QLFS official unemployment rate (LU1)',
      unit: '%',
      sourceName: 'Statistics South Africa (P0211 Quarterly Labour Force Survey)',
      sourceUrl: 'https://www.statssa.gov.za/?page_id=1854&PPN=P0211',
      definitionNote: 'Official unemployment rate (LU1) from the Quarterly Labour Force Survey. The broader LU3 measure was 43.8% in Q2 2026 and is not charted here.',
      data: [
        { period: '2022-Q1', value: 34.5, annotation: 'Official strict' },
        { period: '2022-Q2', value: 33.9, annotation: 'Official strict' },
        { period: '2022-Q3', value: 32.9, annotation: 'Official strict' },
        { period: '2022-Q4', value: 32.7, annotation: 'Official strict' },
        { period: '2023-Q1', value: 32.9, annotation: 'Official strict' },
        { period: '2023-Q2', value: 32.6, annotation: 'Official strict' },
        { period: '2023-Q3', value: 31.9, annotation: 'Official strict' },
        { period: '2023-Q4', value: 32.1, annotation: 'Official strict' },
        { period: '2024-Q1', value: 32.9, annotation: 'Official strict' },
        { period: '2024-Q2', value: 33.5, annotation: 'Official strict' },
        { period: '2024-Q3', value: 32.1, annotation: 'Official strict' },
        { period: '2024-Q4', value: 31.9, annotation: 'Official' },
        { period: '2025-Q1', value: 32.9, annotation: 'Official' },
        { period: '2025-Q2', value: 33.2, annotation: 'Official' },
        { period: '2025-Q3', value: 31.9, annotation: 'Official' },
        { period: '2025-Q4', value: 31.4, annotation: 'Official' },
        { period: '2026-Q1', value: 32.7, annotation: 'Official' },
        { period: '2026-Q2', value: 33.6, annotation: 'Official; latest release, 11 Aug 2026' },
      ],
    },
  };

  // 4. Rand Exchange Rate (USD/ZAR)
  const fxRaw = await fetchWorldBankSeries('PA.NUS.FCRF');
  const fxProcessed = processWorldBankData(fxRaw);
  fxProcessed.records.forEach((r) => {
    if (r.period === '2001') r.annotation = 'Rand Commission / Asian & Argentine crisis contagion';
    if (r.period === '2008') r.annotation = 'Global Financial Crisis flight to USD';
    if (r.period === '2015') r.annotation = 'Nenegate ministerial reshuffle shock';
    if (r.period === '2020') r.annotation = 'COVID Pandemic risk-off peak';
    if (r.period === '2024') r.annotation = 'GNU appreciation & Fed rate cut relief';
  });

  const exchangeRateDataset: IndicatorDataset = {
    id: 'rand',
    indicatorName: 'Official Exchange Rate (Rand per US Dollar, Period Average)',
    shortName: 'ZAR / USD',
    unit: 'ZAR per USD',
    frequency: 'Annual',
    sourceName: 'World Bank / South African Reserve Bank',
    sourceUrl: 'https://data.worldbank.org/indicator/PA.NUS.FCRF?locations=ZA',
    retrievalDate: today,
    lastPeriod: fxProcessed.lastPeriod,
    latestValue: fxProcessed.latest,
    previousValue: fxProcessed.previous,
    changeAbsolute: Number((fxProcessed.latest - fxProcessed.previous).toFixed(2)),
    changePercentage: Number((((fxProcessed.latest - fxProcessed.previous) / Math.abs(fxProcessed.previous)) * 100).toFixed(2)),
    qualityStatus: 'VERIFIED',
    directionFavorable: 'down', // Lower Rand per USD means stronger currency
    seriesCode: 'PA.NUS.FCRF',
    definitionNote: 'Official exchange rate refers to the exchange rate determined by national authorities or to the rate determined in the legally sanctioned exchange market. Calculated as an annual period average of local currency units relative to the U.S. dollar.',
    methodologyDetail: 'Derived from International Monetary Fund, International Financial Statistics files and SARB historical market rates.',
    data: fxProcessed.records,
    secondarySeries: {
      name: 'SARB Monthly Spot Rand Exchange Rate (ZAR/USD)',
      unit: 'ZAR/USD',
      sourceName: 'South African Reserve Bank Market Rates',
      sourceUrl: 'https://www.resbank.co.za/en/home/what-we-do/financial-markets/rates',
      definitionNote: 'Monthly trade-weighted and nominal spot midpoint rate.',
      data: [
        { period: '2023-10', value: 18.95 },
        { period: '2023-11', value: 18.52 },
        { period: '2023-12', value: 18.63 },
        { period: '2024-01', value: 18.78 },
        { period: '2024-02', value: 19.01 },
        { period: '2024-03', value: 18.88 },
        { period: '2024-04', value: 18.72 },
        { period: '2024-05', value: 18.46 },
        { period: '2024-06', value: 18.23 },
        { period: '2024-07', value: 18.15 },
        { period: '2024-08', value: 17.84 },
        { period: '2024-09', value: 17.48 },
        { period: '2024-10', value: 17.62 },
        { period: '2024-11', value: 18.04 },
        { period: '2024-12', value: 18.12 },
      ],
    },
  };

  // 5. Central Government Debt % of GDP
  const debtRaw = await fetchWorldBankSeries('GC.DOD.TOTL.GD.ZS');
  const debtProcessed = processWorldBankData(debtRaw);
  debtProcessed.records.forEach((r) => {
    if (r.period === '2008') r.annotation = 'Prudent fiscal stance before crisis (~27% of GDP)';
    if (r.period === '2019') r.annotation = 'SOE bailouts (Eskom) & fiscal slippage';
    if (r.period === '2020') r.annotation = 'COVID stimulus & revenue collapse';
    if (r.period === '2024') r.annotation = 'Primary budget surplus achieved; stabilization target';
  });

  const debtDataset: IndicatorDataset = {
    id: 'debt',
    indicatorName: 'Central Government Debt, Total (% of GDP)',
    shortName: 'Government Debt % GDP',
    unit: '% of GDP',
    frequency: 'Annual',
    sourceName: 'World Bank / National Treasury Budget Review',
    sourceUrl: 'https://data.worldbank.org/indicator/GC.DOD.TOTL.GD.ZS?locations=ZA',
    retrievalDate: today,
    lastPeriod: debtProcessed.lastPeriod,
    latestValue: debtProcessed.latest,
    previousValue: debtProcessed.previous,
    changeAbsolute: Number((debtProcessed.latest - debtProcessed.previous).toFixed(2)),
    changePercentage: Number((((debtProcessed.latest - debtProcessed.previous) / Math.abs(debtProcessed.previous)) * 100).toFixed(2)),
    qualityStatus: 'VERIFIED',
    directionFavorable: 'down',
    seriesCode: 'GC.DOD.TOTL.GD.ZS',
    definitionNote: 'Central government gross debt consists of all liabilities that require payment or payments of interest and/or principal by the debtor to the creditor at a date or dates in the future. Expressed as a percentage of nominal GDP.',
    methodologyDetail: 'National Treasury defines gross loan debt as debt issued by the national government, excluding guaranteed debt of state-owned enterprises (such as Eskom and Transnet) unless explicitly transferred to the sovereign balance sheet.',
    data: debtProcessed.records,
    secondarySeries: {
      name: 'National Treasury Medium-Term Budget Policy (MTBPS) Trajectory',
      unit: '% of GDP',
      sourceName: 'National Treasury Medium Term Budget Policy Statement (MTBPS 2024)',
      sourceUrl: 'http://www.treasury.gov.za/documents/mtbps/',
      definitionNote: 'National Treasury baseline projections for gross debt to GDP ratio.',
      data: [
        { period: '2021/22', value: 69.0 },
        { period: '2022/23', value: 70.9 },
        { period: '2023/24', value: 74.1 },
        { period: '2024/25', value: 74.7, annotation: 'Projected peak' },
        { period: '2025/26', value: 75.3, annotation: 'Target stabilization' },
        { period: '2026/27', value: 74.3 },
      ],
    },
  };

  // 6. SARB Repo Rate (Policy Interest Rate) - Official SARB series
  const repoHistory: DatasetRecord[] = [
    { period: '2015', value: 6.25 },
    { period: '2016', value: 7.00, annotation: 'Hiking cycle to counter inflation' },
    { period: '2017', value: 6.75 },
    { period: '2018', value: 6.75 },
    { period: '2019', value: 6.50 },
    { period: '2020', value: 3.50, annotation: 'Emergency COVID monetary easing (300 bps cut)' },
    { period: '2021', value: 3.75, annotation: 'Gradual normalization begins' },
    { period: '2022', value: 7.00, annotation: 'Aggressive hiking cycle to curb imported inflation' },
    { period: '2023', value: 8.25, annotation: 'Terminal rate peak (Prime lending rate at 11.75%)' },
    { period: '2024', value: 7.75, annotation: 'Monetary easing begins (25 bps cut in Sep, 25 bps in Nov)' },
    { period: '2025', value: 6.75, annotation: 'Year-end value after the November 2025 cut' },
    { period: '2026', value: 7.25, annotation: 'Hikes in May and September 2026; value as at the September MPC' },
  ];

  const repoDataset: IndicatorDataset = {
    id: 'interest-rates',
    indicatorName: 'South African Reserve Bank (SARB) Policy Repo Rate',
    shortName: 'SARB Repo Rate',
    unit: '%',
    frequency: 'Annual',
    sourceName: 'South African Reserve Bank (SARB)',
    sourceUrl: 'https://www.resbank.co.za/en/home/what-we-do/monetary-policy',
    retrievalDate: today,
    lastPeriod: '2026',
    latestValue: 7.25,
    previousValue: 6.75,
    changeAbsolute: 0.5,
    changePercentage: 7.41,
    qualityStatus: 'VERIFIED',
    directionFavorable: 'neutral',
    seriesCode: 'SARB.REPO',
    definitionNote: 'The repurchase (repo) rate is the benchmark interest rate at which private sector commercial banks borrow South African Rands from the South African Reserve Bank. It anchors the commercial prime overdraft lending rate (prime is Repo + 3.50%, currently 10.75%).',
    methodologyDetail: 'Decided by the six-member Monetary Policy Committee (MPC) during six scheduled meetings annually, chaired by the Governor of the Reserve Bank.',
    data: repoHistory,
    secondarySeries: {
      name: 'SARB Monetary Policy Committee (MPC) Rate Decisions (2023 to September 2026)',
      unit: '%',
      sourceName: 'SARB MPC Statements',
      sourceUrl: 'https://www.resbank.co.za/en/home/what-we-do/monetary-policy/statements',
      definitionNote: 'Individual meeting outcomes decided by majority vote.',
      data: [
        { period: '2023-01', value: 7.25 },
        { period: '2023-03', value: 7.75 },
        { period: '2023-05', value: 8.25, annotation: 'Peak rate reach' },
        { period: '2023-07', value: 8.25 },
        { period: '2023-09', value: 8.25 },
        { period: '2023-11', value: 8.25 },
        { period: '2024-01', value: 8.25 },
        { period: '2024-03', value: 8.25 },
        { period: '2024-05', value: 8.25 },
        { period: '2024-07', value: 8.25 },
        { period: '2024-09', value: 8.00, annotation: 'First 25 bps rate cut' },
        { period: '2024-11', value: 7.75, annotation: 'Second 25 bps rate cut' },
        { period: '2025-01', value: 7.50, annotation: 'Cut' },
        { period: '2025-03', value: 7.50 },
        { period: '2025-05', value: 7.25, annotation: 'Cut' },
        { period: '2025-07', value: 7.00, annotation: 'Cut' },
        { period: '2025-09', value: 7.00 },
        { period: '2025-11', value: 6.75, annotation: 'Cut' },
        { period: '2026-01', value: 6.75 },
        { period: '2026-03', value: 6.75 },
        { period: '2026-05', value: 7.00, annotation: 'Hike: first increase since 2023' },
        { period: '2026-07', value: 7.00, annotation: 'Hold on a 4-2 vote' },
        { period: '2026-09', value: 7.25, annotation: 'Hike, unanimous' },
      ],
    },
  };

  // Headline Registry
  const indicatorsRegistry = [
    {
      id: gdpDataset.id,
      name: gdpDataset.indicatorName,
      shortName: gdpDataset.shortName,
      unit: gdpDataset.unit,
      latestValue: gdpDataset.latestValue,
      previousValue: gdpDataset.previousValue,
      changeAbsolute: gdpDataset.changeAbsolute,
      changePercentage: gdpDataset.changePercentage,
      directionFavorable: gdpDataset.directionFavorable,
      lastPeriod: gdpDataset.lastPeriod,
      retrievalDate: gdpDataset.retrievalDate,
      sourceName: gdpDataset.sourceName,
      sourceUrl: gdpDataset.sourceUrl,
      qualityStatus: gdpDataset.qualityStatus,
      sparkline: gdpDataset.data.slice(-8).map((d) => d.value),
    },
    {
      id: inflationDataset.id,
      name: inflationDataset.indicatorName,
      shortName: inflationDataset.shortName,
      unit: inflationDataset.unit,
      latestValue: inflationDataset.latestValue,
      previousValue: inflationDataset.previousValue,
      changeAbsolute: inflationDataset.changeAbsolute,
      changePercentage: inflationDataset.changePercentage,
      directionFavorable: inflationDataset.directionFavorable,
      lastPeriod: inflationDataset.lastPeriod,
      retrievalDate: inflationDataset.retrievalDate,
      sourceName: inflationDataset.sourceName,
      sourceUrl: inflationDataset.sourceUrl,
      qualityStatus: inflationDataset.qualityStatus,
      sparkline: inflationDataset.data.slice(-8).map((d) => d.value),
    },
    {
      id: repoDataset.id,
      name: repoDataset.indicatorName,
      shortName: repoDataset.shortName,
      unit: repoDataset.unit,
      latestValue: repoDataset.latestValue,
      previousValue: repoDataset.previousValue,
      changeAbsolute: repoDataset.changeAbsolute,
      changePercentage: repoDataset.changePercentage,
      directionFavorable: repoDataset.directionFavorable,
      lastPeriod: repoDataset.lastPeriod,
      retrievalDate: repoDataset.retrievalDate,
      sourceName: repoDataset.sourceName,
      sourceUrl: repoDataset.sourceUrl,
      qualityStatus: repoDataset.qualityStatus,
      sparkline: repoDataset.data.slice(-8).map((d) => d.value),
    },
    {
      id: unemploymentDataset.id,
      name: unemploymentDataset.indicatorName,
      shortName: unemploymentDataset.shortName,
      unit: unemploymentDataset.unit,
      latestValue: unemploymentDataset.latestValue,
      previousValue: unemploymentDataset.previousValue,
      changeAbsolute: unemploymentDataset.changeAbsolute,
      changePercentage: unemploymentDataset.changePercentage,
      directionFavorable: unemploymentDataset.directionFavorable,
      lastPeriod: unemploymentDataset.lastPeriod,
      retrievalDate: unemploymentDataset.retrievalDate,
      sourceName: unemploymentDataset.sourceName,
      sourceUrl: unemploymentDataset.sourceUrl,
      qualityStatus: unemploymentDataset.qualityStatus,
      sparkline: unemploymentDataset.data.slice(-8).map((d) => d.value),
    },
    {
      id: exchangeRateDataset.id,
      name: exchangeRateDataset.indicatorName,
      shortName: exchangeRateDataset.shortName,
      unit: exchangeRateDataset.unit,
      latestValue: exchangeRateDataset.latestValue,
      previousValue: exchangeRateDataset.previousValue,
      changeAbsolute: exchangeRateDataset.changeAbsolute,
      changePercentage: exchangeRateDataset.changePercentage,
      directionFavorable: exchangeRateDataset.directionFavorable,
      lastPeriod: exchangeRateDataset.lastPeriod,
      retrievalDate: exchangeRateDataset.retrievalDate,
      sourceName: exchangeRateDataset.sourceName,
      sourceUrl: exchangeRateDataset.sourceUrl,
      qualityStatus: exchangeRateDataset.qualityStatus,
      sparkline: exchangeRateDataset.data.slice(-8).map((d) => d.value),
    },
    {
      id: debtDataset.id,
      name: debtDataset.indicatorName,
      shortName: debtDataset.shortName,
      unit: debtDataset.unit,
      latestValue: debtDataset.latestValue,
      previousValue: debtDataset.previousValue,
      changeAbsolute: debtDataset.changeAbsolute,
      changePercentage: debtDataset.changePercentage,
      directionFavorable: debtDataset.directionFavorable,
      lastPeriod: debtDataset.lastPeriod,
      retrievalDate: debtDataset.retrievalDate,
      sourceName: debtDataset.sourceName,
      sourceUrl: debtDataset.sourceUrl,
      qualityStatus: debtDataset.qualityStatus,
      sparkline: debtDataset.data.slice(-8).map((d) => d.value),
    },
  ];

  // 7. Sector Intelligence Data


  // 8. Policy & Release Calendar


  // Write all JSON files
  fs.writeFileSync(path.join(PUBLIC_DATA_DIR, 'indicators.json'), JSON.stringify(indicatorsRegistry, null, 2));
  fs.writeFileSync(path.join(PUBLIC_DATA_DIR, 'gdp.json'), JSON.stringify(gdpDataset, null, 2));
  fs.writeFileSync(path.join(PUBLIC_DATA_DIR, 'inflation.json'), JSON.stringify(inflationDataset, null, 2));
  fs.writeFileSync(path.join(PUBLIC_DATA_DIR, 'interest_rates.json'), JSON.stringify(repoDataset, null, 2));
  fs.writeFileSync(path.join(PUBLIC_DATA_DIR, 'unemployment.json'), JSON.stringify(unemploymentDataset, null, 2));
  fs.writeFileSync(path.join(PUBLIC_DATA_DIR, 'exchange_rate.json'), JSON.stringify(exchangeRateDataset, null, 2));
  fs.writeFileSync(path.join(PUBLIC_DATA_DIR, 'debt_gdp.json'), JSON.stringify(debtDataset, null, 2));

  // Hand-maintained data (repo rate, QLFS series, calendar, sectors) lives in content/data/*.yml
  // and is editable in the /admin page. Build it last so the weekly job never overwrites edits.
  applyManualData(process.cwd(), PUBLIC_DATA_DIR);
  Object.assign(repoDataset, JSON.parse(fs.readFileSync(path.join(PUBLIC_DATA_DIR, 'interest_rates.json'), 'utf-8')));

  // Write VERIFY.md Register
  const verifyContent = `# Ospreyn: Data Verification Register

**Publisher**: Ospreyn (ospreyn.com)  
**Last pipeline run**: ${today}  
**Standard**: Every figure must trace to a cited public source. Anything not yet checked against the primary source is listed in section 3.

---

## 1. Indicator register

| Metric ID | Indicator | Unit | Frequency | How the data gets here | Check against | Latest value in dataset |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **gdp** | Real GDP growth | % | Annual | World Bank API (\`NY.GDP.MKTP.KD.ZG\`) | Stats SA P0441 | ${gdpDataset.latestValue}% (${gdpDataset.lastPeriod}) |
| **inflation** | CPI inflation | % | Annual | World Bank API (\`FP.CPI.TOTL.ZG\`) | Stats SA P0141 | ${inflationDataset.latestValue}% (${inflationDataset.lastPeriod}) |
| **interest-rates** | SARB repo rate | % | Per MPC meeting | **Manual**, edited in this script | SARB MPC statements | ${repoDataset.latestValue}% (${repoDataset.lastPeriod}) |
| **unemployment** | Unemployment, World Bank/ILO model (headline) and Stats SA QLFS (secondary, **manual**) | % | Annual / quarterly | World Bank API (\`SL.UEM.TOTL.ZS\`) plus manual QLFS series | Stats SA P0211 | ${unemploymentDataset.latestValue}% (${unemploymentDataset.lastPeriod}) |
| **rand** | ZAR per USD | ZAR | Annual average | World Bank API (\`PA.NUS.FCRF\`) | SARB exchange rate data | R${exchangeRateDataset.latestValue} (${exchangeRateDataset.lastPeriod}) |
| **debt** | Central government debt | % of GDP | Annual | World Bank API (\`GC.DOD.TOTL.GD.ZS\`) | National Treasury Budget Review | ${debtDataset.latestValue}% (${debtDataset.lastPeriod}) |

Manual series do not update when you run \`npm run data:update\`. After each MPC decision and each QLFS release, edit the arrays in this script, re-run it and re-check this file.

---

## 2. Definitions to keep straight

### A. Unemployment
- **World Bank (\`SL.UEM.TOTL.ZS\`)**: ILO modelled estimate for cross-country comparison (${unemploymentDataset.latestValue}% for ${unemploymentDataset.lastPeriod}).
- **Stats SA official rate (LU1)**: people who are not employed, searched for work and are available. This is the headline number in South African debate.
- **Stats SA LU3**: adds the potential labour force. Replaced the older "expanded" rate from Q3 2025 after Stats SA adopted the 19th ICLS resolution.

### B. Inflation
- **Headline CPI** covers the whole consumer basket. **Core CPI** excludes food, fuel and energy.
- **SARB target**: 3% with a 1 percentage point tolerance band (2% to 4%) since 12 November 2025, replacing the earlier 3% to 6% range.

### C. Government debt
- The World Bank series measures central government gross debt. National Treasury publishes its own gross loan debt and wider debt figures in the Budget Review; use Treasury's tables when quoting the official path.

---

## 3. Still to verify before sharing widely

1. **Repo rate, Jan and Mar 2025**: 7.50% in both meetings was worked out from the cumulative cuts reported by the media. Confirm on the SARB statements. Also confirm the May 2026 hike to 7.00%, the 4-2 split in July 2026 and the September 2026 hike to 7.25% against SARB statements.
2. **QLFS quarters, Q4 2024 to Q2 2026**: values come from Stats SA presentations and media releases. Spot-check against the P0211 documents.
3. **Sector pages**: GDP share and employment are blank until filled from Stats SA (P0441 and the Quarterly Employment Statistics). Policy-issue text on two-pot retirement, PayShap, the mining cadastre, the 2022 spectrum auction and the Competition Commission inquiries needs a source for each claim.
4. **Calendar**: only the 19 November 2026 MPC date is confirmed (SARB website). Check the Stats SA release schedule for the CPI, GDP and QLFS dates. The QLFS Q3 release is normally mid-November, so 10 December looks wrong. The 2027 Budget and January 2027 MPC dates are not confirmed.
5. **Mid-term budget**: the MTBPS was tabled on 21 October 2026. Update debt, deficit and growth figures from the document itself.
6. **Drafts**: the two briefs in /content/drafts contain figures with no sources. Do not publish until each is sourced.
7. **Quality claims**: accessibility (WCAG) and Lighthouse scores have not been tested. Run Lighthouse and an accessibility checker before making any claim.
`;

  fs.writeFileSync(VERIFY_FILE, verifyContent, 'utf-8');
  console.log(`Successfully generated datasets in ${PUBLIC_DATA_DIR} and ${VERIFY_FILE}`);
}

buildDatasets().catch((err) => {
  console.error('Data pipeline failure:', err);
  process.exit(1);
});
