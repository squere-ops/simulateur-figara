const { chromium } = require('playwright');
const setNative = async (page, el, value) => {
  await el.evaluate((node, v) => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(node, v);
    node.dispatchEvent(new Event('input', { bubbles: true }));
  }, value);
};
const repondreNonPartout = async (page) => {
  for (let k = 0; k < 12; k++) {
    const n = await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll('[data-ncq="manque"]')).filter(e => e.offsetParent !== null);
      for (const el of els) {
        const b = Array.from(el.querySelectorAll('button')).find(x => x.textContent.trim() === 'Non');
        if (b) { b.click(); return 1; }
      }
      return 0;
    });
    if (!n) break;
    await page.waitForTimeout(200);
  }
};
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined });
  const page = await browser.newPage({ viewport: { width: 1400, height: 950 } });
  const errs = [];
  page.on('pageerror', e => { if (!/tailwind is not defined/.test(String(e))) errs.push(String(e)); });
  await page.goto('http://localhost:8899/test_local.html?etude=1', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1400);
  if (await page.locator('text=Accéder au simulateur').count()) {
    const inps = page.locator('input');
    await setNative(page, inps.nth(0), 'UP'); await setNative(page, inps.nth(1), 'T');
    await page.locator('button:has-text("Accéder au simulateur")').first().click();
    await page.waitForTimeout(1000);
  }
  await page.locator('button:has-text("Nouveau client")').first().click();
  await page.waitForTimeout(700);
  const btn = page.locator('button, [role=button]').filter({ hasText: /complète|complet/i }).first();
  if (await btn.count()) { try { await btn.click({ timeout: 2000 }); } catch (e) {} }
  await page.waitForTimeout(500);
  const mod = page.locator('div.fixed.inset-0').last();

  // Étape 1 : PACS, conjoint renseigné, propriétaire RP 530 000, CRD 205 000
  await setNative(page, page.locator('input[placeholder="DUPONT"]:visible').last(), 'POLOTEST');
  await setNative(page, page.locator('input[placeholder="Marie"]:visible').last(), 'Marco');
  await mod.locator('button:has-text("Pacsé(e)")').first().click();
  await page.waitForTimeout(400);
  await page.locator('text=Renseigner le conjoint ?').locator('xpath=following::button[normalize-space()="Oui"][1]').click();
  await page.waitForTimeout(500);
  await mod.locator('button:text-is("Propriétaire")').first().click();
  await page.waitForTimeout(500);
  await setNative(page, page.locator('text=Valeur estimée du bien').first().locator('xpath=following::input[not(@type="range")][1]').first(), '530000');
  await page.waitForTimeout(300);
  await page.locator("text=Un crédit est-il en cours sur ce bien ?").locator('xpath=following::button[normalize-space()="Oui"][1]').click();
  await page.waitForTimeout(500);
  const crdInp = page.locator('text=/Capital restant dû/i').first().locator('xpath=following::input[not(@type="range")][1]').first();
  await setNative(page, crdInp, '205000');
  await page.waitForTimeout(300);

  // Étape 2 : 1 enfant commun (16 ans)
  await repondreNonPartout(page);
  await page.locator('button:has-text("Famille")').first().click();
  await page.waitForTimeout(600);
  await page.locator('text=Avez-vous des enfants ?').locator('xpath=following::button[normalize-space()="Oui"][1]').click();
  await page.waitForTimeout(400);
  await mod.locator('button:text-is("1")').first().click();
  await page.waitForTimeout(400);
  await setNative(page, page.locator('input[placeholder="Prénom"]:visible').first(), 'Théo');
  await setNative(page, page.locator('input[placeholder="2012"]:visible').first(), '2010');
  await page.waitForTimeout(300);

  // Étape 3 : locatif 145 000, CRD 95 000
  await repondreNonPartout(page);
  await page.locator('button:has-text("Activité & revenus")').first().click();
  await page.waitForTimeout(700);
  await mod.locator('button:has-text("Salarié")').first().click();
  await page.waitForTimeout(400);
  await setNative(page, page.locator('span:text-is("Salaire fixe")').first().locator('xpath=ancestor::div[2]//input[not(@type="range")]').first(), '120000');
  await page.waitForTimeout(300);
  await page.locator('text=Percevez-vous des revenus fonciers (locations) ?').locator('xpath=following::button[normalize-space()="Oui"][1]').click();
  await page.waitForTimeout(800);
  await page.locator('text=Combien de logements en location ?').locator('xpath=following::button[normalize-space()="1"][1]').click();
  await page.waitForTimeout(700);
  await setNative(page, page.locator('text=Valeur estimée').first().locator('xpath=following::input[not(@type="range")][1]').first(), '145000');
  await page.waitForTimeout(300);
  const t3 = await page.evaluate(() => document.body.innerText);
  // crédit sur le locatif
  const detLoc = page.locator('button:has-text("Détails (régime fiscal, crédit")').first();
  if (await detLoc.count()) { await detLoc.click(); await page.waitForTimeout(500); }
  await page.locator('text=Un crédit sur ce bien ?').locator('xpath=following::button[normalize-space()="Oui"][1]').click();
  await page.waitForTimeout(600);
  const crdL = page.locator('text=/Capital restant dû/i').first().locator('xpath=following::input[@type="range"][1]').first();
  await setNative(page, crdL, '95000');
  await page.waitForTimeout(300);

  // Étape 5 : compte courant 45 000 (commun) + AV 150 000
  await repondreNonPartout(page);
  await page.locator('button:has-text("Patrimoine & épargne")').first().click();
  await page.waitForTimeout(600);
  await page.locator("text=Avez-vous de l'épargne ou des placements ?").locator('xpath=following::button[normalize-space()="Oui"][1]').click();
  await page.waitForTimeout(600);
  await page.locator('text=Type de placement').first().locator('xpath=following::select[1]').selectOption('compte_courant');
  await page.waitForTimeout(400);
  await setNative(page, page.locator('text=Encours').first().locator('xpath=following::input[not(@type="range")][1]').first(), '45000');
  await page.waitForTimeout(300);
  await page.locator('button:has-text("Ajouter un avoir")').last().click();
  await page.waitForTimeout(500);
  await page.locator('text=Type de placement').nth(1).locator('xpath=following::select[1]').selectOption('av');
  await page.waitForTimeout(400);
  await setNative(page, page.locator('text=Encours').nth(1).locator('xpath=following::input[not(@type="range")][1]').first(), '150000');
  await page.waitForTimeout(400);

  // Synthèse
  await repondreNonPartout(page);
  await page.locator('button:has-text("Synthèse")').first().click();
  await page.waitForTimeout(900);
  if (await page.evaluate(() => /un instant/i.test(document.body.innerText))) {
    const p35 = page.locator('button:has-text("300 – 500")').last();
    if (await p35.count()) { await p35.click(); await page.waitForTimeout(300); }
    const val = page.locator('button:has-text("Valider")').last();
    if (await val.count()) await val.click();
    await page.waitForTimeout(900);
  }
  await page.waitForTimeout(1200);
  const T = await page.evaluate(() => (document.querySelector('.nc-syn-zone')||{innerText:'PAS'}).innerText.replace(/[  ]/g, ' '));
  const has = (lbl, re) => console.log((re.test(T) ? 'OK  ' : 'FAIL') + ' — ' + lbl);
  // Contrôle expert : RP (530 000 × 80 %) × 50 % − 102 500 = 109 500 ; locatif 25 000 ;
  // CC 22 500 ; − 1 500 frais funéraires → 155 500 ?? (locatif 50 000 si CRD OK)
  has('assiette 155 500 € (locatif 50/50 compté UNE fois, art. 775 déduit)', /155 500 €/);
  has('droits recalculés : 9 294 € (au lieu des 18 694 € erronés)', /9 294 € de droits/);
  has('note valeur vénale + art. 768 + art. 775', /abattement de 20 % appliqué sur la valeur vénale[\s\S]{0,120}art\. 768[\s\S]{0,60}art\. 775/i);
  has('hypothèses succession explicites (retenue vs alternative)', /hypothèse RETENUE : prêts non couverts[\s\S]{0,320}Les deux ne se cumulent pas/i);
  has('PACS : droit temporaire au logement un an (art. 515-6 / 763)', /droit temporaire au logement pendant un an \(art\. 515-6 \/ 763 C\. civ\.\)/i);
  has('clause bénéficiaire nominative recommandée', /clause bénéficiaire d'assurance-vie NOMINATIVE/i);
  has('AV hors succession (art. 990 I)', /d'assurance-vie HORS succession \(art\. 990 I/i);
  const clipOf = async (txt) => await page.evaluate((t) => {
    const els = [...document.querySelectorAll('.nc-syn-zone div')];
    const el = els.find(e => e.textContent.includes(t) && e.getBoundingClientRect().height < 900 && e.getBoundingClientRect().height > 60);
    if (!el) return null;
    el.scrollIntoView({ block: 'center' });
    const r = el.getBoundingClientRect();
    return { x: Math.max(0, r.x - 8), y: Math.max(0, r.y - 8), width: Math.min(1380, r.width + 16), height: Math.min(880, r.height + 16) };
  }, txt);
  const c1 = await clipOf('Vos placements — état des lieux');
  if (c1) await page.screenshot({ path: 'shot_v162_polo_plac.png', clip: c1 });
  const c2 = await clipOf('Patrimoine net');
  if (c2) await page.screenshot({ path: 'shot_v162_polo_patnet.png', clip: c2 });
  console.log('SHOTS', !!c1, !!c2);
  await browser.close();
})().catch(e => { console.error('CRASH', e); process.exit(1); });
