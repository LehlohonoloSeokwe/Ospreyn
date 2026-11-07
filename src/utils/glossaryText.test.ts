import { test } from 'node:test';
import assert from 'node:assert/strict';
import { splitByTerms } from './glossaryText';

const entries = [
  { id: 'repo-rate', term: 'Repo rate', aliases: ['repo'] },
  { id: 'mpc', term: 'Monetary Policy Committee', aliases: ['MPC'] },
  { id: 'gdp', term: 'Gross domestic product', aliases: ['GDP'] },
];

test('wraps only the first mention of each term', () => {
  const out = splitByTerms('The repo rate fell. The repo rate rose after the MPC met.', entries);
  assert.deepEqual(out, [
    'The ',
    { id: 'repo-rate', text: 'repo rate' },
    ' fell. The repo rate rose after the ',
    { id: 'mpc', text: 'MPC' },
    ' met.',
  ]);
});

test('does not match inside longer words', () => {
  assert.deepEqual(splitByTerms('Repository of GDPR notes', entries), ['Repository of GDPR notes']);
});

test('prefers the longest name', () => {
  const out = splitByTerms('The Monetary Policy Committee decided.', entries);
  assert.deepEqual(out[1], { id: 'mpc', text: 'Monetary Policy Committee' });
});

test('plain text with no terms comes back unchanged', () => {
  assert.deepEqual(splitByTerms('Nothing to see.', entries), ['Nothing to see.']);
});
