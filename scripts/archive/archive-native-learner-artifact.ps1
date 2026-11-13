$ErrorActionPreference = 'Stop'
$workspaceRoot = [IO.Path]::GetFullPath('D:\Projects\MCY')
if ((Get-Location).Path -ne $workspaceRoot) { throw 'Run from MCY root' }
$nativeArtifactRoot = Join-Path $workspaceRoot '.vercel\mcy-native-20261013'
$sourceApk = Join-Path $workspaceRoot 'android\app\build\outputs\apk\parallel\app-parallel.apk'
$metadataPath = Join-Path $workspaceRoot 'android\app\build\outputs\apk\parallel\output-metadata.json'
$metadata = Get-Content -LiteralPath $metadataPath -Raw | ConvertFrom-Json
if ($metadata.applicationId -ne 'com.nilaza.motchutyoga.mcydebug' -or $metadata.variantName -ne 'parallel') { throw 'Wrong native variant' }
New-Item -ItemType Directory -Path $nativeArtifactRoot -Force | Out-Null
if ((Get-Item -LiteralPath $nativeArtifactRoot).Attributes -band [IO.FileAttributes]::ReparsePoint) { throw 'Artifact root must not be a link' }
$archiveApk = Join-Path $nativeArtifactRoot 'app-parallel.apk'
$sourceHash = (Get-FileHash -LiteralPath $sourceApk -Algorithm SHA256).Hash.ToLowerInvariant()
if (Test-Path -LiteralPath $archiveApk) {
  if ((Get-FileHash -LiteralPath $archiveApk -Algorithm SHA256).Hash.ToLowerInvariant() -ne $sourceHash) { throw 'Immutable archive already differs' }
} else { Copy-Item -LiteralPath $sourceApk -Destination $archiveApk }
$assetRoot = Join-Path $nativeArtifactRoot 'public'
New-Item -ItemType Directory -Path $assetRoot -Force | Out-Null
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [IO.Compression.ZipFile]::OpenRead($archiveApk)
$inventory = @()
try {
  foreach ($entry in $zip.Entries) {
    if (-not $entry.FullName.StartsWith('assets/public/') -or $entry.FullName.EndsWith('/')) { continue }
    $relative = $entry.FullName.Substring('assets/public/'.Length)
    if ($relative.Split('/') -contains '..') { throw 'Unsafe archive entry' }
    $targetPath = [IO.Path]::GetFullPath((Join-Path $assetRoot $relative))
    if (-not $targetPath.StartsWith($assetRoot + '\', [StringComparison]::OrdinalIgnoreCase)) { throw 'Archive escapes owned root' }
    New-Item -ItemType Directory -Path ([IO.Path]::GetDirectoryName($targetPath)) -Force | Out-Null
    if ((Get-Item -LiteralPath ([IO.Path]::GetDirectoryName($targetPath))).Attributes -band [IO.FileAttributes]::ReparsePoint) { throw 'Asset directory must not be a link' }
    $stream = $entry.Open()
    $buffer = [IO.MemoryStream]::new()
    try { $stream.CopyTo($buffer); $bytes = $buffer.ToArray() } finally { $stream.Dispose(); $buffer.Dispose() }
    $hash = [Convert]::ToHexString([Security.Cryptography.SHA256]::HashData($bytes)).ToLowerInvariant()
    if (Test-Path -LiteralPath $targetPath) {
      if ((Get-FileHash -LiteralPath $targetPath -Algorithm SHA256).Hash.ToLowerInvariant() -ne $hash) { throw 'Archived asset differs' }
    } else { [IO.File]::WriteAllBytes($targetPath, $bytes) }
    $inventory += [ordered]@{path=$relative;bytes=$bytes.Length;sha256=$hash}
  }
} finally { $zip.Dispose() }
if (-not (Test-Path -LiteralPath (Join-Path $assetRoot 'index.html'))) { throw 'APK lacks HTML entry' }
$receipt = [ordered]@{
  kind='ArchivedNativeLearnerArtifact';capturedAt=[DateTime]::UtcNow.ToString('o');
  applicationId=$metadata.applicationId;variant='parallel';
  apkPath='.vercel/mcy-native-20261013/app-parallel.apk';apkSha256=$sourceHash;
  apkBytes=(Get-Item -LiteralPath $archiveApk).Length;
  extractedPublicPath='.vercel/mcy-native-20261013/public';
  assets=@($inventory | Sort-Object path);
  signedProductionRelease=$false;cloudDeployment=$false;databaseWrites=$false
}
$receipt | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath (Join-Path $workspaceRoot 'analyse\MCY_NATIVE_ARTIFACT_2026-10-13.json') -Encoding utf8
[ordered]@{apkSha256=$sourceHash;apkBytes=$receipt.apkBytes;packagedAssetCount=$inventory.Count} | ConvertTo-Json -Compress
