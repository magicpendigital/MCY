param([Parameter(Mandatory=$true)][ValidatePattern('^[a-f0-9]{64}$')][string]$ExpectedGoSha256)
$ErrorActionPreference='Stop'
$repo=(Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '../..')).Path
$work=$PSScriptRoot
$candidate=Join-Path $repo '.vercel/ux-step5-3-rebind-20261019-v1'
$goPath=Join-Path $work 'ROOT-OWNER-READ-GO.json'
$freezePath=Join-Path $work 'CANDIDATE-FREEZE-v1.json'
$output=Join-Path $work 'owner-preview-v1'
if(Test-Path -LiteralPath $output){throw 'owner output exists'}
if((Get-FileHash -LiteralPath $goPath -Algorithm SHA256).Hash.ToLowerInvariant() -ne $ExpectedGoSha256){throw 'Owner GO mismatch'}
if((Get-FileHash -LiteralPath $freezePath -Algorithm SHA256).Hash.ToLowerInvariant() -ne '6af8eb4daf3838d8abd44edfaa0009619e54b1ad42001c4c5b4869a6b9dabc5e'){throw 'freeze mismatch'}
$nodeReceipt=Join-Path $work 'node13-v1/receipt.json'
if((Get-FileHash -LiteralPath $nodeReceipt -Algorithm SHA256).Hash.ToLowerInvariant() -ne '4b1126bbeb65a1fffd60fe48cb3d92b42ce4c3cf340acc093a1033bbd69827ec'){throw 'Node13 receipt mismatch'}
$freeze=Get-Content -LiteralPath $freezePath -Raw | ConvertFrom-Json
function Check-Pins {
 foreach($pin in @($freeze.sourceFiles)+@($freeze.clientFiles)+@($freeze.canonicalDependencies)+@($freeze.rootDirtyPreserved)+@($freeze.preservedOldEvidence)){
  if((Get-FileHash -LiteralPath (Join-Path $repo $pin.path) -Algorithm SHA256).Hash.ToLowerInvariant() -ne $pin.sha256){throw ('pin mismatch '+$pin.path)}
 }
}
Check-Pins
$nodePath='C:\Program Files\nodejs\node.exe'
if(-not(Test-Path -LiteralPath $nodePath -PathType Leaf)){throw 'Node missing'}
if((Get-FileHash -LiteralPath $nodePath -Algorithm SHA256).Hash.ToLowerInvariant() -ne '98843732431bad6c2c165908bb7dde6fe2a221ddbc491a955d548a2e6ab9ebff'){throw 'Node hash mismatch'}
if(@(Get-NetTCPConnection -LocalPort 4260 -State Listen -ErrorAction SilentlyContinue).Count -ne 0){throw '4260 occupied; do not kill unknown listener'}
New-Item -ItemType Directory -Path $output | Out-Null
$psi=[System.Diagnostics.ProcessStartInfo]::new()
$psi.FileName=$nodePath
$psi.WorkingDirectory=$candidate
$psi.UseShellExecute=$false
$psi.CreateNoWindow=$true
$psi.RedirectStandardOutput=$true
$psi.RedirectStandardError=$true
foreach($arg in @('server/contentReview/startLocalReview.mjs','--mode','owner_local_preview','--port','4260')){[void]$psi.ArgumentList.Add($arg)}
$psi.Environment.Clear()
foreach($key in @('SystemRoot','WINDIR','PATH','TEMP','TMP','USERPROFILE')){$envValue=[Environment]::GetEnvironmentVariable($key);if($null -ne $envValue){$psi.Environment[$key]=$envValue}}
$proc=[System.Diagnostics.Process]::new()
$proc.StartInfo=$psi
[void]$proc.Start()
$ownedPid=$proc.Id
$ownedCreation=$proc.StartTime.ToUniversalTime().ToString('o')
$startupTask=$proc.StandardOutput.ReadLineAsync()
if(-not $startupTask.Wait(10000)){$proc.Kill($true);throw 'owned child startup timeout'}
$line=$startupTask.GetAwaiter().GetResult()
try{
 $start=$line | ConvertFrom-Json
 if($start.pid -ne $ownedPid -or $start.origin -ne 'http://127.0.0.1:4260' -or $start.mode -ne 'owner_local_preview'){throw 'startup identity mismatch'}
 $identity=Get-CimInstance Win32_Process -Filter ('ProcessId='+$ownedPid)
 if($identity.ExecutablePath -ne $nodePath -or $identity.CommandLine -notmatch 'startLocalReview\.mjs.*--mode owner_local_preview --port 4260'){throw 'owned process metadata mismatch'}
 $capFiles=@($start.bootstrapFiles | Where-Object {$_.purpose -eq 'owner'})
 if($capFiles.Count -ne 1){throw 'unexpected capability path count'}
 $privateDir=Split-Path -Parent $capFiles[0].path
 $privateBase=(Resolve-Path -LiteralPath (Join-Path $repo '.vercel/local-review-private')).Path
 $resolvedPrivate=(Resolve-Path -LiteralPath $privateDir).Path
 if(-not $resolvedPrivate.StartsWith($privateBase+[IO.Path]::DirectorySeparatorChar) -or (Split-Path -Leaf $resolvedPrivate) -notlike 'review-*'){throw 'private dir containment mismatch'}
 $receipt=[ordered]@{schema='mcy.step5-3.rebind-owner-start.v2';status='STARTED_ROOT_READ_PENDING';startedUtc=(Get-Date).ToUniversalTime().ToString('o');pid=$ownedPid;creationUtc=$ownedCreation;executable=$nodePath;executableSha256='98843732431bad6c2c165908bb7dde6fe2a221ddbc491a955d548a2e6ab9ebff';commandLine=$identity.CommandLine;cwd=$candidate;origin=$start.origin;mode=$start.mode;bootstrapFiles=$start.bootstrapFiles;privateDirectory=$resolvedPrivate;capabilityValueRecorded=$false;rootGoSha256=$ExpectedGoSha256;freezeSha256='6af8eb4daf3838d8abd44edfaa0009619e54b1ad42001c4c5b4869a6b9dabc5e';environmentKeys=@('SystemRoot','WINDIR','PATH','TEMP','TMP','USERPROFILE');prePins='PASS source255/client59/canonical71/root35/oldEvidence6';postPins='DEFERRED_TO_STOP_TO_KEEP_SHORT_BOOTSTRAP_WINDOW';scriptSha256=(Get-FileHash -LiteralPath $PSCommandPath -Algorithm SHA256).Hash.ToLowerInvariant()}
 $receipt | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath (Join-Path $output 'start.json') -Encoding utf8
 Write-Output ('STARTED pid='+$ownedPid+' origin='+$start.origin)
 Write-Output ('startReceiptSha256='+(Get-FileHash -LiteralPath (Join-Path $output 'start.json') -Algorithm SHA256).Hash.ToLowerInvariant())
 Write-Output ('capabilityPath='+$capFiles[0].path)
}catch{if(-not $proc.HasExited){$proc.Kill($true)};throw}

