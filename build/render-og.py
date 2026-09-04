"""Genera assets/og.jpg (1200×630) desde build/og.html. Uso: ~/.cache/hermes-pw-venv/bin/python build/render-og.py"""
import asyncio, os
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={"width": 1200, "height": 630}, device_scale_factor=2)
        await pg.goto("file://" + os.path.join(HERE, "og.html"))
        await pg.wait_for_load_state("networkidle"); await pg.evaluate("document.fonts.ready")
        await pg.wait_for_timeout(500)
        png = os.path.join(HERE, "og@2x.png")
        await pg.screenshot(path=png); await b.close()
    out = os.path.join(ROOT, "assets", "og.jpg")
    try:  # el venv de Playwright puede no traer Pillow: en mac cae a sips
        from PIL import Image
        Image.open(png).convert("RGB").resize((1200, 630), Image.LANCZOS).save(out, quality=88, optimize=True)
    except ImportError:
        import subprocess
        subprocess.run(["sips", "-s", "format", "jpeg", "-s", "formatOptions", "88",
                        "-z", "630", "1200", png, "--out", out], check=True, capture_output=True)
    os.remove(png); print("assets/og.jpg listo")
asyncio.run(main())
