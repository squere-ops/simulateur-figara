#!/bin/bash
# Fabrique local/ : les vendors d'index.html (React, ReactDOM, Babel) copiés depuis
# node_modules, et trois stubs qui remplacent ce qui vient du réseau (Tailwind CDN,
# Chart.js, Supabase). À lancer une fois après `npm i`, et après toute montée de version.
set -e
cd "$(dirname "$0")"
mkdir -p local
cp node_modules/react/umd/react.production.min.js local/
cp node_modules/react-dom/umd/react-dom.production.min.js local/
cp node_modules/@babel/standalone/babel.min.js local/
cat > local/tailwind-stub.js <<'JS'
// Le vrai Tailwind est compilé dans local/tailwind-real.css par regen.sh ;
// ce stub ne sert qu'à ce que `tailwind.config = {...}` ne plante pas.
window.tailwind = { config: {} };
JS
cat > local/chart-stub.js <<'JS'
// Chart.js inerte : les graphiques ne sont pas l'objet des bancs.
window.Chart = function () { return { destroy() {}, update() {}, resize() {} }; };
window.Chart.register = function () {};
window.Chart.defaults = { font: {}, plugins: {} };
JS
cat > local/supabase.js <<'JS'
// Client Supabase sans réseau : aucune session → l'application reste sur sa
// porte d'identité (IdentityGate), les bancs chargent une étude via ?etude=1.
(function () {
  const vide = async () => ({ data: null, error: null });
  const table = () => { const q = { select: () => q, insert: () => q, update: () => q, upsert: () => q, delete: () => q, eq: () => q, order: () => q, limit: () => q, single: () => q, maybeSingle: () => q, then: (r) => r({ data: [], error: null }) }; return q; };
  window.supabase = { createClient: () => ({
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
      signInWithPassword: vide, signUp: vide, signOut: vide,
    },
    from: table,
  }) };
})();
JS
echo "local/ prêt : $(ls local | tr '\n' ' ')"
