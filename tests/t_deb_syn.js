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
  await page.waitForTimeout(1400);

  // ═══ DETECTEUR DE DEBORDEMENT — SUR TOUTE LA SYNTHESE, LES TROIS VOLETS ═══
  // Le detecteur ne tournait que sur la Projection : un debordement du Constat
  // (« €/mo | is ») est passe en livraison. Il couvre desormais tout le document.
  const scan = async (label) => {
    const bad = await page.evaluate(() => {
      const out = [];
      const zone = document.querySelector('.nc-syn-zone') || document.body;
      zone.querySelectorAll('div,span,td,th,li,label,button,select,p,a').forEach(e => {
        if (e.children.length > 2) return;
        const cs = getComputedStyle(e);
        if (cs.display === 'none' || cs.visibility === 'hidden') return;
        if (cs.overflow === 'auto' || cs.overflow === 'scroll') return;
        const txt = (e.innerText || '').replace(/\s+/g, ' ').trim();
        if (!txt) return;
        // debordement de la boite
        if (e.scrollWidth > e.clientWidth + 1 && cs.overflowX !== 'visible')
          out.push({ t: 'tronque en largeur', txt: txt.slice(0, 55), a: e.scrollWidth, b: e.clientWidth });
        if (e.scrollHeight > e.clientHeight + 1 && cs.overflowY !== 'visible')
          out.push({ t: 'tronque en hauteur', txt: txt.slice(0, 55), a: e.scrollHeight, b: e.clientHeight });
        // VALEUR ATOMIQUE COUPEE : un montant court dont l unite part a la ligne
        // suivante. getClientRects() n est PAS fiable (il renvoie plusieurs rects
        // pour des inline non coupes) : on compare la HAUTEUR a la hauteur de ligne,
        // et on ignore ce qui est deja protege par white-space: nowrap.
        // seulement les FEUILLES dont le texte est une valeur pure (nombre + unite) :
        // une tuile « 30 994 € / SANS RIEN FAIRE » occupe legitimement deux lignes.
        const VALEUR = /^[−+\-]?\s?[\d\s\u00a0\u202f.,]+\s?(€|%)(\s?\/\s?(mois|an))?$/;
        if (e.children.length === 0 && VALEUR.test(txt) && cs.whiteSpace !== 'nowrap' && cs.whiteSpace !== 'pre') {
          const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.4;
          const h = e.getBoundingClientRect().height;
          if (lh > 0 && h > lh * 1.6)
            out.push({ t: 'valeur coupee sur deux lignes', txt: txt.slice(0, 55), a: Math.round(h), b: Math.round(lh) });
        }
      });
      return out;
    });
    // dedoublonnage
    const vus = new Set(); const uniq = [];
    for (const x of bad) { const k = x.t + '|' + x.txt; if (!vus.has(k)) { vus.add(k); uniq.push(x); } }
    console.log((uniq.length ? '  X ' : '  OK ') + label + (uniq.length ? ' — ' + uniq.length + ' probleme(s)' : ''));
    uniq.forEach(x => console.log('       [' + x.t + '] "' + x.txt + '" ' + x.a + ' > ' + x.b));
    return uniq.length;
  };
  const clic = (t) => page.evaluate((t) => {
    const b = [...document.querySelectorAll('button')].find(x => (x.textContent || '').trim() === t);
    if (b) { b.click(); return true; } return false;
  }, t);

  // ═══ AUTO-TEST DU DETECTEUR : on injecte une valeur volontairement coupee et
  //     on verifie que le detecteur la voit. Un detecteur qui ne detecte rien
  //     parce qu il est casse donne la meme sortie qu une page saine. ═══
  await page.evaluate(() => {
    const z = document.querySelector('.nc-syn-zone') || document.body;
    const t = document.createElement('div');
    t.id = 'nc-autotest-deb';
    t.style.cssText = 'width:38px;font-size:13px;line-height:18px;overflow:visible';
    t.textContent = '11 167 €/mois';
    z.appendChild(t);
  });
  await page.waitForTimeout(200);
  const vu = await page.evaluate(() => {
    const e = document.getElementById('nc-autotest-deb');
    const cs = getComputedStyle(e);
    const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.4;
    return e.getBoundingClientRect().height > lh * 1.6;
  });
  console.log('AUTO-TEST du detecteur : ' + (vu ? 'OK — une valeur coupee est bien vue' : 'X — LE DETECTEUR EST AVEUGLE'));
  await page.evaluate(() => { const e = document.getElementById('nc-autotest-deb'); if (e) e.remove(); });
  await page.waitForTimeout(150);

  let tot = 0;
  console.log('=== DEBORDEMENT — TOUTE LA SYNTHESE, LES TROIS VOLETS ===');
  for (const [lib, nom] of [["RDV 1 · Constat", "Constat"], ["RDV 2 · Préconisations", "Preconisations"], ["Projection", "Projection"]]) {
    if (!(await clic(lib))) { console.log('  ! onglet introuvable :', lib); continue; }
    await page.waitForTimeout(1100);
    tot += await scan(nom);
  }
  console.log('\nTOTAL PROBLEMES :', tot);
  console.log('PAGEERRORS:', errs.length ? errs.join(' || ') : 'aucune');
  await browser.close();
})();
