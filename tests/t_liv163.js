const { chromium } = require('playwright');
const setNative = async (page, el, value) => {
  await el.evaluate((node, v) => {
    const proto = node.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(node, v);
    node.dispatchEvent(new Event('input', { bubbles: true }));
    node.dispatchEvent(new Event('change', { bubbles: true }));
  }, value);
};
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage({ viewport: { width: 1500, height: 1000 } });
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
  await page.locator('button, [role=button]').filter({ hasText: /Fiche rapide/i }).first().click();
  await page.waitForTimeout(600);
  const mod = page.locator('div.fixed.inset-0').last();
  await setNative(page, page.locator('input[placeholder="DUPONT"]:visible').last(), 'TESTLIV');
  await setNative(page, page.locator('input[placeholder="Marie"]:visible').last(), 'Loulou');
  await mod.locator('button:has-text("Enregistrer")').first().click();
  await page.waitForTimeout(900);
  // Fermer le modal « Nouveau scénario » s'il est ouvert
  const ann = page.locator('div.fixed.inset-0 button:has-text("Annuler")');
  if (await ann.count()) { try { await ann.last().click({ timeout: 2000 }); } catch (e) {} }
  await page.waitForTimeout(400);
  // Avancer jusqu'au comparatif
  for (let k = 0; k < 6; k++) {
    const dec = await page.locator('text=Détail de la simulation en cas de décès').count();
    if (dec) break;
    const cont = page.locator('button:has-text("Continuer")').last();
    if (await cont.count()) { try { await cont.click({ timeout: 3000 }); } catch (e) { break; } }
    await page.waitForTimeout(900);
  }
  await page.waitForTimeout(800);
  const ok = (l, c) => console.log((c ? 'OK  ' : 'FAIL') + ' — ' + l);
  const body = await page.evaluate(() => document.body.innerText.replace(/[  ]/g, ' '));
  ok('section « en cas de décès » atteinte', /en cas de décès/i.test(body));
  const seg = body.slice(body.search(/DÉTAIL DE LA SIMULATION EN CAS DE DÉCÈS/i));
  const num = (re) => { const m = seg.match(re); return m ? parseInt(m[1].replace(/[ .]/g, ''), 10) : null; };
  // Première carte de la section = LIVRET
  const cap = num(/Capital à transmettre\s*\n\s*([\d .]+) €/);
  const droits = num(/Droits de succession\s*\n\s*−\s*([\d .]+) €/);
  const net = num(/CAPITAL NET POUR LES HÉRITIERS\s*\n\s*([\d .]+) €/i);
  ok('livret : AUCUN abattement (ligne Abattement à 0 €)', /Abattement\s*\n\s*0 €/.test(seg));
  ok('livret : mention « Aucun abattement — taux forfaitaire de 30 % »', /Aucun abattement — droits au taux forfaitaire de 30 %/.test(seg));
  ok('livret : PAS de barème art. 777 ni art. 779 sur la carte livret', !/art\. 779/.test(seg.slice(0, seg.indexOf('Capital à transmettre', seg.indexOf('Capital à transmettre') + 1))));
  const attendu = Math.round(cap * 0.30);
  ok(`livret : droits = capital × 30 % (${droits} €, attendu ≈ ${attendu} €)`, droits != null && Math.abs(droits - attendu) <= 2);
  ok('livret : net héritiers = capital − droits', net != null && cap != null && Math.abs((cap - droits) - net) <= 2);
  ok('AV : abattement 152 500 € × 2 et droits 0 € (inchangée)', /152 500 € × 2 bénéf\./.test(seg) && /Droits de succession\s*\n\s*0 €/.test(seg));
  // Capture visuelle de la carte livret
  const el = page.locator('text=Détail de la simulation en cas de décès').first();
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'shot_v163_deces.png' });
  console.log('PAGEERRORS:', errs.length ? errs.join(' | ') : 'aucune');
  await browser.close();
})().catch(e => { console.error('CRASH', e); process.exit(1); });
