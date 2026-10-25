<#
  Owner helper for the Google Play upload bundle. Secrets are typed into prompts and live only in this
  PowerShell process; nothing is written to the repository or to disk by this script.

  1) Create the upload key once:   powershell -File scripts/play-release.ps1 -CreateKey
  2) Build a signed bundle:        powershell -File scripts/play-release.ps1 -Build -VersionCode 1 -VersionName 1.0.0
     (raise -VersionCode for every new Play upload)
#>
param(
  [switch]$CreateKey,
  [switch]$Build,
  [int]$VersionCode = 1,
  [string]$VersionName = "1.0.0",
  [string]$KeyDir = (Join-Path $env:USERPROFILE "mcy-signing"),
  [string]$Alias = "mcy-upload"
)
$ErrorActionPreference = "Stop"
$store = Join-Path $KeyDir "mcy-upload.p12"
$repo = Split-Path -Parent $PSScriptRoot

if ($CreateKey) {
  if (Test-Path $store) { throw "Upload key already exists at $store. Do not create a second one." }
  New-Item -ItemType Directory -Force $KeyDir | Out-Null
  Write-Host "keytool will ask for a password (choose a long one and save it in your password manager) and some identity fields."
  & keytool -genkeypair -v -storetype PKCS12 -keystore $store -alias $Alias -keyalg RSA -keysize 2048 -validity 10000
  if ($LASTEXITCODE -ne 0) { throw "keytool failed" }
  Write-Host "`nCreated $store"
  Write-Host "Back up this file AND the password now (password manager + a second copy). It is never committed."
  exit 0
}

if ($Build) {
  if (-not (Test-Path $store)) { throw "No upload key at $store. Run with -CreateKey first." }
  $secure = Read-Host "Upload key password" -AsSecureString
  $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  try {
    $plain = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
    $env:MCY_UPLOAD_STORE_FILE = $store
    $env:MCY_UPLOAD_STORE_PASSWORD = $plain
    $env:MCY_UPLOAD_KEY_ALIAS = $Alias
    $env:MCY_UPLOAD_KEY_PASSWORD = $plain
    $env:MCY_VERSION_CODE = "$VersionCode"
    $env:MCY_VERSION_NAME = $VersionName
    # Build from a clean export of the committed HEAD so unfinished working-tree changes never ship.
    $commit = (& git -C $repo rev-parse --short HEAD).Trim()
    $work = Join-Path $env:TEMP ("mcy-play-" + $commit + "-" + [guid]::NewGuid().ToString("N").Substring(0, 8))
    New-Item -ItemType Directory $work | Out-Null
    & git -C $repo archive HEAD --format=tar --output "$work.tar"
    & tar -xf "$work.tar" -C $work
    Remove-Item "$work.tar"
    & cmd /c mklink /J "$work\node_modules" "$repo\node_modules" | Out-Null
    Write-Host "Building commit $commit in $work"
    $aab = Join-Path $repo "mcy-$commit-v$VersionCode.aab"
    Push-Location $work
    try {
      & npm run android:release:bundle
      if ($LASTEXITCODE -ne 0) { throw "bundle build failed" }
      $built = Join-Path $work "android/app/build/outputs/bundle/release/app-release.aab"
      if (-not (Test-Path $built)) { throw "AAB not found at $built" }
      Copy-Item $built $aab
    } finally {
      Pop-Location
      & cmd /c rmdir "$work\node_modules"
      Remove-Item -Recurse -Force $work -ErrorAction SilentlyContinue
    }
    & jarsigner -verify -certs $aab | Select-String -Pattern "jar verified|CN=|no manifest|unsigned"
    Write-Host ("`nAAB: {0}`nSize: {1:N0} bytes`nSHA-256: {2}" -f $aab, (Get-Item $aab).Length, (Get-FileHash $aab -Algorithm SHA256).Hash)
    Write-Host "`nUpload certificate fingerprint (compare with Play Console > App signing > Upload key certificate):"
    & keytool -list -v -keystore $store -alias $Alias -storepass $plain | Select-String -Pattern "SHA1|SHA256"
  } finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
    Remove-Item Env:MCY_UPLOAD_STORE_PASSWORD, Env:MCY_UPLOAD_KEY_PASSWORD -ErrorAction SilentlyContinue
  }
  exit 0
}

Write-Host "Use -CreateKey (once) or -Build [-VersionCode N] [-VersionName x.y.z]."
