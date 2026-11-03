param(
  [Parameter(Mandatory = $true)][string]$InputVideo,
  [Parameter(Mandatory = $true)][string]$OutputFrame,
  [double]$AtSeconds = 10
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Runtime.WindowsRuntime
[Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime] | Out-Null
[Windows.Media.Editing.MediaClip, Windows.Media.Editing, ContentType = WindowsRuntime] | Out-Null
[Windows.Media.Editing.MediaComposition, Windows.Media.Editing, ContentType = WindowsRuntime] | Out-Null
[Windows.Media.Editing.VideoFramePrecision, Windows.Media.Editing, ContentType = WindowsRuntime] | Out-Null
[Windows.Graphics.Imaging.ImageStream, Windows.Graphics.Imaging, ContentType = WindowsRuntime] | Out-Null
$script:AsTask = [System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
  $_.Name -eq 'AsTask' -and $_.IsGenericMethod -and $_.GetGenericArguments().Count -eq 1 -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1'
} | Select-Object -First 1
function Wait-WinRt([object]$Operation, [type]$ResultType) {
  $task = $script:AsTask.MakeGenericMethod($ResultType).Invoke($null, @($Operation))
  $task.GetAwaiter().GetResult()
}
$resolvedVideo = (Resolve-Path -LiteralPath $InputVideo).ProviderPath
$file = Wait-WinRt ([Windows.Storage.StorageFile]::GetFileFromPathAsync($resolvedVideo)) ([Windows.Storage.StorageFile])
$clip = Wait-WinRt ([Windows.Media.Editing.MediaClip]::CreateFromFileAsync($file)) ([Windows.Media.Editing.MediaClip])
$composition = New-Object Windows.Media.Editing.MediaComposition
$clips = [System.Collections.Generic.IList[Windows.Media.Editing.MediaClip]]$composition.Clips
$clips.Add($clip)
$time = [Math]::Min([Math]::Max(0, $AtSeconds), [Math]::Max(0, $clip.OriginalDuration.TotalSeconds - 0.1))
$thumb = Wait-WinRt ($composition.GetThumbnailAsync([TimeSpan]::FromSeconds($time), 360, 0, [Windows.Media.Editing.VideoFramePrecision]::NearestFrame)) ([Windows.Graphics.Imaging.ImageStream])
$stream = [System.IO.WindowsRuntimeStreamExtensions]::AsStreamForRead($thumb)
$outStream = [System.IO.File]::Open($OutputFrame, [System.IO.FileMode]::Create)
try { $stream.CopyTo($outStream) } finally { $outStream.Dispose(); $stream.Dispose() }
@{ input = $resolvedVideo; durationSeconds = $clip.OriginalDuration.TotalSeconds; atSeconds = $time; output = $OutputFrame } | ConvertTo-Json -Compress
