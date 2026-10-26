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
  const celib = mod.locator('button:has-text("Célibataire")').first();
  if (await celib.count()) await celib.click();
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


  // ─── SONDE : structure DOM de la zone de synthèse ───
  const dump = async (tag) => {
    const r = await page.evaluate(() => {
      const z = document.querySelector('.nc-syn-zone');
      if (!z) return { err: 'pas de zone' };
      const anc = [];
      let p = z;
      while (p && p !== document.body) {
        const cs = getComputedStyle(p);
        anc.push({ tag: p.tagName, cls: (p.className || '').toString().slice(0, 90), pos: cs.position, ov: cs.overflowY, tr: cs.transform === 'none' ? '' : 'TRANSFORM', h: Math.round(p.getBoundingClientRect().height) });
        p = p.parentElement;
      }
      const kids = [...z.children].map((c, i) => ({
        i, tag: c.tagName, cls: (c.className || '').toString().slice(0, 70),
        h: Math.round(c.getBoundingClientRect().height),
        t: (c.innerText || '').replace(/\s+/g, ' ').slice(0, 70)
      }));
      // le gros conteneur = enfant le plus haut
      const host = [...z.children].reduce((a, b) => (b.getBoundingClientRect().height > (a ? a.getBoundingClientRect().height : 0) ? b : a), null);
      const hk = host ? [...host.children].map((c, i) => ({
        i, tag: c.tagName, cls: (c.className || '').toString().slice(0, 60),
        h: Math.round(c.getBoundingClientRect().height),
        t: (c.innerText || '').replace(/\s+/g, ' ').slice(0, 85)
      })) : [];
      return { anc, kids, hostCls: host ? (host.className || '').toString() : null, hk };
    });
    console.log('\n########## ' + tag + ' ##########');
    if (r.err) { console.log(r.err); return; }
    console.log('-- ANCETRES de .nc-syn-zone --');
    r.anc.forEach(a => console.log('   ' + a.tag + ' .' + a.cls + ' | pos=' + a.pos + ' ov=' + a.ov + ' ' + a.tr + ' h=' + a.h));
    console.log('-- ENFANTS de .nc-syn-zone --');
    r.kids.forEach(k => console.log('  [' + k.i + '] h=' + k.h + ' <' + k.tag + ' class="' + k.cls + '"> ' + k.t));
    console.log('-- HOST: ' + r.hostCls);
    r.hk.forEach(k => console.log('  (' + k.i + ') h=' + k.h + ' <' + k.tag + ' class="' + k.cls + '"> ' + k.t));
  };

  await dump('VOLET CONSTAT (Audit et synthese)');
  { const b = page.locator('button:has-text("Analyse R2")').first(); if (await b.count()) { await b.click(); await page.waitForTimeout(1200); } }
  await dump('VOLET PROJECTION');
  { const b = page.locator('button:has-text("Simulation")').first(); if (await b.count()) { await b.click(); await page.waitForTimeout(1200); } }
  await dump('VOLET PRECO');
  console.log('\nPAGEERRORS:', errs.length ? errs.slice(0,3).join(' | ') : 'aucune');
  await browser.close();
})();
