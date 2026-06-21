param(
  [string]$NodePath = ""
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $repoRoot

$resolvedNode = $NodePath
if (-not $resolvedNode) {
  $candidates = @(
    (Join-Path $env:ProgramFiles "nodejs\node.exe"),
    (Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe")
  )
  $resolvedNode = $candidates | Where-Object { Test-Path $_ } | Select-Object -First 1
}

if (-not $resolvedNode) {
  throw "Node.js bulunamadi. Once Node.js LTS kurulu olmali."
}

& $resolvedNode "scripts/commercial-deploy-ready.cjs"
exit $LASTEXITCODE
