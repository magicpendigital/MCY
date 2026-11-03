param(
  [Parameter(Mandatory=$true)]
  [ValidatePattern('^[a-f0-9]{64}$')]
  [string]$ExpectedGoSha256
)
$ErrorActionPreference = 'Stop'
$repo = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '../..')).Path
$work = $PSScriptRoot
$candidate = Join-Path $repo '.vercel/ux-step5-3-rebind-20261019-v1'
$freezePath = Join-Path $work 'CANDIDATE-FREEZE-v1.json'
$goPath = Join-Path $work 'ROOT-INVOCATION-GO.json'
$outputDir = Join-Path $work 'node13-v1'
if (Test-Path -LiteralPath $outputDir) { throw 'node13-v1 output already exists; do not overwrite or retry' }
$freezeHash = (Get-FileHash -LiteralPath $freezePath -Algorithm SHA256).Hash.ToLowerInvariant()
$goHash = (Get-FileHash -LiteralPath $goPath -Algorithm SHA256).Hash.ToLowerInvariant()
if ($freezeHash -ne '6af8eb4daf3838d8abd44edfaa0009619e54b1ad42001c4c5b4869a6b9dabc5e') { throw 'freeze hash mismatch' }
if ($goHash -ne $ExpectedGoSha256) { throw 'root invocation GO hash mismatch' }
$freeze = Get-Content -LiteralPath $freezePath -Raw | ConvertFrom-Json
$baselinePath = Join-Path $repo $freeze.baseline.path
if ((Get-FileHash -LiteralPath $baselinePath -Algorithm SHA256).Hash.ToLowerInvariant() -ne $freeze.baseline.sha256) { throw 'baseline hash mismatch' }
$baseline = Get-Content -LiteralPath $baselinePath -Raw | ConvertFrom-Json

function Get-PinMismatches($items, $base) {
  @(
    foreach ($item in $items) {
      $pinPath = Join-Path $base $item.path
      if (-not (Test-Path -LiteralPath $pinPath -PathType Leaf)) { $item.path; continue }
      $actual = (Get-FileHash -LiteralPath $pinPath -Algorithm SHA256).Hash.ToLowerInvariant()
      if ($actual -ne $item.sha256) { $item.path }
    }
  )
}
function Get-AllMismatches {
  [ordered]@{
    source = @(Get-PinMismatches $freeze.sourceFiles $repo)
    client = @(Get-PinMismatches $freeze.clientFiles $repo)
    canonical = @(Get-PinMismatches $freeze.canonicalDependencies $repo)
    rootDirty = @(Get-PinMismatches $freeze.rootDirtyPreserved $repo)
    oldEvidence = @(Get-PinMismatches $freeze.preservedOldEvidence $repo)
    oldSource = @(Get-PinMismatches $baseline.source.files (Join-Path $repo '.vercel/ux-step5-3-20261018-v1'))
    oldClient = @(Get-PinMismatches $baseline.builtClient.files $repo)
  }
}
$pre = Get-AllMismatches
$preMismatchCount = 0
foreach ($value in $pre.Values) { $preMismatchCount += $value.Count }
$started = (Get-Date).ToUniversalTime().ToString('o')
$nodePath = (Get-Command node -CommandType Application).Source
if ($nodePath -ne 'C:\Program Files\nodejs\node.exe') { throw 'unexpected Node executable' }
$childExit = $null
$childPid = $null
$timedOut = $false
$stdout = ''
$stderr = ''
$executionError = $null
$proc = $null

