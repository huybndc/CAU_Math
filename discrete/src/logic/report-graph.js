import { fail } from '@shared/logic/app-error.js';

/* ---------------------------------------------------------------
   MÁY GIẢI ĐỒ THỊ (D8): danh sách cạnh → bậc, bổ đề bắt tay, thành phần liên thông, hai phía (tô 2 màu / chu trình lẻ),
   chu trình, cây, đường đi / chu trình Euler. Thuần; chỉ khoá từ điển.
   --------------------------------------------------------------- */

const MAX_V = 14;
export function parseEdges(text) {
  const edges = [], verts = new Set();
  for (const part of String(text).split(/[,;\n]+/).map(s => s.trim()).filter(Boolean)) {
    const m = part.match(/^([\w']+)\s*[-–—]\s*([\w']+)$/);
    if (m) { edges.push([m[1], m[2]]); verts.add(m[1]); verts.add(m[2]); }
    else if (/^[\w']+$/.test(part)) verts.add(part);                          // đỉnh cô lập
    else fail('dg.badEdge', { s: part });
  }
  if (!verts.size) fail('dg.empty');
  if (verts.size > MAX_V) fail('dg.tooBig', { n: MAX_V });
  return { V: [...verts].sort((a, b) => (isNaN(a) || isNaN(b) ? a.localeCompare(b) : a - b)), edges };
}

export function graphReport(text) {
  const { V, edges } = parseEdges(text);
  const loops = edges.filter(([a, b]) => a === b).length;
  const seen = new Set(), E = [];
  for (const [a, b] of edges) { const k = [a, b].sort().join('|'); if (a !== b && !seen.has(k)) { seen.add(k); E.push([a, b]); } }
  const adj = Object.fromEntries(V.map(v => [v, []]));
  for (const [a, b] of E) { adj[a].push(b); adj[b].push(a); }
  const deg = Object.fromEntries(V.map(v => [v, adj[v].length]));
  // thành phần liên thông + tô 2 màu
  const comp = {}, color = {}; let c = 0, bip = true, odd = null;
  for (const v of V) {
    if (comp[v] !== undefined) continue;
    comp[v] = c; color[v] = 0; const stack = [v];
    while (stack.length) {
      const u = stack.pop();
      for (const w of adj[u]) {
        if (comp[w] === undefined) { comp[w] = c; color[w] = 1 - color[u]; stack.push(w); }
        else if (color[w] === color[u] && bip) { bip = false; odd = [u, w]; }
      }
    }
    c++;
  }
  const n = V.length, m = E.length, oddV = V.filter(v => deg[v] % 2);
  const conn = c === 1, hasCycle = m > n - c;
  const tree = conn && m === n - 1;
  const eulerOK = E.length > 0 && V.filter(v => deg[v]).every(v => comp[v] === comp[V.find(u => deg[u])]);
  const euler = !eulerOK ? 'none' : oddV.length === 0 ? 'circuit' : oddV.length === 2 ? 'trail' : 'none';
  const sum = V.map(v => deg[v]).reduce((s, x) => s + x, 0);
  const T = b => (b ? '✓' : '✗');
  return {
    answer: [
      { key: 'dg.size', m: `|V| = ${n}, |E| = ${m}${loops ? ` (+${loops})` : ''}` },
      { key: 'dg.conn', m: `${T(conn)}   (${c})` }, { key: 'dg.bip', m: T(bip) }, { key: 'dg.cycle', m: T(hasCycle) }, { key: 'dg.tree', m: T(tree) },
      { key: 'dg.euler' + euler[0].toUpperCase() + euler.slice(1), m: oddV.length ? `(${oddV.join(', ')})` : '' },
    ],
    steps: [
      { group: 'dg.tabDeg', head: { key: 'dg.stDeg' }, why: { key: 'dg.whyHand' },
        lines: [V.map(v => `deg(${v}) = ${deg[v]}`).join(',  '), { key: 'dg.hand', m: `Σdeg = ${sum} = 2·${m}` }, { key: 'dg.oddCount', m: `${oddV.length}` }] },
      { group: 'dg.tabConn', head: { key: 'dg.stConn' }, why: { key: 'dg.whyConn' },
        lines: Array.from({ length: c }, (_, i) => `{${V.filter(v => comp[v] === i).join(', ')}}`).concat([{ key: 'dg.cycleRule', m: `m = ${m} ${hasCycle ? '>' : '='} n − c = ${n - c}` }]) },
      { group: 'dg.tabBip', head: { key: 'dg.stBip' }, why: { key: 'dg.whyBip' },
        lines: bip ? [`L = {${V.filter(v => color[v] === 0).join(', ')}},  R = {${V.filter(v => color[v] === 1).join(', ')}}`] : [{ key: 'dg.oddEdge', m: `${odd[0]} — ${odd[1]}` }] },
    ],
    check: () => true,
    graph: { V, E, deg, color: bip ? color : null, odd: oddV },   // cho hình vẽ
  };
}
