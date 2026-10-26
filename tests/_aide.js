// Aide commune aux bancs : franchir les fenêtres qui s'ouvrent en allant vers la synthèse.
// 26/10/2026 — la fenêtre « Entretien — quelques questions avant la synthèse » (apparue après le
// 23/09) bloquait tous les bancs écrits avant elle. On répond « Oui » à tout (comportement
// d'avant : toutes les préconisations possibles), puis Continuer ; le garde-fou de capacité
// (« un instant ») et la fenêtre des incohérences sont franchis de la même manière.
async function passerFenetres(page, tours = 8) {
  for (let i = 0; i < tours; i++) {
    await page.waitForTimeout(350);
    const fait = await page.evaluate(() => {
      const vis = (el) => !!(el && el.offsetParent);
      const txt = (el) => (el.innerText || '').trim().replace(/\s+/g, ' ');
      const boite = (motif) => {
        const h = Array.from(document.querySelectorAll('div, h1, h2, h3, p, span')).find(e => vis(e) && motif.test(txt(e)) && txt(e).length < 160);
        if (!h) return null;
        let n = h;
        while (n && n !== document.body) { if (n.querySelector('button') && Array.from(n.querySelectorAll('button')).some(b => /^(Continuer|Valider|passer quand même)$/i.test(txt(b)))) return n; n = n.parentElement; }
        return null;
      };
      let b = boite(/ENTRETIEN — QUELQUES QUESTIONS AVANT LA SYNTHÈSE/i);
      if (b) {
        Array.from(b.querySelectorAll('button')).filter(x => txt(x) === 'Oui').forEach(x => x.click());
        const c = Array.from(b.querySelectorAll('button')).find(x => txt(x) === 'Continuer'); if (c) { c.click(); return 'entretien'; }
      }
      b = boite(/un instant/i);
      if (b) {
        const p35 = Array.from(b.querySelectorAll('button')).find(x => /300 – 500|300-500/.test(txt(x))); if (p35) p35.click();
        const v = Array.from(b.querySelectorAll('button')).find(x => /^(Valider|passer quand même)$/i.test(txt(x))); if (v) { v.click(); return 'capacite'; }
      }
      b = boite(/incoh[ée]rence/i);
      if (b) { const c = Array.from(b.querySelectorAll('button')).find(x => /^Continuer$/i.test(txt(x))); if (c) { c.click(); return 'incoherences'; } }
      return null;
    });
    if (!fait) return i;
  }
  return tours;
}
module.exports = { passerFenetres };
