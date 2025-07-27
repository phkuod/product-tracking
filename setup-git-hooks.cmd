@echo off
echo Setting up Git hooks for best practices...

REM Configure Git to use custom hooks directory
git config core.hooksPath .githooks

REM Check if configuration was successful
git config core.hooksPath > nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Git hooks configured successfully
    echo ✅ Commit message validation enabled
    echo ✅ Pre-commit checks enabled
) else (
    echo ❌ Failed to configure Git hooks
    exit /b 1
)

echo.
echo Git workflow setup complete!
echo.
echo Next steps:
echo 1. Create feature branches: git checkout -b feature/your-feature
echo 2. Use conventional commits: git commit -m "feat: description"
echo 3. Create PRs to dev branch for review
echo.
pause