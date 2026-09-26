import { describe, it, expect } from 'vitest';
import { seededRandom } from '@shared/logic/shuffle.js';
import {
  parseEdges, formatEdges, degrees, adjMatrix, matPow, bfs, shortestPath, components, twoColor, eulerKind,
  havelHakimi, isomorphism, differingInvariant, randomGraph, randomConnected, relabel, twoSwitch, triangles,
} from '../src/logic/graph.js';

const C5 = parseEdges('ab, bc, cd, de, ea');

describe('đồ thị: đọc, bậc, ma trận kề', () => {
  it('đọc danh sách cạnh, bỏ trùng, nhận đỉnh cô lập', () => {
    const g = parseEdges('a-b, BA, bc, e');
    expect(g).toEqual({ n: 5, edges: [[0, 1], [1, 2]] });
    expect(formatEdges(g)).toBe('ab, bc');
    expect(degrees(g)).toEqual([1, 2, 1, 0, 0]);
    expect(() => parseEdges('aa')).toThrow();
    expect(() => parseEdges('abc')).toThrow();
    expect(() => parseEdges(' ')).toThrow();
  });

  it('Aᵏ đếm đường đi: trong C₅ có 2 đường độ dài 2 từ a về a, 0 từ a tới b', () => {
    const A2 = matPow(adjMatrix(C5), 2);
    expect(A2[0][0]).toBe(2);
    expect(A2[0][1]).toBe(0);
    expect(matPow(adjMatrix(C5), 3)[0][1]).toBe(3);   // a-b-a-b, a-b-c-b, a-e-a-b
  });
});

describe('đồ thị: BFS, liên thông, hai phía, Euler', () => {
  it('khoảng cách và đường ngắn nhất', () => {
    expect(bfs(C5, 0).dist).toEqual([0, 1, 2, 2, 1]);
    expect(shortestPath(C5, 0, 2)).toEqual([0, 1, 2]);
    expect(shortestPath(parseEdges('ab, c'), 0, 2)).toBeNull();
  });

  it('thành phần liên thông', () => {
    expect(components(parseEdges('ab, cd, e'))).toEqual([[0, 1], [2, 3], [4]]);
  });

  it('hai phía ⇔ không chu trình lẻ; chu trình lẻ trả về là chu trình thật', () => {
    expect(twoColor(parseEdges('ab, bc, cd, da')).ok).toBe(true);
    const r = twoColor(C5);
    expect(r.ok).toBe(false);
    expect(r.cycle.length % 2).toBe(1);
    const A = adjMatrix(C5);
    r.cycle.forEach((v, i) => expect(A[v][r.cycle[(i + 1) % r.cycle.length]]).toBe(1));
    for (let s = 0; s < 200; s++) {
      const g = randomConnected(7, 4, seededRandom(s)), c = twoColor(g);
      if (c.ok) g.edges.forEach(([a, b]) => expect(c.color[a]).not.toBe(c.color[b]));
      else { const M = adjMatrix(g); expect(c.cycle.length % 2).toBe(1); c.cycle.forEach((v, i) => expect(M[v][c.cycle[(i + 1) % c.cycle.length]]).toBe(1)); }
    }
  });

  it('Euler: C₅ có chu trình, đường Lₙ có đường đi, K₄ không có', () => {
    expect(eulerKind(C5).kind).toBe('circuit');
    expect(eulerKind(parseEdges('ab, bc, cd')).kind).toBe('path');
    expect(eulerKind(parseEdges('ab, ac, ad, bc, bd, cd')).kind).toBe('none');
    expect(eulerKind(parseEdges('ab, bc, ca, de, ef, fd')).kind).toBe('none');   // hai tam giác rời nhau
  });
});

describe('đồ thị: dãy bậc, đẳng cấu', () => {
  it('Havel–Hakimi khớp với dãy bậc của đồ thị thật', () => {
    expect(havelHakimi([3, 3, 3, 1]).ok).toBe(false);
    expect(havelHakimi([2, 2, 2]).ok).toBe(true);
    expect(havelHakimi([3, 1]).ok).toBe(false);
    for (let s = 0; s < 200; s++) expect(havelHakimi(degrees(randomGraph(7, 9, seededRandom(s)))).ok).toBe(true);
  });

  it('đổi nhãn luôn đẳng cấu và ánh xạ giữ đúng cạnh; hoán đổi 2 cạnh giữ dãy bậc', () => {
    for (let s = 0; s < 200; s++) {
      const rnd = seededRandom(s);
      const G = randomConnected(6, 3, rnd), H = relabel(G, rnd), f = isomorphism(G, H);
      expect(f).not.toBeNull();
      const AH = adjMatrix(H);
      G.edges.forEach(([a, b]) => expect(AH[f[a]][f[b]]).toBe(1));
      const S = twoSwitch(G, rnd);
      if (S) expect(degrees(S).sort().join()).toBe(degrees(G).sort().join());
    }
  });

  it('C₆ và hai tam giác: cùng dãy bậc, khác nhau ở số thành phần', () => {
    const C6 = parseEdges('ab, bc, cd, de, ef, fa'), TT = parseEdges('ab, bc, ca, de, ef, fd');
    expect(isomorphism(C6, TT)).toBeNull();
    expect(differingInvariant(C6, TT).id).toBe('components');
    expect(triangles(TT)).toBe(2);
  });
});
