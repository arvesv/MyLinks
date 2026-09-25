import { spawnSync } from 'node:child_process';
import process from 'node:process';

const tag = process.argv[2] || 'latest';
const ns = process.argv[3] || process.env.NAMESPACE || 'default';
const replicas = process.argv[4] || process.env.REPLICAS || '1';
const adminUsers = process.argv[5] || process.env.ADMIN_USERS || '';
const isWin = process.platform === 'win32';

const cmd = isWin ? 'powershell' : 'bash';
const args = isWin
  ? [
      '-ExecutionPolicy',
      'Bypass',
      '-File',
      'scripts/deploy-k8s.ps1',
      '-Tag',
      tag,
      '-Namespace',
      ns,
      '-Replicas',
      replicas,
      ...(adminUsers ? ['-AdminUsers', adminUsers] : []),
    ]
  : ['scripts/deploy-k8s.sh', tag, ns, replicas, adminUsers];

const result = spawnSync(cmd, args, { stdio: 'inherit', shell: isWin });
process.exit(result.status ?? 0);
