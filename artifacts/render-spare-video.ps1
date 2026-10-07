$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$videoRoot = $PSScriptRoot
$scenes = Get-Content -LiteralPath (Join-Path $videoRoot 'spare-video-scenes.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$framesDir = Join-Path $videoRoot 'spare-video-frames'
New-Item -ItemType Directory -Path $framesDir -Force | Out-Null
$format = New-Object System.Drawing.StringFormat
$format.Alignment = [System.Drawing.StringAlignment]::Center
$format.LineAlignment = [System.Drawing.StringAlignment]::Center
$format.FormatFlags = [System.Drawing.StringFormatFlags]::DirectionRightToLeft
$latinFormat = New-Object System.Drawing.StringFormat
$latinFormat.Alignment = [System.Drawing.StringAlignment]::Center
$latinFormat.LineAlignment = [System.Drawing.StringAlignment]::Center
$titleFont = New-Object System.Drawing.Font('Arial', 34, [System.Drawing.FontStyle]::Bold)
$bodyFont = New-Object System.Drawing.Font('Arial', 23)
$demoFont = New-Object System.Drawing.Font('Arial', 40, [System.Drawing.FontStyle]::Bold)
$smallFont = New-Object System.Drawing.Font('Arial', 15)
$dark = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#493853'))
$muted = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#796c80'))
$white = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#fffcf6'))
$plum = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#493853'))
$lilac = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#e6deee'))
$gold = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#f5d89e'))
for ($sceneIndex = 0; $sceneIndex -lt $scenes.Count; $sceneIndex++) {
  $scene = $scenes[$sceneIndex]
  $bitmap = New-Object System.Drawing.Bitmap(1280,720)
  $g = [System.Drawing.Graphics]::FromImage($bitmap)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
  $g.Clear([System.Drawing.ColorTranslator]::FromHtml('#f2efe9'))
  $g.DrawString('SPARE.', $smallFont, $dark, [System.Drawing.RectangleF]::new(55,24,160,40), $latinFormat)
  $g.DrawString(('{0:00} / 07' -f ($sceneIndex+1)), $smallFont, $muted, [System.Drawing.RectangleF]::new(1070,24,160,40), $latinFormat)
  $g.DrawString($scene.title, $titleFont, $dark, [System.Drawing.RectangleF]::new(75,84,1130,98), $format)
  $panelBrush = if ($sceneIndex -eq 5) { $gold } else { $plum }
  $demoBrush = if ($sceneIndex -eq 5) { $dark } else { $white }
  $g.FillRectangle($panelBrush, 140,205,1000,225)
  $g.FillEllipse($panelBrush,115,205,50,225)
  $g.FillEllipse($panelBrush,1115,205,50,225)
  $g.DrawString($scene.demo, $demoFont, $demoBrush, [System.Drawing.RectangleF]::new(150,215,980,205), $(if ($sceneIndex -in @(0,1,4,5)) { $latinFormat } else { $format }))
  $g.DrawString($scene.text, $bodyFont, $muted, [System.Drawing.RectangleF]::new(75,450,1130,150), $format)
  for ($dot=0; $dot -lt 7; $dot++) {
    $dotBrush = if ($dot -eq $sceneIndex) { $plum } else { $lilac }
    $g.FillEllipse($dotBrush, 539+$dot*30,640,14,14)
  }
  $bitmap.Save((Join-Path $framesDir ('scene-{0}.jpg' -f $sceneIndex)), [System.Drawing.Imaging.ImageFormat]::Jpeg)
  $g.Dispose(); $bitmap.Dispose()
}
$format.Dispose();$latinFormat.Dispose()
$titleFont.Dispose();$bodyFont.Dispose();$demoFont.Dispose();$smallFont.Dispose()
$dark.Dispose();$muted.Dispose();$white.Dispose();$plum.Dispose();$lilac.Dispose();$gold.Dispose()
Write-Output 'Rendered 7 Arabic tutorial scenes at 1280x720.'
