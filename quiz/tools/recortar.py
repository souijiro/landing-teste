"""Recorta as ilustrações do quiz detectando as divisórias brancas.
Uso: python3 -I recortar.py <boleira.png> <jornada.png> <pasta_saida>"""
import sys
from PIL import Image
import numpy as np

def faixas(mask, minimo):
    """Retorna intervalos [ini,fim) onde mask é False (conteúdo) com tamanho >= minimo."""
    out, ini = [], None
    for i, b in enumerate(list(mask) + [True]):
        if not b and ini is None: ini = i
        if b and ini is not None:
            if i - ini >= minimo: out.append((ini, i))
            ini = None
    return out

def branco(arr):
    return (arr.min(axis=2) > 232)

def celulas(img, linhas, colunas):
    a = np.asarray(img.convert("RGB")).astype(int)
    w = branco(a)
    rows = faixas(w.mean(axis=1) > 0.75, a.shape[0] // (linhas * 3))
    assert len(rows) == linhas, rows
    res = []
    for (y0, y1) in rows:
        cols = faixas(w[y0:y1].mean(axis=0) > 0.75, a.shape[1] // (colunas * 3))
        assert len(cols) == colunas, cols
        for (x0, x1) in cols:
            # refina a borda de cada célula (linhas/colunas majoritariamente brancas)
            sub = w[y0:y1, x0:x1]
            r = faixas(sub.mean(axis=1) > 0.6, 10); c = faixas(sub.mean(axis=0) > 0.6, 10)
            yy0, yy1 = y0 + r[0][0], y0 + r[-1][1]
            xx0, xx1 = x0 + c[0][0], x0 + c[-1][1]
            m = 4  # margem para eliminar a borda anti-aliased
            res.append((xx0 + m, yy0 + m, xx1 - m, yy1 - m))
    return res

def salvar(img, caixas, prefixo, saida):
    for i, b in enumerate(caixas, 1):
        nome = f"{saida}/{prefixo}-{i:02d}.webp"
        img.crop(b).save(nome, "WEBP", quality=82, method=6)
        print(nome, b)

boleira, jornada, saida = sys.argv[1:4]
im1 = Image.open(boleira).convert("RGB"); salvar(im1, celulas(im1, 2, 5), "question", saida)
im2 = Image.open(jornada).convert("RGB"); salvar(im2, celulas(im2, 2, 2), "result", saida)
