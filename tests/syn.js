// Porte de syntaxe : chaque <script> inline d'index.html doit se parser (JSX inclus).
// Dernière ligne « SYNTAX OK » = feu vert pour la suite de verif.sh.
const fs = require('fs');
const parser = require('@babel/parser');
const html = fs.readFileSync('index.html', 'utf8');
const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/g;
let m, n = 0, ko = 0;
while ((m = re.exec(html))) {
  if (/\bsrc=/.test(m[1])) continue;
  n++;
  const jsx = /text\/babel/.test(m[1]);
  try {
    parser.parse(m[2], { sourceType: 'script', plugins: jsx ? ['jsx'] : [], errorRecovery: false });
  } catch (e) {
    ko++;
    const ligneDebut = html.slice(0, m.index).split('\n').length;
    console.log(`SYNTAX KO dans le script n°${n} (ouvert ligne ${ligneDebut}) : ${e.message}`);
  }
}
console.log(ko ? `SYNTAX KO — ${ko} script(s) en erreur` : `SYNTAX OK — ${n} scripts inline`);
process.exit(ko ? 1 : 0);
