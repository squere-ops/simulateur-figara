#!/usr/bin/env python3
"""Regenere _test_proj.html a partir de index.html.

Le harnais isole le composant NcProjection avec des stubs (ncCalcFisc,
ncDetailRNI) et un dossier de test. Il DOIT etre regenere apres chaque
modification du composant : sinon on teste une copie figee.
"""
import io, re

SRC = 'index.html'
DST = '_test_proj.html'

import os, sys
s = io.open(SRC, encoding='utf-8').read()
if not os.path.exists(DST):
    print("HARNAIS MANQUANT : le gabarit _test_proj.html (tete vendors+helpers, pied dossier D) "
          "n'est pas dans le depot — a reconstruire (voir TODO.md). Rien a regenerer.")
    sys.exit(2)
old = io.open(DST, encoding='utf-8').read()

def grab(name):
    i = s.index("function " + name + "(")
    # fin de la liste de parametres — sans quoi une destructuration ({ d, synth })
    # ferme le comptage d accolades des la premiere et tronque le corps
    pi = s.index("(", i); pd = 0; pk = pi
    while True:
        if s[pk] == "(": pd += 1
        elif s[pk] == ")": pd -= 1
        if pd == 0: break
        pk += 1
    j = s.index("{", pk); d = 0; k = j
    while True:
        if s[k] == "{": d += 1
        elif s[k] == "}": d -= 1
        if d == 0: break
        k += 1
    return s[i:k + 1]

FONCS = ["ncpCapM", "ncpCrd", "ncpCrdApres", "ncpDureeRestante", "ncpAmortAnnuel",
         "ncpFoncierNuReel", "ncpMeubleReel", "ncpReducIR", "ncpPvMeuble", "ncpCap",
         # 10/09 : page de garde (ncCapNom) et succession a l horizon (ncCalcSuccession)
         "ncCapNom", "ncBaremeSucc", "ncCalcSuccession", "ncProjetRP", "NcProjection"]
corps = []
for f in FONCS:
    try:
        corps.append(grab(f))
    except ValueError:
        print("  ! fonction absente de index.html :", f)

# constantes de module utilisees par le composant
consts = []
# ncEstTNSActs / ncTauxRemplacement / ncPensionPerso restent des STUBS dans la
# tete du harnais : seule la logique NOUVELLE (ncPensionFoyer) est extraite du
# fichier reel, pour limiter la surface d extraction fragile.
for pat in [r'const ncNbsp = [^;]*;', r'const ncPrecoParts = \([\s\S]*?\n    \};', r'const ncPrecaution = \([\s\S]*?\n    \};', r'const NCP_C = \{[\s\S]*?const Alerte = \([\s\S]*?\n    \);', r'const ncPensionFoyer = \([\s\S]*?\n    \};', r'const NCP_CAP_EP = \{[^}]*\};', r'const NCP_MICRO_SEUIL = [^;]*;', r'const NCP_MICRO_ABATT = [^;]*;', r'const NCP_REGIMES = \{[\s\S]*?\n    \};', r'const ncTit = [^;]*;', r'const ncQuotPart = \([\s\S]*?\n    \};', r'const ncQuotDefaut = \([\s\S]*?\n    \};', r'const ncQuotitesConnues = \([\s\S]*?\n    \};', r'const ncAgeDate = \([\s\S]*?\n    \};', r'const ncUsufruitPct = [^;]*;', r'const NC_SUCC_TRANCHES = \[[\s\S]*?\];']:
    m = re.search(pat, s)
    if m: consts.append(m.group(0))
    else: print("  ! constante absente :", pat)

# en-tete du harnais : tout jusqu'au premier "function ncpCapM"
# l ancre doit couvrir TOUTES les constantes reinjectees, sinon celles deja
# presentes dans la tete sont declarees deux fois (SyntaxError silencieuse)
tete = old[:re.search(r"^ *const ncNbsp = |^ *const NCP_CAP_EP = |^ *function ncpCapM\(", old, re.M).start()]
# pied : a partir de "\nconst D = {"
pied = old[old.index("\nconst D = {"):]

# retirer de la tete l ancienne declaration de NCP_CAP_EP (reinjectee ci-dessous)
tete = re.sub(r'\n *const NCP_CAP_EP = \{[^}]*\};', '', tete)

out = tete + "\n".join("    " + c for c in consts) + "\n\n" + "\n\n".join(corps) + "\n" + pied
io.open(DST, 'w', encoding='utf-8').write(out)
print("_test_proj.html regenere depuis index.html —", len(FONCS), "fonctions,", len(consts), "constantes")
