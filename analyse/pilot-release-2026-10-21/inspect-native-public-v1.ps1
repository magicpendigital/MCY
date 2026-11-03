# Preparatory package-only control; invoke only under reviewed native build GO.
$ErrorActionPreference = 'Stop'
if ($args.Count -ne 0) { throw 'No arguments accepted' }
$taskTree = [IO.Path]::GetFullPath('C:/Users/Admin/.codex/worktrees/pilot-web-android-20261021/MCY').TrimEnd('\')
$taskApk = Join-Path $taskTree 'android/app/build/outputs/apk/parallel/app-parallel.apk'
$taskMetadata = Join-Path $taskTree 'android/app/build/outputs/apk/parallel/output-metadata.json'
$taskExtract = Join-Path $taskTree '.vercel/pilot-artifacts/native-public-v1'
$taskNativeWeb = Join-Path $taskTree '.vercel/pilot-artifacts/native-web-v1'
$taskEvidence = 'D:/Projects/MCY/analyse/pilot-release-2026-10-21/NATIVE-PUBLIC-INVENTORY-v1.json'
if ((Test-Path -LiteralPath $taskExtract) -or (Test-Path -LiteralPath $taskEvidence)) { throw 'Existing native inspection output; no automatic retry' }
foreach ($taskPath in @($taskApk, $taskMetadata, $taskNativeWeb, $taskExtract)) {
  if (-not [IO.Path]::GetFullPath($taskPath).StartsWith($taskTree + '\', [StringComparison]::OrdinalIgnoreCase)) { throw 'Native path outside managed tree' }
}
foreach ($taskSegment in @('.vercel', '.vercel/pilot-artifacts')) {
  $taskAncestor = Join-Path $taskTree $taskSegment
  if ((Test-Path -LiteralPath $taskAncestor) -and ((Get-Item -LiteralPath $taskAncestor).Attributes -band [IO.FileAttributes]::ReparsePoint)) { throw 'Native extraction reparse ancestor' }
}
$taskMeta = Get-Content -LiteralPath $taskMetadata -Raw | ConvertFrom-Json
if ($taskMeta.applicationId -ne 'com.nilaza.motchutyoga.mcydebug' -or $taskMeta.variantName -ne 'parallel' -or @($taskMeta.elements).Count -ne 1 -or $taskMeta.elements[0].versionCode -ne 1 -or $taskMeta.elements[0].versionName -ne '1.0-mcydebug-pilot20261021') { throw 'Native output metadata mismatch' }
Add-Type -AssemblyName System.IO.Compression
$taskZip = [IO.Compression.ZipFile]::OpenRead($taskApk)
$taskFiles = [System.Collections.Generic.List[object]]::new()
$taskTotalBytes = [long]0
try {
  if (@($taskZip.Entries | Where-Object { $_.FullName -match '(?i)content/yoga-library|server/contentReview|(?:^|/)\.env(?:[^/]*)(?:$|/)|\.cap$' }).Count -gt 0) { throw 'Private content/control path in APK' }
  $taskEntries = @($taskZip.Entries | Where-Object { $_.FullName.StartsWith('assets/public/', [StringComparison]::Ordinal) -and -not $_.FullName.EndsWith('/') })
  if ($taskEntries.Count -eq 0 -or $taskEntries.Count -gt 500) { throw 'Invalid native public file count' }
  foreach ($taskEntry in $taskEntries) {
    $taskRelative = $taskEntry.FullName.Substring('assets/public/'.Length)
    if ($taskRelative -notmatch '^[A-Za-z0-9_./-]+$' -or $taskRelative.Split('/') -contains '..' -or $taskRelative.Split('/') -contains '.' -or $taskRelative.StartsWith('.') -or $taskEntry.Length -gt 12000000) { throw 'Unsafe or oversized native public entry' }
    $taskTotalBytes += $taskEntry.Length
    if ($taskTotalBytes -gt 80000000) { throw 'Native public total exceeds bound' }
    $taskTarget = [IO.Path]::GetFullPath((Join-Path $taskExtract $taskRelative))
    if (-not $taskTarget.StartsWith($taskExtract + '\', [StringComparison]::OrdinalIgnoreCase)) { throw 'Native public entry escaped extraction directory' }
    New-Item -ItemType Directory -Path (Split-Path -Parent $taskTarget) -Force | Out-Null
    $taskIn = $taskEntry.Open()
    $taskOut = [IO.File]::Open($taskTarget, [IO.FileMode]::CreateNew)
    try { $taskIn.CopyTo($taskOut) } finally { $taskOut.Dispose(); $taskIn.Dispose() }
    if ((Get-Item -LiteralPath $taskTarget).Length -ne $taskEntry.Length) { throw 'Extracted native public length mismatch' }
    $taskFiles.Add([ordered]@{ path = $taskRelative; sha256 = (Get-FileHash -LiteralPath $taskTarget -Algorithm SHA256).Hash.ToLower(); bytes = $taskEntry.Length })
  }
} finally { $taskZip.Dispose() }
$taskExpected = @(Get-ChildItem -LiteralPath $taskNativeWeb -Recurse -File | ForEach-Object {
  $taskRelative = $_.FullName.Substring($taskNativeWeb.Length + 1).Replace('\', '/')
  $taskPin = @($taskFiles | Where-Object path -eq $taskRelative)
  if ($taskPin.Count -ne 1 -or $taskPin[0].sha256 -ne (Get-FileHash -LiteralPath $_.FullName).Hash.ToLower()) { throw ('Native web/APK public byte mismatch: ' + $taskRelative) }
  $taskRelative
})
$taskExtras = @($taskFiles | Where-Object { $taskExpected -notcontains $_.path })
if (@($taskExtras | Where-Object { $_.path -notin @('cordova.js', 'cordova_plugins.js') }).Count -gt 0) { throw 'Unexpected native-only public file' }
$taskResult = [ordered]@{
  status = 'PASS_NATIVE_PUBLIC_BYTE_PARITY_ONLY'
  capturedUtc = [DateTime]::UtcNow.ToString('o')
  apkPath = $taskApk
  apkSha256 = (Get-FileHash -LiteralPath $taskApk).Hash.ToLower()
  apkBytes = (Get-Item -LiteralPath $taskApk).Length
  package = $taskMeta.applicationId
  versionCode = 1
  versionName = $taskMeta.elements[0].versionName
  extractedPublicPath = $taskExtract
  files = @($taskFiles.ToArray())
  totalPublicBytes = $taskTotalBytes
  compiledNativeWebFilesMatched = $taskExpected.Count
  nativeBridgeExtras = $taskExtras
  physicalDeviceOrRestoreOrLiveDataAcceptance = $false
}
[IO.File]::WriteAllText($taskEvidence, ($taskResult | ConvertTo-Json -Depth 10), [Text.UTF8Encoding]::new($false))
[pscustomobject]@{ status = $taskResult.status; fileCount = $taskFiles.Count; expectedMatched = $taskExpected.Count; evidence = $taskEvidence } | ConvertTo-Json -Compress
