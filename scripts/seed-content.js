#!/usr/bin/env node
/**
 * Seed demo content into local Ghost via Admin API.
 */
const http = require('http');

const BASE = 'http://localhost:2373';
const EMAIL = 'demo@ghost-on-github-pages.local';
const PASSWORD = 'Gh0st-Demo-2026!Secure';

function request(method, path, body, cookie) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const url = new URL(path, BASE);
    const opts = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(cookie ? { Cookie: cookie } : {}),
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    };
    const req = http.request(opts, (res) => {
      let raw = '';
      res.on('data', (c) => (raw += c));
      res.on('end', () => {
        const setCookie = res.headers['set-cookie'];
        let parsed;
        try { parsed = raw ? JSON.parse(raw) : null; } catch { parsed = raw; }
        if (res.statusCode >= 400) {
          reject(new Error(`${method} ${path} -> ${res.statusCode}: ${raw}`));
        } else {
          resolve({ data: parsed, cookie: setCookie ? setCookie.map((c) => c.split(';')[0]).join('; ') : cookie });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

const posts = [
  {
    title: 'Welcome to the Ghost on GitHub Pages Demo',
    slug: 'welcome-to-v3',
    tags: ['demo', 'version-3', 'getting-started'],
    excerpt: 'A live showcase of free Ghost blogging on GitHub Pages, now powered by version 3.',
    html: `<p>This is the official live demo for <a href="https://github.com/paladini/ghost-on-github-pages">Ghost on GitHub Pages</a> version 3. You are reading a real Ghost blog — edited locally, published as static HTML, and hosted for free on GitHub Pages.</p>
<h2>What you are seeing</h2>
<ul>
<li><strong>Ghost 6.x</strong> running locally for editing</li>
<li><strong>gssg</strong> generating the static site (replacing the old Python buster tool)</li>
<li><strong>GitHub Pages</strong> serving the published files worldwide</li>
</ul>
<p>Version 3 fixes long-standing issues from the Classic release: broken localhost links, image path bugs, and a Python 2 dependency that stopped working on modern systems.</p>
<p>Ready to start your own blog? Read the <a href="getting-started-in-minutes/">Getting Started in Minutes</a> post or visit the <a href="https://github.com/paladini/ghost-on-github-pages/blob/master/docs/v3/GETTING-STARTED.md">official guide</a>.</p>`,
  },
  {
    title: "What's New in Version 3",
    slug: 'whats-new-in-v3',
    tags: ['version-3', 'tutorials'],
    excerpt: 'gssg replaces buster, Python 2 is gone, and publishing is more reliable than ever.',
    html: `<p>Version 3.0 is a major update after several years. Here is what changed and why it matters.</p>
<h2>Fewer dependencies</h2>
<p>Classic v2 required Node.js, Python 2, pip, and buster. Version 3 needs only <strong>Node.js</strong> and <strong>wget</strong>. The static site generator is <a href="https://github.com/Fried-Chicken/ghost-static-site-generator">gssg</a>, installed automatically via npm.</p>
<h2>Reliable production URLs</h2>
<p>The old buster workflow left <code>localhost:2373</code> links in published HTML. gssg rewrites these correctly using <code>--productionDomain</code>.</p>
<h2>Migration tool</h2>
<p>Already on Classic v2? Run <code>./migrate.sh</code> from the v3 release. It backs up your blog folder automatically.</p>
<h2>Better validation</h2>
<p>Before every publish, <code>validate-static.sh</code> checks for localhost links and broken image paths.</p>`,
  },
  {
    title: 'Getting Started in Minutes',
    slug: 'getting-started-in-minutes',
    tags: ['getting-started', 'tutorials'],
    excerpt: 'Set up a free Ghost blog on GitHub Pages with install.sh and deploy.sh.',
    html: `<p>You can have a live Ghost blog on GitHub Pages in a few steps. No server costs, no credit card.</p>
<h2>Step 1 — Download version 3</h2>
<p>Get the latest release from <a href="https://github.com/paladini/ghost-on-github-pages/releases/latest">github.com/paladini/ghost-on-github-pages</a>.</p>
<h2>Step 2 — Run install.sh</h2>
<pre><code>chmod +x install.sh\n./install.sh</code></pre>
<h2>Step 3 — Set up your blog</h2>
<p>Open <code>http://localhost:2373/ghost</code> and create your admin account.</p>
<h2>Step 4 — Publish</h2>
<pre><code>cd ~/.ghost\n./deploy.sh</code></pre>`,
  },
  {
    title: 'Classic v2 vs Version 3: Side by Side',
    slug: 'v2-vs-v3-comparison',
    tags: ['version-3', 'demo'],
    excerpt: 'Compare the 2018 Classic workflow with the modern v3 toolchain.',
    html: `<p>This demo repository preserves both versions so you can see the difference firsthand.</p>
<h2>Comparison</h2>
<table>
<thead><tr><th></th><th>v3.0 (current)</th><th>v2.0.1 (Classic)</th></tr></thead>
<tbody>
<tr><td>Static generator</td><td>gssg (Node.js)</td><td>buster (Python 2)</td></tr>
<tr><td>Dependencies</td><td>Node + wget</td><td>Node + Python 2 + pip + buster</td></tr>
<tr><td>Production URLs</td><td>Correct</td><td>Broken (localhost)</td></tr>
<tr><td>Support</td><td>Active</td><td>Frozen</td></tr>
</tbody>
</table>
<h2>See the Classic demo</h2>
<p>The frozen 2018 site is at <a href="../legacy/v2/static/index.html">Classic v2 Demo</a>. Click any tag — you will see <code>localhost:2373</code> links throughout.</p>`,
  },
  {
    title: 'How Publishing Works',
    slug: 'publishing-workflow',
    tags: ['tutorials', 'getting-started'],
    excerpt: 'Edit locally in Ghost, generate static files with gssg, push to GitHub Pages.',
    html: `<p>Ghost on GitHub Pages uses a simple publish loop.</p>
<ol>
<li><strong>Edit</strong> at <code>http://localhost:2373/ghost</code></li>
<li><strong>Generate</strong> static HTML with gssg via <code>deploy.sh</code></li>
<li><strong>Validate</strong> links and images</li>
<li><strong>Push</strong> to GitHub</li>
<li><strong>Live</strong> on GitHub Pages within ~10 minutes</li>
</ol>`,
  },
  {
    title: 'Free Ghost Hosting with GitHub Pages',
    slug: 'free-ghost-hosting',
    tags: ['getting-started', 'demo'],
    excerpt: 'Why static Ghost on GitHub Pages is a great option for personal blogs.',
    html: `<p>Ghost is a modern publishing platform. GitHub Pages offers free static hosting. Together, they give you a professional blog at zero cost.</p>
<h2>Why static?</h2>
<ul>
<li><strong>Security</strong> — No server to patch</li>
<li><strong>Speed</strong> — Plain HTML loads fast</li>
<li><strong>Cost</strong> — Free for public repositories</li>
</ul>
<p>Start today with <a href="https://github.com/paladini/ghost-on-github-pages">Ghost on GitHub Pages</a>.</p>`,
  },
];

const aboutPage = {
  title: 'About This Demo',
  slug: 'about',
  html: `<p>This site demonstrates <a href="https://github.com/paladini/ghost-on-github-pages">Ghost on GitHub Pages</a>.</p>
<h2>History</h2>
<p>The project started in 2016. Version 3.0 (2026) modernizes the stack with gssg.</p>
<h2>This repository</h2>
<ul>
<li><strong>Main demo</strong> — Ghost 6.x with gssg</li>
<li><strong><a href="../legacy/v2/static/index.html">Classic v2 archive</a></strong> — Frozen 2018 demo</li>
</ul>
<p>Created by <a href="https://github.com/paladini">Fernando Paladini</a>.</p>`,
};

async function main() {
  let { cookie } = await request('POST', '/ghost/api/admin/session/', {
    username: EMAIL,
    password: PASSWORD,
  });

  await request('PUT', '/ghost/api/admin/settings/', {
    settings: [
      { key: 'description', value: 'A live demo of free Ghost blogging on GitHub Pages — now powered by v3.' },
      { key: 'locale', value: 'en' },
      {
        key: 'navigation',
        value: JSON.stringify([
          { label: 'Home', url: '/' },
          { label: 'About', url: '/about/' },
          { label: 'Classic v2 Demo', url: '../legacy/v2/static/index.html' },
        ]),
      },
    ],
  }, cookie);

  for (const p of posts) {
    const body = {
      posts: [{
        title: p.title,
        slug: p.slug,
        status: 'published',
        html: p.html,
        custom_excerpt: p.excerpt,
        tags: p.tags.map((name) => ({ name })),
      }],
    };
    await request('POST', '/ghost/api/admin/posts/?source=html', body, cookie);
    console.log('Created post:', p.slug);
  }

  await request('POST', '/ghost/api/admin/pages/?source=html', {
    pages: [{ ...aboutPage, status: 'published' }],
  }, cookie);
  console.log('Created page: about');

  console.log('Done.');
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
