"""Multi-page invitation PDF with clickable links preserved.

Uses Playwright's native `page.pdf()` (which preserves hyperlinks) to render
one section at a time by hiding all other sections, then merges the per-section
PDFs into a single multi-page document with pypdf.
"""

import asyncio
from pathlib import Path

from playwright.async_api import async_playwright
from pypdf import PdfReader, PdfWriter

URL = "https://indian-celebration-1.preview.emergentagent.com/"
OUT = Path("/app/frontend/public/downloads/jyoti-vishnu-invitation.pdf")
OUT.parent.mkdir(parents=True, exist_ok=True)
TMP = Path("/tmp/jv_pdf_pages")
TMP.mkdir(parents=True, exist_ok=True)

SECTIONS = [
    ("hero", "section.hero"),
    ("invocation", "[data-testid='invocation']"),
    ("families", "#story"),
    ("schedule", "#weekend"),
    ("venue", "#venue"),
    ("rsvp", ".rsvp-band"),
    ("closing", "[data-testid='closing-band']"),
]
VIEWPORT_W = 1280


async def render_section(page, selector: str, out_path: Path) -> None:
    """Hide every other section, snapshot the target as a native PDF page."""
    all_selectors = [sel for (_, sel) in SECTIONS]
    await page.evaluate(
        """({active, all}) => {
            // reset any previous hiding
            document.querySelectorAll('[data-pdf-hidden="1"]').forEach(el => {
                el.style.removeProperty('display');
                el.removeAttribute('data-pdf-hidden');
            });
            // hide ambient page-wide ornaments (they use huge top offsets and inflate scrollHeight)
            const orn = document.querySelector('.page-ornaments');
            if (orn) { orn.style.display = 'none'; orn.setAttribute('data-pdf-hidden','1'); }
            for (const sel of all) {
                if (sel === active) continue;
                document.querySelectorAll(sel).forEach(el => {
                    el.style.display = 'none';
                    el.setAttribute('data-pdf-hidden', '1');
                });
            }
        }""",
        {"active": selector, "all": all_selectors},
    )
    await page.wait_for_timeout(200)
    height = await page.evaluate(
        """(sel) => {
            const el = document.querySelector(sel);
            if (!el) return 0;
            // use the taller of the section box and the current document height
            const rect = el.getBoundingClientRect();
            const docH = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
            return Math.ceil(Math.max(rect.height, docH));
        }""",
        selector,
    )
    if not height:
        raise RuntimeError(f"Section not found: {selector}")

    await page.pdf(
        path=str(out_path),
        print_background=True,
        width=f"{VIEWPORT_W}px",
        height=f"{height}px",
        margin={"top": "0", "bottom": "0", "left": "0", "right": "0"},
        prefer_css_page_size=False,
    )


async def main() -> None:
    per_page_pdfs: list[Path] = []
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        ctx = await browser.new_context(
            viewport={"width": VIEWPORT_W, "height": 900},
        )
        page = await ctx.new_page()
        await page.goto(URL, wait_until="networkidle", timeout=60_000)
        await page.emulate_media(media="screen")
        # kill animations so nothing is captured mid-frame
        await page.add_style_tag(
            content="*,*::before,*::after{animation:none!important;transition:none!important}"
        )
        # scroll once so lazy content (map iframe) paints
        await page.evaluate(
            "async () => { const h = document.body.scrollHeight; "
            "for (let y = 0; y < h; y += 400) { window.scrollTo(0, y); "
            "await new Promise(r => setTimeout(r, 90)); } window.scrollTo(0, 0); }"
        )
        await page.evaluate(
            "() => Promise.all(Array.from(document.images).map(img => img.complete ? null : "
            "new Promise(r => { img.onload = img.onerror = r; })))"
        )
        await page.wait_for_timeout(1200)

        for name, sel in SECTIONS:
            out = TMP / f"{name}.pdf"
            print(f"→ {name}")
            await render_section(page, sel, out)
            per_page_pdfs.append(out)

        await browser.close()

    # Merge into a single multi-page PDF (preserves internal link annotations)
    writer = PdfWriter()
    for pth in per_page_pdfs:
        reader = PdfReader(str(pth))
        for pg in reader.pages:
            writer.add_page(pg)
    with open(OUT, "wb") as f:
        writer.write(f)
    print(f"Saved: {OUT} ({OUT.stat().st_size // 1024} KB, {len(per_page_pdfs)} pages)")


if __name__ == "__main__":
    asyncio.run(main())
