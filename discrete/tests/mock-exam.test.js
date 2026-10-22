/* Đề như thật (Discrete, phỏng đoán): cấu trúc, công thức dựng được, và các phát biểu về cây/Fermat/RSA đúng trên ví dụ. */
import { describe, it, expect } from 'vitest';
import katex from 'katex';
import { buildMock } from '@shared/logic/mock-exam.js';
import { DISCRETE_MOCK } from '../src/logic/mock-exam.js';
import { DEFINITIONS } from '../src/logic/mock-proofs.js';

const SEEDS = Array.from({ length: 80 }, (_, i) => i * 104729 + 7);

describe('đề Discrete', () => {
  it('3 câu, 7 ý, 100 điểm, 60 phút; câu 1 có 3 định nghĩa khác nhau, mỗi ý 5 điểm', () => {
    for (const s of SEEDS) {
      const ex = buildMock(DISCRETE_MOCK, s);
      expect(ex.questions.map(q => q.parts.length)).toEqual([3, 3, 1]);
      expect([ex.total, ex.minutes]).toEqual([100, 60]);
      expect(ex.questions[0].parts.every(p => p.pts === 5)).toBe(true);
      expect(new Set(ex.questions[0].parts.map(p => p.facts.id)).size).toBe(3);
      ex.questions.forEach(q => expect(q.refs.length).toBeGreaterThan(0));
    }
  });
  it('cùng seed ⇒ cùng đề; khác seed ⇒ khác', () => {
    expect(buildMock(DISCRETE_MOCK, 5)).toEqual(buildMock(DISCRETE_MOCK, 5));
    expect(new Set(SEEDS.map(s => JSON.stringify(buildMock(DISCRETE_MOCK, s)))).size).toBeGreaterThan(20);
  });
  it('mọi công thức KaTeX dựng được, dấu $ cặp đủ', () => {
    for (const d of DEFINITIONS) expect(d.q).toBeTruthy();
    for (const s of SEEDS) {
      const ex = buildMock(DISCRETE_MOCK, s);
      for (const str of ex.questions.flatMap(q => [q.stem, ...q.parts.flatMap(p => [p.q, ...p.a])])) {
        const pieces = str.split('$');
        expect(pieces.length % 2, str.slice(0, 50)).toBe(1);
        pieces.forEach((m, i) => { if (i % 2) katex.renderToString(m, { throwOnError: true }); });
      }
    }
  });
});

describe('các phát biểu được chứng minh trong đáp án đúng trên ví dụ (kiểm riêng bằng đếm)', () => {
  const prufer = (seq, n) => {                         // dãy Prüfer → danh sách cạnh của cây n đỉnh
    const deg = Array(n).fill(1); seq.forEach(v => { deg[v]++; });
    const edges = [];
    for (const v of seq) { const leaf = deg.findIndex(d => d === 1); edges.push([leaf, v]); deg[leaf]--; deg[v]--; }
    const rest = deg.map((d, i) => [d, i]).filter(([d]) => d === 1).map(([, i]) => i);
    edges.push(rest);
    return edges;
  };
  const allSeqs = (n, len) => (len === 0 ? [[]] : allSeqs(n, len - 1).flatMap(q => Array.from({ length: n }, (_, v) => [...q, v])));
  it('cây n ≤ 7 đỉnh: ≥ 2 lá (n ≥ 2), đúng n − 1 cạnh, tô 2 màu được', () => {
    for (let n = 2; n <= 7; n++) for (const seq of allSeqs(n, n - 2)) {
      const edges = prufer(seq, n), deg = Array(n).fill(0);
      edges.forEach(([a, b]) => { deg[a]++; deg[b]++; });
      expect(edges).toHaveLength(n - 1);
      expect(deg.filter(d => d === 1).length).toBeGreaterThanOrEqual(2);
      const color = Array(n).fill(-1); color[0] = 0;
      for (let k = 0; k < n; k++) edges.forEach(([a, b]) => { if (color[a] >= 0 && color[b] < 0) color[b] = 1 - color[a]; if (color[b] >= 0 && color[a] < 0) color[a] = 1 - color[b]; });
      expect(edges.every(([a, b]) => color[a] !== color[b])).toBe(true);
    }
  });
  it('Fermat và RSA đúng với số nhỏ', () => {
    const pw = (b, e, m) => { let r = 1n; b %= m; while (e > 0n) { if (e & 1n) r = r * b % m; b = b * b % m; e >>= 1n; } return r; };
    for (const p of [3n, 5n, 7n, 11n, 13n]) for (let a = 1n; a < 3n * p; a++) if (a % p) expect(pw(a, p - 1n, p)).toBe(1n);
    const p = 11n, q = 13n, n = p * q, phi = (p - 1n) * (q - 1n), e = 7n;
    let d = 1n; while ((e * d) % phi !== 1n) d++;
    for (let m = 0n; m < n; m++) expect(pw(pw(m, e, n), d, n)).toBe(m);
  });
});

describe('chuỗi đề không có ký tự thừa do thoát sai (\\; bị nuốt thành ;)', () => {
  it('không có ",;" hay ";;" trong đề và đáp án', () => {
    for (const s of SEEDS.slice(0, 40)) {
      const text = JSON.stringify(buildMock(DISCRETE_MOCK, s), (k, v) => (k === 'facts' ? undefined : v));
      expect(text, `seed ${s}`).not.toMatch(/,;|;;/);
    }
  });
});
