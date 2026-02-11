#!/usr/bin/env node
/**
 * check-links.mjs — Scan all .html files for internal links and report missing targets.
 * Usage: node scripts/check-links.mjs [rootDir]
 * Default rootDir: current working directory (project root).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(process.cwd(), process.argv[2] || '.');

const EXTS = ['.html'];
const SKIP_PROTOCOLS = ['mailto:', 'tel:', 'sms:', 'http://', 'https://', '#', 'javascript:'];
const missing = []; // { from: string, href: string, resolved: string }[]

function* walk(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name === '.git') continue;
      yield* walk(full);
    } else if (e.isFile() && EXTS.some(ext => e.name.endsWith(ext))) {
      yield full;
    }
  }
}

function isExternal(href) {
  const t = href.trim();
  if (!t) return true;
  for (const p of SKIP_PROTOCOLS) {
    if (t.toLowerCase().startsWith(p)) return true;
  }
  return false;
}

function resolveHref(fromFile, href) {
  let clean = href.replace(/#.*$/, '').trim();
  if (!clean || clean === '/') return null;
  let absolute;
  if (clean.startsWith('/')) {
    absolute = path.join(rootDir, clean.endsWith('/') ? clean.slice(0, -1) : clean);
  } else {
    absolute = path.resolve(path.dirname(fromFile), clean.endsWith('/') ? clean.slice(0, -1) : clean);
  }
  const withIndex = path.join(absolute, 'index.html');
  if (fs.existsSync(absolute)) return null;
  if (fs.existsSync(absolute + '.html')) return null;
  if (fs.existsSync(withIndex)) return null;
  if (path.extname(absolute) === '' && fs.existsSync(absolute + '.html')) return null;
  return absolute;
}

const hrefRe = /href\s*=\s*["']([^"']+)["']/gi;

for (const file of walk(rootDir)) {
  const content = fs.readFileSync(file, 'utf8');
  let m;
  hrefRe.lastIndex = 0;
  while ((m = hrefRe.exec(content)) !== null) {
    const href = m[1].trim();
    if (isExternal(href)) continue;
    const resolved = resolveHref(file, href);
    if (resolved !== null) {
      missing.push({
        from: path.relative(rootDir, file),
        href,
        resolved: path.relative(rootDir, resolved),
      });
    }
  }
}

if (missing.length === 0) {
  console.log('OK: No missing internal links found.');
  process.exit(0);
}

console.log('Missing links (source file → href → resolved path):');
missing.forEach(({ from, href, resolved }) => {
  console.log(`  ${from}  →  ${href}  (${resolved})`);
});
process.exit(1);
