/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IndicatorDataset } from '../types';

export function exportIndicatorToCsv(indicator: IndicatorDataset): void {
  const metadataLines = [
    `# Indicator: ${indicator.indicatorName}`,
    `# Short Name: ${indicator.shortName}`,
    `# Unit: ${indicator.unit}`,
    `# Frequency: ${indicator.frequency}`,
    `# Primary Source: ${indicator.sourceName}`,
    `# Source URL: ${indicator.sourceUrl}`,
    `# Series Code: ${indicator.seriesCode || 'N/A'}`,
    `# Last Period: ${indicator.lastPeriod}`,
    `# Quality Status: ${indicator.qualityStatus}`,
    `# Retrieved: ${indicator.retrievalDate}`,
    `# Platform: Ospreyn (ospreyn.com)`,
    '',
  ];

  const header = `Period,Value (${indicator.unit}),Annotation`;
  const rows = indicator.data.map(
    (row) => `"${row.period}",${row.value},"${(row.annotation || '').replace(/"/g, '""')}"`
  );

  const csvContent = [...metadataLines, header, ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `sa_policy_desk_${indicator.id}_${indicator.lastPeriod}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
