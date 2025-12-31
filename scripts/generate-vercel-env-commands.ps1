# Generates scripts/vercel-env-commands.ps1 from .env
# Usage: pwsh -ExecutionPolicy Bypass -File scripts/generate-vercel-env-commands.ps1

$envPath = Join-Path -Path (Get-Location) -ChildPath ".env"
$outPath = Join-Path -Path (Get-Location) -ChildPath "scripts/vercel-env-commands.ps1"

if (-not (Test-Path $envPath)) {
    Write-Error ".env file not found at $envPath"
    exit 1
}

$lines = Get-Content $envPath -ErrorAction Stop
$header = "# Generated vercel env add commands\n# REVIEW this file before running. It will call `vercel env add` for each variable.\n# Run with: pwsh -ExecutionPolicy Bypass -File scripts/vercel-env-commands.ps1\n\n"
Set-Content -Path $outPath -Value $header -Encoding UTF8

foreach ($line in $lines) {
    $trim = $line.Trim()
    if ([string]::IsNullOrWhiteSpace($trim)) { continue }
    if ($trim.StartsWith("#")) { continue }
    if ($trim -notmatch "=") { continue }
    $parts = $trim -split "=", 2
    $key = $parts[0].Trim()
    $val = $parts[1]
    # Remove surrounding quotes if present
    if ($val.StartsWith('"') -and $val.EndsWith('"')) { $val = $val.Substring(1, $val.Length - 2) }
    if ($val.StartsWith("'") -and $val.EndsWith("'")) { $val = $val.Substring(1, $val.Length - 2) }
    # Escape single quotes for PowerShell single-quoted literal by doubling them
    $safeVal = $val -replace "'", "''"
    $cmd = "vercel env add '$key' '$safeVal' production"
    Add-Content -Path $outPath -Value $cmd -Encoding UTF8
}

Write-Output "Generated $outPath — inspect it, then run it to add env vars to Vercel."