# Windows: creates a "NEXUS" shortcut on the Desktop. Run: right-click → Run with PowerShell
$dir = Split-Path -Parent $MyInvocation.MyCommand.Path
$s = (New-Object -ComObject WScript.Shell).CreateShortcut("$env:USERPROFILE\Desktop\NEXUS.lnk")
$s.TargetPath = "$dir\start.bat"; $s.WorkingDirectory = $dir; $s.Save()
Write-Host "Shortcut created on the Desktop"
