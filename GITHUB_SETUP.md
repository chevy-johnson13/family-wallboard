# GitHub Setup Guide

## 🔒 Security Checklist

Before pushing to GitHub, ensure:

- ✅ **`.env` files are in `.gitignore`** - Contains API keys and calendar URLs
- ✅ **No hardcoded secrets in source code** - All secrets come from environment variables
- ✅ **`ENV_SETUP.txt` is safe** - Only contains placeholder values
- ✅ **Build artifacts excluded** - `dist/`, `node_modules/` are ignored

## 📦 Files to Exclude (Already in .gitignore)

- `backend/.env` - Your actual API keys and calendar URLs
- `frontend/.env` - Frontend environment variables
- `node_modules/` - Dependencies (install with `npm install`)
- `dist/` - Build output (build with `npm run build`)
- `*.tar.gz` - Deployment archives
- `backend/data/meals.json` - User data

## 🗑️ Optional Files You Can Remove

These are debug/test files you might not need in the repo:

- `DEBUG_KIOSK.sh` - Debug script (optional)
- `TEST_DOORBELL.sh` - Test script (optional)
- `TEST_NOW.md` - Test notes (optional)
- `FIXES_APPLIED.md` - Development notes (optional)
- `FIXES_COMPLETE.md` - Development notes (optional)
- `STATUS_UPDATE.md` - Development notes (optional)
- `READINESS_ASSESSMENT.md` - Development notes (optional)
- `wallboard-deploy.tar.gz` - Deployment archive (already ignored)

## 🚀 Steps to Push to GitHub

### 1. Run the setup script

```bash
./SETUP_GITHUB.sh
```

This will:
- Check that `.env` files are ignored
- Verify no hardcoded secrets
- Show what will be committed

### 2. Initialize Git (if not already done)

```bash
git init
```

### 3. Add all files (respects .gitignore)

```bash
git add .
```

### 4. Verify what will be committed

```bash
git status
```

**IMPORTANT:** Make sure you don't see:
- ❌ `backend/.env`
- ❌ Any files with actual API tokens or calendar URLs

### 5. Create initial commit

```bash
git commit -m "Initial commit: Family Wallboard with state sync"
```

### 6. Create GitHub repository

1. Go to https://github.com/new
2. Create a new repository (e.g., `family-wallboard`)
3. **DO NOT** initialize with README, .gitignore, or license (we already have these)

### 7. Add remote and push

```bash
git remote add origin https://github.com/YOUR_USERNAME/family-wallboard.git
git branch -M main
git push -u origin main
```

## ✅ Verification

After pushing, verify on GitHub:
- ✅ No `.env` files are visible
- ✅ No hardcoded API tokens in source files
- ✅ `ENV_SETUP.txt` only has placeholder values

## 📝 What's Safe to Commit

✅ **Safe files:**
- All source code (`src/`, `backend/src/`)
- Configuration files (`package.json`, `tsconfig.json`, etc.)
- Documentation (`.md` files)
- Setup scripts (`pi-setup/`, `DEPLOY_TO_PI.sh`)
- `ENV_SETUP.txt` (template with placeholders)

❌ **Never commit:**
- `.env` files (contains real API keys)
- `node_modules/` (too large, install with npm)
- `dist/` (build output)
- User data files

## 🔐 If You Accidentally Committed Secrets

If you accidentally committed a `.env` file:

1. **Remove it from git history:**
   ```bash
   git rm --cached backend/.env
   git commit -m "Remove .env file"
   ```

2. **If already pushed, you need to:**
   - Rotate all API keys/tokens immediately
   - Remove the file from git history (requires force push)
   - Consider making the repo private

## 📚 Repository Structure

```
family-wallboard/
├── backend/          # Node.js backend
│   ├── src/         # Source code (safe)
│   ├── .env         # ⚠️ NOT committed (in .gitignore)
│   └── ENV_SETUP.txt # ✅ Safe (template only)
├── frontend/         # React frontend
│   ├── src/         # Source code (safe)
│   └── dist/        # ⚠️ NOT committed (build output)
├── pi-setup/        # Raspberry Pi setup scripts
├── *.md             # Documentation
└── .gitignore       # Excludes sensitive files
```

