#!/bin/bash
# cleanup-unilodge.sh
# Safe cleanup script for unilodge-new codebase
# USAGE: bash cleanup-unilodge.sh [--auto-delete]

set -e

UNILODGE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AUTO_DELETE=false

if [[ "$1" == "--auto-delete" ]]; then
  AUTO_DELETE=true
fi

echo "╔════════════════════════════════════════════════════════╗"
echo "║  UniLodge Codebase Cleanup                             ║"
echo "║  Mode: $([ "$AUTO_DELETE" = true ] && echo "AUTO-DELETE" || echo "INTERACTIVE")                              ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Arrays of files to delete
DANGEROUS_FILES=(
  "$UNILODGE_DIR/rewrite.py"
)

CLEANUP_FILES=(
  "$UNILODGE_DIR/mock-api.js"
  "$UNILODGE_DIR/test-api.sh"
  "$UNILODGE_DIR/verify-setup.sh"
  "$UNILODGE_DIR/src"
  "$UNILODGE_DIR/apps/frontend/lib/services/geminiService.ts"
  "$UNILODGE_DIR/apps/frontend/public/config.ts"
  "$UNILODGE_DIR/apps/frontend/types.ts"
)

# Display dangerous files
echo "🔴 DANGEROUS FILES (Manual Review Required):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
for file in "${DANGEROUS_FILES[@]}"; do
  if [ -e "$file" ]; then
    echo ""
    echo "  ❌ $(basename "$file")"
    echo "     Path: $file"
    echo "     Reason: Git history manipulation (non-production)"
    echo "     Action: DELETE MANUALLY after verification"
    echo ""
  fi
done

# Display files to clean
echo ""
echo "🟡 FILES TO CLEAN UP:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
TOTAL_SIZE=0
FILE_COUNT=0

for file in "${CLEANUP_FILES[@]}"; do
  if [ -e "$file" ]; then
    if [ -d "$file" ]; then
      size=$(du -sh "$file" 2>/dev/null | cut -f1)
      echo "  📁 $(basename "$file")/ ($size) - Folder"
    else
      lines=$(wc -l < "$file" 2>/dev/null || echo "0")
      size=$(stat -f%z "$file" 2>/dev/null | awk '{printf "%.1f KB", $1/1024}' || echo "?")
      echo "  📄 $(basename "$file") ($lines lines, $size) - File"
    fi
    FILE_COUNT=$((FILE_COUNT + 1))
  fi
done

echo ""
echo "Total files to delete: $FILE_COUNT"

# Show npm packages to remove
echo ""
echo "📦 UNUSED NPM PACKAGES TO REMOVE:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Backend (apps/backend/package.json):"
echo "  npm uninstall mongodb  # ← Use PostgreSQL instead"
echo ""
echo "Frontend (apps/frontend/package.json):"
echo "  npm uninstall @google/genai @google/generative-ai mongodb"
echo ""

# Confirmation
if [ "$AUTO_DELETE" = false ]; then
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  read -p "Proceed with cleanup? (yes/no): " confirm

  if [[ "$confirm" != "yes" ]]; then
    echo "❌ Cleanup cancelled."
    exit 0
  fi
fi

# Delete files
echo ""
echo "🗑️  DELETING FILES:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

for file in "${CLEANUP_FILES[@]}"; do
  if [ -e "$file" ]; then
    rm -rf "$file"
    echo "  ✅ Deleted: $(basename "$file")"
  fi
done

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "📋 MANUAL STEPS REMAINING:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Review and delete manually:"
echo "   rm $UNILODGE_DIR/rewrite.py"
echo ""
echo "2. Remove unused packages from backend:"
echo "   cd $UNILODGE_DIR/apps/backend"
echo "   npm uninstall mongodb"
echo ""
echo "3. Remove unused packages from frontend:"
echo "   cd $UNILODGE_DIR/apps/frontend"
echo "   npm uninstall @google/genai @google/generative-ai mongodb"
echo ""
echo "4. Reinstall dependencies:"
echo "   cd $UNILODGE_DIR"
echo "   npm install"
echo ""
echo "5. Verify no errors:"
echo "   npm run lint"
echo "   npm run test"
echo ""
echo "✨ Done!"
