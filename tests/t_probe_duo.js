const { chromium } = require('playwright');

const setNative = async (page, el, value) => {
  await el.evaluate((node, v) => {
    const proto = node.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
    setter.call(node, v);
    node.dispatchEvent(new Event('input', { bubbles: true }));
    node.dispatchEvent(new Event('change', { bubbles: true }));
  }, value);
};


const repondreNonPartout = async (page) => {
  for (let k = 0; k < 10; k++) {
    const n = await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll('[data-ncq="manque"]')).filter(e => e.offsetParent !== null);
      for (const el of els) {
        const btn = Array.from(el.querySelectorAll('button')).find(b => b.textContent.trim() === 'Non');
        if (btn) { btn.click(); return 1; }
      }
      return 0;
    });
    if (!n) break;
    await page.waitForTimeout(250);
  }
};

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined });
  const page = await browser.newPage({ viewport: { width: 1400, height: 950 } });
  const errs = [];
  page.on('pageerror', e => { if (!/tailwind is not defined/.test(String(e))) errs.push(String(e)); });
  await page.goto((process.env.PW_PAGE || 'http://localhost:8899/test_local.html') + '?etude=1', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Porte d'entrée cabinet/nom (premier accès)
  if (await page.locator('text=Accéder au simulateur').count()) {
    const inps = page.locator('input');
    await setNative(page, inps.nth(0), 'Universel Patrimoine');
    await setNative(page, inps.nth(1), 'Test');
    await page.locator('button:has-text("Accéder au simulateur")').first().click();
    await page.waitForTimeout(1200);
  }
  console.log('ACCUEIL:', (await page.evaluate(() => document.body.innerText)).slice(0, 400).replace(/\n+/g, ' | '));

  // Ouvrir Nouveau client
  await page.locator('button:has-text("Nouveau client")').first().click();
  await page.waitForTimeout(800);
  // Si un choix de niveau apparaît, prendre l'étude complète
  const modalTxt = await page.evaluate(() => document.body.innerText.slice(0, 4000));
  if (/complet|complète/i.test(modalTxt)) {
    const btn = page.locator('button, [role=button]').filter({ hasText: /complète|complet/i }).first();
    if (await btn.count()) { try { await btn.click({ timeout: 2000 }); } catch (e) {} }
  }
  await page.waitForTimeout(600);

  // ÉTAPE 1 — état civil
  console.log('NB_DUPONT:', await page.locator('input[placeholder="DUPONT"]').count(), 'visibles:', await page.locator('input[placeholder="DUPONT"]:visible').count());
  await setNative(page, page.locator('input[placeholder="DUPONT"]:visible').last(), 'RGEAF');
  await setNative(page, page.locator('input[placeholder="Marie"]:visible').last(), 'erfvd');
  const dn = page.locator('input[type="date"]:visible').first();
  if (await dn.count()) await setNative(page, dn, '1981-03-01');
  await setNative(page, page.locator('input[placeholder="06 12 34 56 78"]:visible').last(), '06 11 22 33 44');
  await setNative(page, page.locator('input[placeholder="contact@email.fr"]:visible').last(), 'client@test.fr');
  // Célibataire / Locataire : scopés au MODAL (le fond de page a aussi ces libellés)
  const mod = page.locator('div.fixed.inset-0').last();
  // 15/09/2026 : COUPLE — le CGP veut lire QUI verse (« Monsieur 200 €, Madame 100 € »).
  const marie = mod.locator('button:has-text("Marié")').first();
  if (await marie.count()) { await marie.click(); await page.waitForTimeout(500); }
  try {
    const selReg = page.locator('select').filter({ has: page.locator('option[value="separation"]') }).first();
    if (await selReg.count()) await selReg.selectOption('separation');
    else {
      const bSep = mod.locator('button:has-text("Séparation de biens")').first();
      if (await bSep.count()) { await bSep.click({ timeout: 1500 }); await page.waitForTimeout(300); }
    }
  } catch (e) {}
  await page.waitForTimeout(300);
  const cjQ = page.locator('text=Renseigner le conjoint ?').locator('xpath=following::button[normalize-space()="Oui"][1]');
  if (await cjQ.count()) { await cjQ.first().click(); await page.waitForTimeout(500); }
  {
    const cjPre = page.locator('input[placeholder="Jean"]:visible');
    if (await cjPre.count()) await setNative(page, cjPre.last(), 'Sophie');
    const dts = page.locator('input[type="date"]:visible');
    if (await dts.count() > 1) await setNative(page, dts.nth(1), '1983-05-01');
  }
  await page.waitForTimeout(300);
  await mod.locator('button:text-is("Locataire")').first().click();
  await page.waitForTimeout(400);
  const loyerInp = page.locator('div:has(> div:text-is("Montant du loyer")) input').first();
  if (await loyerInp.count()) await setNative(page, loyerInp, '1200');
  else {
    // fallback : premier input après le libellé
    const li = page.locator('text=Montant du loyer').locator('xpath=following::input[1]');
    await setNative(page, li.first(), '1200');
  }
  await page.waitForTimeout(300);

  // ÉTAPE 3 — activité & revenus
  await repondreNonPartout(page);
  await page.locator('button:has-text("Activité & revenus")').first().click();
  await page.waitForTimeout(600);
  const sal = page.locator('button:has-text("Salarié")').first();
  if (await sal.count()) await sal.click();
  await page.waitForTimeout(500);
  const m13 = page.locator('button:text-is("13 mois")').first();
  if (await m13.count()) await m13.click();
  // Salaire : input à proximité du libellé "Salaire fixe" — défaut €/an → 150 000
  const salInp = page.locator('span:text-is("Salaire fixe")').locator('xpath=ancestor::div[2]//input[not(@type="range")]').first();
  await setNative(page, salInp, '150000');
  await page.waitForTimeout(400);
  console.log('SAL_ZONE:', (await page.evaluate(() => {
    const el = [...document.querySelectorAll('span')].find(x => x.textContent.trim() === 'Salaire fixe');
    return el ? el.closest('div').parentElement.parentElement.innerText.replace(/\n/g, ' | ') : 'introuvable';
  })).slice(0, 300));

  // ÉTAPE 5 — patrimoine & épargne : livret 22 500
  await repondreNonPartout(page);
  await page.locator('button:has-text("Patrimoine & épargne")').first().click();
  await page.waitForTimeout(600);
  const qEp = page.locator('div:has-text("Avez-vous de l\'épargne ou des placements ?")').locator('button:text-is("Oui")').last();
  await qEp.click();
  await page.waitForTimeout(400);
  // 10/09 : un nouveau placement s'ouvre sur « — Choisir — » (decision CGP) : on choisit Livrets
  { const selT = page.locator('text=Type de placement').first().locator('xpath=following::select[1]'); if (await selT.count()) await selT.selectOption('livrets'); }
  await page.waitForTimeout(600);
  // montant du livret : slider → setter natif, sinon champ €
  const rng = page.locator('input[type="range"]').last();
  if (await rng.count()) await setNative(page, rng, '22500');
  await page.waitForTimeout(400);
  console.log('AVOIR_TXT:', (await page.evaluate(() => document.body.innerText.match(/22\s?500[^\n]*/g) || 'aucun 22500')).toString().slice(0, 200));


  // ─── versement mensuel sur le livret : 200 €/mois ───
  {
    const ouiVers = page.locator('div:has(> div:text-is("Versement mensuel ?")) button:text-is("Oui")').first();
    if (await ouiVers.count()) { await ouiVers.click(); await page.waitForTimeout(400); }
    else {
      const o = page.locator('text=Versement mensuel ?').locator('xpath=following::button[normalize-space()="Oui"][1]');
      if (await o.count()) { await o.first().click(); await page.waitForTimeout(400); }
    }
    const champ = page.locator('text=Versement mensuel ?').locator('xpath=following::input[1]');
    if (await champ.count()) { await setNative(page, champ.first(), '200'); await page.waitForTimeout(300); }
  }
  console.log('PP1:', (await page.evaluate(() => (document.body.innerText.match(/200[^\n]{0,40}/g) || []).slice(0,3).join(' || '))));

  // détenteur du livret : Monsieur
  {
    const r = await page.evaluate(() => {
      const sels = Array.from(document.querySelectorAll('select')).filter(s => s.offsetParent !== null
        && Array.from(s.options).some(o => o.value === 'client'));
      if (!sels.length) return 'aucun select detenteur';
      const s = sels[sels.length - 1];
      const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set;
      setter.call(s, 'client');
      s.dispatchEvent(new Event('change', { bubbles: true }));
      return 'ok ' + s.value;
    });
    console.log('DETENTEUR livret:', r);
    await page.waitForTimeout(500);
  }

  // ─── deuxième placement : assurance vie 30 000 €, 100 €/mois ───
  {
    const plus = page.locator('button:has-text("Ajouter un placement"), button:has-text("Ajouter")').last();
    if (await plus.count()) { await plus.click(); await page.waitForTimeout(700); }
    // le DERNIER select de la page est maintenant celui du détenteur du 1er placement :
    // viser explicitement un select qui propose le TYPE « av ».
    const rT = await page.evaluate(() => {
      const sels = Array.from(document.querySelectorAll('select')).filter(s => s.offsetParent !== null
        && Array.from(s.options).some(o => o.value === 'av'));
      if (!sels.length) return 'aucun select type';
      const s = sels[sels.length - 1];
      const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set;
      setter.call(s, 'av');
      s.dispatchEvent(new Event('change', { bubbles: true }));
      return 'ok ' + s.value;
    });
    console.log('TYPE av:', rT);
    await page.waitForTimeout(800);
    const rng2 = page.locator('input[type="range"]').last();
    if (await rng2.count()) { await setNative(page, rng2, '30000'); await page.waitForTimeout(400); }
    const ouiVers2 = page.locator('text=Versement mensuel ?').locator('xpath=following::button[normalize-space()="Oui"][1]');
    if (await ouiVers2.count()) { await ouiVers2.last().click(); await page.waitForTimeout(400); }
    const champ2 = page.locator('text=Versement mensuel ?').locator('xpath=following::input[1]');
    if (await champ2.count()) { await setNative(page, champ2.last(), '100'); await page.waitForTimeout(300); }
    // détenteur de l'assurance vie : Madame
    const r2 = await page.evaluate(() => {
      const sels = Array.from(document.querySelectorAll('select')).filter(s => s.offsetParent !== null
        && Array.from(s.options).some(o => o.value === 'conjoint'));
      if (!sels.length) return 'aucun select detenteur';
      const s = sels[sels.length - 1];
      const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set;
      setter.call(s, 'conjoint');
      s.dispatchEvent(new Event('change', { bubbles: true }));
      return 'ok ' + s.value;
    });
    console.log('DETENTEUR av:', r2);
    await page.waitForTimeout(500);
  }

  // ─── ÉTAPE 6 : objectifs ───
  await repondreNonPartout(page);
  await page.locator('button:has-text("Objectifs")').first().click();
  await page.waitForTimeout(800);
  for (const lib of ['Retraite', 'Protection', 'Fiscalité', 'Transmission']) {
    const c = page.locator('button:has-text("' + lib + '")').first();
    if (await c.count()) { try { await c.click({ timeout: 1500 }); await page.waitForTimeout(250); } catch (e) {} }
  }

  // ÉTAPE 7 — synthèse (garde-fou capacité en route)
  await repondreNonPartout(page);
  await page.locator('button:has-text("Synthèse")').first().click();
  await page.waitForTimeout(800);
  const guard = await page.evaluate(() => /un instant/i.test(document.body.innerText));
  if (guard) {
    const p35 = page.locator('button:has-text("300 – 500")').first();
    if (await p35.count()) { await p35.click(); await page.waitForTimeout(300); }
    const val = page.locator('button:has-text("Valider")').first();
    if (await val.count()) await val.click();
    else await page.locator('text=passer quand même').first().click();
    await page.waitForTimeout(900);
  }
  await page.waitForTimeout(1200);



  /* ═══════════════════════════════════════════════════════════════════════
     LE DOCUMENT IMPRIMÉ — page par page, sur LES DEUX FORMATS DE PAPIER.
     16/09/2026. Le CGP : « tu ne vérifies absolument pas ce que tu délivres ».
     Il avait raison : toutes mes vérifications portaient sur l'ÉCRAN. Ce banc
     fabrique le PDF, MESURE le taux de remplissage de chaque page et rend les
     images — qui doivent être RELUES avant toute livraison.
     ═══════════════════════════════════════════════════════════════════════ */
  const fs = require('fs');
  /* Le pipeline d'export démonte le holder juste après window.print() : on neutralise
     le démontage, sinon page.pdf() photographie l'application et non le document. */
  await page.evaluate(() => {
    window.print = () => {};
    const rm = Element.prototype.remove;
    Element.prototype.remove = function () { if (this.id === 'nc-print-holder') return; return rm.call(this); };
    const clRm = DOMTokenList.prototype.remove;
    DOMTokenList.prototype.remove = function (...c) {
      if (c.indexOf('nc-print-syn') !== -1 || c.indexOf('nc-print-syn-root') !== -1) return;
      return clRm.apply(this, c);
    };
  });
  await page.locator('button:has-text("Enregistrer en PDF")').first().click();
  await page.waitForTimeout(500);
  const hint = page.locator('button:has-text("J\'ai compris")');
  if (await hint.count()) { await hint.first().click(); await page.waitForTimeout(500); }
  await page.waitForTimeout(900);

  /* ═══ LE DOCUMENT NE DOIT JAMAIS ÊTRE PLUS LARGE QUE SA PAGE (18/09/2026) ═══
     Le CGP : « le document paraît tout petit et sous-dimensionné ». Cause : une seule
     valeur en `white-space: nowrap` (la ligne « Note » d'un crédit) débordait en
     largeur ; Chrome met alors LA PAGE ENTIÈRE à l'échelle pour la faire tenir, et
     tout le document rétrécit d'un tiers, en haut à gauche de la feuille.
     Ce contrôle mesure le débordement horizontal du porteur d'impression. Il échoue
     au premier pixel de trop : ce défaut ne se lit NI à l'écran NI dans le compte
     de pages. */
  /* le porteur est en display:none hors impression : on émule le média print pour
     que la mesure porte sur la mise en page réelle du document. */
  await page.emulateMedia({ media: 'print' });
  const debord = await page.evaluate(() => {
    const h = document.getElementById('nc-print-holder');
    if (!h) return { err: 'porteur absent', pire: 0 };
    let pire = 0, coupable = '';
    const base = h.getBoundingClientRect();
    h.querySelectorAll('*').forEach(n => {
      const r = n.getBoundingClientRect();
      const dd = Math.round(r.right - base.right);
      if (dd > pire) { pire = dd; coupable = (n.className && String(n.className).slice(0, 60)) + ' | ' + (n.textContent || '').trim().slice(0, 60); }
    });
    return { scroll: h.scrollWidth, client: h.clientWidth, pire, coupable };
  });
  await page.emulateMedia({ media: null });
  console.log('LARGEUR:', JSON.stringify(debord));

  global.__koLarge = debord.pire > 2 ? 1 : 0;
  console.log(global.__koLarge
    ? `FAIL — le document deborde de ${debord.pire} px en largeur : Chrome mettra toute la page a l echelle. Coupable : ${debord.coupable}`
    : 'OK   — aucun debordement horizontal : le document sort a sa taille reelle');


  await page.emulateMedia({ media: 'print' });
  const res = await page.evaluate(() => {
    const st = document.createElement('style');
    st.textContent = '.nc-duo > * { flex-grow: 1 !important; }';
    document.head.appendChild(st);
    const h = document.getElementById('nc-print-holder');
    const rows = Array.from(h.querySelectorAll('.nc-duo'));
    const r = rows[rows.length - 1];
    const suite = r.cloneNode(false);
    suite.appendChild(r.lastElementChild);
    r.parentNode.insertBefore(suite, r.nextSibling);
    return { seuleAvecGrow: Math.round(suite.firstElementChild.getBoundingClientRect().width) };
  });
  console.log('PROBE_AVANT_FIX:', JSON.stringify(res));
  process.exit(0);
  for (const fmt of ['A4', 'Letter']) {
    const out = `doc_${fmt}.pdf`;
    await page.pdf({ path: out, format: fmt, printBackground: true });
    console.log('PDF', fmt, '->', out, fs.statSync(out).size, 'octets');
  }
  try { const dbg = await page.evaluate(() => ({ p: window.__ncDbgPieds || null, g: window.__ncDbgGeo || null })); console.log('DBGPIEDS', JSON.stringify(dbg)); } catch (e) {}
  console.log('\nPAGEERRORS:', errs.length ? errs.slice(0, 3).join(' | ') : 'aucune');
  await browser.close();

  /* ═══ LE CONTRÔLE QUI MANQUAIT : on MESURE le remplissage de chaque page ═══
     Rendu en images, puis lecture du dernier pixel encré de la zone de contenu
     (le pied de page fixe, dans les 10 % du bas, est exclu). Une page remplie à
     moins de 60 % est un défaut de mise en page : le CGP l'a vu avant moi. */
  const { execSync } = require('child_process');
  let ko = global.__koLarge || 0;
  for (const fmt of ['A4', 'Letter']) {
    execSync(`rm -f pg_${fmt}-*.png && pdftoppm -r 60 -png doc_${fmt}.pdf pg_${fmt}`);
    const imgs = fs.readdirSync('.').filter(f => f.startsWith(`pg_${fmt}-`) && f.endsWith('.png')).sort();
    console.log(`\n=== ${fmt} : ${imgs.length} pages`);
    imgs.forEach((f, i) => {
      const taux = parseInt(execSync(`python3 -c "
from PIL import Image
im=Image.open('${f}').convert('L'); w,h=im.size; px=im.load(); hmax=int(h*0.90); d=0
for y in range(hmax-1,-1,-1):
    for x in range(0,w,3):
        if px[x,y]<242: d=y; break
    if d: break
print(round(d/hmax*100))
"`).toString().trim(), 10);
      const derniere = i === imgs.length - 1;
      const bon = taux >= 60 || derniere;
      if (!bon) ko++;
      console.log(`${bon ? 'OK  ' : 'FAIL'} — page ${i + 1} remplie à ${taux} %${derniere ? ' (dernière page : tolérée)' : ''}`);
    });
  }
  console.log(ko === 0 ? '\nDOCUMENT IMPRIMÉ : TOUT EST VERT' : `\nDOCUMENT IMPRIMÉ : ${ko} page(s) trop vide(s)`);
  process.exit(ko === 0 && errs.length === 0 ? 0 : 1);
})();
