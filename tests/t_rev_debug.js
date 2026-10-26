const { chromium } = require('playwright');
const setNative = async (el, value) => el.evaluate((node, v) => {
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(node, v);
  node.dispatchEvent(new Event('input', { bubbles: true })); node.dispatchEvent(new Event('change', { bubbles: true }));
}, value);
const jsClick = (page, re) => page.evaluate((src) => { const r = new RegExp(src, 'i'); const b = [...document.querySelectorAll('button')].find(e => e.offsetParent !== null && r.test(e.innerText.trim())); if (b) { b.click(); return true; } return false; }, re);
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
  const errs = [];
  page.on('pageerror', e => { if (!/tailwind/.test(String(e))) errs.push(String(e).slice(0, 200)); });
  page.on('console', m => { if (m.type() === 'error' && /FIGARA\] render error/.test(m.text())) errs.push(m.text().slice(0, 200)); });
  await page.goto('http://localhost:8899/test_local.html', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(4000); console.log('page chargée');
  const inps = page.locator('input:visible'); const n = await inps.count();
  for (let i = 0; i < Math.min(n, 2); i++) await setNative(inps.nth(i), 'Test');
  await jsClick(page, '^Accéder au simulateur'); await page.waitForTimeout(1500);
  await jsClick(page, '^DUPONT Marie'); await page.waitForTimeout(600);
  await jsClick(page, '^Continuer'); await page.waitForTimeout(900);
  console.log('bouton REVERSE trouvé :', await jsClick(page, 'REVERSE')); await page.waitForTimeout(900);
  const lire = async () => page.evaluate(() => {
    const T = document.body.innerText.replace(/[\u00a0\u202f\u2009]/g, ' ');
    const g = (re) => { const m = T.match(re); return m ? m[1] : '?'; };
    return { pp: g(/Épargne mensuelle à prévoir\s*\n\s*([\d ]+ €)/i), capNec: g(/Capital nécessaire\s*\n\s*([\d ]+ €)/i), capAtt: g(/Capital atteint\s*\n\s*([\d ]+ €)/i), total: g(/Total investi\s*\n\s*([\d ]+ €)/i) };
  });
  console.log(await page.evaluate(() => { const T = document.body.innerText.replace(/[  ]/g, ' '); const i = T.indexOf('Quel effort'); return (i < 0 ? 'MODALE ABSENTE — ' : '') + T.slice(Math.max(0,i), Math.max(0,i) + 1500).replace(/\n/g, ' | '); }));
  const fraisInp = page.locator('input[step="0.25"]').last(); console.log('nb inputs step 0.25 :', await page.locator('input[step="0.25"]').count());
  console.log('champ frais présent :', await fraisInp.count(), '| valeur :', await fraisInp.inputValue());
  for (const v of ['4.75', '0', '2', '10', '4,75']) {
    await setNative(fraisInp, v); await page.waitForTimeout(400);
    console.log(`frais saisi "${v}" → lu "${await fraisInp.inputValue()}" →`, JSON.stringify(await lire()));
  }
  await fraisInp.click({ clickCount: 3 }); await page.keyboard.type('1'); await page.waitForTimeout(400);
  console.log('frappe clavier "1" →', await fraisInp.inputValue(), JSON.stringify(await lire()));
  console.log('ERREURS:', errs.length ? errs.join(' || ') : 'aucune');
  await browser.close();
})();
