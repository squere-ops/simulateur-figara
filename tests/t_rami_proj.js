const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined });
  const p = await b.newPage({ viewport: { width: 1300, height: 1000 } });
  const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0,200)));
  p.on('console', m => { if (m.type()==='error' && /render error/.test(m.text())) errs.push(m.text().slice(0,200)); });
  await p.goto('http://127.0.0.1:8899/_test_rami.html', { waitUntil: 'networkidle' });
  await p.waitForTimeout(1500);
  const cocher = (titre, veut) => p.evaluate(([t, v]) => { const el = Array.from(document.querySelectorAll('span')).find(e => e.textContent.trim() === t); if (!el) return 'introuvable'; const cb = el.closest('div[class*="rounded-xl"]').querySelector('input[type=checkbox]'); if (cb.checked !== v) cb.click(); return 'ok'; }, [titre, veut]);
  await cocher("Plan d'épargne retraite", true); await cocher("Assurance-vie", true); await cocher("Investissement locatif", true);
  await p.waitForTimeout(400);
  const sel = p.locator('select').filter({ has: p.locator('option:text-is("Bailleur privé (Jeanbrun)")') }).first();
  await sel.selectOption('jeanbrun'); await p.waitForTimeout(600);
  const T = await p.evaluate(() => document.body.innerText.replace(/[  ]/g, ' '));
  const grab = (re) => { const m = T.match(re); return m ? m[0].replace(/\n/g,' | ') : '?'; };
  console.log(grab(/300 à 500[\s\S]{0,600}/)); console.log('---');
  console.log(grab(/IMPÔT ÉCONOMISÉ PAR AN[\s\S]{0,100}/i)); console.log('---');
  console.log(grab(/d'impôt en moins sur[\s\S]{0,250}/)); console.log('---');
  console.log(grab(/Il manque[\s\S]{0,300}/)); console.log('---');
  console.log(grab(/VOTRE SITUATION[\s\S]{0,2200}/)); console.log('---');
  await p.screenshot({ path: process.argv[2] + '/proj_full.png', fullPage: true });
  // table screenshot
  const tab = p.locator('table').first(); await tab.scrollIntoViewIfNeeded(); await p.waitForTimeout(300);
  await tab.locator('xpath=..').screenshot({ path: process.argv[2] + '/proj_table.png' });
  // sticky bar visibility after scroll
  await p.evaluate(() => window.scrollTo(0, 1500)); await p.waitForTimeout(300);
  await p.screenshot({ path: process.argv[2] + '/proj_sticky.png' });
  console.log('ERRS', errs);
  await b.close();
})();
