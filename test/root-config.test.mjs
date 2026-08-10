import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

test('root package exposes the Docker startup command', async () => {
  const packageJson = JSON.parse(
    await readFile(join(projectRoot, 'package.json'), 'utf8'),
  );

  assert.equal(
    packageJson.scripts['docker:up'],
    'docker compose --env-file ./.env -f ./docker-compose.yml up -d',
  );
});

test('pnpm workspace manifest includes application and package workspaces', async () => {
  const workspaceManifest = await readFile(
    join(projectRoot, 'pnpm-workspace.yaml'),
    'utf8',
  );

  assert.match(workspaceManifest, /^\s*- apps\/\*$/m);
  assert.match(workspaceManifest, /^\s*- packages\/\*$/m);
});

test('applications reference shared types through the pnpm workspace protocol', async () => {
  const packagePaths = [
    'apps/backend/package.json',
    'apps/frontend/package.json',
  ];

  for (const packagePath of packagePaths) {
    const packageJson = JSON.parse(
      await readFile(join(projectRoot, packagePath), 'utf8'),
    );

    assert.equal(packageJson.dependencies['@wordforge/shared-types'], 'workspace:*');
  }
});
