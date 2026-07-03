#!/usr/bin/env node
/**
 * Post-process gssg output for GitHub Pages project sites (blog under /static/).
 * - Fetch missing theme assets (gssg/wget often skips /assets/built/)
 * - Convert root-absolute paths to relative paths
 * - Remove scripts that require a live Ghost API (portal, search, members)
 */
const fs = require('fs');
const path = require('path');

const STATIC_DIR = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(__dirname, '..', 'static');

const SITE_BASE = 'https://paladini.github.io/ghost-on-github-pages-demo/static';

function copyThemeAssets() {
  const home = process.env.GHOST_HOME || path.join(require('os').homedir(), '.ghost');
  const themeBuilt = path.join(home, 'current', 'content', 'themes', 'source', 'assets');
  const ghostPublic = path.join(home, 'content', 'public');

  const copyDir = (src, dest) => {
    if (!fs.existsSync(src)) return;
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
      const from = path.join(src, entry.name);
      const to = path.join(dest, entry.name);
      if (entry.isDirectory()) copyDir(from, to);
      else fs.copyFileSync(from, to);
    }
  };

  copyDir(path.join(themeBuilt, 'built'), path.join(STATIC_DIR, 'assets', 'built'));
  copyDir(path.join(themeBuilt, 'images'), path.join(STATIC_DIR, 'assets', 'images'));
  copyDir(path.join(themeBuilt, 'fonts'), path.join(STATIC_DIR, 'assets', 'fonts'));

  for (const name of ['cards.min.css', 'cards.min.js']) {
    const src = path.join(ghostPublic, name);
    if (fs.existsSync(src)) {
      fs.mkdirSync(path.join(STATIC_DIR, 'public'), { recursive: true });
      fs.copyFileSync(src, path.join(STATIC_DIR, 'public', name));
    }
  }
}

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(html|xml|xsl)$/i.test(entry.name)) files.push(full);
  }
  return files;
}

function depthPrefix(filePath) {
  const rel = path.relative(STATIC_DIR, path.dirname(filePath));
  if (!rel || rel === '.') return '';
  return `${'../'.repeat(rel.split(path.sep).length)}`;
}

function isInternalPath(p) {
  if (!p || p.startsWith('http') || p.startsWith('//') || p.startsWith('#') || p.startsWith('mailto:')) {
    return false;
  }
  if (p.startsWith('ghost/') || p.startsWith('email/') || p.startsWith('members/') || p.startsWith('webmentions/')) {
    return false;
  }
  return p.startsWith('/');
}

function fixHtml(content, prefix) {
  let out = content;

  // Root-absolute asset and public paths -> relative
  out = out.replace(/(href|src)="\/(assets\/[^"]*)"/g, (_, attr, p) => `${attr}="${prefix}${p}"`);
  out = out.replace(/(href|src)="\/(public\/[^"]*)"/g, (_, attr, p) => `${attr}="${prefix}${p}"`);

  // Root-absolute internal page links -> relative
  out = out.replace(/(href)="\/([^"#][^"]*)"/g, (match, attr, p) => {
    if (!isInternalPath(`/${p}`)) return match;
    if (p.startsWith('legacy/')) return `${attr}="${prefix}../${p}"`;
    return `${attr}="${prefix}${p}"`;
  });

  // Production URLs missing /static/ segment (nav) — skip if already under /static/
  const repoRoot = 'https://paladini.github.io/ghost-on-github-pages-demo';
  out = out.replace(
    new RegExp(`href="${repoRoot}/static/static/?"`, 'g'),
    `href="${SITE_BASE}/"`,
  );
  out = out.replace(
    new RegExp(`href="${repoRoot}/(?!static/?)([^"]*)"`, 'g'),
    (_, p) => `href="${SITE_BASE}/${p}"`,
  );
  out = out.replace(`href="${repoRoot}"`, `href="${SITE_BASE}/"`);

  // Legacy v2 demo link
  out = out.replace(
    /href="(?:https:\/\/paladini\.github\.io\/ghost-on-github-pages-demo\/static\/)?\.\.\/legacy\/v2\/static\/index\.html"/g,
    `href="${prefix}../legacy/v2/static/index.html"`,
  );

  // Canonical / og:url -> static base
  out = out.replace(
    /content="https:\/\/paladini\.github\.io\/ghost-on-github-pages-demo\/"/g,
    `content="${SITE_BASE}/"`,
  );
  out = out.replace(
    /<link rel="canonical" href="https:\/\/paladini\.github\.io\/ghost-on-github-pages-demo\/">/g,
    `<link rel="canonical" href="${SITE_BASE}/">`,
  );

  // RSS alternate
  out = out.replace(
    /href="https:\/\/paladini\.github\.io\/ghost-on-github-pages-demo\/rss\/"/g,
    `href="${prefix}rss/"`,
  );

  // Remove API-dependent scripts and styles
  out = out.replace(/<script[^>]*portal\.min\.js[^>]*><\/script>/gi, '');
  out = out.replace(/<script[^>]*sodo-search\.min\.js[^>]*><\/script>/gi, '');
  out = out.replace(/<script[^>]*comment-counts\.min\.js[^>]*><\/script>/gi, '');
  out = out.replace(/<script[^>]*member-attribution\.min\.js[^>]*><\/script>/gi, '');
  out = out.replace(/<style id="gh-members-styles">[\s\S]*?<\/style>/gi, '');
  out = out.replace(/<link[^>]*webmention[^>]*>/gi, '');

  // Hide broken sign-in / subscribe controls
  out = out.replace(
    /<a[^>]*data-portal[^>]*>[\s\S]*?<\/a>/gi,
    '',
  );
  out = out.replace(/<li class="nav-sign-up[^"]*">[\s\S]*?<\/li>/gi, '');

  return out;
}

function fixRobots(content) {
  return content.replace(
    /Sitemap: .*/,
    `Sitemap: ${SITE_BASE}/sitemap.xml`,
  );
}

function fixSitemap(content, prefix) {
  return content
    .replace(/https:\/\/paladini\.github\.io\/ghost-on-github-pages-demo\//g, `${SITE_BASE}/`)
    .replace(/href="\/\/paladini\.github\.io\/ghost-on-github-pages-demo\//g, `href="${SITE_BASE}/`);
}

// Remove accidentally crawled legacy copy
const nestedLegacy = path.join(STATIC_DIR, 'legacy');
if (fs.existsSync(nestedLegacy)) {
  fs.rmSync(nestedLegacy, { recursive: true, force: true });
}

copyThemeAssets();

let count = 0;
for (const file of walk(STATIC_DIR)) {
  const prefix = depthPrefix(file);
  let content = fs.readFileSync(file, 'utf8');
  let fixed;

  if (path.basename(file) === 'robots.txt') {
    fixed = fixRobots(content);
  } else if (/sitemap.*\.xml$/i.test(file)) {
    fixed = fixSitemap(content, prefix);
  } else {
    fixed = fixHtml(content, prefix);
  }

  if (fixed !== content) {
    fs.writeFileSync(file, fixed);
    count += 1;
  }
}

console.log(`Post-processed ${count} files in ${STATIC_DIR}`);
