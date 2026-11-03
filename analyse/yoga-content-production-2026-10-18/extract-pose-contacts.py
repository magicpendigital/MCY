"""Read 13 local pose originals; derive private research frames, never learner assets."""
from pathlib import Path
import csv
import hashlib
import json
import re
import subprocess
import sys

BASE = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE / "tools"))
from imageio_ffmpeg import get_ffmpeg_exe
from PIL import Image, ImageDraw, ImageFont

SOURCE_ROOT = Path(r"D:\nilaza\documents\Tư thế lẻ")
OUTPUT = BASE / "private-evidence" / "pose-contacts"
OUTPUT.mkdir(parents=True, exist_ok=True)
INVENTORY = BASE.parent / "uiux-audit-2026-09-26" / "media-inventory-2026-09-27.csv"
FRACTIONS = [0.05, 0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.8, 0.95]
FFMPEG = get_ffmpeg_exe()
font = ImageFont.truetype(r"C:\Windows\Fonts\arial.ttf", 18)
small_font = ImageFont.truetype(r"C:\Windows\Fonts\arial.ttf", 14)
rows = [r for r in csv.DictReader(INVENTORY.open(encoding="utf-8-sig")) if r["group"] == "Tư thế lẻ"]
assert len(rows) == 13
args = sys.argv[1:]
if args == ["--crow-only"]:
    rows = [r for r in rows if r["file"] == "Quạ thấp.mov"]
elif args:
    raise SystemExit("Only --crow-only is supported")
records = []
for row in rows:
    source = SOURCE_ROOT / row["file"]
    assert source.is_file() and source.resolve().parent == SOURCE_ROOT.resolve()
    info = subprocess.run([FFMPEG, "-hide_banner", "-i", str(source)], capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=20)
    match = re.search(r"Duration: (\d+):(\d+):([\d.]+)", info.stderr)
    assert match, "Source duration is unavailable"
    duration = int(match[1]) * 3600 + int(match[2]) * 60 + float(match[3])
    stem = source.stem
    frames = []
    for idx, fraction in enumerate(FRACTIONS, 1):
        at = round(duration * fraction, 3)
        target = OUTPUT / f"{stem}-frame-{idx:02d}.jpg"
        result = subprocess.run(
            [FFMPEG, "-hide_banner", "-loglevel", "error", "-ss", str(at), "-i", str(source), "-frames:v", "1", "-vf", "scale=270:-1", "-q:v", "3", "-y", str(target)],
            capture_output=True, timeout=30,
        )
        if result.returncode:
            raise RuntimeError(f"Frame extraction failed: {source.name}, frame {idx}; exit {result.returncode}")
        with Image.open(target) as image:
            assert image.width == 270 and image.height > 200
        frames.append({"path": str(target.relative_to(BASE)), "requestedSeconds": at, "sha256": hashlib.sha256(target.read_bytes()).hexdigest()})
    sheet = Image.new("RGB", (3 * 284, 48 + 3 * 516), "#efeee9")
    draw = ImageDraw.Draw(sheet)
    draw.text((10, 10), f"{source.name} — research samples, not review approval", fill="#202c24", font=font)
    for index, frame in enumerate(frames):
        x = (index % 3) * 284 + 7
        y = 48 + (index // 3) * 516
        with Image.open(BASE / frame["path"]) as image:
            sheet.paste(image, (x, y))
        draw.text((x, y + 484), f"{frame['requestedSeconds']:.3f}s (requested)", fill="#202c24", font=small_font)
    sheet_path = OUTPUT / f"{stem}-contact.jpg"
    sheet.save(sheet_path, quality=90)
    records.append({
        "sourcePath": str(source), "sourceSha256": hashlib.sha256(source.read_bytes()).hexdigest(),
        "durationSecondsFromDecoder": duration, "durationSecondsFromHistoricalInventory": float(row["duration_seconds"]), "contactPath": str(sheet_path.relative_to(BASE)),
        "contactSha256": hashlib.sha256(sheet_path.read_bytes()).hexdigest(), "frames": frames,
        "youtubeBinding": "unverified", "purpose": "private_editorial_identity_research_only", "expertApproved": False,
    })
    print(json.dumps({"source": source.name, "samples": len(frames), "contact": str(sheet_path)}, ensure_ascii=False), flush=True)
manifest_path = OUTPUT / ("crow-probe-manifest.json" if args else "manifest.json")
manifest_path.write_text(json.dumps({"decoder": "imageio-ffmpeg 0.6.0 (bundled ffmpeg)", "records": records}, ensure_ascii=False, indent=2), encoding="utf-8")
