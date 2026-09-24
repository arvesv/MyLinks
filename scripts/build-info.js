import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

let gitSha = process.env.GIT_COMMIT_SHA || '';
if (!gitSha || gitSha === 'unknown' || gitSha === 'dev') {
  try {
    gitSha = execSync('git rev-parse HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    gitSha = 'dev';
  }
}

const buildTime = process.env.BUILD_TIME || new Date().toISOString();

const pkgPath = path.join(process.cwd(), 'package.json');
let version = '0.1.0';
try {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  if (pkg.version) version = pkg.version;
} catch {}

const outDir = path.join(process.cwd(), 'dist');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const info = {
  version,
  gitCommitSha: gitSha,
  buildTime,
};

fs.writeFileSync(path.join(outDir, 'build-info.json'), JSON.stringify(info, null, 2));
console.log(`📦 Build info generated: ${gitSha.slice(0, 7)} at ${buildTime}`);
