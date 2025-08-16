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
const opt = { dry: false, date: null, force: false, git: false, push: true, msg: null };
for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--dry-run' || a === '--dry') opt.dry = true;
    else if (a === '--force') opt.force = true;
    else if (a === '--date') { opt.date = args[++i]; }
    else if (a === '--git') opt.git = true;
    else if (a === '--no-push') opt.push = false;
    else if (a === '--msg') opt.msg = args[++i];
}

function todayToken() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
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
    'assets/agent-dot.svg'
    // Removed unused diamond-unified.svg (pruned obsolete diamond variants)
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
    const n = suffix ? parseInt(suffix, 10) + 1 : 2; // first increment becomes -2
    return `${baseDate}-${n}`;
}

function processHtmlFile(filePath) {
    let original = fs.readFileSync(filePath, 'utf8');
    let modified = original;
    const changes = [];
    modified = modified.replace(assetRegex, (full, pathPart, ver) => {
        const newVer = nextVersion(ver);
        if (ver === newVer) return full; // no change
        changes.push({ asset: pathPart, from: ver || '(none)', to: newVer });
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
    const changedHtmlFiles = new Set();
    for (const f of files) {
        const filepath = path.join(root, f);
        const changes = processHtmlFile(filepath);
        if (changes.length) {
            console.log(`\n${opt.dry ? '[DRY] ' : ''}${f}:`);
            changes.forEach(c => {
                console.log(`  ${c.asset}: ${c.from} -> ${c.to}`);
            });
            totalChanges += changes.length;
            changedHtmlFiles.add(f);
        }
    }
    if (totalChanges === 0) {
        console.log(opt.dry ? 'No changes would be made.' : 'No version updates applied.');
    } else {
        console.log(`\n${opt.dry ? 'Would update' : 'Updated'} ${totalChanges} asset reference(s).`);
    }

    // Optional git automation
    if (!opt.dry && opt.git && totalChanges > 0) {
        try {
            const { execSync } = require('child_process');
            // Stage only changed HTML files
            const fileList = Array.from(changedHtmlFiles).map(f => JSON.stringify(f)).join(' ');
            if (fileList.length === 0) {
                console.log('No HTML files recorded as changed; skipping git add.');
                return;
            }
            console.log(`\n[git] Adding changed files: ${Array.from(changedHtmlFiles).join(', ')}`);
            execSync(`git add ${fileList}`, { stdio: 'inherit' });
            const commitMsg = opt.msg || `chore: bump asset cache versions ${baseDate}`;
            console.log(`[git] Committing with message: ${commitMsg}`);
            execSync(`git commit -m ${JSON.stringify(commitMsg)}`, { stdio: 'inherit' });
            if (opt.push) {
                console.log('[git] Pushing...');
                try {
                    execSync('git push', { stdio: 'inherit' });
                } catch (e) {
                    console.log('[git] Push failed (possibly no remote). You can push manually.');
                }
            } else {
                console.log('[git] Push skipped (--no-push specified).');
            }
        } catch (e) {
            console.error('Git automation failed:', e.message);
        }
    } else if (opt.git && totalChanges === 0) {
        console.log('No changes detected; skipping git commit.');
    }
}

run();
