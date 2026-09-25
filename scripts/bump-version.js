import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const target = process.argv[2] || 'patch';
const cleanTarget = target.trim().replace(/^["']|["']$/g, '');

console.log(`🚀 Bumping version with target: "${cleanTarget}"...`);

// 1. Run npm version to bump package.json and package-lock.json
try {
  execSync(`npm version ${cleanTarget} --allow-same-version --no-git-tag-version`, { stdio: 'inherit' });
} catch (err) {
  console.error(`❌ Failed to bump version using "npm version ${cleanTarget}":`, err.message);
  process.exit(1);
}

// 2. Read new version from package.json
const pkgPath = path.resolve('package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const rawVersion = pkg.version;
const tagVersion = `v${rawVersion}`;

console.log(`📦 Updated package.json version to ${rawVersion}`);

// 3. Helper to update compose & readme files
function updateImageTag(filePath) {
  const resolvedPath = path.resolve(filePath);
  if (!fs.existsSync(resolvedPath)) {
    console.warn(`⚠️ Warning: ${filePath} does not exist, skipping.`);
    return;
  }
  const content = fs.readFileSync(resolvedPath, 'utf8');
  const regex = /(ghcr\.io\/[^/]+\/mylinks:)[^\s'"]+/g;
  const updated = content.replace(regex, `$1${rawVersion}`);
  if (content !== updated) {
    fs.writeFileSync(resolvedPath, updated, 'utf8');
    console.log(`✅ Updated container image tag in ${filePath} -> :${rawVersion}`);
  } else {
    console.log(`ℹ️ No changes needed in ${filePath}`);
  }
}

// 4. Update docker-compose.yml and README.md
updateImageTag('docker-compose.yml');
updateImageTag('README.md');

// 5. Write GitHub Actions outputs if running in CI
if (process.env.GITHUB_OUTPUT) {
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `version=${tagVersion}\n`);
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `raw_version=${rawVersion}\n`);
}

console.log(`✨ Successfully bumped version to ${tagVersion} (${rawVersion})`);
