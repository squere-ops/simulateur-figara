/* ═══════════════════════════════════════════════════════════════════════════
   LE CONSEILLER CORRIGE LE DOCUMENT (21/09/2026)

   Le CGP : « permets-moi aussi de pouvoir modifier toute cette partie :
   objectifs recommandés par le cabinet, préconisations, questions du prochain
   rendez-vous — que tu peux renommer "Les questions" ». Et : « rajoute 9 % en
   financier sur 18 % au total ».

   Ce banc charge le client type « Célibataire » et vérifie :
   1. le bloc s'appelle « Les questions » (plus « … du prochain rendez-vous ») ;
   2. ✎ sur une question : le texte saisi remplace le texte généré ;
   3. ✕ sur une autre : elle disparaît, et « tout réafficher » apparaît ;
   4. « + Ajouter une question » : la question ajoutée s'affiche ;
   5. ✎ sur une ligne des « Objectifs recommandés par le cabinet » ;
   6. le document IMPRIMÉ reprend les corrections et ne porte aucun bouton ;
   7. la phrase des 18 % précise « dont 9 % en épargne financière ».
   ═══════════════════════════════════════════════════════════════════════════ */
const { chromium } = require('playwright');
const setN = async (el, v) => el.evaluate((n, val) => { const s = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; s.call(n, val); n.dispatchEvent(new Event('input', { bubbles: true })); }, v);
let ko = 0;
const OK = (m) => console.log('OK   — ' + m);
const KO = (m) => { console.log('FAIL — ' + m); ko++; };

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined });
  const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
  await page.addInitScript(() => { window.__NC_FORCE_DEMO = true; });
  const errs = [];
  page.on('pageerror', e => { if (!/tailwind is not defined/.test(String(e))) errs.push(String(e)); });
  page.on('dialog', dl => dl.accept());
  await page.goto('http://localhost:8899/test_local.html?etude=1', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1300);
  if (await page.locator('text=Accéder au simulateur').count()) {
    const inps = page.locator('input'); await setN(inps.nth(0), 'UP'); await setN(inps.nth(1), 'T');
    await page.locator('button:has-text("Accéder au simulateur")').first().click(); await page.waitForTimeout(900);
  }
  await page.locator('button:has-text("Nouveau client")').first().click(); await page.waitForTimeout(700);
  const b = page.locator('button, [role=button]').filter({ hasText: /complète|complet/i }).first();
  if (await b.count()) { try { await b.click({ timeout: 2000 }); } catch (e) {} }
  await page.waitForTimeout(700);
  await page.locator('[data-nc-client-type="celib"]').click(); await page.waitForTimeout(900);
  await page.locator('button:has-text("Synthèse")').first().click(); await page.waitForTimeout(1800);

  /* 21/09/2026 : la fenêtre des incohérences peut s'ouvrir en quittant les objectifs —
     le banc la franchit par « Continuer quand même » (elle a son propre banc). */
  { const bInc = page.locator('[data-nc-inco="1"] button:has-text("Continuer quand même")'); if (await bInc.count()) { await bInc.first().click(); await page.waitForTimeout(1600); } }

  const zoneTxt = () => page.evaluate(() => (document.querySelector('.nc-syn-zone') || { innerText: '' }).innerText);
  /* le bloc des questions : le conteneur dont le titre est « Les questions » */
  const blocQ = () => page.evaluate(() => {
    const t = Array.from(document.querySelectorAll('.nc-syn-zone div')).find(e => e.children.length === 0 && e.textContent.trim() === 'Les questions');
    return t ? t.parentElement : null;
  });

  /* 1 · titre */
  let T = await zoneTxt();
  if (/questions du prochain rendez-vous/i.test(T)) KO('l\'ancien titre « Les questions du prochain rendez-vous » est encore là');
  else if (!/(^|\n)les questions[ \t]*\n/i.test(T)) KO('le bloc « Les questions » est introuvable');
  else OK('le bloc s\'intitule « Les questions »');

  /* 7 · 18 % dont 9 % */
  const T2 = T + '\n' + await (async () => {
    const s2 = page.locator('button:has-text("Simulation")').first();
    if (!(await s2.count())) return '';
    await s2.click(); await page.waitForTimeout(1200);
    const t = await zoneTxt();
    await page.locator('button:has-text("Audit et synthèse")').first().click(); await page.waitForTimeout(1000);
    return t;
  })();
  if (/18 % en moyenne pour les Français, dont 9 % en épargne financière/.test(T2.replace(/[  ]/g, ' '))) OK('« 18 % en moyenne pour les Français, dont 9 % en épargne financière »');
  else if (/contre 18 %/.test(T2)) KO('la phrase des 18 % ne précise pas « dont 9 % en épargne financière »');
  else OK('phrase des 18 % absente de ce dossier (rien à contrôler)');

  const questions = () => page.evaluate(() => {
    const t = Array.from(document.querySelectorAll('.nc-syn-zone div')).find(e => e.children.length === 0 && e.textContent.trim() === 'Les questions');
    if (!t) return [];
    return Array.from(t.parentElement.children).slice(1).filter(x => x.querySelector('.tabular-nums')).map(x => {
      const s = x.querySelector('.flex-1');
      const c = s.cloneNode(true); c.querySelectorAll('[data-nc-doc-ctl]').forEach(n => n.remove());
      return c.textContent.trim();
    });
  });
  const q0 = await questions();
  console.log('QUESTIONS AVANT :', q0.length);
  if (q0.length < 2) { KO('moins de deux questions : le banc ne peut rien corriger'); }

  const cliquerDansQuestion = (i, sym) => page.evaluate(([i, sym]) => {
    const t = Array.from(document.querySelectorAll('.nc-syn-zone div')).find(e => e.children.length === 0 && e.textContent.trim() === 'Les questions');
    const lignes = Array.from(t.parentElement.children).slice(1).filter(x => x.querySelector('.tabular-nums'));
    const btn = Array.from(lignes[i].querySelectorAll('button')).find(x => x.textContent.trim() === sym);
    if (btn) btn.click();
    return !!btn;
  }, [i, sym]);
  const saisirFenetre = async (texte) => {
    const ta = page.locator('textarea').last();
    await ta.fill(texte);
    await page.locator('div.fixed.inset-0').last().locator('button', { hasText: /^Enregistrer$/ }).first().click();
    await page.waitForTimeout(700);
  };

  /* 2 · ✎ question 1 */
  const NQ = 'Question corrigée par le conseiller : quel est votre horizon ?';
  if (await cliquerDansQuestion(0, '✎')) { await page.waitForTimeout(400); await saisirFenetre(NQ); }
  let q1 = await questions();
  if (q1[0] !== NQ) KO('✎ : la question 1 n\'a pas pris le texte saisi — lu « ' + (q1[0] || '').slice(0, 80) + ' »');
  else OK('✎ : la question 1 affiche le texte du conseiller');
  T = await zoneTxt();
  if (!/texte personnalisé/i.test(T)) KO('le repère « texte personnalisé » n\'apparaît pas');
  else OK('repère « texte personnalisé » affiché');

  /* 3 · ✕ question 2 */
  const q2txt = q1[1];
  await cliquerDansQuestion(1, '✕'); await page.waitForTimeout(600);
  const q2 = await questions();
  if (q2.includes(q2txt) || q2.length !== q1.length - 1) KO('✕ : la question 2 est toujours là');
  else OK('✕ : la question 2 est masquée (' + q2.length + ' questions)');
  T = await zoneTxt();
  if (!/tout réafficher/i.test(T)) KO('le lien « tout réafficher » manque après un masquage');
  else OK('lien « tout réafficher » présent');

  /* 4 · + Ajouter une question */
  const AJ = 'Avez-vous pensé à la protection de votre famille ?';
  await page.locator('button:has-text("+ Ajouter une question")').first().click(); await page.waitForTimeout(400);
  await saisirFenetre(AJ);
  const q3 = await questions();
  if (q3[q3.length - 1] !== AJ) KO('+ Ajouter : la question ajoutée n\'apparaît pas en dernier — lu « ' + (q3[q3.length - 1] || '').slice(0, 80) + ' »');
  else OK('+ Ajouter : la question ajoutée est la dernière');

  /* 5 · ✎ objectifs recommandés — carte présente au constat (v242) */
  const NO = 'Objectif corrigé : constituer une épargne de précaution de 15 000 €';
  const okObj = await page.evaluate(() => {
    const t = Array.from(document.querySelectorAll('.nc-syn-zone div')).find(e => e.children.length === 0 && /Objectifs recommandés par le cabinet/i.test(e.textContent.trim()));
    if (!t) return false;
    const btn = Array.from(t.parentElement.querySelectorAll('button')).find(x => x.textContent.trim() === '✎');
    if (btn) btn.click();
    return !!btn;
  });
  if (!okObj) KO('carte « Objectifs recommandés par le cabinet » : aucun bouton ✎');
  else {
    await page.waitForTimeout(400); await saisirFenetre(NO);
    T = await zoneTxt();
    if (!T.includes(NO)) KO('✎ objectifs recommandés : le texte saisi n\'apparaît pas');
    else OK('✎ objectifs recommandés : le texte du conseiller remplace la ligne générée');
  }

  /* 6 · le document imprimé */
  await page.evaluate(() => {
    window.print = () => {};
    const rm = Element.prototype.remove;
    Element.prototype.remove = function () { if (this.id === 'nc-print-holder') return; return rm.call(this); };
  });
  await page.locator('button:has-text("Enregistrer en PDF")').first().click(); await page.waitForTimeout(500);
  const hint = page.locator('button:has-text("J\'ai compris")');
  if (await hint.count()) { await hint.first().click(); await page.waitForTimeout(500); }
  await page.waitForTimeout(900);
  const P = await page.evaluate(() => { const h = document.getElementById('nc-print-holder'); return h ? h.textContent : null; });
  if (!P) KO('clone d\'impression introuvable');
  else {
    if (!P.includes(NQ)) KO('imprimé : la question corrigée n\'y est pas'); else OK('imprimé : la question corrigée y est');
    if (P.includes(q2txt)) KO('imprimé : la question masquée y figure encore'); else OK('imprimé : la question masquée n\'y est pas');
    if (!P.includes(AJ)) KO('imprimé : la question ajoutée n\'y est pas'); else OK('imprimé : la question ajoutée y est');
    if (!P.includes(NO)) KO('imprimé : l\'objectif corrigé n\'y est pas'); else OK('imprimé : l\'objectif corrigé y est');
    if (/✎|✕|↺|texte personnalisé|Ajouter une question|Ajouter une ligne|tout réafficher/.test(P)) KO('imprimé : un bouton ou un repère de correction s\'imprime');
    else OK('imprimé : aucun bouton ni repère de correction');
  }

  console.log('\nPAGEERRORS:', errs.length ? errs.slice(0, 3).join(' | ') : 'aucune');
  if (errs.length) ko++;
  await browser.close();
  console.log(ko ? '\nCORRECTIONS DU DOCUMENT : ' + ko + ' DÉFAUT(S)' : '\nCORRECTIONS DU DOCUMENT : TOUT PASSE, À L\'ÉCRAN COMME À L\'IMPRESSION');
  process.exit(ko ? 1 : 0);
})();
