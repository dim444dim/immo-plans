"""Génère les icônes PNG de la PWA ImmoViz 3D à partir du design du manifest
(fond #159500, texte "3D" blanc en gras).

Usage : python generate_icons.py
Régénère icon-192.png, icon-512.png, icon-maskable-192.png,
icon-maskable-512.png et apple-touch-icon.png dans ce dossier.
"""

from PIL import Image, ImageDraw, ImageFont

BG = "#159500"
FG = "#ffffff"
FONT_PATH = r"C:\Windows\Fonts\arialbd.ttf"


def make_icon(path, size, safe_zone_ratio=1.0):
    img = Image.new("RGB", (size, size), BG)
    draw = ImageDraw.Draw(img)

    # Le texte occupe la "safe zone" (1.0 = plein cadre, <1.0 = pour les icônes maskable)
    font_size = int(size * 0.6 * safe_zone_ratio)
    font = ImageFont.truetype(FONT_PATH, font_size)

    text = "3D"
    bbox = draw.textbbox((0, 0), text, font=font)
    w, h = bbox[2] - bbox[0], bbox[3] - bbox[1]
    x = (size - w) / 2 - bbox[0]
    y = (size - h) / 2 - bbox[1]
    draw.text((x, y), text, fill=FG, font=font)

    img.save(path, "PNG")
    print(f"OK {path} ({size}x{size}, safe_zone={safe_zone_ratio})")


if __name__ == "__main__":
    make_icon("icon-192.png", 192, safe_zone_ratio=1.0)
    make_icon("icon-512.png", 512, safe_zone_ratio=1.0)
    # Maskable : le contenu important reste dans le cercle central de 80%
    make_icon("icon-maskable-192.png", 192, safe_zone_ratio=0.8)
    make_icon("icon-maskable-512.png", 512, safe_zone_ratio=0.8)
    # Apple touch icon : iOS arrondit lui-même les coins, on garde une petite marge
    make_icon("apple-touch-icon.png", 180, safe_zone_ratio=0.85)
