"""Genera los iconos PNG de la app sin dependencias externas.

Uso: python3 herramientas/generar_iconos.py  (desde la carpeta mi-dieta)
Dibuja un cuadrado con degradé verde y un anillo blanco abierto (estilo anillo de actividad).
"""
import math
import os
import struct
import zlib

AQUI = os.path.dirname(os.path.abspath(__file__))
SALIDA = os.path.join(AQUI, "..", "icons")


def png(ancho, alto, pixeles):
    filas = b"".join(b"\x00" + bytes(pixeles[y * ancho * 4:(y + 1) * ancho * 4]) for y in range(alto))

    def trozo(tipo, datos):
        c = tipo + datos
        return struct.pack(">I", len(datos)) + c + struct.pack(">I", zlib.crc32(c) & 0xFFFFFFFF)

    return (b"\x89PNG\r\n\x1a\n"
            + trozo(b"IHDR", struct.pack(">IIBBBBB", ancho, alto, 8, 6, 0, 0, 0))
            + trozo(b"IDAT", zlib.compress(filas, 9))
            + trozo(b"IEND", b""))


def mezclar(a, b, t):
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))


def icono(tam, maskable=False):
    arriba = (52, 199, 89)     # verde sistema
    abajo = (20, 140, 70)
    blanco = (255, 255, 255)
    px = bytearray(tam * tam * 4)
    c = tam / 2
    escala = 0.78 if maskable else 1.0   # zona segura para iconos "maskable"
    r_ext = tam * 0.30 * escala
    grosor = tam * 0.085 * escala
    r_int = r_ext - grosor
    # el anillo deja un hueco arriba a la derecha (como un anillo casi completo)
    hueco_ini, hueco_fin = math.radians(-105), math.radians(-20)
    punto_r = grosor * 0.62
    ang_p = math.radians(-62.5)
    pr = (r_ext + r_int) / 2
    px_p, py_p = c + pr * math.cos(ang_p), c + pr * math.sin(ang_p)
    for y in range(tam):
        for x in range(tam):
            col = mezclar(arriba, abajo, y / (tam - 1))
            a = 255
            dx, dy = x + 0.5 - c, y + 0.5 - c
            d = math.hypot(dx, dy)
            ang = math.atan2(dy, dx)
            cobertura = 0.0
            if r_int - 1 <= d <= r_ext + 1 and not (hueco_ini < ang < hueco_fin):
                cobertura = max(0.0, min(1.0, r_ext + 0.5 - d, d - (r_int - 0.5)))
            # extremos redondeados del anillo
            for extremo in (hueco_ini, hueco_fin):
                ex, ey = c + pr * math.cos(extremo), c + pr * math.sin(extremo)
                de = math.hypot(x + 0.5 - ex, y + 0.5 - ey)
                cobertura = max(cobertura, max(0.0, min(1.0, grosor / 2 + 0.5 - de)))
            # punto (una hoja/semilla) en el hueco
            dp = math.hypot(x + 0.5 - px_p, y + 0.5 - py_p)
            cobertura = max(cobertura, max(0.0, min(1.0, punto_r + 0.5 - dp)))
            col = mezclar(col, blanco, cobertura)
            i = (y * tam + x) * 4
            px[i:i + 4] = bytes((col[0], col[1], col[2], a))
    return png(tam, tam, px)


if __name__ == "__main__":
    os.makedirs(SALIDA, exist_ok=True)
    for nombre, tam, mask in (("icon-192.png", 192, False), ("icon-512.png", 512, False),
                              ("icon-maskable-512.png", 512, True), ("apple-touch-icon.png", 180, False)):
        with open(os.path.join(SALIDA, nombre), "wb") as f:
            f.write(icono(tam, mask))
        print("ok", nombre)
