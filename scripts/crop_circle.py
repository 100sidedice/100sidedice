#!/usr/bin/env python3
"""Crop an image to a centered circle and save as PNG with transparency.
Usage: python3 scripts/crop_circle.py input.png output.png
"""
import sys
from PIL import Image, ImageDraw


def crop_circle(in_path, out_path):
    im = Image.open(in_path).convert("RGBA")
    w, h = im.size
    # Crop to square based on smallest dimension, centered
    side = min(w, h)
    left = (w - side) // 2
    top = (h - side) // 2
    right = left + side
    bottom = top + side
    im = im.crop((left, top, right, bottom))

    # Create mask
    mask = Image.new("L", (side, side), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0, side, side), fill=255)

    # Apply mask to alpha channel
    im.putalpha(mask)

    # Save as PNG
    im.save(out_path, format="PNG")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python3 scripts/crop_circle.py input.png output.png")
        sys.exit(1)
    crop_circle(sys.argv[1], sys.argv[2])
