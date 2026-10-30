// Bản chép từ Study_Hub phải khớp nguồn (lệch ⇒ npm run sync:hub). Không có repo Hub cạnh bên thì bỏ qua.
import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { HUB, SEMESTER_HEAD } from '../../scripts/sync-hub.mjs';
import { TERM_STARTS, WEEKS, EXAMS } from '../logic/semester.js';

const has = existsSync(HUB);
const hub = f => readFileSync(new URL(f, HUB), 'utf8');
const ours = f => readFileSync(new URL(`../../${f}`, import.meta.url), 'utf8');

describe.skipIf(!has)('bản chép khớp Study_Hub', () => {
  it('design-tokens.json giống hệt', () => expect(ours('shared/style/design-tokens.json')).toBe(hub('design-tokens.json')));
  it('semester.js giống hệt bản xuất của Hub', () => expect(ours('shared/logic/semester.js')).toBe(SEMESTER_HEAD + hub('semester.js')));
  it('hằng số kỳ học khớp semester.json', () => {
    const s = JSON.parse(hub('semester.json'));
    expect([TERM_STARTS, WEEKS, EXAMS]).toEqual([s.termStarts, s.weeks, s.exams.map(e => [e.week, e.name])]);
  });
});
