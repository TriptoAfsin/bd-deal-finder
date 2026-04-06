#!/usr/bin/env node

/**
 * dedup-deals.mjs
 * Removes duplicate entries from data/deals.md based on URL.
 * Keeps the most recent entry (by date) when duplicates are found.
 *
 * Usage: node scripts/dedup-deals.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
const DEALS_FILE = join(ROOT, 'data', 'deals.md');

function extractUrl(row) {
  const match = row.match(/\[link\]\(([^)]+)\)/);
  return match ? match[1] : null;
}

function extractDate(row) {
  const match = row.match(/\|\s*\d+\s*\|\s*(\d{4}-\d{2}-\d{2})\s*\|/);
  return match ? match[1] : '1970-01-01';
}

function main() {
  const content = readFileSync(DEALS_FILE, 'utf-8');
  const lines = content.split('\n');

  const headerIdx = lines.findIndex(l => l.startsWith('| #'));
  if (headerIdx === -1) {
    console.log('No deals table found.');
    return;
  }

  const prefix = lines.slice(0, headerIdx);
  const header = lines[headerIdx];
  const separator = lines[headerIdx + 1];

  const entries = [];
  for (let i = headerIdx + 2; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('|') && line.length > 3) {
      entries.push(line);
    }
  }

  // Group by URL, keep most recent
  const urlMap = new Map();
  let dupes = 0;

  for (const entry of entries) {
    const url = extractUrl(entry);
    if (!url) {
      // Keep entries without URLs
      urlMap.set(`__no_url_${dupes}`, entry);
      continue;
    }

    if (urlMap.has(url)) {
      dupes++;
      const existing = urlMap.get(url);
      const existingDate = extractDate(existing);
      const newDate = extractDate(entry);
      if (newDate > existingDate) {
        urlMap.set(url, entry);
      }
    } else {
      urlMap.set(url, entry);
    }
  }

  // Renumber entries
  const dedupedEntries = [...urlMap.values()];
  const renumbered = dedupedEntries.map((entry, idx) => {
    const num = String(idx + 1).padStart(3, '0');
    return entry.replace(/^\|\s*\d+\s*\|/, `| ${num} |`);
  });

  const output = [...prefix, header, separator, ...renumbered, ''].join('\n');
  writeFileSync(DEALS_FILE, output, 'utf-8');

  console.log(`Dedup complete. Removed ${dupes} duplicates. ${renumbered.length} deals remain.`);
}

main();
