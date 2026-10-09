// Ghi lại sha256 các file chép từ Study_Hub (sau khi chép bản mới từ Hub). Test shared/tests/hub-mirror-lock.test.js so file local với lock này.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

export const MIRRORED = ['shared/ui/pet.js', 'shared/logic/pet.js', 'shared/logic/pet-engine.js', 'shared/logic/pet-art.json', 'shared/logic/pet-rules.js', 'shared/logic/design-pets.json', 'shared/style/pet.css'];
export const sha = path => createHash('sha256').update(readFileSync(new URL(`../${path}`, import.meta.url))).digest('hex');

if (import.meta.url === `file://${process.argv[1]}`) {
  writeFileSync(new URL('../shared/logic/hub-mirror.lock', import.meta.url), JSON.stringify(Object.fromEntries(MIRRORED.map(p => [p, sha(p)])), null, 2) + '\n');
}
