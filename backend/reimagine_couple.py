"""Transform the couple's real photos into traditional South Indian wedding portraits.

Uses Gemini Nano Banana (image editing) to keep the face/identity from the
uploaded photos and re-dress the couple in traditional South Indian wedding
attire that matches the invitation's palette.
"""

import asyncio
import base64
import os
from pathlib import Path

from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage, FileContentWithMimeType

load_dotenv(Path(__file__).parent / ".env")

OUT = Path("/app/frontend/public/gen")
OUT.mkdir(parents=True, exist_ok=True)
MODEL = "gemini-3.1-flash-image-preview"
API_KEY = os.getenv("EMERGENT_LLM_KEY")

JOBS = {
    "groom": {
        "source": "/tmp/couple/A.jpg",
        "prompt": (
            "IMPORTANT: The person in the reference photo is a MALE / MAN. "
            "Keep him as a MAN — do NOT change his gender. Preserve his "
            "exact facial features, moustache, hairstyle, skin tone and "
            "identity. Restyle this same man as a traditional South Indian "
            "wedding GROOM (bridegroom). Dress him in a rich cream and gold "
            "silk kurta (long sleeved) with a gold-bordered silk "
            "angavastram / uttariya draped over one shoulder, and a "
            "traditional white and gold mundu. Give him a small red tilak "
            "on the forehead and a jasmine garland (varmala) around his "
            "neck. Set the background as a warmly lit Kerala temple "
            "mandap with brass diyas, marigold garlands and soft golden "
            "bokeh. Cinematic warm lighting, photorealistic portrait "
            "photograph, portrait orientation, sharp focus on his face, "
            "no text, no other people."
        ),
    },
    "bride": {
        "source": "/tmp/couple/B.jpg",
        "prompt": (
            "Restyle this exact same woman, keeping her facial features, "
            "hairstyle length and identity absolutely unchanged, as a "
            "traditional South Indian wedding bride. Dress her in a rich "
            "deep-red and gold Kanjivaram silk saree with elaborate zari "
            "border, ornate temple jewellery (long necklace, jhumka "
            "earrings, maang tikka and nose ring), a delicate red bindi, "
            "fresh jasmine flowers braided into her hair. Set the "
            "background as a warmly lit Kerala temple mandap with brass "
            "diyas, marigold garlands and soft golden bokeh. Cinematic "
            "warm lighting, photorealistic, portrait orientation, sharp "
            "focus on her face, no text."
        ),
    },
}


async def run(name: str, source: str, prompt: str) -> None:
    out_path = OUT / f"{name}.png"
    chat = (
        LlmChat(
            api_key=API_KEY,
            session_id=f"jv-portrait-{name}",
            system_message="You are an expert wedding portrait photographer and image editor.",
        )
        .with_model("gemini", MODEL)
        .with_params(modalities=["image", "text"])
    )
    msg = UserMessage(
        text=prompt,
        file_contents=[FileContentWithMimeType(file_path=source, mime_type="image/jpeg")],
    )
    print(f"[gen ] {name}")
    text, images = await chat.send_message_multimodal_response(msg)
    if not images:
        print(f"[warn] {name}: no images. text response = {text!r}")
        raise RuntimeError(f"No image returned for {name}")
    img_bytes = base64.b64decode(images[0]["data"])
    out_path.write_bytes(img_bytes)
    print(f"[ok  ] {name}: {out_path} ({len(img_bytes)//1024} KB)")


async def main() -> None:
    for name, cfg in JOBS.items():
        out_path = OUT / f"{name}.png"
        if out_path.exists():
            print(f"[skip] {name}")
            continue
        await run(name, cfg["source"], cfg["prompt"])


if __name__ == "__main__":
    asyncio.run(main())
