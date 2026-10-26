#!/bin/bash
# Porte de syntaxe + CSS Tailwind réel + banc de test local
set -e
cd /home/claude/work
node syn.js | tail -1
npx tailwindcss -c tailwind.config.js -i tw_in.css -o local/tailwind-real.css >/dev/null 2>&1
python3 << 'PYEOF'
import io, re
s = io.open('index.html', encoding='utf-8').read()
subs = [
 (r'<script[^>]*src="https://unpkg.com/react@[^"]*"[^>]*>\s*</script>', '<script src="local/react.production.min.js"></script>'),
 (r'<script[^>]*src="https://unpkg.com/react-dom@[^"]*"[^>]*>\s*</script>', '<script src="local/react-dom.production.min.js"></script>'),
 (r'<script[^>]*src="https://unpkg.com/@babel/standalone[^"]*"[^>]*>\s*</script>', '<script src="local/babel.min.js"></script>'),
 (r'<script[^>]*src="https://cdn\.tailwindcss\.com[^"]*"[^>]*>\s*</script>', '<link rel="stylesheet" href="local/tailwind-real.css"><script src="local/tailwind-stub.js"></script>'),
 (r'<script[^>]*src="https://cdnjs\.cloudflare\.com/ajax/libs/Chart\.js[^"]*"[^>]*>\s*</script>', '<script src="local/chart-stub.js"></script>'),
 (r'<script[^>]*src="https://unpkg\.com/@supabase/supabase-js[^"]*"[^>]*>\s*</script>', '<script src="local/supabase.js"></script>'),
]
for pat, repl in subs: s = re.sub(pat, repl, s)
io.open('test_local.html', 'w', encoding='utf-8').write(s)
print('test_local.html régénéré (Tailwind réel)')
PYEOF
