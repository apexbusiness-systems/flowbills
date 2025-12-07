import fs from 'fs';
import path from 'path';
import url from 'url';

const projectRoot = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const pkgPath = path.resolve(projectRoot, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

const checks = [
  {
    name: 'Build script defined',
    pass: Boolean(pkg.scripts?.build),
    detail: pkg.scripts?.build ?? 'missing',
  },
  {
    name: 'Lint script defined',
    pass: Boolean(pkg.scripts?.['lint:check'] || pkg.scripts?.lint),
    detail: pkg.scripts?.['lint:check'] || pkg.scripts?.lint || 'missing',
  },
  {
    name: 'Type-check script defined',
    pass: Boolean(pkg.scripts?.['type-check'] || pkg.scripts?.['typecheck']),
    detail: pkg.scripts?.['type-check'] || pkg.scripts?.['typecheck'] || 'missing',
  },
  {
    name: 'Tests configured',
    pass: Boolean(pkg.scripts?.test || pkg.scripts?.['test:unit']),
    detail: pkg.scripts?.test || pkg.scripts?.['test:unit'] || 'missing',
  },
  {
    name: 'Lockfile present',
    pass: fs.existsSync(path.resolve(projectRoot, 'package-lock.json')),
    detail: 'package-lock.json',
  },
  {
    name: 'TypeScript config present',
    pass: fs.existsSync(path.resolve(projectRoot, 'tsconfig.json')),
    detail: 'tsconfig.json',
  },
];

const failures = checks.filter((check) => !check.pass);

for (const check of checks) {
  const symbol = check.pass ? '✅' : '❌';
  console.log(`${symbol} ${check.name} (${check.detail})`);
}

if (failures.length > 0) {
  console.error('\nProduction rubric failed:', failures.map((f) => f.name).join(', '));
  process.exitCode = 1;
} else {
  console.log('\nProduction rubric passed.');
}
