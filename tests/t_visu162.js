const { chromium } = require('playwright');
const setNative = async (page, el, value) => {
  await el.evaluate((node, v) => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(node, v);
    node.dispatchEvent(new Event('input', { bubbles: true }));
  }, value);
};
const repondreNonPartout = async (page) => {
  for (let k = 0; k < 10; k++) {
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
  await page.goto((process.env.PW_PAGE || 'http://localhost:8899/test_local.html') + '?etude=1', { waitUntil: 'networkidle' });
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
  await setNative(page, page.locator('input[placeholder="DUPONT"]:visible').last(), 'PERFULL');
  await setNative(page, page.locator('input[placeholder="Marie"]:visible').last(), 'Max');
  await mod.locator('button:has-text("Célibataire")').first().click();
  await page.waitForTimeout(250);
  await mod.locator('button:text-is("Locataire")').first().click();
  await page.waitForTimeout(300);
  await repondreNonPartout(page);
  await page.locator('button:has-text("Activité & revenus")').first().click();
  await page.waitForTimeout(600);
  await mod.locator('button:has-text("Salarié")').first().click();
  await page.waitForTimeout(400);
  await setNative(page, page.locator('span:text-is("Salaire fixe")').first().locator('xpath=ancestor::div[2]//input[not(@type="range")]').first(), '90000');
  await page.waitForTimeout(300);
  await repondreNonPartout(page);
  await page.locator('button:has-text("Fiscalité")').first().click();
  await page.waitForTimeout(700);
  await page.locator('text=Bénéficiez-vous de réductions ou crédits d\'impôt ?').locator('xpath=following::button[normalize-space()="Oui"][1]').click();
  await page.waitForTimeout(500);
  await mod.locator('button:has-text("Ajouter une réduction d\'impôt")').first().click();
  await page.waitForTimeout(400);
  await mod.locator('button:text-is("PER")').last().click();
  await page.waitForTimeout(500);
  let t4 = await page.evaluate(() => document.body.innerText.replace(/[  ]/g, ' '));
  const ok = (l, c) => console.log((c ? 'OK  ' : 'FAIL') + ' — ' + l);
  ok('ligne PER : rappel « une seule saisie » (pas de champ Versement)', /une seule saisie, la déduction se calcule automatiquement/.test(t4));
  // v161 : le bouton Ajouter vient APRÈS le bloc PER en place (ne coupe plus le flux)
  ok('bouton Ajouter APRÈS le bloc PER en place', (() => { const iP = t4.indexOf('PER EN PLACE'); const iB = t4.indexOf("+ Ajouter une réduction d'impôt"); return iP >= 0 && iB > iP; })());
  ok('choix de gestion Prudent/Équilibré/Dynamique présent', /Choix de gestion \?/.test(t4));
  // sélectionner Équilibré
  await page.locator('text=Choix de gestion ?').locator('xpath=following::button[normalize-space()="Équilibré"][1]').click();
  await page.waitForTimeout(300);
  // Bloc PER en place : versement + ENCOURS, tout au même endroit
  await page.locator('text=Versez-vous chaque mois ?').locator('xpath=following::button[normalize-space()="Oui"][1]').click();
  await page.waitForTimeout(400);
  await setNative(page, page.locator('text=Combien ?').locator('xpath=following::input[not(@type="range")][1]').first(), '100');
  await page.waitForTimeout(400);
  await setNative(page, page.locator('text=Encours actuel du PER').locator('xpath=following::input[not(@type="range")][1]').first(), '30000');
  await page.waitForTimeout(500);
  t4 = await page.evaluate(() => document.body.innerText.replace(/[  ]/g, ' '));
  ok('déduction auto 1 200 €/an reprise des versements', /repris automatiquement des versements PER \(100 €\/mois × 12\)/.test(t4));
  ok('rappel ambre disparu une fois le versement saisi', !/Renseignez le versement mensuel dans le bloc/.test(t4));
  // Étape 5 : rien à ressaisir
  await repondreNonPartout(page);
  await page.locator('button:has-text("Patrimoine & épargne")').first().click();
  await page.waitForTimeout(600);
  await page.locator("text=Avez-vous de l'épargne ou des placements ?").locator('xpath=following::button[normalize-space()="Oui"][1]').click();
  await page.waitForTimeout(600);
  const t5 = await page.evaluate(() => document.body.innerText.replace(/[  ]/g, ' '));
  ok('étape 5 : « pris en compte automatiquement… Rien à ressaisir »', /pris en compte automatiquement[\s\S]{0,80}encours 30 000 €[\s\S]{0,60}Rien à ressaisir/.test(t5));
  ok('étape 5 : plus de bouton « Reprendre ce PER ici »', !/Reprendre ce PER ici/.test(t5));
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
  await page.waitForTimeout(1000);
    // v162 VISU : captures ciblées — bloc placements + tuiles patrimoine.
  const clipOf = async (txt) => await page.evaluate((t) => {
    const els = [...document.querySelectorAll('.nc-syn-zone div')];
    const el = els.find(e => e.textContent.includes(t) && e.getBoundingClientRect().height < 900 && e.getBoundingClientRect().height > 60);
    if (!el) return null;
    el.scrollIntoView({ block: 'center' });
    const r = el.getBoundingClientRect();
    return { x: Math.max(0, r.x - 8), y: Math.max(0, r.y - 8), width: Math.min(1380, r.width + 16), height: r.height + 16 };
  }, txt);
  const c1 = await clipOf('Vos placements — état des lieux');
  if (c1) await page.screenshot({ path: 'shot_v162_placements.png', clip: c1 });
  const c2 = await clipOf('Patrimoine net');
  if (c2) await page.screenshot({ path: 'shot_v162_patnet.png', clip: c2 });
  console.log('SHOTS', !!c1, !!c2);
  await browser.close();
})().catch(e => { console.error('CRASH', e); process.exit(1); });
