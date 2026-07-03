#!/usr/bin/env node
/**
 * Fix root-relative internal links for GitHub Pages project sites
 * where the blog lives under /static/.
 */
const fs = require('fs');
const path = require('path');

const STATIC_DIR = path.join(__dirname, '..', 'static');
const BASE = 'https://paladini.github.io/ghost-on-github-pages-demo/static';

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(html|xml|xsl|rss)$/i.test(entry.name)) files.push(full);
  }
  return files;
}

function fixContent(content) {
  // Root-relative internal links -> production static URLs
  let out = content.replace(
    /(href|src)="\/(?!\/)([^"]*)"/g,
    (match, attr, p) => {
      if (p.startsWith('ghost/') || p.startsWith('email/') || p.startsWith('members/')) {
        return match;
      }
      const normalized = p.startsWith('static/') ? p.slice(7) : p;
      return `${attr}="${BASE}/${normalized}"`;
    },
  );
  // Protocol-relative sitemap stylesheet
  out = out.replace(
    /href="\/\/paladini\.github\.io\/ghost-on-github-pages-demo\//g,
    `href="${BASE}/`,
  );
  // robots.txt sitemap line
  out = out.replace(
    /Sitemap: https:\/\/paladini\.github\.io\/ghost-on-github-pages-demo\/sitemap\.xml/g,
    `Sitemap: ${BASE}/sitemap.xml`,
  );
  return out;
}

let count = 0;
for (const file of walk(STATIC_DIR)) {
  const original = fs.readFileSync(file, 'utf8');
  const fixed = fixContent(original);
  if (fixed !== original) {
    fs.writeFileSync(file, fixed);
    count += 1;
  }
}
console.log(`Fixed internal links in ${count} files under static/`);
