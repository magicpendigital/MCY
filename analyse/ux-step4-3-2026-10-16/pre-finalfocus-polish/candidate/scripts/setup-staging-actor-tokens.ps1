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

function Get-StagingAuthFailure([System.Management.Automation.ErrorRecord]$Failure) {
  # Never return exception text, response bodies, headers or unrecognized codes.
  $httpStatus = 0
  $httpResponse = $null
  $webStatus = $null
  $exception = $Failure.Exception
  for ($depth = 0; $exception -and $depth -lt 5; $depth++) {
    if ($exception -is [System.Net.WebException]) { $webStatus = $exception.Status }
    if ($exception.Response) {
      $httpResponse = $exception.Response
      try { $httpStatus = [int]$httpResponse.StatusCode } catch { $httpStatus = 0 }
      if ($httpStatus -lt 100 -or $httpStatus -gt 599) { $httpStatus = 0 }
      break
    }
    $exception = $exception.InnerException
  }

  $rawBody = if ($Failure.ErrorDetails) { $Failure.ErrorDetails.Message } else { $null }
  if (-not $rawBody -and $httpResponse) {
    $reader = $null
    try {
      $reader = New-Object System.IO.StreamReader($httpResponse.GetResponseStream())
      $buffer = New-Object char[] 8193
      $count = $reader.ReadBlock($buffer, 0, $buffer.Length)
      if ($count -le 8192) { $rawBody = New-Object string($buffer, 0, $count) }
    } catch {
      # Missing/unreadable HTTP bodies remain an unknown failure, not credentials.
    } finally {
      if ($reader) { $reader.Dispose() }
    }
  }

  $candidate = $null
  if ($rawBody -and $rawBody.Length -le 8192) {
    try {
      $decoded = $rawBody | ConvertFrom-Json -ErrorAction Stop
      if ($decoded.code -is [string]) { $candidate = $decoded.code.ToLowerInvariant() }
      elseif ($decoded.error_code -is [string]) { $candidate = $decoded.error_code.ToLowerInvariant() }
    } catch {
      # Do not expose non-JSON or malformed provider responses.
    }
  }

  $known = @{
    invalid_credentials = @("Login credentials were rejected. Check this staging user's email and password, or choose another confirmed test account.", $true)
    email_not_confirmed = @("This staging user's email is not confirmed. Check the user in Dashboard > Authentication > Users; do not disable email confirmation.", $false)
    user_banned = @("This staging user is disabled or banned. Check the account state in the Dashboard.", $false)
    captcha_failed = @("The CAPTCHA requirement was not satisfied. Use a supported sign-in flow; do not disable CAPTCHA as a workaround.", $false)
    email_provider_disabled = @("The Auth email provider is disabled. Review the staging Auth configuration separately.", $false)
    over_request_rate_limit = @("Auth rate limit reached. Stop and wait before rerunning; no automatic retry was sent.", $false)
    request_timeout = @("Auth timed out. Check connectivity/service status before rerunning; no automatic retry was sent.", $false)
    network_error = @("No usable Auth response. Check network, DNS and TLS connectivity; this does not prove incorrect credentials.", $false)
    auth_server_error = @("Auth returned a server error. Check staging Auth logs/service status; this does not prove incorrect credentials.", $false)
    auth_unknown = @("The failure could not be classified safely. Check staging Auth logs; do not share credentials, tokens or raw response bodies.", $false)
  }
  $code = "auth_unknown"
  if ($httpStatus -eq 429) { $code = "over_request_rate_limit" }
  elseif ($httpStatus -ge 500) { $code = "auth_server_error" }
  elseif ($candidate -and $known.ContainsKey($candidate)) { $code = $candidate }
  elseif ($webStatus -eq [System.Net.WebExceptionStatus]::Timeout) { $code = "request_timeout" }
  elseif ($webStatus -and $webStatus -ne [System.Net.WebExceptionStatus]::ProtocolError) { $code = "network_error" }

  return [pscustomobject]@{
    Code = $code
    Advice = $known[$code][0]
    CanRetry = $known[$code][1]
    HttpStatus = $httpStatus
  }
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
  for ($attempt = 1; $attempt -le 3; $attempt++) {
    $email = (Read-Host "Email for disposable staging account ($($actor.Label))").Trim()
    if (-not $email) {
      $tokens.Clear()
      throw "No email entered for $($actor.Label). No token file changes were made."
    }
    $securePassword = Read-Host "Password for $($actor.Label) (input hidden)" -AsSecureString
    if ($securePassword.Length -eq 0) {
      $securePassword.Dispose()
      $tokens.Clear()
      throw "No password entered for $($actor.Label). No token file changes were made."
    }

    $passwordBstr = [IntPtr]::Zero
    $password = $null
    $bodyJson = $null
    $failure = $null
    $authenticated = $false
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
        $failure = [pscustomobject]@{ Code = "incomplete_auth_response"; Advice = "Auth returned no usable token/identity. Check staging Auth logs."; CanRetry = $false; HttpStatus = 0 }
      }
      elseif ($userIds -contains [string]$response.user.id) {
        $failure = [pscustomobject]@{ Code = "duplicate_actor"; Advice = "This account was already used for another fixture. Choose a different confirmed staging Auth user."; CanRetry = $true; HttpStatus = 0 }
      }
      else {
        $userIds += [string]$response.user.id
        $tokens[$actor.Variable] = [string]$response.access_token
        $authenticated = $true
        Write-Host "Authenticated $($actor.Label); identity and token kept local."
      }
    }
    catch {
      $failure = Get-StagingAuthFailure -Failure $_
    }
    finally {
      if ($passwordBstr -ne [IntPtr]::Zero) {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordBstr)
      }
      $email = $null
      $password = $null
      $bodyJson = $null
      $response = $null
      $securePassword.Dispose()
    }

    if ($authenticated) { break }
    $statusLabel = if ($failure.HttpStatus) { "HTTP $($failure.HttpStatus)" } else { "HTTP status unavailable" }
    Write-Warning "Could not authenticate $($actor.Label) [$($failure.Code); $statusLabel]. $($failure.Advice)"
    if (-not $failure.CanRetry -or $attempt -ge 3) {
      $tokens.Clear()
      throw "Stopped at $($actor.Label): $($failure.Code). No token file changes were made. Do not run the actor matrix until setup succeeds."
    }
    $retry = (Read-Host "Retry only $($actor.Label), attempt $($attempt + 1)/3? [y/N]").Trim()
    if ($retry -notmatch "^(y|yes)$") {
      $tokens.Clear()
      throw "Setup cancelled at $($actor.Label). No token file changes were made."
    }
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
  # Windows PowerShell 5.1 converts $null to an invalid empty backup path.
  # NullString passes a real .NET null while preserving atomic replacement.
  [System.IO.File]::Replace($tempPath, $envPath, [System.Management.Automation.Language.NullString]::Value)
}
finally {
  if (Test-Path -LiteralPath $tempPath -PathType Leaf) {
    Remove-Item -LiteralPath $tempPath -Force
  }
}

$tokens.Clear()
Write-Host "Saved five distinct, short-lived staging access tokens in ignored .env.local. Token values were not displayed."
Write-Host "Run: npm run test:teacher-actors"
