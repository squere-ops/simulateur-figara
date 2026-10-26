#!/usr/bin/env python3
"""Taux de remplissage de chaque page d'un PDF (en %), une ligne par page.

Remplace pdftoppm + Pillow (absents sur le Mac) par PyMuPDF, installable d'une commande :
    python3 -m pip install pymupdf
Mesure : dernier pixel encré de la zone de contenu (les 10 % du bas — pied de page fixe —
sont exclus), rapporté à la hauteur utile. Même règle que l'ancien script.
"""
import sys
try:
    import fitz  # PyMuPDF
except ImportError:
    print("PYMUPDF MANQUANT : python3 -m pip install pymupdf", file=sys.stderr); sys.exit(3)
doc = fitz.open(sys.argv[1])
for page in doc:
    pix = page.get_pixmap(matrix=fitz.Matrix(60 / 72, 60 / 72), colorspace=fitz.csGRAY, alpha=False)
    w, h, s = pix.width, pix.height, pix.samples
    hmax = int(h * 0.90); d = 0
    for y in range(hmax - 1, -1, -1):
        row = s[y * w:(y + 1) * w]
        if any(row[x] < 242 for x in range(0, w, 3)):
            d = y; break
    print(round(d / hmax * 100))
