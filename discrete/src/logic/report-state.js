import { fail } from '@shared/logic/app-error.js';

/* ---------------------------------------------------------------
   MÁY GIẢI BẤT BIẾN (D5): các bước (dx, dy) trên lưới, điểm đầu, điểm đích → đích có tới được không (tìm theo chiều rộng trong
   khung), và các bất biến dạng `p·x + q·y ≡ c (mod m)` bảo toàn qua mọi bước. Đích vi phạm bất biến ⇒ chứng minh không tới được.
   Thuần; chỉ khoá từ điển.
   --------------------------------------------------------------- */

const LIMIT = 40, MAX_STATES = 20000, MAX_MOVES = 8;

const pt = text => {
  const m = String(text).replace(/[()]/g, '').split(/[,\s]+/).filter(Boolean);
  if (m.length !== 2 || !m.every(v => /^-?\d+$/.test(v.replace('−', '-')))) fail('dst.badPoint');
  return m.map(v => +v.replace('−', '-'));
};
export const parseMoves = text => {
  const ms = String(text).split(/[;|]/).map(s => s.trim()).filter(Boolean).map(pt);
  if (!ms.length || ms.length > MAX_MOVES) fail('dst.badMoves', { n: MAX_MOVES });
  return ms;
};
const mod = (a, m) => ((a % m) + m) % m;

/** Các (p, q, m) với m = 2..9, 0 ≤ p, q < m, mọi bước thoả p·dx + q·dy ≡ 0 (mod m); xếp m nhỏ trước. */
export function invariants(moves) {
  const out = [];
  for (let m = 2; m <= 9; m++) for (let p = 0; p < m; p++) for (let q = 0; q < m; q++) {
    if (!p && !q) continue;
    if (moves.every(([dx, dy]) => mod(p * dx + q * dy, m) === 0)) out.push({ p, q, m });
  }
  return out;
}
const fmt = ({ p, q, m }) => `${p ? (p === 1 ? 'x' : `${p}x`) : ''}${p && q ? ' + ' : ''}${q ? (q === 1 ? 'y' : `${q}y`) : ''} (mod ${m})`;

export function stateReport(movesText, startText, goalText) {
  const moves = parseMoves(movesText), s = pt(startText), g = pt(goalText);
  const key = ([x, y]) => `${x},${y}`;
  const prev = new Map([[key(s), null]]);
  let frontier = [s], found = key(s) === key(g);
  while (frontier.length && !found && prev.size < MAX_STATES) {
    const next = [];
    for (const [x, y] of frontier) for (const [dx, dy] of moves) {
      const n = [x + dx, y + dy];
      if (Math.abs(n[0]) > LIMIT || Math.abs(n[1]) > LIMIT || prev.has(key(n))) continue;
      prev.set(key(n), [x, y]); next.push(n);
      if (key(n) === key(g)) found = true;
    }
    frontier = next;
  }
  const path = [];
  if (found) for (let c = g; c; c = prev.get(key(c))) path.unshift(`(${c[0]}, ${c[1]})`);
  const inv = invariants(moves);
  const broken = inv.filter(({ p, q, m }) => mod(p * s[0] + q * s[1], m) !== mod(p * g[0] + q * g[1], m));
  return {
    answer: [{ key: found ? 'dst.reach' : (broken.length ? 'dst.never' : 'dst.noneFound'), m: found ? `${path.length - 1}` : '' }],
    steps: [
      { group: 'dst.tabInv', head: { key: 'dst.stInv' }, why: { key: 'dst.whyInv' },
        lines: inv.length ? inv.slice(0, 6).map(v => ({ key: 'dst.invLine', m: `${fmt(v)}:  ${mod(v.p * s[0] + v.q * s[1], v.m)} → ${mod(v.p * g[0] + v.q * g[1], v.m)}` })) : [{ key: 'dst.noInv', m: '' }] },
      { group: 'dst.tabSearch', head: { key: 'dst.stSearch', params: { lim: LIMIT } }, why: { key: 'dst.whySearch' },
        lines: found ? [path.join(' → ')] : [{ key: 'dst.notFound', m: `${prev.size}` }] },
    ],
    check: () => true,
  };
}
