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
  for (let k = 0; k < 12; k++) {
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
  await page.goto('http://localhost:8899/test_local.html?etude=1', { waitUntil: 'networkidle' });
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
  await setNative(page, page.locator('input[placeholder="DUPONT"]:visible').last(), 'PENSQ');
  await setNative(page, page.locator('input[placeholder="Marie"]:visible').last(), 'Syl');
  await mod.locator('button:has-text("Célibataire")').first().click();
  await page.waitForTimeout(300);
  await mod.locator('button:has-text("Logé à titre gratuit")').first().click();
  await page.waitForTimeout(400);
  await repondreNonPartout(page);
  // BLOC-NOTES : ouvrir, saisir, fermer
  await page.locator('button:has-text("Bloc-notes")').first().click();
  await page.waitForTimeout(400);
  const okN = (l, c) => console.log((c ? 'OK  ' : 'FAIL') + ' — ' + l);
  okN('tiroir Notes ouvert', await page.locator('text=Bloc-notes du rendez-vous').count() > 0);
  await setNative(page, page.locator('textarea[placeholder*="Notes libres"]').first(), 'Client tres presse - relancer sur la prevoyance en septembre.\nPrevoir simulation PER au prochain RDV.');
  await page.waitForTimeout(300);
  // v175 : le tiroir reste ouvert PENDANT la saisie — la fenêtre se décale, pas de recouvrement
  await page.locator('button:has-text("Famille")').first().click();
  await page.waitForTimeout(500);
  okN("tiroir toujours ouvert en changeant d'étape", await page.locator('text=Bloc-notes du rendez-vous').count() > 0);
  const cote = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('div.fixed.inset-0 div.bg-white')];
    const card = cards.find(c => /Renseigner le client|État civil/.test(c.textContent) && c.getBoundingClientRect().width > 400);
    if (!card) return 'CARD_ABSENTE';
    const r = card.getBoundingClientRect();
    return { right: Math.round(r.right), win: window.innerWidth };
  });
  console.log('DBG cote:', JSON.stringify(cote));
  okN('fenêtre décalée à gauche — aucun recouvrement', cote && cote.right <= cote.win - 380);
  await page.locator('button:has-text("×")').first().click();
  await page.waitForTimeout(300);

  // Étape 2 : Famille — 2 enfants (27 et 17 ans), pension perçue 300 + versée 900
  await page.locator('button:has-text("Famille")').first().click();
  await page.waitForTimeout(600);
  await page.locator('text=Avez-vous des enfants ?').locator('xpath=following::button[normalize-space()="Oui"][1]').click();
  await page.waitForTimeout(400);
  await mod.locator('button:text-is("2")').first().click();
  await page.waitForTimeout(400);
  const an = new Date().getFullYear();
  await setNative(page, page.locator('input[placeholder="Prénom"]:visible').nth(0), 'Aina');
  await setNative(page, page.locator('input[placeholder="2012"]:visible').nth(0), String(an - 27));
  await setNative(page, page.locator('input[placeholder="Prénom"]:visible').nth(1), 'Tom');
  await setNative(page, page.locator('input[placeholder="2012"]:visible').nth(1), String(an - 17));
  await page.waitForTimeout(300);
  await page.locator('text=Percevez-vous ou versez-vous une pension alimentaire ?').locator('xpath=following::button[normalize-space()="Oui"][1]').click();
  await page.waitForTimeout(400);
  await setNative(page, page.locator('div:text-is("Pension perçue")').first().locator('xpath=..//input').first(), '300');
  await setNative(page, page.locator('div:text-is("Pension versée")').first().locator('xpath=..//input').first(), '900');
  await page.waitForTimeout(300);
  await repondreNonPartout(page);
  // Étape 3 : Activité — salarié 110 000 €/an ≈ 9 167 €/mois
  await page.locator('button:has-text("Activité & revenus")').first().click();
  await page.waitForTimeout(600);
  await mod.locator('button:has-text("Salarié")').first().click();
  await page.waitForTimeout(400);
  await setNative(page, page.locator('span:text-is("Salaire fixe")').first().locator('xpath=ancestor::div[2]//input[not(@type="range")]').first(), '110000');
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
  ok('bloc logement : « Logé(e) à titre gratuit » affiché', /Logé\(e\) à titre gratuit/.test(T));
  ok("note forfait 600 € nommée + suppression à l'achat RP", /forfait de 600 €\/mois retenu dans l'endettement/.test(T) && /disparaît en cas d'achat de la résidence principale/.test(T));
  ok('mensualité dispo : « achat RP (forfait logement supprimé) »', /achat RP \(forfait logement supprimé\)/.test(T));
  /* 18/09/2026 — ASSERTION PÉRIMÉE, CORRIGÉE. Elle cherchait « forfait logement de
     600 € disparaît à l'achat » dans la SYNTHÈSE du premier rendez-vous. Cette phrase
     n'y est pas et n'y a jamais été : elle appartient aux PUCES DE CAPACITÉ du volet
     « Simulation et plan d'action » (RDV 2). Ce banc n'étant pas appelé par verif.sh,
     l'échec dormait. Ce que le constat porte réellement pour un client logé à titre
     gratuit, c'est le libellé des charges engagées. */
  ok("charges engagées : le forfait du logement à titre gratuit est nommé",
     /forfait logé à titre gratuit|forfait logement/.test(T));
  ok('synthèse : bloc « Notes du rendez-vous » présent', /Notes du rendez-vous/i.test(T));
  ok('synthèse : contenu des notes repris (2 lignes)', /Client tres presse - relancer sur la prevoyance en septembre\./.test(T) && /Prevoir simulation PER au prochain RDV\./.test(T));
  /* 18/09/2026 (CGP) : « peux-tu mettre les notes qui sont prises au-dessus des
     questions ? » — contrôle de POSITION dans l'ordre de lecture du document. */
  {
    const iN = T.search(/notes du rendez-vous/i);
    const iQ = T.search(/(^|\n)les questions[ \t]*\n/i);
    console.log('ORDRE NOTES/QUESTIONS:', JSON.stringify({ notes: iN, questions: iQ }));
    ok('les notes du rendez-vous précèdent les questions', iN !== -1 && iQ !== -1 && iN < iQ);
  }
  ok('AUCUN NaN', !/NaN/.test(T));
  console.log('PAGEERRORS:', errs.length ? errs.join(' | ') : 'aucune');
  await browser.close();
})().catch(e => { console.error('CRASH', e); process.exit(1); });
