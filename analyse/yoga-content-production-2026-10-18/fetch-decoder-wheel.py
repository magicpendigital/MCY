"""Download one exact PyPI wheel with bounded byte ranges and verify PyPI digest."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
import hashlib
import json
import math
import time
import urllib.request

BASE = Path(__file__).resolve().parent
TARGET = BASE / "private-evidence" / "decoder-download"
TARGET.mkdir(parents=True, exist_ok=True)
NAME = "imageio_ffmpeg-0.6.0-py3-none-win_amd64.whl"
URL = "https://files.pythonhosted.org/packages/2c/c6/fa760e12a2483469e2bf5058c5faff664acf66cadb4df2ad6205b016a73d/" + NAME
SIZE = 31246824
EXPECTED = "02fa47c83703c37df6bfe4896aab339013f62bf02c5ebf2dce6da56af04ffc0a"
PARTS = 16
CHUNK = math.ceil(SIZE / PARTS)

def fetch(index):
    start = index * CHUNK
    end = min(SIZE - 1, (index + 1) * CHUNK - 1)
    path = TARGET / f"part-{index:02d}.bin"
    began = time.monotonic()
    request = urllib.request.Request(URL, headers={"Range": f"bytes={start}-{end}"})
    with urllib.request.urlopen(request, timeout=20) as response, path.open("wb") as output:
        assert response.status == 206
        assert response.headers.get("Content-Range") == f"bytes {start}-{end}/{SIZE}"
        while block := response.read(65536):
            if time.monotonic() - began > 240:
                raise TimeoutError("Range download exceeded bounded 240-second window")
            output.write(block)
    assert path.stat().st_size == end - start + 1
    print(json.dumps({"part": index, "bytes": path.stat().st_size, "seconds": round(time.monotonic() - began, 2)}), flush=True)
    return path

with ThreadPoolExecutor(max_workers=16) as pool:
    completed = list(pool.map(fetch, range(PARTS)))
wheel = TARGET / NAME
with wheel.open("wb") as output:
    for path in completed:
        output.write(path.read_bytes())
digest = hashlib.sha256(wheel.read_bytes()).hexdigest()
assert wheel.stat().st_size == SIZE and digest == EXPECTED
(TARGET / "download-receipt.json").write_text(json.dumps({"url": URL, "metadata": "https://pypi.org/pypi/imageio-ffmpeg/0.6.0/json", "size": SIZE, "sha256": digest, "verified": True}, indent=2), encoding="utf-8")
print(json.dumps({"wheel": str(wheel), "verified": True, "sha256": digest}), flush=True)
