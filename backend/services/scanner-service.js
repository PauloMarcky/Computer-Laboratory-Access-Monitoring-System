const { spawn } = require('child_process');
const path = require('path');
const readline = require('readline');

const PYTHON_BIN = process.env.PYTHON_BIN || 'python';
const TIMEOUT_MS = 15000; // first call can be slow while Python loads OpenCV

let proc = null;
let ready = false;
let seq = 0;
const pending = new Map(); // id -> { resolve, reject, timer }

function failAll(err) {
  for (const p of pending.values()) {
    clearTimeout(p.timer);
    p.reject(err);
  }
  pending.clear();
}

// Starts the Python OCR worker (services/scanner.py) as a child process.
// Safe to call many times. scanImage() also calls it automatically.
function startScanner() {
  if (proc) return proc;
  ready = false;

  proc = spawn(PYTHON_BIN, [path.join(__dirname, 'scanner.py')], {
    stdio: ['pipe', 'pipe', 'inherit'], // stderr shows Python logs in this terminal
  });

  readline.createInterface({ input: proc.stdout }).on('line', (line) => {
    let msg;
    try {
      msg = JSON.parse(line);
    } catch {
      return; // ignore anything that isn't JSON
    }
    if (msg.ready) {
      ready = true;
      console.log('[SCANNER] OCR worker ready');
      return;
    }
    const p = pending.get(msg.id);
    if (!p) return;
    clearTimeout(p.timer);
    pending.delete(msg.id);
    p.resolve(msg);
  });

  proc.stdin.on('error', () => { }); // ignore EPIPE if the worker dies

  proc.on('error', (e) => {
    console.error('[SCANNER] failed to start Python:', e.message);
    proc = null;
    ready = false;
    failAll(new Error(`Cannot start Python ("${PYTHON_BIN}"). Set PYTHON_BIN in .env.`));
  });

  proc.on('close', (code) => {
    console.log(`[SCANNER] OCR worker exited (${code})`);
    proc = null;
    ready = false;
    failAll(new Error('OCR worker stopped. Check that Python packages and Tesseract are installed.'));
  });

  return proc;
}

// Sends one JPEG buffer to the worker. Resolves { scannedId, raw }.
function scanImage(buffer) {
  return new Promise((resolve, reject) => {
    const child = startScanner();
    const id = ++seq;
    const timer = setTimeout(() => {
      pending.delete(id);
      reject(new Error('OCR timed out'));
    }, TIMEOUT_MS);
    pending.set(id, { resolve, reject, timer });
    child.stdin.write(JSON.stringify({ id, image: buffer.toString('base64') }) + '\n');
  });
}

function stopScanner() {
  if (proc) proc.kill();
}

function isScannerReady() {
  return ready;
}

process.on('exit', stopScanner);

module.exports = { startScanner, stopScanner, scanImage, isScannerReady };