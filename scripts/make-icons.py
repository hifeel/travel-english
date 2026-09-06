#!/usr/bin/env python3
"""Draw the PWA icons: a white paper plane on the brand blue.

Run from the repo root:  python3 scripts/make-icons.py
Regenerates icons/*.png plus the favicon and apple-touch-icon copies.
"""
import os

from PIL import Image, ImageDraw

BLUE = (37, 99, 235, 255)   # --primary / theme_color
WHITE = (255, 255, 255, 255)
WING = (191, 214, 255, 255)  # far wing, a shade down from white

# Paper plane in a 0..1 box, y pointing down.
TIP = (0.965, 0.045)
LEFT = (0.035, 0.475)
NOTCH = (0.395, 0.545)
TAIL = (0.455, 0.955)

SS = 4  # supersampling factor

# Bumped whenever the artwork changes. The filenames carry it so a CDN that
# still holds the previous icons cannot serve them under the new manifest --
# stale corrupt icons at the edge are exactly what broke installability once.
V = "v2"


def draw(size, plane_scale):
    """Render one icon. plane_scale is the plane's share of the canvas."""
    px = size * SS
    img = Image.new("RGBA", (px, px), BLUE)
    d = ImageDraw.Draw(img)

    span = px * plane_scale
    off = (px - span) / 2.0

    def pt(p):
        return (off + p[0] * span, off + p[1] * span)

    # Far wing first, then the near wing over it.
    d.polygon([pt(TIP), pt(LEFT), pt(NOTCH)], fill=WING)
    d.polygon([pt(TIP), pt(NOTCH), pt(TAIL)], fill=WHITE)

    return img.resize((size, size), Image.LANCZOS)


def main():
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.chdir(root)

    # purpose "any": the plane fills most of the tile.
    draw(192, 0.68).save("icons/icon-192-%s.png" % V)
    draw(512, 0.68).save("icons/icon-512-%s.png" % V)
    # purpose "maskable": keep the plane inside the 80% safe zone.
    draw(512, 0.48).save("icons/icon-maskable-512-%s.png" % V)

    for name in ("favicon.png", "apple-touch-icon.png"):
        draw(192, 0.68).save(name)

    for p in ("icons/icon-192-%s.png" % V, "icons/icon-512-%s.png" % V,
              "icons/icon-maskable-512-%s.png" % V, "favicon.png",
              "apple-touch-icon.png"):
        print("%-30s %d bytes" % (p, os.path.getsize(p)))


if __name__ == "__main__":
    main()
