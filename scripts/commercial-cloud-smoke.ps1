param(
  [string]$ServiceRoleKey = "",
  [string]$NodePath = ""
)

$ErrorActionPreference = "Stop"

function Read-OptionalSecret {
  param([string]$Label, [string]$Value)
  if ($Value) { return $Value }
  $secure = Read-Host $Label -AsSecureString
  if (-not $secure -or $secure.Length -eq 0) { return "" }
  $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  try {
    return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
  } finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
  }
}

$repoRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $repoRoot

$resolvedNode = $NodePath
if (-not $resolvedNode) {
  $candidate = Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
  if (Test-Path $candidate) {
    $resolvedNode = $candidate
  } else {
    $resolvedNode = "node"
  }
}

$key = Read-OptionalSecret "Supabase service_role key" $ServiceRoleKey
if ($key) {
  $env:KASAM_SUPABASE_SERVICE_ROLE_KEY = $key
}

Write-Host "Commercial cloud smoke basliyor..."
& $resolvedNode "scripts/commercial-cloud-smoke.cjs"
$exitCode = $LASTEXITCODE
Remove-Item Env:\KASAM_SUPABASE_SERVICE_ROLE_KEY -ErrorAction SilentlyContinue
exit $exitCode
