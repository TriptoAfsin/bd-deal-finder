#!/usr/bin/env node

/**
 * merge-deals.mjs
 * Merges TSV files from batch/deal-additions/ into data/deals.md
 * Also updates data/top-deals.md for deals scoring >= top_threshold.
 *
 * Usage: node scripts/merge-deals.mjs
 */

import { readFileSync, writeFileSync, readdirSync, unlinkSync, existsSync, mkdirSync } from 'fs';
import { join, basename } from 'path';
import { parse } from 'yaml';

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
const ADDITIONS_DIR = join(ROOT, 'batch', 'deal-additions');
const DEALS_FILE = join(ROOT, 'data', 'deals.md');
const TOP_DEALS_FILE = join(ROOT, 'data', 'top-deals.md');
const PROFILE_FILE = join(ROOT, 'config', 'profile.yml');

function loadProfile() {
  if (!existsSync(PROFILE_FILE)) return { scan: { top_threshold: 4.0 } };
  return parse(readFileSync(PROFILE_FILE, 'utf-8'));
}

function parseDealsTable(content) {
  const lines = content.split('\n');
  const headerIdx = lines.findIndex(l => l.startsWith('| #'));
  if (headerIdx === -1) return { header: '', separator: '', entries: [], prefix: lines.join('\n') };

  const header = lines[headerIdx];
  const separator = lines[headerIdx + 1] || '';
  const entries = [];

  for (let i = headerIdx + 2; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('|') && line.length > 3) {
      entries.push(line);
    }
  }

  const prefix = lines.slice(0, headerIdx).join('\n');
  return { header, separator, entries, prefix };
}

function parseTsvLine(line) {
  const cols = line.split('\t');
  if (cols.length < 10) return null;
  return {
    num: cols[0],
    date: cols[1],
    category: cols[2],
    product: cols[3],
    original: cols[4],
    sale: cols[5],
    discount: cols[6],
    source: cols[7],
    score: cols[8],
    url: cols[9],
  };
}

function dealToRow(deal) {
  return `| ${deal.num} | ${deal.date} | ${deal.category} | ${deal.product} | ${deal.original} | ${deal.sale} | ${deal.discount}% | ${deal.source} | ${deal.score} | Active | [link](${deal.url}) |`;
}

function dealToTopRow(deal) {
  return `| ${deal.num} | ${deal.category} | ${deal.product} | ${deal.sale}৳ | ${deal.discount}% | ${deal.source} | ${deal.score} | [link](${deal.url}) |`;
}

function getExistingUrls(entries) {
  const urls = new Set();
  for (const entry of entries) {
    const match = entry.match(/\[link\]\(([^)]+)\)/);
    if (match) urls.add(match[1]);
  }
  return urls;
}

function getMaxNum(entries) {
  let max = 0;
  for (const entry of entries) {
    const match = entry.match(/^\|\s*(\d+)\s*\|/);
    if (match) max = Math.max(max, parseInt(match[1], 10));
  }
  return max;
}

function main() {
  if (!existsSync(ADDITIONS_DIR)) {
    mkdirSync(ADDITIONS_DIR, { recursive: true });
  }

  const tsvFiles = readdirSync(ADDITIONS_DIR).filter(f => f.endsWith('.tsv'));

  if (tsvFiles.length === 0) {
    console.log('No deal additions to merge.');
    return;
  }

  const profile = loadProfile();
  const topThreshold = profile.scan?.top_threshold ?? 4.0;

  // Parse existing deals
  const dealsContent = readFileSync(DEALS_FILE, 'utf-8');
  const { header, separator, entries, prefix } = parseDealsTable(dealsContent);
  const existingUrls = getExistingUrls(entries);
  let nextNum = getMaxNum(entries) + 1;

  const newEntries = [];
  const topEntries = [];
  let skipped = 0;

  for (const file of tsvFiles) {
    const content = readFileSync(join(ADDITIONS_DIR, file), 'utf-8');
    const lines = content.trim().split('\n');

    for (const line of lines) {
      if (!line.trim()) continue;
      const deal = parseTsvLine(line);
      if (!deal) continue;

      // Dedup by URL
      if (existingUrls.has(deal.url)) {
        skipped++;
        continue;
      }

      deal.num = String(nextNum).padStart(3, '0');
      nextNum++;
      existingUrls.add(deal.url);

      newEntries.push(dealToRow(deal));

      // Check for top deal
      const scoreNum = parseFloat(deal.score);
      if (scoreNum >= topThreshold) {
        topEntries.push(dealToTopRow(deal));
      }
    }
  }

  // Write updated deals.md
  const allEntries = [...newEntries, ...entries];
  const newDealsContent = `${prefix}\n${header}\n${separator}\n${allEntries.join('\n')}\n`;
  writeFileSync(DEALS_FILE, newDealsContent, 'utf-8');

  // Update top-deals.md if there are new top entries
  if (topEntries.length > 0) {
    let topContent = readFileSync(TOP_DEALS_FILE, 'utf-8');
    const today = new Date().toISOString().split('T')[0];
    topContent = topContent.replace(/Last updated: [^\n*]*/, `Last updated: ${today}`);

    // Insert new top entries after "This Week" table header
    const thisWeekHeader = '| # | Category | Product | Price (৳) | Discount | Source | Score | Link |';
    const insertIdx = topContent.indexOf(thisWeekHeader);
    if (insertIdx !== -1) {
      const afterHeader = topContent.indexOf('\n', insertIdx);
      const afterSeparator = topContent.indexOf('\n', afterHeader + 1);
      topContent = topContent.slice(0, afterSeparator + 1) +
        topEntries.join('\n') + '\n' +
        topContent.slice(afterSeparator + 1);
    }

    writeFileSync(TOP_DEALS_FILE, topContent, 'utf-8');
  }

  // Clean up processed TSV files
  for (const file of tsvFiles) {
    unlinkSync(join(ADDITIONS_DIR, file));
  }

  console.log(`Merged ${newEntries.length} new deals (${skipped} duplicates skipped).`);
  if (topEntries.length > 0) {
    console.log(`${topEntries.length} top deals added to top-deals.md.`);
  }
}

main();
