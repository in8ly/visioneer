#!/usr/bin/env node
/**
 * Cache-busting version helper.
 *
 * Scans all *.html files in repo root and updates ?v= query strings
 * for known static assets (CSS, JS, SVG) to a new version token.
 *
 * Version token strategy:
 *   Default: YYYYMMDD  (today's date in local time)
 *   If an asset already has today's date, auto-increment suffix: -2, -3, etc.
 *   If --force provided, always replace with base date (dropping existing suffixes).
 *
 * Supports dry runs.
 *
 * Usage examples:
 *   node bump-version.js            # bump to today (increment if already today)
 *   node bump-version.js --date 20250813   # force a specific date base
 *   node bump-version.js --dry-run   # show what would change
 *   node bump-version.js --force     # reset suffixes for today to none
 *
 * Recognized attributes: href=, src=, data=
 */
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const opt = { dry:false, date:null, force:false };
for (let i=0;i<args.length;i++) {
  const a = args[i];
  if (a === '--dry-run' || a === '--dry') opt.dry = true;
  else if (a === '--force') opt.force = true;
  else if (a === '--date') { opt.date = args[++i]; }
}

function todayToken() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const day = String(d.getDate()).padStart(2,'0');
  return `${y}${m}${day}`;
}

const baseDate = opt.date || todayToken();
if (!/^\d{8}$/.test(baseDate)) {
  console.error('Invalid --date value. Expect YYYYMMDD.');
  process.exit(1);
}

// Asset file patterns to manage
const assetPatterns = [
  'styles.css',
  'script.js',
  'assets/agent-dot.svg',
  'assets/diamond-unified.svg'
];

// Build a regex that matches any of the asset references with optional ?v=...
// Capture groups:
// 1 full path before query
// 2 existing version (if any)
const assetRegex = new RegExp(
  '(' + assetPatterns.map(p => p.replace(/[-/\\.]/g, m => '\\' + m)).join('|') + ')(?:\\?v=([0-9]{8}(?:-[0-9]+)?))?',
  'g'
);

function nextVersion(existingVersion) {
  if (!existingVersion) return baseDate; // no version yet
  const match = existingVersion.match(/^(\d{8})(?:-(\d+))?$/);
  if (!match) return baseDate; // unexpected format
  const [, datePart, suffix] = match;
  if (datePart !== baseDate) return baseDate; // different day -> reset to base
  if (opt.force) return baseDate; // drop suffix
  // increment suffix
  const n = suffix ? parseInt(suffix,10)+1 : 2; // first increment becomes -2
  return `${baseDate}-${n}`;
}

function processHtmlFile(filePath) {
  let original = fs.readFileSync(filePath,'utf8');
  let modified = original;
  const changes = [];
  modified = modified.replace(assetRegex, (full, pathPart, ver) => {
    const newVer = nextVersion(ver);
    if (ver === newVer) return full; // no change
    changes.push({ asset:pathPart, from:ver||'(none)', to:newVer });
    return `${pathPart}?v=${newVer}`;
  });
  if (changes.length && !opt.dry) {
    fs.writeFileSync(filePath, modified, 'utf8');
  }
  return changes;
}

function run() {
  const root = process.cwd();
  const files = fs.readdirSync(root).filter(f => f.endsWith('.html'));
  let totalChanges = 0;
  for (const f of files) {
    const filepath = path.join(root, f);
    const changes = processHtmlFile(filepath);
    if (changes.length) {
      console.log(`\n${opt.dry?'[DRY] ':''}${f}:`);
      changes.forEach(c => {
        console.log(`  ${c.asset}: ${c.from} -> ${c.to}`);
      });
      totalChanges += changes.length;
    }
  }
  if (totalChanges === 0) {
    console.log(opt.dry ? 'No changes would be made.' : 'No version updates applied.');
  } else {
    console.log(`\n${opt.dry ? 'Would update' : 'Updated'} ${totalChanges} asset reference(s).`);
  }
}

run();
