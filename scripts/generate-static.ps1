# PowerShell helper for Windows maintainers — generates static/ via gssg.
$ErrorActionPreference = "Stop"

$ghostCurrent = Join-Path $env:USERPROFILE ".ghost\current"
$demoRoot = Split-Path $PSScriptRoot -Parent
if (-not (Test-Path $ghostCurrent)) {
    Write-Error "Ghost not found at $ghostCurrent. Install ghost-on-github-pages v3 first."
}

$wgetDir = "$env:LOCALAPPDATA\Microsoft\WinGet\Links"
$gitBin = "C:\Program Files\Git\usr\bin"
$env:PATH = "$wgetDir;$gitBin;" + $env:PATH

Push-Location $ghostCurrent
try {
    if (Test-Path "static") { Remove-Item -Recurse -Force "static" }
    gssg --domain http://localhost:2373 `
        --url https://paladini.github.io/ghost-on-github-pages-demo `
        --dest static `
        --silent
} finally {
    Pop-Location
}

$destStatic = Join-Path $demoRoot "static"
if (Test-Path $destStatic) { Remove-Item -Recurse -Force $destStatic }
Copy-Item -Recurse (Join-Path $ghostCurrent "static") $destStatic
$nestedLegacy = Join-Path $destStatic "legacy"
if (Test-Path $nestedLegacy) { Remove-Item -Recurse -Force $nestedLegacy }
node (Join-Path $demoRoot "scripts\fix-project-site-links.js")

Write-Host "Static site copied to $destStatic"
