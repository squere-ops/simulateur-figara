const { chromium } = require('playwright');
const setNative = async (page, el, value) => {
  await el.evaluate((node, v) => {
    const proto = node.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(node, v);
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
  if (await page.locator('text=Accéder au simulateur').count()) {
    const inps = page.locator('input');
    await setNative(page, inps.nth(0), 'UP'); await setNative(page, inps.nth(1), 'T');
    await page.locator('button:has-text("Accéder au simulateur")').first().click();
    await page.waitForTimeout(1200);
  }
  await page.locator('button:has-text("Nouveau client")').first().click();
  await page.waitForTimeout(800);
  const b = page.locator('button, [role=button]').filter({ hasText: /complète|complet/i }).first();
  if (await b.count()) { try { await b.click({ timeout: 2000 }); } catch (e) {} }
  await page.waitForTimeout(600);
  const mod = page.locator('div.fixed.inset-0').last();

  await setNative(page, page.locator('input[placeholder="DUPONT"]:visible').last(), 'VCENTQ');
  await setNative(page, page.locator('input[placeholder="Marie"]:visible').last(), 'Vic');
  await mod.locator('button:has-text("Célibataire")').first().click();
  await page.waitForTimeout(300);
  await mod.locator('button:text-is("Locataire")').first().click();
  await page.waitForTimeout(300);
  await repondreNonPartout(page);
  await page.locator('button:has-text("Activité & revenus")').first().click();
  await page.waitForTimeout(600);
  await mod.locator('button:has-text("Salarié")').first().click();
  await page.waitForTimeout(400);
  await setNative(page, page.locator('span:text-is("Salaire fixe")').first().locator('xpath=ancestor::div[2]//input[not(@type="range")]').first(), '90000');
  await page.waitForTimeout(400);

  // ONGLET 7 : profil de risque (étape dédiée)
  await repondreNonPartout(page);
  await page.locator('button:has-text("Profil de risque")').first().click();
  await page.waitForTimeout(700);
  const t6 = await page.evaluate(() => document.body.innerText);
  console.log((/Questionnaire de profil de risque/i.test(t6) ? 'OK  ' : 'FAIL') + ' — onglet 7 dédié Profil de risque');
  await mod.locator('button:has-text("Questionnaire intégré (MIF 2)")').first().click();
  await page.waitForTimeout(500);
  const t6d = await page.evaluate(() => document.body.innerText);
  console.log((/Connaissances & expérience/i.test(t6d) && /capacité à subir des pertes/i.test(t6d) && /Objectifs & horizon/i.test(t6d) && /Tolérance au risque/i.test(t6d) ? 'OK  ' : 'FAIL') + ' — 4 dimensions MIF 2 affichées');
  for (const lbl of ["bonne", "actions, OPCVM", "quelques fois par an", "oui, une perte limitée", "25 à 50 %", "3 à 6 mois", "un impact limité", "plus de 15 ans", "une croissance modérée", "peu probable", "j'attends que ça remonte", "5 et +8", "une opportunité mesurée"]) {
    await mod.locator(`button:has-text("${lbl}")`).first().click();
    await page.waitForTimeout(150);
  }
  const t6b = await page.evaluate(() => document.body.innerText);
  console.log((/Profil : Dynamique — indicateur SRI 5 \/ 7 \(score 40\/52\)/.test(t6b) ? 'OK  ' : 'FAIL') + ' — score 40/52 → Dynamique, SRI 5/7');
  // réponses multiples : cocher en plus « aucune » sur q1 → max(1,3)=3, score inchangé
  await mod.locator('button:has-text("aucune")').first().click();
  await page.waitForTimeout(300);
  const t6c = await page.evaluate(() => document.body.innerText);
  console.log((/score 40\/52/.test(t6c) ? 'OK  ' : 'FAIL') + ' — multi-réponses : la plus avancée compte (score stable)');

  // Capacité (garde-fou) puis synthèse
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
  let T = await page.evaluate(() => document.querySelector('.nc-syn-zone').innerText);
  const has = (l, re) => console.log((re.test(T) ? 'OK  ' : 'FAIL') + ' — ' + l);
  has('carte Profil de risque en synthèse', /Profil de risque — questionnaire réalisé/i);
  has('note SRI 5 / 7 affichée', /SRI[\s\S]{0,80}5 \/ 7/);
  has('profil Dynamique affiché', /Dynamique/);

  // CORRECTIONS : ✎ corriger le 1er axe (prompt stubé), ✕ masquer le 1er point fort
  await page.evaluate(() => { window.prompt = () => "TEXTE CORRIGE PAR LE CONSEILLER (test)"; });
  await page.locator('button[title="Corriger le texte"]').first().click();
  await page.waitForTimeout(500);
  T = await page.evaluate(() => document.querySelector('.nc-syn-zone').innerText);
  has('texte corrigé appliqué', /TEXTE CORRIGE PAR LE CONSEILLER \(test\)/);
  const nbAvant = await page.locator('.nc-syn-zone button[title="Masquer du document"]').count();
  await page.locator('button[title="Masquer du document"]').first().click();
  await page.waitForTimeout(500);
  const nbApres = await page.locator('.nc-syn-zone button[title="Masquer du document"]').count();
  console.log((nbApres === nbAvant - 1 ? 'OK  ' : 'FAIL') + ` — élément masqué (${nbAvant} → ${nbApres})`);
  T = await page.evaluate(() => document.querySelector('.nc-syn-zone').innerText);
  has('bandeau corrections + tout rétablir', /tout rétablir/);
  // RÉORDRE : premier axe descend d'un cran
  const axesAvant = await page.evaluate(() => [...document.querySelectorAll('.nc-syn-zone ul')].map(u => u.innerText).join('\n'));
  await page.locator('button[title="Monter — priorité du client"]').nth(1).click();
  await page.waitForTimeout(500);
  const axesApres = await page.evaluate(() => [...document.querySelectorAll('.nc-syn-zone ul')].map(u => u.innerText).join('\n'));
  console.log((axesAvant !== axesApres ? 'OK  ' : 'FAIL') + ' — ordre des axes modifié (priorité client)');
  // tout rétablir
  await page.locator('button:has-text("tout rétablir")').first().click();
  await page.waitForTimeout(500);
  T = await page.evaluate(() => document.querySelector('.nc-syn-zone').innerText);
  console.log((!/TEXTE CORRIGE PAR LE CONSEILLER/.test(T) ? 'OK  ' : 'FAIL') + ' — tout rétablir restaure l\'analyse d\'origine');
  await page.evaluate(() => { window.print = () => {}; });
  await page.locator('button:has-text("Enregistrer en PDF")').first().click();
  await page.waitForTimeout(400);
  const hintBtn = page.locator('button:has-text("J\'ai compris")');
  if (await hintBtn.count()) { await hintBtn.first().click(); await page.waitForTimeout(400); }
  await page.pdf({ path: 'export_v140.pdf', format: 'A4', printBackground: true });
  console.log('PDF genere');
  console.log('PAGEERRORS:', errs.length ? errs.join(' || ') : 'aucune');
  await browser.close();
})().catch(e => { console.error('CRASH', e); process.exit(1); });
