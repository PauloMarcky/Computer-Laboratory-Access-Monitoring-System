"""
CLAMS OCR worker.

This is NOT a web server. Express (services/scanner-service.js) starts it as a
child process and talks to it over stdin/stdout, one JSON object per line:

  in : {"id": 1, "image": "<base64 jpeg>"}
  out: {"id": 1, "scannedId": "24-10326", "raw": "..."}

Only JSON may be written to stdout. Debug output goes to stderr.
"""
import base64
import json
import os
import re
import sys

import cv2
import numpy as np
import pytesseract

# Path to tesseract.exe on Windows (override with the TESSERACT_CMD env var)
if os.environ.get("TESSERACT_CMD"):
    pytesseract.pytesseract.tesseract_cmd = os.environ["TESSERACT_CMD"]
elif os.name == "nt":
    pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

TESSERACT_CONFIG = r"--psm 11 -c tessedit_char_whitelist=0123456789-"

# Student ID format: 2 digits, hyphen, 5 digits  ->  24-10326
ID_PATTERN = re.compile(r"(?<!\d)(\d{2})\s*[-\u2013\u2014]?\s*(\d{5})(?!\d)")


def normalize_id(raw_text: str):
    """Returns NN-NNNNN (e.g. 24-10326) or None.
    Accepts 24-10326, 24 10326 and 2410326 (missing hyphen)."""
    m = ID_PATTERN.search(raw_text)
    if not m:
        return None
    return f"{m.group(1)}-{m.group(2)}"


def read_id(image_b64: str):
    data = base64.b64decode(image_b64)
    frame = cv2.imdecode(np.frombuffer(data, np.uint8), cv2.IMREAD_COLOR)
    if frame is None:
        return None, ""

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    # Upscale 2x, Tesseract is more accurate with larger text
    resized = cv2.resize(gray, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)

    raw = pytesseract.image_to_string(resized, config=TESSERACT_CONFIG).strip()
    if raw:
        print(f"[OCR RAW READ]: '{raw}'", file=sys.stderr, flush=True)
    return normalize_id(raw), raw


def main():
    # Tell Express the heavy imports are done and we're ready for images
    print(json.dumps({"ready": True}), flush=True)

    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        req = None
        try:
            req = json.loads(line)
            scanned_id, raw = read_id(req["image"])
            out = {"id": req.get("id"), "scannedId": scanned_id, "raw": raw}
        except Exception as e:  # never let one bad frame kill the worker
            out = {
                "id": req.get("id") if isinstance(req, dict) else None,
                "scannedId": None,
                "error": str(e),
            }
        print(json.dumps(out), flush=True)


if __name__ == "__main__":
    main()
