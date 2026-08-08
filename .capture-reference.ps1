param(
  [Parameter(Mandatory = $true)][double]$Second,
  [Parameter(Mandatory = $true)][string]$OutputPath
)

Add-Type -AssemblyName PresentationCore, WindowsBase

$videoPath = 'C:\Users\sonis\Videos\Screen Recordings\Screen Recording 2026-08-08 013617.mp4'
$script:frame = New-Object System.Windows.Threading.DispatcherFrame
$script:media = New-Object System.Windows.Media.MediaPlayer
$script:drawing = New-Object System.Windows.Media.VideoDrawing
$script:drawing.Player = $script:media
$script:timer = New-Object System.Windows.Threading.DispatcherTimer

$script:media.add_MediaOpened({
  $script:media.Position = [TimeSpan]::FromSeconds($Second)
  $script:media.Play()
  $script:timer.Interval = [TimeSpan]::FromMilliseconds(1300)
  $script:timer.add_Tick({
    $script:timer.Stop()
    $script:media.Pause()
    $script:drawing.Rect = New-Object System.Windows.Rect(0, 0, $script:media.NaturalVideoWidth, $script:media.NaturalVideoHeight)
    $visual = New-Object System.Windows.Media.DrawingVisual
    $context = $visual.RenderOpen()
    $context.DrawDrawing($script:drawing)
    $context.Close()
    $bitmap = New-Object System.Windows.Media.Imaging.RenderTargetBitmap($script:media.NaturalVideoWidth, $script:media.NaturalVideoHeight, 96, 96, [System.Windows.Media.PixelFormats]::Pbgra32)
    $bitmap.Render($visual)
    $encoder = New-Object System.Windows.Media.Imaging.PngBitmapEncoder
    $encoder.Frames.Add([System.Windows.Media.Imaging.BitmapFrame]::Create($bitmap))
    $stream = [System.IO.File]::Open($OutputPath, [System.IO.FileMode]::Create)
    $encoder.Save($stream)
    $stream.Close()
    $script:media.Close()
    $script:frame.Continue = $false
  })
  $script:timer.Start()
})

$script:media.Open([Uri]$videoPath)
[System.Windows.Threading.Dispatcher]::PushFrame($script:frame)
