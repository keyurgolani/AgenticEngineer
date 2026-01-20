# Git Hooks

This directory contains git hooks for local validation before commits and pushes.

## Setup

To use these hooks, run the following command from the repository root:

```bash
git config core.hooksPath .githooks
```

## Available Hooks

### pre-commit

Runs before each commit:

- ESLint (linting)
- Vitest (unit tests)

### pre-push

Runs before each push:

- ESLint (linting)
- Vitest (unit tests)
- Next.js build (ensures the app builds successfully)

## Bypassing Hooks

If you need to bypass hooks temporarily (not recommended):

```bash
# Bypass pre-commit
git commit --no-verify -m "your message"

# Bypass pre-push
git push --no-verify
```
