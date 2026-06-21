param(
  [string]$EmailA = "",
  [string]$PasswordA = "",
  [string]$EmailB = "",
  [string]$PasswordB = "",
  [string]$NodePath = ""
)

$ErrorActionPreference = "Stop"

function Read-RequiredText {
  param([string]$Label, [string]$Value)
  if ($Value) { return $Value.Trim() }
  $inputValue = Read-Host $Label
  if (-not $inputValue) { throw "$Label bos olamaz" }
  return $inputValue.Trim()
}

function Read-RequiredSecret {
  param([string]$Label, [string]$Value)
  if ($Value) { return $Value }
  $secure = Read-Host $Label -AsSecureString
  if (-not $secure -or $secure.Length -eq 0) { throw "$Label bos olamaz" }
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
  $candidate = "C:\Users\İRFAN AYYILDIZ\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
  if (Test-Path $candidate) {
    $resolvedNode = $candidate
  } else {
    $resolvedNode = "node"
  }
}

$env:KASAM_CLOUD_EMAIL_A = Read-RequiredText "Test hesabi A e-posta" $EmailA
$env:KASAM_CLOUD_PASSWORD_A = Read-RequiredSecret "Test hesabi A sifre" $PasswordA
$env:KASAM_CLOUD_EMAIL_B = Read-RequiredText "Test hesabi B e-posta" $EmailB
$env:KASAM_CLOUD_PASSWORD_B = Read-RequiredSecret "Test hesabi B sifre" $PasswordB

Write-Host "Cloud live smoke testi basliyor..."
& $resolvedNode "scripts/cloud-live-smoke.cjs"
exit $LASTEXITCODE
