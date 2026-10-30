/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DataQualityStatus } from '../types';
import { CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

interface QualityBadgeProps {
  status: DataQualityStatus;
  size?: 'sm' | 'md';
}

export const QualityBadge: React.FC<QualityBadgeProps> = ({ status, size = 'sm' }) => {
  const isSm = size === 'sm';
  const iconSize = isSm ? 12 : 14;

  if (status === 'VERIFIED') {
    return (
      <span
        className={`inline-flex items-center gap-1 font-mono text-emerald-700 dark:text-emerald-400 font-medium ${
          isSm ? 'text-[11px]' : 'text-xs'
        }`}
        title="Verified against primary institutional release (World Bank / SARB / Stats SA)"
      >
        <CheckCircle2 size={iconSize} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
        <span>Verified Primary Data</span>
      </span>
    );
  }

  if (status === 'STALE') {
    return (
      <span
        className={`inline-flex items-center gap-1 font-mono text-amber-700 dark:text-amber-400 font-medium ${
          isSm ? 'text-[11px]' : 'text-xs'
        }`}
        title="Scheduled update pending official publication"
      >
        <Clock size={iconSize} className="shrink-0 text-amber-600 dark:text-amber-400" />
        <span>Update Pending</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono text-rose-700 dark:text-rose-400 font-medium ${
        isSm ? 'text-[11px]' : 'text-xs'
      }`}
      title="Figure pending manual hand verification against gazette"
    >
      <AlertTriangle size={iconSize} className="shrink-0 text-rose-600 dark:text-rose-400" />
      <span>Pending Verification</span>
    </span>
  );
};
