#!/usr/bin/env node

/**
 * verify-sources.mjs
 * Health check: verifies that all configured sources are reachable.
 * Reports which sources are up, down, or slow.
 *
 * Usage: node scripts/verify-sources.mjs
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { parse } from 'yaml';

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
const SOURCES_FILE = join(ROOT, 'config', 'sources.yml');

const TIMEOUT_MS = 10000;

async function checkSource(source) {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch(source.url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
    });

    clearTimeout(timeout);
    const elapsed = Date.now() - start;

    return {
      name: source.name,
      url: source.url,
      status: response.ok ? 'UP' : `HTTP ${response.status}`,
      time: elapsed,
      tier: source.trust_tier,
    };
  } catch (err) {
    const elapsed = Date.now() - start;
    return {
      name: source.name,
      url: source.url,
      status: err.name === 'AbortError' ? 'TIMEOUT' : 'DOWN',
      time: elapsed,
      tier: source.trust_tier,
      error: err.message,
    };
  }
}

async function main() {
  if (!existsSync(SOURCES_FILE)) {
    console.error('Error: config/sources.yml not found. Run setup first.');
    process.exit(1);
  }

  const config = parse(readFileSync(SOURCES_FILE, 'utf-8'));
  const sources = config.sources || [];

  console.log(`Verifying ${sources.length} sources...\n`);

  const results = await Promise.all(sources.map(checkSource));

  const up = results.filter(r => r.status === 'UP');
  const down = results.filter(r => r.status !== 'UP');

  console.log(`--- UP (${up.length}) ---`);
  for (const r of up) {
    const speed = r.time < 2000 ? 'fast' : r.time < 5000 ? 'slow' : 'very slow';
    console.log(`  [${r.tier}] ${r.name} — ${r.time}ms (${speed})`);
  }

  if (down.length > 0) {
    console.log(`\n--- DOWN/ISSUES (${down.length}) ---`);
    for (const r of down) {
      console.log(`  [${r.tier}] ${r.name} — ${r.status} (${r.error || ''})`);
    }
  }

  console.log(`\nSummary: ${up.length}/${sources.length} sources reachable.`);

  if (down.length > 0) {
    process.exit(1);
  }
}

main();
