#!/bin/bash

# Script pour pousser seulement les fichiers essentiels
echo "🚀 Pushing essential files only..."

# Créer un nouveau repository temporaire
mkdir -p /tmp/mdmc-essential
cd /tmp/mdmc-essential

# Initialiser git
git init
git remote add origin https://github.com/DenisAIagent/mdmc-global-site---smartlink-html.git

# Copier seulement les fichiers essentiels
cp "/Users/denisadam/Downloads/MDMC 2025/website/Site react fonctionnel/MDMC Music Ads Website/frontend/server-smartlinks-api.js" .
cp "/Users/denisadam/Downloads/MDMC 2025/website/Site react fonctionnel/MDMC Music Ads Website/frontend/package.json" .
cp "/Users/denisadam/Downloads/MDMC 2025/website/Site react fonctionnel/MDMC Music Ads Website/frontend/.gitignore" .
cp "/Users/denisadam/Downloads/MDMC 2025/website/Site react fonctionnel/MDMC Music Ads Website/frontend/test-template.html" .

# Créer un README
echo "# MDMC Global Site - SmartLink HTML

Site React avec système SmartLinks HTML5 et template glassmorphism moderne.

## Template SmartLinks
- Design glassmorphism avec backdrop-filter
- Background dynamique avec artwork
- Animations fluides et interactions
- Support audio preview
- Tracking analytics intégré

## Démarrage
\`\`\`bash
npm install
npm run dev
\`\`\`

## Template
Le template SmartLinks est dans \`server-smartlinks-api.js\` avec votre design exact." > README.md

# Add et commit
git add .
git commit -m "feat: Template SmartLinks avec design glassmorphism moderne

- Template exact avec design glassmorphism
- Background dynamique avec artwork flouté  
- Structure HTML identique au modèle fourni
- Support complet des plateformes musicales
- Animations et interactions fluides

🤖 Generated with Claude Code"

# Push
echo "📤 Pushing to GitHub..."
git push -u origin main

echo "✅ Essential files pushed!"
echo "Repository: https://github.com/DenisAIagent/mdmc-global-site---smartlink-html"

# Cleanup
cd /
rm -rf /tmp/mdmc-essential