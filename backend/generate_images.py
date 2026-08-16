"""One-off image generation for the Jyoti & Vishnu wedding invitation.

Runs Gemini Nano Banana (`gemini-3.1-flash-image-preview`) via
`emergentintegrations` and saves the output PNG files into
`/app/frontend/public/gen/` so they can be served as static assets.
"""

import asyncio
import base64
import os
from pathlib import Path

from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage

load_dotenv(Path(__file__).parent / ".env")

OUT_DIR = Path("/app/frontend/public/gen")
OUT_DIR.mkdir(parents=True, exist_ok=True)

MODEL = "gemini-3.1-flash-image-preview"
API_KEY = os.getenv("EMERGENT_LLM_KEY")

# name -> prompt
PROMPTS = {
    "bride": (
        "Photorealistic portrait of a young South Indian bride in a red and gold "
        "Kanjivaram silk saree, ornate temple jewellery, jasmine flowers in her "
        "hair, warm candle-lit backdrop with soft bokeh, elegant traditional "
        "wedding photography, natural expression, close-up, no text."
    ),
    "groom": (
        "Photorealistic portrait of a young South Indian groom in a cream and "
        "gold silk kurta with a silk angavastram over his shoulder, gentle "
        "smile, ornate golden mandap backdrop with warm diyas and marigold "
        "garlands, traditional wedding photography, close-up, no text."
    ),
    "haldi": (
        "Photorealistic close-up of a South Indian haldi ceremony — bride's "
        "hands with turmeric paste being applied by family members, brass "
        "bowls of turmeric, marigold and jasmine, rich red and yellow drapes "
        "in the background, warm golden sunlight, traditional festive mood, "
        "no text."
    ),
    "sangeet": (
        "Photorealistic scene of a South Indian sangeet celebration — women "
        "in colourful silk sarees dancing joyfully under warm fairy lights and "
        "marigold garlands, blurred cinematic evening setting, deep maroon "
        "and gold color palette, motion, celebration, no text."
    ),
    "muhurtham": (
        "Photorealistic close-up of a South Indian muhurtham ritual — the "
        "sacred thali being tied around the bride's neck under a decorated "
        "mandap with marigold garlands and diyas, gentle golden light, priests' "
        "hands with sacred thread visible, warm devotional atmosphere, no text."
    ),
    "sadhya": (
        "Photorealistic top-down shot of a traditional Kerala sadhya on a "
        "fresh banana leaf — rice, avial, thoran, sambar, payasam, pickles "
        "and papadam beautifully arranged, warm ambient natural light, "
        "elegant food photography, no text."
    ),
    "closing": (
        "Photorealistic wide backdrop of a softly lit South Indian temple "
        "mandap at dusk — carved stone pillars decorated with lush orange "
        "and yellow marigold garlands, rows of warm brass diyas glowing on "
        "the steps, subtle golden bokeh in the background, deep maroon "
        "ambient light, wide cinematic composition, ornate, empty centre "
        "for text overlay, no text."
    ),
}


async def generate_one(name: str, prompt: str) -> None:
    out_path = OUT_DIR / f"{name}.png"
    if out_path.exists() and out_path.stat().st_size > 5_000:
        print(f"[skip] {name} already exists at {out_path}")
        return

    chat = LlmChat(
        api_key=API_KEY,
        session_id=f"jv-invitation-{name}",
        system_message="You are an expert wedding photographer.",
    ).with_model("gemini", MODEL).with_params(modalities=["image", "text"])

    print(f"[gen ] {name} …")
    _, images = await chat.send_message_multimodal_response(
        UserMessage(text=prompt)
    )
    if not images:
        print(f"[fail] {name}: no images returned")
        return
    img_bytes = base64.b64decode(images[0]["data"])
    out_path.write_bytes(img_bytes)
    print(f"[ok  ] {name}: {out_path} ({len(img_bytes) // 1024} KB)")


async def main() -> None:
    for name, prompt in PROMPTS.items():
        try:
            await generate_one(name, prompt)
        except Exception as exc:  # noqa: BLE001
            print(f"[err ] {name}: {exc}")


if __name__ == "__main__":
    asyncio.run(main())
