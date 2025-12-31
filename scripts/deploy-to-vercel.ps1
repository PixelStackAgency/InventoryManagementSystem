# Interactive helper to deploy this repo to Vercel
# Usage: pwsh -ExecutionPolicy Bypass -File scripts/deploy-to-vercel.ps1

function Check-Command($name) {
    return (Get-Command $name -ErrorAction SilentlyContinue) -ne $null
}

if (-not (Check-Command node)) {
    Write-Error "Node.js is required. Install Node from https://nodejs.org/ and re-run."
    exit 1
}

Write-Output "This script will help you: login to Vercel, link/import the GitHub repo, add env vars, and deploy production."

# Ensure generated env commands exist (generate from .env)
$genScript = Join-Path (Get-Location) "scripts/generate-vercel-env-commands.ps1"
$envCmds = Join-Path (Get-Location) "scripts/vercel-env-commands.ps1"

if (Test-Path $genScript) {
    Write-Output "Generating Vercel env add commands from .env..."
    powershell -ExecutionPolicy Bypass -File $genScript
} else {
    Write-Warning "Generator script not found: $genScript\nYou can create it with: pwsh -File scripts/generate-vercel-env-commands.ps1"
}

Write-Output "1) Login to Vercel (a browser will open).\n"
Write-Output "If you prefer not to install globally, the script uses npx so you don't need a global install."

# Login
& npx vercel login
if ($LASTEXITCODE -ne 0) {
    Write-Warning "Vercel login may have failed or been cancelled. Continue only after successful login."
}

Write-Output "2) Link or import the project. The interactive prompt will ask if you want to link an existing project or create a new one."

& npx vercel
if ($LASTEXITCODE -ne 0) {
    Write-Warning "Vercel link/import may have failed or been cancelled. You can run 'npx vercel' manually to retry."
}

# Ask to run env commands
if (Test-Path $envCmds) {
    $runEnv = Read-Host "Run generated Vercel env add commands now? (Y/N)"
    if ($runEnv.Trim().ToUpper() -eq 'Y') {
        Write-Output "Running: $envCmds"
        powershell -ExecutionPolicy Bypass -File $envCmds
    } else {
        Write-Output "Skipped adding env vars. You can run: pwsh -File $envCmds"
    }
} else {
    Write-Warning "No generated env commands found at $envCmds. Run the generator first."
}

Write-Output "3) Deploy to production: this runs 'vercel --prod'.\n"
$deployNow = Read-Host "Deploy to production now? (Y/N)"
if ($deployNow.Trim().ToUpper() -eq 'Y') {
    & npx vercel --prod
    if ($LASTEXITCODE -ne 0) { Write-Warning "Deployment may have failed. Check the output above and re-run 'npx vercel --prod'." }
} else {
    Write-Output "Skipped production deploy. You can run: npx vercel --prod"
}

Write-Output "Done. Visit your Vercel dashboard to confirm the project and domain settings."
