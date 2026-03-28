/**
 * Regenerate web/client/public/ytdlp-cli-catalog.json (requires Python + yt_dlp on PYTHONPATH).
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const script = path.join(root, 'devscripts', 'generate_ytdlp_cli_catalog.py');

const r = spawnSync('python', [script], {
  cwd: root,
  stdio: 'inherit',
  env: { ...process.env, PYTHONPATH: root },
});
if (r.error) {
  console.error(r.error);
  process.exit(1);
}
process.exit(r.status ?? 0);
