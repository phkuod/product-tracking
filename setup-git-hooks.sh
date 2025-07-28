#!/bin/bash
echo "Setting up Git hooks for best practices..."

# Configure Git to use custom hooks directory
git config core.hooksPath .githooks

# Make hooks executable (Unix/Linux/Mac)
chmod +x .githooks/*

# Check if configuration was successful
if git config core.hooksPath > /dev/null 2>&1; then
    echo "✅ Git hooks configured successfully"
    echo "✅ Commit message validation enabled"
    echo "✅ Pre-commit checks enabled"
    echo "✅ Hooks made executable"
else
    echo "❌ Failed to configure Git hooks"
    exit 1
fi

echo ""
echo "Git workflow setup complete!"
echo ""
echo "Next steps:"
echo "1. Create feature branches: git checkout -b feature/your-feature"
echo "2. Use conventional commits: git commit -m \"feat: description\""
echo "3. Create PRs to dev branch for review"
echo ""