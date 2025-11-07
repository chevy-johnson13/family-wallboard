#!/bin/bash

# Setup script for pushing to GitHub
# This ensures sensitive files are not committed

echo "🔒 Setting up GitHub repository..."
echo ""

# Check if .env file exists and warn
if [ -f "backend/.env" ]; then
  echo "⚠️  WARNING: backend/.env file exists"
  echo "   This file contains sensitive information and should NOT be committed."
  echo "   It should be in .gitignore (checking...)"
  
  if git check-ignore -q backend/.env 2>/dev/null || [ -f .gitignore ] && grep -q "backend/.env" .gitignore; then
    echo "   ✅ backend/.env is in .gitignore"
  else
    echo "   ❌ backend/.env is NOT in .gitignore - adding it now"
    echo "backend/.env" >> .gitignore
  fi
fi

# Initialize git if not already
if [ ! -d ".git" ]; then
  echo "📦 Initializing git repository..."
  git init
  echo "✅ Git repository initialized"
else
  echo "✅ Git repository already exists"
fi

# Check what will be committed
echo ""
echo "📋 Files that will be committed (excluding .gitignore patterns):"
echo ""
git status --short 2>/dev/null || echo "   (No files staged yet)"

echo ""
echo "🔍 Checking for potentially sensitive files..."
echo ""

# Check for any .env files
ENV_FILES=$(find . -name ".env" -type f 2>/dev/null | grep -v node_modules)
if [ -n "$ENV_FILES" ]; then
  echo "⚠️  Found .env files:"
  echo "$ENV_FILES" | while read file; do
    if git check-ignore -q "$file" 2>/dev/null; then
      echo "   ✅ $file (ignored by .gitignore)"
    else
      echo "   ❌ $file (NOT ignored - will be committed!)"
    fi
  done
else
  echo "✅ No .env files found (or all are ignored)"
fi

# Check for hardcoded tokens/URLs in source files
echo ""
echo "🔍 Checking source files for hardcoded secrets..."
SECRETS_FOUND=0

# Check for actual URLs (not placeholders)
if grep -r "https://.*calendar.*private" backend/src frontend/src 2>/dev/null | grep -v "YOUR_EMAIL\|TOKEN\|placeholder" | grep -v "ENV_SETUP.txt" > /dev/null; then
  echo "   ⚠️  Found potential calendar URLs in source files"
  SECRETS_FOUND=1
fi

if grep -r "TODOIST_API_TOKEN.*=" backend/src frontend/src 2>/dev/null | grep -v "process.env" | grep -v "your_token" > /dev/null; then
  echo "   ⚠️  Found potential hardcoded Todoist tokens"
  SECRETS_FOUND=1
fi

if [ $SECRETS_FOUND -eq 0 ]; then
  echo "   ✅ No hardcoded secrets found in source files"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Review the files above"
echo "2. If everything looks good, run:"
echo "   git add ."
echo "   git commit -m 'Initial commit: Family Wallboard'"
echo "   git remote add origin <your-github-repo-url>"
echo "   git push -u origin main"
echo ""
echo "⚠️  IMPORTANT: Make sure backend/.env is NOT committed!"
echo "   It should be in .gitignore (which it is)"

