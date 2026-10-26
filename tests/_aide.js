// Aide commune aux bancs : franchir les fenêtres qui s'ouvrent en allant vers la synthèse.
// 26/10/2026 — la fenêtre « Entretien — quelques questions avant la synthèse » (apparue après le
// 23/09) bloquait tous les bancs écrits avant elle. On répond « Oui » à tout (comportement
// d'avant : toutes les préconisations possibles), puis Continuer ; le garde-fou de capacité
// (« un instant ») et la fenêtre des incohérences sont franchis de la même manière.
// Une seule action par tour, puis on laisse React se redessiner. PW_DEBUG=1 trace les actions.
async function passerFenetres(page, tours = 12) {
  const actions = [];
  for (let i = 0; i < tours; i++) {
    await page.waitForTimeout(400);
    const fait = await page.evaluate(() => {
      const vis = (el) => !!(el && el.offsetParent) || (el && getComputedStyle(el).position === 'fixed');
      const txt = (el) => (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ');
      const boutons = (n) => Array.from(n.querySelectorAll('button')).filter(b => !b.disabled);
      const boite = (motif) => {
        const cands = Array.from(document.querySelectorAll('div, h1, h2, h3, p, span, strong')).filter(e => motif.test(txt(e)) && txt(e).length < 200);
        for (const h of cands) {
          let n = h;
          while (n && n !== document.body) {
            if (Array.from(n.querySelectorAll('button')).some(b => /^(Continuer|Valider|passer quand même)$/i.test(txt(b)))) return n;
            n = n.parentElement;
          }
        }
        return null;
      };
      let b = boite(/ENTRETIEN\s*[—–-]\s*QUELQUES QUESTIONS/i);
      if (b) {
        const ouis = boutons(b).filter(x => txt(x) === 'Oui' && !/text-white|bg-/.test('') );
        // réponses pas encore données : les « Oui » non sélectionnés (aria-pressed ou classe)
        const aRepondre = boutons(b).filter(x => txt(x) === 'Oui' && x.getAttribute('aria-pressed') !== 'true' && !/\bbg-(emerald|teal|green|red|stone-900|black)\b|text-white/.test(x.className));
        if (aRepondre.length) { aRepondre[0].click(); return 'entretien:oui'; }
        const c = boutons(b).find(x => txt(x) === 'Continuer');
        if (c) { c.click(); return 'entretien:continuer'; }
        return 'entretien:bloquee(' + Array.from(b.querySelectorAll('button')).map(x => txt(x) + (x.disabled ? '(off)' : '')).join('/') + ')';
      }
      b = boite(/un instant/i);
      if (b) {
        const p35 = boutons(b).find(x => /300\s*[–-]\s*500/.test(txt(x))); if (p35 && p35.getAttribute('aria-pressed') !== 'true') { p35.click(); return 'capacite:300-500'; }
        const v = boutons(b).find(x => /^(Valider|passer quand même)$/i.test(txt(x))); if (v) { v.click(); return 'capacite:valider'; }
      }
      b = boite(/incoh[ée]rence/i);
      if (b) { const c = boutons(b).find(x => /^Continuer$/i.test(txt(x))); if (c) { c.click(); return 'incoherences:continuer'; } }
      return null;
    });
    if (!fait) break;
    actions.push(fait);
    if (/bloquee/.test(fait)) break;
  }
  if (process.env.PW_DEBUG) console.log('passerFenetres:', actions.join(' > ') || 'rien à franchir');
  return actions;
}
module.exports = { passerFenetres };
