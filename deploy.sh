#!/bin/bash

# Manual GitHub Pages Deployment Script
echo "🚀 Starting manual GitHub Pages deployment..."

# Build the project
echo "📦 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Switch to gh-pages branch
echo "🌿 Switching to gh-pages branch..."
git checkout gh-pages

if [ $? -ne 0 ]; then
    echo "❌ Failed to checkout gh-pages branch!"
    exit 1
fi

# Copy build files
echo "📋 Copying build files..."
cp -r docs/* .
rm -rf docs/

# Add .nojekyll file
touch .nojekyll

# Commit and push
echo "📤 Committing and pushing..."
git add .
git commit -m "Manual deployment - $(date)"
git push origin gh-pages --force

# Switch back to main
echo "🔙 Switching back to main branch..."
git checkout main

echo "✅ Deployment complete!"
echo "🌐 Site should be live at: https://superdeveloper1.github.io/luxemarket/"
