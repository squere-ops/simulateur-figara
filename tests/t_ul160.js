const { chromium } = require('playwright');
const setNative = async (page, el, value) => {
  await el.evaluate((node, v) => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(node, v); node.dispatchEvent(new Event('input', { bubbles: true })); }, value);
};
const repondreNonPartout = async (page) => {
  for (let k = 0; k < 12; k++) {
    const n = await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll('[data-ncq="manque"]')).filter(e => e.offsetParent !== null);
      for (const el of els) { const b = Array.from(el.querySelectorAll('button')).find(x => x.textContent.trim() === 'Non'); if (b) { b.click(); return 1; } }
      return 0;
    });
    if (!n) break;
    await page.waitForTimeout(200);
  }
};
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined });
  const page = await browser.newPage({ viewport: { width: 1400, height: 950 } });
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
  await setNative(page, page.locator('input[placeholder="DUPONT"]:visible').last(), 'CURE');
  await setNative(page, page.locator('input[placeholder="Marie"]:visible').last(), 'Sylva');
  await mod.locator('button:has-text("Union libre")').first().click();
  await page.waitForTimeout(400);
  await page.locator('text=Renseigner le conjoint ?').locator('xpath=following::button[normalize-space()="Oui"][1]').click();
  await page.waitForTimeout(500);
  await mod.locator('button:text-is("Locataire")').first().click();
  await page.waitForTimeout(300);
  // Enfant majeur rattaché « Léo » (19 ans)
  await repondreNonPartout(page);
  await page.locator('button:has-text("Famille")').first().click();
  await page.waitForTimeout(600);
  await page.locator('text=Avez-vous des enfants ?').locator('xpath=following::button[normalize-space()="Oui"][1]').click();
  await page.waitForTimeout(400);
  await mod.locator('button:text-is("1")').first().click();
  await page.waitForTimeout(400);
  await setNative(page, page.locator('input[placeholder="Prénom"]:visible').first(), 'Léo');
  await setNative(page, page.locator('input[placeholder="2012"]:visible').first(), '2007');
  await page.waitForTimeout(300);
  await mod.locator('button:has-text("Majeur rattaché")').first().click();
  await page.waitForTimeout(300);
  // Salaire élevé Monsieur (TMI 41 %) + salaire Madame
  await repondreNonPartout(page);
  await page.locator('button:has-text("Activité & revenus")').first().click();
  await page.waitForTimeout(600);
  await mod.locator('button:has-text("Salarié")').first().click();
  await page.waitForTimeout(400);
  await setNative(page, page.locator('span:text-is("Salaire fixe")').first().locator('xpath=ancestor::div[2]//input[not(@type="range")]').first(), '150000');
  await page.waitForTimeout(400);
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
  const T = await page.evaluate(() => (document.querySelector('.nc-syn-zone')||{innerText:''}).innerText.replace(/[\u202f\u00a0]/g, ' '));
  const ok = (l, c) => console.log((c ? 'OK  ' : 'FAIL') + ' — ' + l);
  ok('axe nominatif : arbitrage rattachement / pension pour Léo', /Optimiser l'arbitrage rattachement \/ pension alimentaire pour Léo/.test(T));
  ok('mécanique : écrêté 1 807 € + point de bascule chiffré', /au plus 1 807 € par demi-part/.test(T) && /devient gagnant dès ≈ 4 400 €/.test(T));
  ok('conditions : exclusivité + option annuelle + imposable chez l\'enfant', /exclusifs la même année/.test(T) && /CHAQUE année/.test(T) && /imposable chez Léo/.test(T));
  ok('Concubin sans droits OUVRE les axes (priorité)', (() => { const i1 = T.search(/Concubin sans droits — à traiter en priorité/); const i2 = T.search(/LES AXES DE TRAVAIL/i); return i1 > i2 && i1 >= 0; })());
  ok('PACS cité comme levier structurant n°1 (art. 796-0 bis)', /Levier structurant à étudier EN PREMIER : le PACS[\s\S]{0,80}796-0 bis/.test(T));
  ok('levier de crédit : « à n\'activer qu\'APRÈS la sécurisation »', /À n'activer qu'APRÈS la sécurisation du concubin/.test(T));
  ok('capacité d\'emprunt : note union libre emprunt À DEUX', /suppose un emprunt À DEUX/.test(T));
  ok('capacités indicatives par concubin affichées', /Un emprunt porté par un seul concubin repose sur ses seuls revenus/.test(T));
  ok('stress-test mentionné', /stress-test vacance locative, hausse des taux, décès de l'emprunteur/.test(T));
  ok('projection 10 ans : réserve retraite', /Un passage à la retraite dans l'intervalle réduirait ce montant/.test(T));
  ok('taux de remplacement affiché', /taux de remplacement ≈ \d+ % appliqué aux revenus actuels/.test(T));
  // v162 : repère visuel Monsieur / Madame — deux couleurs distinctes dans la synthèse.
  const persColors = await page.evaluate(() => {
    // Couleur normale (#0e7490 / #9d4a6b) OU variante claire pour fond sombre (#8fd4e8 / #eab6cc).
    const els = [...document.querySelectorAll('.nc-syn-zone span')];
    const has = (txt, rgbs) => els.some(e => e.textContent.trim() === txt && rgbs.includes(getComputedStyle(e).color));
    return {
      mr: has('Monsieur', ['rgb(14, 116, 144)', 'rgb(143, 212, 232)']),
      mme: has('Madame', ['rgb(157, 74, 107)', 'rgb(234, 182, 204)'])
    };
  });
  ok('repère visuel : Monsieur en bleu pétrole (couleur dédiée)', persColors.mr);
  ok('repère visuel : Madame en prune (couleur dédiée)', persColors.mme);
  ok('AUCUN NaN dans la synthèse', !/NaN/.test(T));
  console.log('PAGEERRORS check via console absent');
  await browser.close();
})().catch(e => { console.error('CRASH', e); process.exit(1); });
