# Seed demo content into local Ghost via Admin API
$ErrorActionPreference = "Stop"
$BaseUrl = "http://localhost:2373"
$Email = "demo@ghost-on-github-pages.local"
$Password = "Gh0st-Demo-2026!Secure"

$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$authBody = "{`"username`":`"$Email`",`"password`":`"$Password`"}"
Invoke-RestMethod -Uri "$BaseUrl/ghost/api/admin/session/" -Method POST -Body $authBody -ContentType "application/json" -WebSession $session | Out-Null

function New-GhostPost {
    param([string]$Title, [string]$Slug, [string]$Html, [string[]]$Tags, [string]$Excerpt = "")
    $tagObjects = $Tags | ForEach-Object { @{ name = $_ } }
    $post = @{
        title = $Title
        slug = $Slug
        status = "published"
        html = $Html
        custom_excerpt = $Excerpt
        tags = @($tagObjects)
    }
    $body = @{ posts = @($post) } | ConvertTo-Json -Depth 6
    Invoke-RestMethod -Uri "$BaseUrl/ghost/api/admin/posts/?source=html" -Method POST -Body $body -ContentType "application/json" -WebSession $session
}

function New-GhostPage {
    param([string]$Title, [string]$Slug, [string]$Html)
    $page = @{
        title = $Title
        slug = $Slug
        status = "published"
        html = $Html
    }
    $body = @{ pages = @($page) } | ConvertTo-Json -Depth 6
    Invoke-RestMethod -Uri "$BaseUrl/ghost/api/admin/pages/?source=html" -Method POST -Body $body -ContentType "application/json" -WebSession $session
}

New-GhostPost -Title "Welcome to the Ghost on GitHub Pages Demo" -Slug "welcome-to-v3" -Tags @("demo", "version-3", "getting-started") -Excerpt "A live showcase of free Ghost blogging on GitHub Pages, now powered by version 3." -Html @"
<p>This is the official live demo for <a href="https://github.com/paladini/ghost-on-github-pages">Ghost on GitHub Pages</a> version 3. You are reading a real Ghost blog — edited locally, published as static HTML, and hosted for free on GitHub Pages.</p>
<h2>What you are seeing</h2>
<ul>
<li><strong>Ghost 6.x</strong> running locally for editing</li>
<li><strong>gssg</strong> generating the static site (replacing the old Python buster tool)</li>
<li><strong>GitHub Pages</strong> serving the published files worldwide</li>
</ul>
<p>Version 3 fixes long-standing issues from the Classic release: broken localhost links, image path bugs, and a Python 2 dependency that stopped working on modern systems.</p>
<p>Ready to start your own blog? Read the <a href="getting-started-in-minutes/">Getting Started in Minutes</a> post or visit the <a href="https://github.com/paladini/ghost-on-github-pages/blob/master/docs/v3/GETTING-STARTED.md">official guide</a>.</p>
"@

New-GhostPost -Title "What's New in Version 3" -Slug "whats-new-in-v3" -Tags @("version-3", "tutorials") -Excerpt "gssg replaces buster, Python 2 is gone, and publishing is more reliable than ever." -Html @"
<p>Version 3.0 is a major update after several years. Here is what changed and why it matters.</p>
<h2>Fewer dependencies</h2>
<p>Classic v2 required Node.js, Python 2, pip, and buster. Version 3 needs only <strong>Node.js</strong> and <strong>wget</strong>. The static site generator is <a href="https://github.com/Fried-Chicken/ghost-static-site-generator">gssg</a>, installed automatically via npm.</p>
<h2>Reliable production URLs</h2>
<p>The old buster workflow left <code>localhost:2373</code> links in published HTML — tags, canonical URLs, Open Graph metadata, and sitemaps all pointed to your local machine instead of your live site. gssg rewrites these correctly using <code>--productionDomain</code>.</p>
<h2>Migration tool</h2>
<p>Already on Classic v2? Run <code>./migrate.sh</code> from the v3 release. It backs up your blog folder automatically and updates your deploy scripts.</p>
<h2>Better validation</h2>
<p>Before every publish, <code>validate-static.sh</code> checks for localhost links and broken image paths — catching problems before they reach your readers.</p>
"@

New-GhostPost -Title "Getting Started in Minutes" -Slug "getting-started-in-minutes" -Tags @("getting-started", "tutorials") -Excerpt "Set up a free Ghost blog on GitHub Pages with install.sh and deploy.sh." -Html @"
<p>You can have a live Ghost blog on GitHub Pages in a few steps. No server costs, no credit card.</p>
<h2>Step 1 — Download version 3</h2>
<p>Get the latest release from <a href="https://github.com/paladini/ghost-on-github-pages/releases/latest">github.com/paladini/ghost-on-github-pages</a> and extract the ZIP file.</p>
<h2>Step 2 — Run install.sh</h2>
<pre><code>chmod +x install.sh
./install.sh</code></pre>
<p>The script installs Ghost on your computer at <code>~/.ghost</code>. This takes a few minutes.</p>
<h2>Step 3 — Set up your blog</h2>
<p>Open <code>http://localhost:2373/ghost</code> in your browser. Create your admin account and write your first post.</p>
<h2>Step 4 — Publish</h2>
<pre><code>cd ~/.ghost
./deploy.sh</code></pre>
<p>Enter your GitHub username, repository name, and URL when prompted. Wait about 10 minutes, then visit <code>https://YOUR_USERNAME.github.io/YOUR_REPO</code>.</p>
<p>That is it. Edit locally, publish when ready.</p>
"@

New-GhostPost -Title "Classic v2 vs Version 3: Side by Side" -Slug "v2-vs-v3-comparison" -Tags @("version-3", "demo") -Excerpt "Compare the 2018 Classic workflow with the modern v3 toolchain." -Html @"
<p>This demo repository preserves both versions so you can see the difference firsthand.</p>
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
<p>The frozen 2018 site is preserved at <a href="../legacy/v2/static/index.html">Classic v2 Demo</a>. Click any tag or check the page source — you will see <code>localhost:2373</code> links throughout. That is the bug v3 fixes.</p>
<p>The current site you are reading was generated with gssg. Every link points to the real GitHub Pages URL.</p>
"@

New-GhostPost -Title "How Publishing Works" -Slug "publishing-workflow" -Tags @("tutorials", "getting-started") -Excerpt "Edit locally in Ghost, generate static files with gssg, push to GitHub Pages." -Html @"
<p>Ghost on GitHub Pages uses a simple publish loop. Understanding it helps you work confidently with your blog.</p>
<h2>The workflow</h2>
<ol>
<li><strong>Edit</strong> — Write and preview at <code>http://localhost:2373/ghost</code></li>
<li><strong>Generate</strong> — <code>deploy.sh</code> runs gssg to create static HTML from your local blog</li>
<li><strong>Validate</strong> — Scripts check for localhost links and broken images</li>
<li><strong>Push</strong> — Static files upload to your GitHub repository</li>
<li><strong>Live</strong> — GitHub Pages serves the update within about 10 minutes</li>
</ol>
<h2>What gets published</h2>
<p>Only the static HTML, CSS, images, and feeds — not the Ghost application itself. Your repository stays lean and your live site has no server-side code to maintain.</p>
<h2>Updating later</h2>
<p>Every time you want to publish changes, run <code>cd ~/.ghost && ./deploy.sh</code>. Your GitHub settings are saved after the first publish.</p>
"@

New-GhostPost -Title "Free Ghost Hosting with GitHub Pages" -Slug "free-ghost-hosting" -Tags @("getting-started", "demo") -Excerpt "Why static Ghost on GitHub Pages is a great option for personal blogs and portfolios." -Html @"
<p>Ghost is a modern publishing platform built for writers. GitHub Pages offers free static hosting. Together, they give you a professional blog at zero cost.</p>
<h2>Why static?</h2>
<ul>
<li><strong>Security</strong> — No server to patch or defend</li>
<li><strong>Speed</strong> — Plain HTML loads fast everywhere</li>
<li><strong>Cost</strong> — GitHub Pages is free for public repositories</li>
<li><strong>Simplicity</strong> — Your content lives in a Git repository you control</li>
</ul>
<h2>What you still get</h2>
<p>You edit with the full Ghost admin interface — rich editor, tags, authors, themes, and previews. Readers see a fast static site. The best of both worlds.</p>
<h2>Limitations to know</h2>
<p>Static sites cannot run Ghost membership, comments, or dynamic search out of the box. For a personal blog, portfolio, or project journal, that is rarely a problem.</p>
<p>Start today with the <a href="https://github.com/paladini/ghost-on-github-pages">Ghost on GitHub Pages</a> project.</p>
"@

New-GhostPage -Title "About This Demo" -Slug "about" -Html @"
<p>This site demonstrates <a href="https://github.com/paladini/ghost-on-github-pages">Ghost on GitHub Pages</a> — a free toolchain for publishing Ghost blogs as static sites on GitHub Pages.</p>
<h2>History</h2>
<p>The project started in 2016 to make Ghost accessible without paid hosting. The original Classic release (v2.0.1) used buster and Python 2. Version 3.0 (2026) modernizes the stack with gssg and drops the Python dependency entirely.</p>
<h2>This repository</h2>
<ul>
<li><strong>Main demo</strong> — Ghost 6.x content published with gssg (what you are reading)</li>
<li><strong><a href="../legacy/v2/static/index.html">Classic v2 archive</a></strong> — Frozen 2018 demo showing the old workflow and its known bugs</li>
</ul>
<h2>Links</h2>
<ul>
<li><a href="https://github.com/paladini/ghost-on-github-pages">Main project repository</a></li>
<li><a href="https://github.com/paladini/ghost-on-github-pages/blob/master/docs/v3/GETTING-STARTED.md">Getting Started guide</a></li>
<li><a href="https://github.com/paladini/ghost-on-github-pages-demo">This demo repository</a></li>
</ul>
<p>Created by <a href="https://github.com/paladini">Fernando Paladini</a>.</p>
"@

Write-Host "Demo content seeded successfully."
