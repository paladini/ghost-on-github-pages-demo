# Ghost on GitHub Pages — Live Demo

A live demonstration of [Ghost on GitHub Pages](https://github.com/paladini/ghost-on-github-pages) **version 3**: free Ghost blogging hosted on GitHub Pages with no server required.

**Live site:** https://paladini.github.io/ghost-on-github-pages-demo/

## What this repo shows

| | **Current demo (v3)** | **Classic archive (v2)** |
|---|---|---|
| URL | [/static/](static/) | [/legacy/v2/static/](legacy/v2/static/) |
| Ghost version | 5.x | 1.22.5 |
| Static generator | gssg (Node.js) | buster (Python 2) |
| Production URLs | Correct | Broken (localhost links) |
| Tool version | [v3.0.0+](https://github.com/paladini/ghost-on-github-pages/releases/latest) | [v2.0.1](https://github.com/paladini/ghost-on-github-pages/releases/tag/v2.0.1) |

The root `index.html` redirects to the v3 blog. The Classic v2 site is preserved under `legacy/v2/` as a historical reference — including its known localhost URL bugs.

## Get your own blog

Follow the [v3 Getting Started guide](https://github.com/paladini/ghost-on-github-pages/blob/master/docs/v3/GETTING-STARTED.md):

1. Install [Node.js](https://nodejs.org/) and `wget`
2. Download [ghost-on-github-pages v3](https://github.com/paladini/ghost-on-github-pages/releases/latest)
3. Run `./install.sh`
4. Write posts at `http://localhost:2373/ghost`
5. Publish with `cd ~/.ghost && ./deploy.sh`

Upgrading from Classic v2? See the [Migration guide](https://github.com/paladini/ghost-on-github-pages/blob/master/docs/MIGRATION.md).

## Repository layout

```
├── index.html          # Redirect to v3 blog
├── static/             # v3 static site (gssg output)
├── legacy/v2/          # Frozen 2018 Classic demo
├── content-seed/       # Ghost export for reproducing demo content
├── scripts/            # Maintainer deploy scripts
└── .github/workflows/  # CI validation
```

This repo contains **only static files and seed content** — not a full Ghost installation. That is by design in v3 (see [issue #9](https://github.com/paladini/ghost-on-github-pages/issues/9)).

## Maintainers: republishing the demo

### Prerequisites

- Node.js, wget, and Ghost CLI installed
- Local Ghost blog at `~/.ghost` configured for this repository
- Bash shell (Git Bash or WSL on Windows)

### Restore demo content

```bash
cd ~/.ghost/current
ghost import content-seed/demo-posts.json
ghost start
```

### Publish

From this repository checkout:

```bash
chmod +x scripts/deploy-demo.sh
./scripts/deploy-demo.sh
```

The deploy script runs the standard v3 `deploy.sh` and preserves `legacy/`, `content-seed/`, CI workflows, and this README in the published output.

### Deploy settings

The demo uses these GitHub Pages settings (saved in `~/.ghost/deploy.conf`):

```
GH_USERNAME=paladini
GH_REPO=ghost-on-github-pages-demo
PRODUCTION_DOMAIN=https://paladini.github.io/ghost-on-github-pages-demo
```

## License

MIT — see [LICENSE](LICENSE).

## About

Created by [Fernando Paladini](https://github.com/paladini) to showcase free Ghost hosting on GitHub Pages.
