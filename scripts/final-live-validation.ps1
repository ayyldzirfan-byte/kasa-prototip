param(
  [string]$EmailA = "",
  [string]$PasswordA = "",
  [string]$EmailB = "",
  [string]$PasswordB = "",
  [string]$ServiceRoleKey = "",
  [string]$ResetEmail = "",
  [string]$NodePath = ""
)

$ErrorActionPreference = "Stop"

function Read-OptionalText {
  param([string]$Label, [string]$Value)
  if ($Value) { return $Value.Trim() }
  $inputValue = Read-Host $Label
  if ($inputValue) { return $inputValue.Trim() }
  return ""
}

function Read-RequiredText {
  param([string]$Label, [string]$Value)
  if ($Value) { return $Value.Trim() }
  $inputValue = Read-Host $Label
  if (-not $inputValue) { throw "$Label bos olamaz" }
  return $inputValue.Trim()
}

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
  $candidate = Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
  if (Test-Path $candidate) {
    $resolvedNode = $candidate
  } else {
    $resolvedNode = "node"
  }
}

$reset = Read-OptionalText "Sifre reset testi icin e-posta, atlamak icin Enter" $ResetEmail
if ($reset) {
  $env:KASAM_RESET_TEST_EMAIL = $reset
}

$allAccountInputs = $EmailA -and $PasswordA -and $EmailB -and $PasswordB
if ($ServiceRoleKey) {
  $env:KASAM_SUPABASE_SERVICE_ROLE_KEY = $ServiceRoleKey
} elseif (-not $allAccountInputs) {
  $optionalServiceRole = Read-OptionalSecret "Supabase service_role key varsa yapistir, yoksa Enter" ""
  if ($optionalServiceRole) {
    $env:KASAM_SUPABASE_SERVICE_ROLE_KEY = $optionalServiceRole
  }
}

if (-not $env:KASAM_SUPABASE_SERVICE_ROLE_KEY) {
  $env:KASAM_CLOUD_EMAIL_A = Read-RequiredText "Test hesabi A e-posta" $EmailA
  $env:KASAM_CLOUD_PASSWORD_A = Read-RequiredSecret "Test hesabi A sifre" $PasswordA
  $env:KASAM_CLOUD_EMAIL_B = Read-RequiredText "Test hesabi B e-posta" $EmailB
  $env:KASAM_CLOUD_PASSWORD_B = Read-RequiredSecret "Test hesabi B sifre" $PasswordB
}

Write-Host "Final canli dogrulama basliyor..."
& $resolvedNode "scripts/final-live-validation.cjs"
exit $LASTEXITCODE
