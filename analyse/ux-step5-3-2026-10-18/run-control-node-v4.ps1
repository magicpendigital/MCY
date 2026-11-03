$ErrorActionPreference = 'Stop'
$repo = (Get-Location).Path
$work = Join-Path $repo 'analyse/ux-step5-3-2026-10-18'
$candidate = Join-Path $repo '.vercel/ux-step5-3-20261018-v1'
$freezePath = Join-Path $work 'CONTROL-SOURCE-FREEZE-v4.json'
$goPath = Join-Path $work 'ROOT-V4-NODE-GO.json'
$outputDir = Join-Path $work 'control-node-v4'

if (Test-Path -LiteralPath $outputDir) { throw 'control-node-v4 output already exists' }
$freezeHash = (Get-FileHash -LiteralPath $freezePath -Algorithm SHA256).Hash.ToLowerInvariant()
$goHash = (Get-FileHash -LiteralPath $goPath -Algorithm SHA256).Hash.ToLowerInvariant()
if ($freezeHash -ne '8fa517d08d99f938b76f93b11f07fe00ee8dd302155205a2fa13d6e2e0ca7c97') { throw 'freeze hash mismatch' }
if ($goHash -ne '5c3e84cd2ffd98ba6286fa3d574ac8548b25f6063e02401b02594964f1291966') { throw 'root GO hash mismatch' }
$freeze = Get-Content -LiteralPath $freezePath -Raw | ConvertFrom-Json

# Enumerate only mismatching paths. Unlike the failed v3 wrapper, an empty result is
# an empty array, not one nested empty-array object.
function Get-PinMismatches($items, $base) {
  @(
    foreach ($item in $items) {
      $path = Join-Path $base $item.path
      if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { $item.path; continue }
      $sha = (Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash.ToLowerInvariant()
      if ($sha -ne $item.sha256) { $item.path }
    }
  )
}

$preSource = @(Get-PinMismatches $freeze.files $candidate)
$preCanonical = @(Get-PinMismatches $freeze.canonicalDependencies $repo)
$started = (Get-Date).ToUniversalTime().ToString('o')
$childExit = $null
$timedOut = $false
$stdout = ''
$stderr = ''

if ($preSource.Count -eq 0 -and $preCanonical.Count -eq 0) {
  $psi = [System.Diagnostics.ProcessStartInfo]::new()
  $psi.FileName = (Get-Command node).Source
  $psi.WorkingDirectory = $candidate
  $psi.UseShellExecute = $false
  $psi.RedirectStandardOutput = $true
  $psi.RedirectStandardError = $true
  foreach ($arg in @('--test', 'server/contentReview/canonicalAdapter.test.mjs', 'server/contentReview/reviewModel.test.mjs', 'server/contentReview/localReviewServer.test.mjs')) {
    [void]$psi.ArgumentList.Add($arg)
  }
  $psi.Environment.Clear()
  foreach ($key in @('SystemRoot', 'WINDIR', 'PATH', 'TEMP', 'TMP', 'USERPROFILE')) {
    $value = [System.Environment]::GetEnvironmentVariable($key)
    if ($null -ne $value) { $psi.Environment[$key] = $value }
  }
  $proc = [System.Diagnostics.Process]::new()
  $proc.StartInfo = $psi
  [void]$proc.Start()
  $outTask = $proc.StandardOutput.ReadToEndAsync()
  $errTask = $proc.StandardError.ReadToEndAsync()
  if (-not $proc.WaitForExit(600000)) {
    $timedOut = $true
    $proc.Kill($true)
    [void]$proc.WaitForExit(30000)
  }
  $stdout = $outTask.GetAwaiter().GetResult()
  $stderr = $errTask.GetAwaiter().GetResult()
  $childExit = $proc.ExitCode
  $proc.Dispose()
}

New-Item -ItemType Directory -Path $outputDir | Out-Null
$stdoutPath = Join-Path $outputDir 'stdout.tap'
$stderrPath = Join-Path $outputDir 'stderr.txt'
[System.IO.File]::WriteAllText($stdoutPath, $stdout, [System.Text.UTF8Encoding]::new($false))
[System.IO.File]::WriteAllText($stderrPath, $stderr, [System.Text.UTF8Encoding]::new($false))
$postSource = @(Get-PinMismatches $freeze.files $candidate)
$postCanonical = @(Get-PinMismatches $freeze.canonicalDependencies $repo)
$ended = (Get-Date).ToUniversalTime().ToString('o')
$receipt = [ordered]@{
  schema = 'mcy.step5-3.control-node-test.v4'
  startedUtc = $started
  endedUtc = $ended
  freezeSha256 = $freezeHash
  rootGoSha256 = $goHash
  command = 'node --test server/contentReview/canonicalAdapter.test.mjs server/contentReview/reviewModel.test.mjs server/contentReview/localReviewServer.test.mjs'
  environmentKeys = @('SystemRoot', 'WINDIR', 'PATH', 'TEMP', 'TMP', 'USERPROFILE')
  providerKeysExcluded = $true
  nodeOptionsExcluded = $true
  envFilesLoaded = $false
  timeoutMs = 600000
  timedOut = $timedOut
  childExitCode = $childExit
  stdoutPath = $stdoutPath
  stderrPath = $stderrPath
  stdoutSha256 = (Get-FileHash -LiteralPath $stdoutPath -Algorithm SHA256).Hash.ToLowerInvariant()
  stderrSha256 = (Get-FileHash -LiteralPath $stderrPath -Algorithm SHA256).Hash.ToLowerInvariant()
  preSourceMismatches = $preSource.Count
  preCanonicalMismatches = $preCanonical.Count
  postSourceMismatches = $postSource.Count
  postCanonicalMismatches = $postCanonical.Count
}
$receiptPath = Join-Path $outputDir 'receipt.json'
$receipt | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $receiptPath -Encoding utf8
$summary = @($stdout -split "`r?`n" | Where-Object { $_ -match '^# (tests|pass|fail|skipped|duration_ms) ' })
Write-Output ('receiptSha256=' + (Get-FileHash -LiteralPath $receiptPath -Algorithm SHA256).Hash.ToLowerInvariant())
Write-Output ('childExitCode=' + $childExit + ' timedOut=' + $timedOut + ' preSource=' + $preSource.Count + ' preCanonical=' + $preCanonical.Count + ' postSource=' + $postSource.Count + ' postCanonical=' + $postCanonical.Count)
$summary | Write-Output
if ($childExit -ne 0 -or $timedOut -or $preSource.Count -ne 0 -or $preCanonical.Count -ne 0 -or $postSource.Count -ne 0 -or $postCanonical.Count -ne 0) { exit 1 }
exit 0
