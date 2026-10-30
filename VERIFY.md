# Ospreyn: Data Verification Register

**Publisher**: Ospreyn (ospreyn.com)  
**Last pipeline run**: 2026-10-29  
**Standard**: Every figure must trace to a cited public source. Anything not yet checked against the primary source is listed in section 3.

---

## 1. Indicator register

| Metric ID | Indicator | Unit | Frequency | How the data gets here | Check against | Latest value in dataset |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **gdp** | Real GDP growth | % | Annual | World Bank API (`NY.GDP.MKTP.KD.ZG`) | Stats SA P0441 | 1.11% (2025) |
| **inflation** | CPI inflation | % | Annual | World Bank API (`FP.CPI.TOTL.ZG`) | Stats SA P0141 | 3.21% (2025) |
| **interest-rates** | SARB repo rate | % | Per MPC meeting | **Manual**, edited in this script | SARB MPC statements | 7.25% (2026) |
| **unemployment** | Unemployment, World Bank/ILO model (headline) and Stats SA QLFS (secondary, **manual**) | % | Annual / quarterly | World Bank API (`SL.UEM.TOTL.ZS`) plus manual QLFS series | Stats SA P0211 | 32.39% (2025) |
| **rand** | ZAR per USD | ZAR | Annual average | World Bank API (`PA.NUS.FCRF`) | SARB exchange rate data | R17.89 (2025) |
| **debt** | Central government debt | % of GDP | Annual | World Bank API (`GC.DOD.TOTL.GD.ZS`) | National Treasury Budget Review | 82.76% (2024) |

Manual series do not update when you run `npm run data:update`. After each MPC decision and each QLFS release, edit the arrays in this script, re-run it and re-check this file.

---

## 2. Definitions to keep straight

### A. Unemployment
- **World Bank (`SL.UEM.TOTL.ZS`)**: ILO modelled estimate for cross-country comparison (32.39% for 2025).
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
