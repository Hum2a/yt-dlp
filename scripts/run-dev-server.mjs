/**
 * Run uvicorn with web/server's venv Python (see npm run install:web).
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const serverRoot = path.join(root, 'web', 'server');
const venvDir = path.join(serverRoot, '.venv');
const py =
  process.platform === 'win32'
    ? path.join(venvDir, 'Scripts', 'python.exe')
    : path.join(venvDir, 'bin', 'python');

if (!existsSync(py)) {
  console.error('Missing venv. Run: npm run install:web');
  process.exit(1);
}

const proc = spawn(
  py,
  ['-m', 'uvicorn', 'app.main:app', '--reload', '--host', '127.0.0.1', '--port', '8000'],
  { cwd: serverRoot, stdio: 'inherit' },
);

proc.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  }
  process.exit(code ?? 0);
});
