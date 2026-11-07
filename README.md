# Ospreyn — South African Economy & Regulation (ospreyn.com)

**Publisher**: Ospreyn
**Focus**: Economic policy, financial sector regulation and public affairs

A public dashboard of South African macroeconomic indicators with written analysis, a sector view, a policy calendar and policy briefs. Every figure is sourced, and every chart can be checked against its primary publication.

It is educational analysis, not financial, investment or legal advice.

## What is on the site

- **Overview**: a rotating "What matters now" banner (Reserve Bank rates, rand against the dollar, pound and euro, markets and commodities, the next MPC decision and data release, the latest official figures and the newest brief), an optional "what changed this week" note, a notice when any series is overdue for an update, headline indicators with sparklines, source and date, and a short written summary of where the economy stands. Glossary terms get plain-language tooltips.
- **Indicators**: GDP growth, CPI inflation, the SARB repo rate, unemployment, the rand and government debt. Each has an interactive chart, a data table, a CSV download, definition notes and a written analysis with sources.
- **Sectors**: banking, mining, retail and ICT, with the main policy issues in each. GDP-share and employment figures are blank until verified (see `VERIFY.md`).
- **Calendar**: upcoming Reserve Bank decisions and data releases. Only dates marked confirmed have been checked against the institution's website.
- **Briefs**: articles and policy briefs written in the admin page, each with a source list.
- **Admin** (`/admin`): sign in to write articles and update the site text, settings and data.

## Tech stack

React 19, TypeScript, Vite, React Router, Tailwind CSS, Recharts, lucide-react and react-markdown. The admin page uses Sveltia CMS. There is no backend or database: content lives in files in this repository, and every save in the admin page is a commit that makes Netlify rebuild the site.

## Getting started

```bash
npm install
npm run dev        # local development (also rebuilds the manual datasets)
npm run build      # production build
npm test           # unit and data-integrity tests
npm run lint       # type-check
```

## Where things live

| What | Where | Edit in admin? |
| :--- | :--- | :--- |
| Articles and briefs | `content/articles/*.md` | Yes |
| Indicator analysis | `content/analysis/*.yml` | Yes |
| Overview page text | `content/overview.yml` | Yes |
| Site name, footer, contact email, About page | `content/site.yml` | Yes |
| Repo rate, QLFS, calendar, sectors | `content/data/*.yml` | Yes |
| World Bank datasets (generated) | `public/data/*.json` | No (daily job) |
| Data scripts | `scripts/` | No |
| Verification register | `VERIFY.md` | No |
| Admin configuration | `public/admin/config.yml` | No |

## Using the admin page

Go to `/admin` on your site and sign in with GitHub (see `GO-LIVE.md` for the one-time setup).

- **Write an article**: Articles and briefs, then New Article. Add a summary, takeaways and sources, write the text, and switch **Draft** off to publish. Drafts never appear on the site.
- **After a Reserve Bank decision**: Data, then Repo rate, and add one row to the decisions list (period as `YYYY-MM`). The current-year value, change and chart are worked out for you.
- **After a QLFS release**: Data, then Unemployment (Stats SA QLFS), and add the new quarter.
- **Edit analysis or the overview text**: open the item and edit the fields.
- **Calendar**: add events, and tick *confirmed* only after checking the date on the institution's website.

Saving creates a commit, and the site updates a minute or two later. If a build fails (for example because of a duplicate or out-of-order period), the live site stays as it was and Netlify shows the reason in the deploy log.

## Keeping the data current

- **Live Reserve Bank figures** (Overview banner): the visitor's browser reads the rates, currencies and markets from the SARB Web API (`custom.resbank.co.za/SarbWebApi`) when the page loads and again every five minutes (every minute on an MPC decision day, when the banner also switches to a "Decision day" slide). Nothing is stored in the browser. A figure the feed does not return, or returns outside a plausible range, is left out rather than shown. The Reserve Bank publishes these once a day, so they are current, not tick-by-tick. If the live repo rate differs from the reviewed repo rate, the banner says so, which is your reminder to update `content/data/repo_rate.yml`. Code: `src/utils/sarbLive.ts` and `src/components/NowBanner.tsx`.
- **Trends and "since last time"** (`public/data/rates_history.json`): the "Daily rates snapshot" GitHub workflow records the Reserve Bank figures every weekday at 14:30 UTC and commits the file straight to `main`. It needs no review because it holds only Reserve Bank figures. If the Reserve Bank feed cannot be read, the workflow fails and GitHub emails you. The sparklines and up/down arrows start appearing after a few days of history.
- **Calendar run-out alert**: the "Calendar check" workflow runs every Monday and opens a GitHub issue if fewer than three upcoming dates remain in the release calendar.
- **Overdue-series notice**: `src/utils/staleness.ts` flags a series when the next period should already have been published. The notice appears on the Overview page and on the affected banner tile.
- **RSS feed** (`/rss.xml` for reader apps; `/feed` is the friendly page the site links to, with a copy button, because a browser shows the raw file as code): rebuilt from the published articles on every build. For an email list, paste your sign-up form address into Site settings (the form is built for Buttondown: `https://buttondown.com/api/emails/embed-subscribe/YOUR-USERNAME`). Leave it empty to show only the RSS link.
- **Glossary** (`content/glossary.yml`): terms and definitions, editable in the admin page under "Glossary and corrections". The first mention of each term in the Overview text and banner gets a tooltip automatically.
- **Corrections** (`/corrections`): the log is `content/corrections.yml`, editable in the admin page.
- **Chart images**: each indicator chart has an "Image" button that downloads a PNG with the title, source and site name.
- **World Bank series** (GDP, inflation, unemployment model, rand, debt): `npm run data:update` fetches them. A GitHub Actions workflow runs it on weekdays at 05:00 UTC and opens a pull request only when a figure, period or source has actually changed (a new retrieval date alone does not count), so changes are reviewed before they go live.
- **Hand-maintained series** (repo rate, QLFS, sectors, calendar): edit them in the admin page. They are rebuilt from `content/data/*.yml` on every build and at the end of the data job, so the job never overwrites them.

Every dataset records its source, unit, frequency, last period and retrieval date, and the tests fail if any of these are missing.

## Rules for this project

1. Never publish a number without a source.
2. Mark anything unchecked `TO_VERIFY` and list it in `VERIFY.md`.
3. Keep data (in JSON) separate from analysis (in markdown).
4. Do not scrape licensed market data such as JSE prices.
5. Do not claim accessibility or performance standards until they have been tested.

## Before sharing widely

- [ ] Work through section 3 of `VERIFY.md`.
- [ ] Update debt, deficit and growth figures from the October 2026 MTBPS.
- [ ] Run Lighthouse and an accessibility checker, then record the results.
- [ ] Test on a phone-width viewport.
- [ ] Add sources to the two draft articles before switching them to published.

## Deployment

Netlify, configured in `netlify.toml`. See `GO-LIVE.md` for the full steps, including how to retire the old site safely.
