#!/bin/bash
# Usage: ./publish_to_repo.sh <remote-url>
set -e
if [ -z "$1" ]; then
  echo "Usage: $0 <remote-git-url>"
  exit 1
fi
REMOTE=$1

if [ ! -d .git ]; then
  git init
  git add .
  git commit -m "Initial commit - InventoryPro"
else
  git add .
  git commit -m "Update - InventoryPro" || true
fi

git remote add origin "$REMOTE" 2>/dev/null || git remote set-url origin "$REMOTE"

echo "Pushing to $REMOTE (push may fail if you don't have permission)"
git branch -M main
git push -u origin main

echo "Done. If push failed, add the remote manually and push from your machine."
