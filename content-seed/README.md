# Content seed

This folder contains a Ghost export used to reproduce the demo blog content.

## Import into a fresh Ghost install

```bash
cd ~/.ghost/current
ghost import /path/to/ghost-on-github-pages-demo/content-seed/demo-posts.json
ghost start
```

Then regenerate and publish:

```bash
# macOS / Linux
./scripts/deploy-demo.sh

# Windows
powershell -ExecutionPolicy Bypass -File scripts/generate-static.ps1
node scripts/post-process-static.js
# commit and push static/ manually
```

## Notes

- Secrets are stripped from this export before commit (`scripts/sanitize-seed.js`).
- After import, create a new admin account if prompted, or update credentials in Ghost Admin.
- Default demo content includes posts about v3, getting started, and a link to the Classic v2 archive.
