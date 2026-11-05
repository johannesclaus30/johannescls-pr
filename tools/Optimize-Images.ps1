# Generate display copies without changing original artwork.
param(
  [string]$PlanPath = 'tools/image-plan.json',
  [string]$ResultsPath = 'assets/optimized/manifest.json'
)
Add-Type -AssemblyName System.Drawing
$plan = Get-Content -LiteralPath $PlanPath -Raw | ConvertFrom-Json
$encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
$quality = New-Object System.Drawing.Imaging.EncoderParameters 1
$quality.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), ([long]82)
$results = @()
foreach ($item in $plan) {
  $imageQuality = if ($null -ne $item.quality) { [long]$item.quality } else { [long]82 }
  $quality.Param[0].Dispose()
  $quality.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), $imageQuality
  $source = [System.Drawing.Image]::FromFile((Join-Path (Get-Location) $item.source))
  $ratio = [Math]::Min([double]1, [double]$item.size / [Math]::Max($source.Width, $source.Height))
  $width = [Math]::Max(1, [int][Math]::Round($source.Width * $ratio))
  $height = [Math]::Max(1, [int][Math]::Round($source.Height * $ratio))
  $bitmap = New-Object System.Drawing.Bitmap $width,$height
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.DrawImage($source,0,0,$width,$height)
  $output = Join-Path (Get-Location) $item.output
  [System.IO.Directory]::CreateDirectory([System.IO.Path]::GetDirectoryName($output)) | Out-Null
  if ([System.IO.Path]::GetExtension($output) -eq '.png') { $bitmap.Save($output,[System.Drawing.Imaging.ImageFormat]::Png) }
  else { $bitmap.Save($output,$encoder,$quality) }
  $results += [PSCustomObject]@{ source=$item.source; size=$item.size; output=$item.output; width=$width; height=$height; bytes=(Get-Item -LiteralPath $output).Length }
  $graphics.Dispose(); $bitmap.Dispose(); $source.Dispose()
}
$quality.Dispose()
$results | ConvertTo-Json | Set-Content -LiteralPath $ResultsPath -Encoding utf8
Write-Output "Created $($results.Count) optimized display copies."

