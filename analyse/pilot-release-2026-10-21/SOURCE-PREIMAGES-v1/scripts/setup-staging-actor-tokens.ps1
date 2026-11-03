$ErrorActionPreference = "Stop"

$stagingOrigin = "https://mhumbczqrzutdnraafhs.supabase.co"
$repoRoot = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $repoRoot ".env.local"
$tempPath = Join-Path $repoRoot ".env.local.actor-tokens.tmp"

$actors = @(
  [pscustomobject]@{ Label = "learner A"; Variable = "MCY_TEST_LEARNER_A_ACCESS_TOKEN" },
  [pscustomobject]@{ Label = "learner B"; Variable = "MCY_TEST_LEARNER_B_ACCESS_TOKEN" },
  [pscustomobject]@{ Label = "teacher"; Variable = "MCY_TEST_TEACHER_ACCESS_TOKEN" },
  [pscustomobject]@{ Label = "reviewer"; Variable = "MCY_TEST_REVIEWER_ACCESS_TOKEN" },
  [pscustomobject]@{ Label = "owner"; Variable = "MCY_TEST_OWNER_ACCESS_TOKEN" }
)

function Read-DotEnvValue([string[]]$Lines, [string]$Name) {
  $matchingLines = @($Lines | Where-Object { $_ -match "^\s*$([regex]::Escape($Name))\s*=" })
  if ($matchingLines.Count -ne 1) {
    throw "Expected exactly one $Name entry in .env.local."
  }

  $value = ($matchingLines[0] -replace "^\s*$([regex]::Escape($Name))\s*=", "").Trim()
  if ($value.Length -ge 2 -and (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'")))) {
    $value = $value.Substring(1, $value.Length - 2)
  }
  return $value
}

if (-not (Test-Path -LiteralPath $envPath -PathType Leaf)) {
  throw "Create .env.local with the staging URL and publishable key before running this helper."
}

Push-Location $repoRoot
try {
  & git check-ignore -q -- .env.local
  if ($LASTEXITCODE -ne 0) {
    throw "Refusing to write tokens: .env.local is not ignored by Git."
  }
}
finally {
  Pop-Location
}

$original = [System.IO.File]::ReadAllText($envPath)
$newline = if ($original.Contains("`r`n")) { "`r`n" } elseif ($original.Contains("`r")) { "`r" } else { "`n" }
$hadFinalNewline = $original.EndsWith("`n") -or $original.EndsWith("`r")
$lines = [System.Text.RegularExpressions.Regex]::Split($original, "\r\n|\n|\r")
if ($hadFinalNewline -and $lines.Count -gt 0 -and $lines[$lines.Count - 1] -eq "") {
  $lines = $lines[0..($lines.Count - 2)]
}

$url = Read-DotEnvValue -Lines $lines -Name "VITE_SUPABASE_URL"
$publishableKey = Read-DotEnvValue -Lines $lines -Name "VITE_SUPABASE_PUBLISHABLE_KEY"
try {
  $parsedUrl = [uri]$url
}
catch {
  throw "VITE_SUPABASE_URL is not a valid URL."
}
if ($parsedUrl.GetLeftPart([System.UriPartial]::Authority) -ne $stagingOrigin -or $parsedUrl.AbsolutePath -ne "/" -or $parsedUrl.Query -or $parsedUrl.Fragment) {
  throw "Refusing to authenticate: this helper is locked to the mcy-staging project."
}
if (-not $publishableKey.StartsWith("sb_publishable_")) {
  throw "Refusing to authenticate: only the staging publishable key is accepted; never use a secret/service-role key."
}

$tokens = @{}
$userIds = @()
foreach ($actor in $actors) {
  $email = (Read-Host "Email for disposable staging account ($($actor.Label))").Trim()
  if (-not $email) {
    throw "No email entered for $($actor.Label). No token file changes were made."
  }
  $securePassword = Read-Host "Password for $($actor.Label) (input hidden)" -AsSecureString
  if ($securePassword.Length -eq 0) {
    $securePassword.Dispose()
    throw "No password entered for $($actor.Label). No token file changes were made."
  }

  $passwordBstr = [IntPtr]::Zero
  $password = $null
  $bodyJson = $null
  try {
    $passwordBstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
    $password = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordBstr)
    $bodyJson = @{ email = $email; password = $password } | ConvertTo-Json -Compress
    $response = Invoke-RestMethod `
      -Method Post `
      -Uri "$stagingOrigin/auth/v1/token?grant_type=password" `
      -Headers @{ apikey = $publishableKey; Accept = "application/json" } `
      -ContentType "application/json" `
      -Body $bodyJson `
      -TimeoutSec 20

    if (-not $response.access_token -or -not $response.user.id) {
      throw "The authentication response was incomplete."
    }
    if ($userIds -contains [string]$response.user.id) {
      throw "This account matches an earlier fixture. Use five distinct staging Auth users."
    }

    $userIds += [string]$response.user.id
    $tokens[$actor.Variable] = [string]$response.access_token
    Write-Host "Authenticated $($actor.Label); identity and token kept local."
  }
  catch {
    throw "Could not authenticate $($actor.Label). Check the staging user, confirmed email, credentials, and that this is a distinct account. No token values were written."
  }
  finally {
    if ($passwordBstr -ne [IntPtr]::Zero) {
      [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordBstr)
    }
    $password = $null
    $bodyJson = $null
    $response = $null
    $securePassword.Dispose()
  }
}

foreach ($actor in $actors) {
  $keyPattern = "^\s*$([regex]::Escape($actor.Variable))\s*="
  $existing = @($lines | Where-Object { $_ -match $keyPattern })
  if ($existing.Count -gt 1) {
    throw "Duplicate $($actor.Variable) entries in .env.local. Remove duplicates, then run again."
  }
  if ($existing.Count -eq 1) {
    for ($index = 0; $index -lt $lines.Count; $index++) {
      if ($lines[$index] -match $keyPattern) {
        $prefix = [regex]::Match($lines[$index], "^\s*$([regex]::Escape($actor.Variable))\s*=").Value
        $lines[$index] = $prefix + $tokens[$actor.Variable]
        break
      }
    }
  }
  else {
    $lines += "$($actor.Variable)=$($tokens[$actor.Variable])"
  }
}

$updated = [string]::Join($newline, $lines)
if ($hadFinalNewline -or $original.Length -eq 0) {
  $updated += $newline
}
$encoding = New-Object System.Text.UTF8Encoding($false)
try {
  [System.IO.File]::WriteAllText($tempPath, $updated, $encoding)
  [System.IO.File]::Replace($tempPath, $envPath, $null)
}
finally {
  if (Test-Path -LiteralPath $tempPath -PathType Leaf) {
    Remove-Item -LiteralPath $tempPath -Force
  }
}

$tokens.Clear()
Write-Host "Saved five distinct, short-lived staging access tokens in ignored .env.local. Token values were not displayed."
Write-Host "Run: npm run test:teacher-actors"
