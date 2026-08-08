Add-Type -AssemblyName PresentationCore, WindowsBase, System.Drawing

$videoPath = 'C:\Users\sonis\Downloads\c17e9cbf71810b4ac4ba1673efb70d19_720w.mp4'
$outDir = 'c:\Users\sonis\.gemini\antigravity\scratch\portfolio-3d\video_frames'
if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }

$media = New-Object System.Windows.Media.MediaPlayer
$media.Open([Uri]$videoPath)

# Wait for media to open
while (-not $media.NaturalDuration.HasTimeSpan) {
    Start-Sleep -Milliseconds 200
}

$totalSecs = [math]::Floor($media.NaturalDuration.TimeSpan.TotalSeconds)
Write-Host "Video duration: $totalSecs seconds"

# We want around 10-12 frames sampled across the video
$timestamps = @()
$step = [math]::Max(2, [math]::Floor($totalSecs / 12))
for ($i = 0; $i -le $totalSecs; $i += $step) {
    $timestamps += $i
}

foreach ($sec in $timestamps) {
    $outPath = Join-Path $outDir "frame_$($sec)s.png"
    Write-Host "Extracting frame at $sec s -> $outPath"
    
    $frame = New-Object System.Windows.Threading.DispatcherFrame
    $drawing = New-Object System.Windows.Media.VideoDrawing
    $drawing.Player = $media
    $media.Position = [TimeSpan]::FromSeconds($sec)
    $media.Play()
    
    $timer = New-Object System.Windows.Threading.DispatcherTimer
    $timer.Interval = [TimeSpan]::FromMilliseconds(800)
    $timer.add_Tick({
        $timer.Stop()
        $media.Pause()
        $drawing.Rect = New-Object System.Windows.Rect(0, 0, $media.NaturalVideoWidth, $media.NaturalVideoHeight)
        $visual = New-Object System.Windows.Media.DrawingVisual
        $context = $visual.RenderOpen()
        $context.DrawDrawing($drawing)
        $context.Close()
        $bitmap = New-Object System.Windows.Media.Imaging.RenderTargetBitmap($media.NaturalVideoWidth, $media.NaturalVideoHeight, 96, 96, [System.Windows.Media.PixelFormats]::Pbgra32)
        $bitmap.Render($visual)
        $encoder = New-Object System.Windows.Media.Imaging.PngBitmapEncoder
        $encoder.Frames.Add([System.Windows.Media.Imaging.BitmapFrame]::Create($bitmap))
        $stream = [System.IO.File]::Open($outPath, [System.IO.FileMode]::Create)
        $encoder.Save($stream)
        $stream.Close()
        $frame.Continue = $false
    })
    $timer.Start()
    [System.Windows.Threading.Dispatcher]::PushFrame($frame)
}

$media.Close()
Write-Host "Extraction complete!"
