param(
  [string]$Email = ""
)

$ErrorActionPreference = "Stop"

function Read-RequiredText($Prompt, $DefaultValue) {
  if ($DefaultValue) {
    return $DefaultValue
  }
  do {
    $value = Read-Host $Prompt
  } while (-not $value)
  return $value
}

$env:KASAM_RESET_TEST_EMAIL = Read-RequiredText "Sifre sifirlama testi icin e-posta" $Email

$nodeCandidates = @(
  (Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"),
  "node"
)

$resolvedNode = $null
foreach ($candidate in $nodeCandidates) {
  try {
    $cmd = Get-Command $candidate -ErrorAction Stop
    $resolvedNode = $cmd.Source
    break
  } catch {
  }
}

if (-not $resolvedNode) {
  throw "Node.js bulunamadi."
}

& $resolvedNode "scripts/password-reset-live-smoke.cjs"
exit $LASTEXITCODE
