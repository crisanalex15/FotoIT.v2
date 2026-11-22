"""Downscale portfolio and profile images for web."""

from pathlib import Path

from PIL import Image, ImageOps

PUBLIC = Path(__file__).resolve().parent.parent / "public"

PROFILE_MAX = 800
THUMB_MAX = 720
BIG_MAX = 1600
JPEG_QUALITY = 82


def save_jpeg(img: Image.Image, path: Path, quality: int = JPEG_QUALITY) -> int:
    img = ImageOps.exif_transpose(img)
    if img.mode in ("RGBA", "P"):
        img = img.convert("RGB")
    img.save(path, "JPEG", quality=quality, optimize=True, progressive=True)
    return path.stat().st_size


def resize_max(img: Image.Image, max_side: int) -> Image.Image:
    img.thumbnail((max_side, max_side), Image.Resampling.LANCZOS)
    return img


def process_file(path: Path, max_side: int) -> tuple[int, int]:
    before = path.stat().st_size
    with Image.open(path) as im:
        resized = resize_max(im.copy(), max_side)
        after = save_jpeg(resized, path)
    return before, after


def main() -> None:
    profile = PUBLIC / "profil.jpg"
    if profile.exists():
        b, a = process_file(profile, PROFILE_MAX)
        print(f"profil.jpg: {b/1024:.1f} KB -> {a/1024:.1f} KB")

    gallery = PUBLIC / "gallery"
    for path in sorted(gallery.glob("thumbnail*.jpg")):
        b, a = process_file(path, THUMB_MAX)
        print(f"gallery/{path.name}: {b/1024:.1f} KB -> {a/1024:.1f} KB")

    big_dir = gallery / "big"
    if big_dir.exists():
        for path in sorted(big_dir.glob("thumbnail*.jpg")):
            b, a = process_file(path, BIG_MAX)
            print(f"gallery/big/{path.name}: {b/1024:.1f} KB -> {a/1024:.1f} KB")


if __name__ == "__main__":
    main()