try {
  if ($preMismatchCount -eq 0) {
    $psi = [System.Diagnostics.ProcessStartInfo]::new()
    $psi.FileName = $nodePath
    $psi.WorkingDirectory = $candidate
    $psi.UseShellExecute = $false
    $psi.CreateNoWindow = $true
    $psi.RedirectStandardOutput = $true
    $psi.RedirectStandardError = $true
    foreach ($arg in @('--test', 'server/contentReview/canonicalAdapter.test.mjs', 'server/contentReview/reviewModel.test.mjs', 'server/contentReview/localReviewServer.test.mjs')) {
      [void]$psi.ArgumentList.Add($arg)
    }
    $psi.Environment.Clear()
    foreach ($key in @('SystemRoot', 'WINDIR', 'PATH', 'TEMP', 'TMP', 'USERPROFILE')) {
      $envValue = [System.Environment]::GetEnvironmentVariable($key)
      if ($null -ne $envValue) { $psi.Environment[$key] = $envValue }
    }
    $proc = [System.Diagnostics.Process]::new()
    $proc.StartInfo = $psi
    [void]$proc.Start()
    $childPid = $proc.Id
    $outTask = $proc.StandardOutput.ReadToEndAsync()
    $errTask = $proc.StandardError.ReadToEndAsync()
    if (-not $proc.WaitForExit(60000)) {
      $timedOut = $true
      $proc.Kill($true)
      if (-not $proc.WaitForExit(10000)) { throw 'owned Node child did not exit after kill' }
    }
    $stdout = $outTask.GetAwaiter().GetResult()
    $stderr = $errTask.GetAwaiter().GetResult()
    $childExit = $proc.ExitCode
  }
} catch {
  $executionError = $_.Exception.Message
} finally {
  if ($null -ne $proc) {
    try { if (-not $proc.HasExited) { $proc.Kill($true); [void]$proc.WaitForExit(10000) } } catch { $executionError = 'owned Node cleanup error: ' + $_.Exception.Message }
    $proc.Dispose()
  }
}
New-Item -ItemType Directory -Path $outputDir | Out-Null
$stdoutPath = Join-Path $outputDir 'stdout.tap'
$stderrPath = Join-Path $outputDir 'stderr.txt'
[System.IO.File]::WriteAllText($stdoutPath, $stdout, [System.Text.UTF8Encoding]::new($false))
[System.IO.File]::WriteAllText($stderrPath, $stderr, [System.Text.UTF8Encoding]::new($false))
$post = Get-AllMismatches
$postMismatchCount = 0
foreach ($value in $post.Values) { $postMismatchCount += $value.Count }
$summary = @($stdout -split "`r?`n" | Where-Object { $_ -match '^# (tests|pass|fail|skipped|cancelled|duration_ms) ' })
$expectedTap = $stdout -match '(?m)^# tests 13\r?$' -and $stdout -match '(?m)^# pass 13\r?$' -and $stdout -match '(?m)^# fail 0\r?$' -and $stdout -match '(?m)^# skipped 0\r?$' -and $stdout -match '(?m)^# cancelled 0\r?$'
$status = if ($childExit -eq 0 -and -not $timedOut -and $null -eq $executionError -and $expectedTap -and $preMismatchCount -eq 0 -and $postMismatchCount -eq 0) { 'PASS' } else { 'FAIL' }
$receipt = [ordered]@{
  schema = 'mcy.step5-3.snapshot-rebind-node13.v1'
  status = $status
  startedUtc = $started
  endedUtc = (Get-Date).ToUniversalTime().ToString('o')
  scriptSha256 = (Get-FileHash -LiteralPath $PSCommandPath -Algorithm SHA256).Hash.ToLowerInvariant()
  freezeSha256 = $freezeHash
  rootInvocationGoSha256 = $goHash
  executable = $nodePath
  cwd = $candidate
  command = 'node --test server/contentReview/canonicalAdapter.test.mjs server/contentReview/reviewModel.test.mjs server/contentReview/localReviewServer.test.mjs'
  environmentKeys = @('SystemRoot','WINDIR','PATH','TEMP','TMP','USERPROFILE')
  nodeOptionsExcluded = $true
  providerKeysExcluded = $true
  envFilesLoaded = $false
  timeoutMs = 60000
  childPid = $childPid
  childExitCode = $childExit
  timedOut = $timedOut
  executionError = $executionError
  tapSummary = $summary
  expected13NoSkip = [bool]$expectedTap
  preMismatches = $pre
  postMismatches = $post
  stdout = @{ path = $stdoutPath; sha256 = (Get-FileHash -LiteralPath $stdoutPath -Algorithm SHA256).Hash.ToLowerInvariant() }
  stderr = @{ path = $stderrPath; sha256 = (Get-FileHash -LiteralPath $stderrPath -Algorithm SHA256).Hash.ToLowerInvariant() }
  scope = 'Unchanged Node-only adapter/model/server fixtures; no actual Owner startup/browser/cloud/native acceptance'
}
$receiptPath = Join-Path $outputDir 'receipt.json'
$receipt | ConvertTo-Json -Depth 12 | Set-Content -LiteralPath $receiptPath -Encoding utf8
Write-Output ('status=' + $status + ' childExit=' + $childExit + ' timedOut=' + $timedOut + ' pre=' + $preMismatchCount + ' post=' + $postMismatchCount)
Write-Output ('receiptSha256=' + (Get-FileHash -LiteralPath $receiptPath -Algorithm SHA256).Hash.ToLowerInvariant())
$summary | Write-Output
if ($status -ne 'PASS') { exit 1 }
exit 0
