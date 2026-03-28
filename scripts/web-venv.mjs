/**
 * Create web/server/.venv if missing and pip install -e web/server.
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const venvDir = path.join(root, 'web', 'server', '.venv');
const py =
  process.platform === 'win32'
    ? path.join(venvDir, 'Scripts', 'python.exe')
    : path.join(venvDir, 'bin', 'python');

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { stdio: 'inherit', ...opts });
  if (r.error) {
    console.error(r.error);
    process.exit(1);
  }
  if (r.status !== 0) {
    process.exit(r.status ?? 1);
  }
}

if (!existsSync(py)) {
  run('python', ['-m', 'venv', venvDir], { cwd: root });
}

run(py, ['-m', 'pip', 'install', '-U', 'pip']);
run(py, ['-m', 'pip', 'install', '-e', path.join(root, 'web', 'server')]);
