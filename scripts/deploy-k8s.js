import { spawnSync } from 'node:child_process';
import process from 'node:process';

const tag = process.argv[2] || 'latest';
const ns = process.argv[3] || process.env.NAMESPACE || 'default';
const isWin = process.platform === 'win32';

const cmd = isWin ? 'powershell' : 'bash';
const args = isWin
  ? ['-ExecutionPolicy', 'Bypass', '-File', 'scripts/deploy-k8s.ps1', '-Tag', tag, '-Namespace', ns]
  : ['scripts/deploy-k8s.sh', tag, ns];

const result = spawnSync(cmd, args, { stdio: 'inherit', shell: isWin });
process.exit(result.status ?? 0);
