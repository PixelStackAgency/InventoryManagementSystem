param(
  [Parameter(Mandatory=$true)]
  [string]$RemoteUrl
)
if (-not (Test-Path .git)) {
  git init
  git add .
  git commit -m "Initial commit - InventoryPro"
} else {
  git add .
  git commit -m "Update - InventoryPro" -ErrorAction SilentlyContinue
}

git remote add origin $RemoteUrl -ErrorAction SilentlyContinue
git branch -M main
git push -u origin main
Write-Output "Done. If push failed, add the remote manually and push from your machine."
