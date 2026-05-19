#!/bin/bash
# ============================================================
# DEPLOY VERCEL UNIQUEMENT - version verbeuse pour debug
# ============================================================
set -eo pipefail

if [ -f ".tokens" ]; then
  set -a
  source ./.tokens
  set +a
fi

if [ -z "${VERCEL_TOKEN:-}" ]; then
  echo "[ERREUR] VERCEL_TOKEN manquant - creez .tokens ou exportez la variable"
  exit 1
fi

REPO_NAME="simulateur-figara"
VERCEL_TEAM="universel-patrimoine"

echo ""
echo "============================================="
echo "   Vercel deploy (debug mode)"
echo "============================================="
echo ""

echo "[INFO] node --version :"
node --version || echo "  node introuvable"
echo ""
echo "[INFO] npm --version :"
npm --version || echo "  npm introuvable"
echo ""
echo "[INFO] npx --version :"
npx --version || echo "  npx introuvable"
echo ""

echo "[INFO] which node :"
which node || echo "  introuvable"
echo ""

echo "============================================="
echo "   Lancement npx vercel deploy"
echo "============================================="
echo ""

mkdir -p .vercel

# Sans tee, sans pipe - on voit tout en direct
npx -y vercel@latest deploy \
  --token "$VERCEL_TOKEN" \
  --scope "$VERCEL_TEAM" \
  --name "$REPO_NAME" \
  --yes \
  --prod

echo ""
echo "============================================="
echo "   Fin"
echo "============================================="
