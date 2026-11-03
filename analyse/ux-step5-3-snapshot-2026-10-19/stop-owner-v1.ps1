param([Parameter(Mandatory=$true)][ValidatePattern('^[a-f0-9]{64}$')][string]$ExpectedStartSha256)
$ErrorActionPreference='Stop'
$repo=(Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '../..')).Path
$receiptPath=Join-Path $PSScriptRoot 'owner-preview-v1/start.json'
$stopPath=Join-Path $PSScriptRoot 'owner-preview-v1/stop.json'
if(Test-Path -LiteralPath $stopPath){throw 'stop receipt exists'}
if((Get-FileHash -LiteralPath $receiptPath -Algorithm SHA256).Hash.ToLowerInvariant() -ne $ExpectedStartSha256){throw 'start receipt hash mismatch'}
$start=Get-Content -LiteralPath $receiptPath -Raw | ConvertFrom-Json
$ownedPid=[int]$start.pid
$process=Get-Process -Id $ownedPid -ErrorAction SilentlyContinue
$stopped=$false
if($null -ne $process){
 $identity=Get-CimInstance Win32_Process -Filter ('ProcessId='+$ownedPid)
 if($identity.ExecutablePath -ne $start.executable -or $identity.CommandLine -ne $start.commandLine -or $process.StartTime.ToUniversalTime().ToString('o') -ne $start.creationUtc){throw 'PID identity differs; do not stop'}
 Stop-Process -Id $ownedPid
 $process.WaitForExit(10000) | Out-Null
 $stopped=$true
}
if($null -ne (Get-Process -Id $ownedPid -ErrorAction SilentlyContinue)){throw 'owned PID still present'}
$privateBase=(Resolve-Path -LiteralPath (Join-Path $repo '.vercel/local-review-private')).Path
$removed=$false
if(Test-Path -LiteralPath $start.privateDirectory){
 $privateDir=(Resolve-Path -LiteralPath $start.privateDirectory).Path
 $item=Get-Item -LiteralPath $privateDir -Force
 if(-not $privateDir.StartsWith($privateBase+[IO.Path]::DirectorySeparatorChar) -or (Split-Path -Leaf $privateDir) -notlike 'review-*' -or ($item.Attributes -band [IO.FileAttributes]::ReparsePoint)){throw 'private cleanup containment/reparse check failed'}
 Remove-Item -LiteralPath $privateDir -Recurse
 $removed=$true
}
$portClosed=@(Get-NetTCPConnection -LocalPort 4260 -State Listen -ErrorAction SilentlyContinue).Count -eq 0
$freeze=Get-Content -LiteralPath (Join-Path $PSScriptRoot 'CANDIDATE-FREEZE-v1.json') -Raw | ConvertFrom-Json
$baseline=Get-Content -LiteralPath (Join-Path $repo $freeze.baseline.path) -Raw | ConvertFrom-Json
$mismatches=@(foreach($pin in @($freeze.sourceFiles)+@($freeze.clientFiles)+@($freeze.canonicalDependencies)+@($freeze.rootDirtyPreserved)+@($freeze.preservedOldEvidence)){
 if((Get-FileHash -LiteralPath (Join-Path $repo $pin.path) -Algorithm SHA256).Hash.ToLowerInvariant() -ne $pin.sha256){$pin.path}
})
$oldSourceMismatches=@(foreach($pin in $baseline.source.files){if((Get-FileHash -LiteralPath (Join-Path (Join-Path $repo '.vercel/ux-step5-3-20261018-v1') $pin.path) -Algorithm SHA256).Hash.ToLowerInvariant() -ne $pin.sha256){$pin.path}})
$oldClientMismatches=@(foreach($pin in $baseline.builtClient.files){if((Get-FileHash -LiteralPath (Join-Path $repo $pin.path) -Algorithm SHA256).Hash.ToLowerInvariant() -ne $pin.sha256){$pin.path}})
$status=if($portClosed -and $mismatches.Count -eq 0 -and $oldSourceMismatches.Count -eq 0 -and $oldClientMismatches.Count -eq 0){'PASS_EXACT_OWNED_CLEANUP_AND_PRESERVATION'}else{'FAIL'}
[ordered]@{schema='mcy.step5-3.rebind-owner-stop.v1';stoppedUtc=(Get-Date).ToUniversalTime().ToString('o');status=$status;startReceiptSha256=$ExpectedStartSha256;pid=$ownedPid;exactOwnedStopped=$stopped;processAbsent=$true;privateDirectoryRemoved=$removed;privateDirectoryAbsent=(-not(Test-Path -LiteralPath $start.privateDirectory));port4260Closed=$portClosed;pinMismatches=$mismatches;oldSourceMismatches=$oldSourceMismatches;oldClientMismatches=$oldClientMismatches;capabilityValueRead=$false;globalKill=$false;scriptSha256=(Get-FileHash -LiteralPath $PSCommandPath -Algorithm SHA256).Hash.ToLowerInvariant()} | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $stopPath -Encoding utf8
Write-Output ('status='+$status+' stopReceiptSha256='+(Get-FileHash -LiteralPath $stopPath -Algorithm SHA256).Hash.ToLowerInvariant())
if($status -eq 'FAIL'){exit 1}
