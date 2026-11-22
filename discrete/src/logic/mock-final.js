/* ---------------------------------------------------------------
   PRACTICE FINAL EXAM (Discrete Math), pure. Scope = class after the midterm (D75): communication networks (Beneš),
   Euler tours, directed graphs and walk counting, relations, sums (annuities, geometric series), bounds on sums by
   integrals, asymptotic notation (~, O, Θ). Counting rules are not taught yet, so they are not asked.
   Form follows the midterm: definitions, short answers, short proofs. English text, LaTeX $…$; facts = raw data for tests.
   Section numbers follow MCS (MIT 6.042J, 2017); "11" and "10" are chapter-level where the section is not checked.
   --------------------------------------------------------------- */
const r = String.raw;
const int = (lo, hi, rnd) => lo + Math.floor(rnd() * (hi - lo + 1));
const pick = (arr, rnd) => arr[Math.floor(rnd() * arr.length)];
const shuffled = (arr, rnd) => arr.map(x => [rnd(), x]).sort((a, b) => a[0] - b[0]).map(p => p[1]);
const mat = M => `\\begin{bmatrix}${M.map(row => row.join(' & ')).join(' \\\\ ')}\\end{bmatrix}`;
const money = x => x.toFixed(2);
const gcd = (a, b) => (b ? gcd(b, a % b) : a);
const num = (a, c) => { const g = gcd(a, c), [n, d] = [a / g, c / g]; return d === 1 ? `${n}` : `\\tfrac{${n}}{${d}}`; };

const NET = ['11', 'Communication networks'], DIG = ['10', 'Directed graphs and partial orders'], SUM = ['14.1', 'The value of an annuity'];
const EUL = ['12', 'Simple graphs (Euler tours)'], REL = ['10', 'Directed graphs: relations'];
const APP = ['9.3', 'Approximating sums'], ASY = ['9.7', 'Asymptotic notation'], HAR = ['9.4', 'Hanging out over the edge (harmonic numbers)'], PRD = ['9.6', 'Products (n!)'];

const DEFS = [
  { id: 'euler', ref: EUL, q: r`Define an Euler tour of a graph.`, a: [r`An Euler tour is a closed walk that uses every edge of the graph exactly once.`] },
  { id: 'hamilton', ref: EUL, q: r`Define a Hamiltonian cycle of a graph.`, a: [r`A Hamiltonian cycle is a cycle that visits every vertex exactly once.`] },
  { id: 'strong', ref: DIG, q: r`Define when a directed graph is strongly connected.`, a: [r`A digraph is strongly connected if for every pair of vertices $u, v$ there is a directed walk from $u$ to $v$ and one from $v$ to $u$.`] },
  { id: 'dag', ref: DIG, q: r`Define a directed acyclic graph (DAG).`, a: [r`A DAG is a directed graph with no positive-length closed walk (no directed cycle).`] },
  { id: 'equiv', ref: REL, q: r`Define an equivalence relation on a set $A$.`, a: [r`A binary relation on $A$ that is reflexive ($a\,R\,a$), symmetric ($a\,R\,b \Rightarrow b\,R\,a$) and transitive ($a\,R\,b \wedge b\,R\,c \Rightarrow a\,R\,c$).`] },
  { id: 'porder', ref: REL, q: r`Define a weak partial order on a set $A$.`, a: [r`A binary relation on $A$ that is reflexive, antisymmetric ($a\,R\,b \wedge b\,R\,a \Rightarrow a = b$) and transitive.`] },
  { id: 'congestion', ref: NET, q: r`Define the congestion of a communication network.`,
    a: [r`For a routing of a permutation, the congestion is the largest number of paths through one switch. The congestion of the network is the largest such value over all permutations, each routed in the best way.`] },
  { id: 'pv', ref: SUM, q: r`Define the present value of a payment of $M$ dollars made $t$ years from now, at yearly interest rate $p$.`,
    a: [r`It is the amount that grows to $M$ in $t$ years at rate $p$: $M/(1+p)^t$.`] },
];

const ASY_DEFS = [
  { id: 'tilde', ref: ASY, q: r`Define $f(x) \sim g(x)$ (asymptotic equality).`, a: [r`$f(x) \sim g(x)$ means $\displaystyle\lim_{x \to \infty} f(x)/g(x) = 1$.`] },
  { id: 'bigO', ref: ASY, q: r`Define $f(x) = O(g(x))$.`, a: [r`There are constants $c > 0$ and $x_0$ such that $|f(x)| \le c\,|g(x)|$ for all $x \ge x_0$. It is an upper bound only.`] },
  { id: 'theta', ref: ASY, q: r`Define $f(x) = \Theta(g(x))$.`, a: [r`$f = O(g)$ and $f = \Omega(g)$, where $f = \Omega(g)$ means $f$ is at least a positive multiple of $g$ for all large $x$ ($g = O(f)$).`] },
];

export function makeDefinitions(rnd) {
  const defs = [...shuffled(DEFS, rnd).slice(0, 3), pick(ASY_DEFS, rnd)], seen = new Set();
  return {
    stem: 'Definitions. State each definition precisely. Examples alone earn nothing.',
    parts: defs.map(d => ({ pts: 10, q: d.q, a: d.a, facts: { id: d.id } })),
    refs: defs.map(d => d.ref).filter(x => !seen.has(x.join()) && seen.add(x.join())),
  };
}

// network facts for N = 2^a inputs: [question, value(N, lg), answer text]
const NETS = [
  [r`How many switches does a complete binary tree network with $N$ inputs have?`, (N) => 2 * N - 1, r`2N - 1`],
  [r`What is the congestion of a complete binary tree network with $N$ inputs?`, (N) => N, r`N`],
  [r`What is the diameter of a complete binary tree network with $N$ inputs?`, (N, lg) => 2 * lg + 2, r`2\log N + 2`],
  [r`How many switches does an $N \times N$ two-dimensional array network have?`, (N) => N * N, r`N^2`],
  [r`How many levels of switches does a butterfly network with $N$ inputs have?`, (N, lg) => lg + 1, r`\log N + 1`],
  [r`How many switches does a butterfly network with $N$ inputs have?`, (N, lg) => N * (lg + 1), r`N(\log N + 1)`],
  [r`What is the congestion of a Beneš network with $N$ inputs?`, () => 1, r`1`],
];

function graphWithDegrees(rnd) {
  const n = 5, edges = new Set();
  const order = shuffled([0, 1, 2, 3, 4], rnd);
  for (let i = 1; i < n; i++) edges.add([order[i - 1], order[i]].sort().join());     // spanning path: connected
  const extra = int(1, 4, rnd);
  for (let k = 0; k < 20 && edges.size < n - 1 + extra; k++) { const a = int(0, 4, rnd), b = int(0, 4, rnd); if (a !== b) edges.add([a, b].sort((x, y) => x - y).join()); }
  return [...edges].map(e => e.split(',').map(Number));
}

export function makeShortAnswers(rnd) {
  const lg = int(3, 5, rnd), N = 2 ** lg, net = pick(NETS, rnd), netVal = net[1](N, lg);
  const port = int(0, N / 2 - 1, rnd), partner = port + N / 2;
  const edges = graphWithDegrees(rnd), deg = [0, 0, 0, 0, 0];
  edges.forEach(([a, b]) => { deg[a]++; deg[b]++; });
  const odd = deg.filter(d => d % 2).length, eul = odd === 0 ? 'tour' : odd === 2 ? 'walk' : 'none';
  let A;
  do A = [0, 1, 2, 3].map(i => [0, 1, 2, 3].map(j => (i !== j && rnd() < 0.45 ? 1 : 0))); while (A.flat().filter(Boolean).length < 5);
  const mul = (X, Y) => X.map(row => Y[0].map((_, j) => row.reduce((s, v, k) => s + v * Y[k][j], 0)));
  const A2 = mul(A, A), A3 = mul(A2, A), [wi, wj] = [int(0, 3, rnd), int(0, 3, rnd)], walks = A3[wi][wj];
  const pairs = [];
  for (let a = 1; a <= 3; a++) for (let b = 1; b <= 3; b++) if (a === b ? rnd() < 0.6 : rnd() < 0.4) pairs.push([a, b]);
  const has = (a, b) => pairs.some(([x, y]) => x === a && y === b), S = [1, 2, 3];
  const refl = S.every(a => has(a, a)), sym = pairs.every(([a, b]) => has(b, a));
  const trans = pairs.every(([a, b]) => pairs.every(([c, d]) => b !== c || has(a, d)));
  const yn = x => (x ? 'yes' : 'no');
  const vx = i => `v_${i + 1}`;
  const [ta, tb, tc] = [int(1, 3, rnd), int(1, 5, rnd), int(1, 3, rnd)], tlim = ta / tc;
  const od = int(2, 3, rnd), [oa, ob] = [int(1, 6, rnd), int(1, 6, rnd)], pc = pick([2, 3, 4, 5, 6, 8, 10], rnd), dbl = Math.log(2) / Math.log(1 + pc / 100);
  const P = [
      { pts: 10, q: r`Let $N = ${N}$. ${net[0]}`, a: [r`$${net[2]} = ${netVal}$ for $N = ${N}$ ($\log N = ${lg}$).`], facts: { kind: 'net', N, lg, id: NETS.indexOf(net), value: netVal } },
      { pts: 10, q: r`In a Beneš network with $N = ${N}$ inputs, which input shares a first-level switch with input $${port}$? Can their packets use the same subnetwork?`,
        a: [r`Input $${partner}$ ($= ${port} + N/2$). No: the two packets of one first-level switch must go to different subnetworks.`], facts: { kind: 'benes', N, port, partner } },
      { pts: 10, q: r`A connected graph has vertices $v_1, \dots, v_5$ and edges $${edges.map(([a, b]) => `${vx(a)}${vx(b)}`).join(', ')}$. Does it have an Euler tour, an Euler walk that is not a tour, or neither?`,
        a: [r`Degrees: $${deg.join(', ')}$; ${odd} odd. ${eul === 'tour' ? 'All even, so it has an Euler tour.' : eul === 'walk' ? r`Exactly $2$ odd, so it has an Euler walk (from one odd vertex to the other) but no tour.` : r`More than $2$ odd, so neither.`}`],
        facts: { kind: 'euler', edges, eul } },
      { pts: 10, q: r`A digraph on $v_1, \dots, v_4$ has adjacency matrix $A = ${mat(A)}$. How many walks of length $3$ go from $${vx(wi)}$ to $${vx(wj)}$?`,
        a: [r`It is entry $(${wi + 1},${wj + 1})$ of $A^3$. $A^2 = ${mat(A2)}$, $A^3 = ${mat(A3)}$, so the answer is $${walks}$.`], facts: { kind: 'walks', A, wi, wj, walks } },
      { pts: 10, q: r`The relation $R = \{${pairs.map(([a, b]) => `(${a},${b})`).join(', ') || r`\,`}\}$ is on $\{1, 2, 3\}$. Is $R$ reflexive? Symmetric? Transitive?`,
        a: [r`Reflexive: ${yn(refl)}. Symmetric: ${yn(sym)}. Transitive: ${yn(trans)}.`], facts: { kind: 'relation', pairs, refl, sym, trans } },
      { pts: 10, q: r`Money grows at $${pc}\%$ a year (compound interest). After how many years does it double? Give the formula and the value to $1$ decimal.`,
        a: [r`$(1 + p)^t = 2$ gives $t = \dfrac{\ln 2}{\ln(1 + p)} = \dfrac{\ln 2}{\ln ${(1 + pc / 100).toFixed(2)}} \approx ${dbl.toFixed(1)}$ years.`], facts: { kind: 'doubling', p: pc / 100, t: dbl } },
      { pts: 10, q: r`Let $f(x) = ${ta}x^2 + ${tb}x$ and $g(x) = ${tc}x^2$. Compute $\lim_{x \to \infty} f(x)/g(x)$. Is $f(x) \sim g(x)$?`,
        a: [r`$f/g = \dfrac{${ta} + ${tb}/x}{${tc}} \to ${num(ta, tc)}$ as $x \to \infty$.`, tlim === 1 ? r`The limit is $1$, so $f \sim g$.` : r`The limit is not $1$, so $f \not\sim g$ (but $f = \Theta(g)$).`], facts: { kind: 'tilde', a: ta, b: tb, c: tc, limit: tlim, sim: tlim === 1 } },
      { pts: 10, q: r`Let $f(x) = ${oa}x^${od} + ${ob}x^${od - 1}$. Find constants $c$ and $x_0$ with $f(x) \le c\,x^${od}$ for all $x \ge x_0$. Is $f = \Theta(x^${od})$?`,
        a: [r`For $x \ge 1$: $${ob}x^${od - 1} \le ${ob}x^${od}$, so $f(x) \le ${oa + ob}\,x^${od}$. Take $c = ${oa + ob}$, $x_0 = 1$, so $f = O(x^${od})$.`, r`Also $f(x) \ge ${oa}x^${od}$, so $f = \Omega(x^${od})$. Hence $f = \Theta(x^${od})$.`], facts: { kind: 'bigO', d: od, a: oa, b: ob, c: oa + ob, x0: 1 } },
  ];
  const chosen = [pick([P[0], P[1]], rnd), pick([P[2], P[3]], rnd), pick([P[4], P[5]], rnd), P[6], P[7]], refOf = { net: NET, benes: NET, euler: EUL, walks: DIG, relation: REL, doubling: SUM, tilde: ASY, bigO: ASY };
  return {
    stem: r`Short answers. Give the value and one line of reason.`,
    parts: chosen,
    refs: [...new Map(chosen.map(c => [refOf[c.facts.kind].join(), refOf[c.facts.kind]])).values()],
  };
}

export function makeAnnuity(rnd) {
  const m = pick([100, 500, 1000, 2000], rnd), pc = pick([4, 5, 8, 10], rnd), n = pick([3, 4, 5, 10], rnd), p = pc / 100, x = 1 / (1 + p);
  const V = m * (1 - x ** n) / (1 - x), Vinf = m * (1 + p) / p;
  return {
    stem: r`An annuity pays $${m}$ dollars at the start of each year. The yearly interest rate is $p = ${pc}\%$. Let $x = 1/(1+p)$.`,
    parts: [
      { pts: 20, q: r`Prove that $\sum_{i=0}^{n-1} x^i = \dfrac{1 - x^n}{1 - x}$ for $x \ne 1$ by the perturbation method.`,
        a: [r`Let $S = 1 + x + \dots + x^{n-1}$. Then $xS = x + x^2 + \dots + x^n$.`, r`Subtract: $S - xS = 1 - x^n$, so $S = \dfrac{1 - x^n}{1 - x}$ ($x \ne 1$).`], facts: { kind: 'annuity' } },
      { pts: 20, q: r`Find the present value of the annuity if it pays $${n}$ times. Give the formula and the value to $2$ decimals.`,
        a: [r`The payment at the start of year $i+1$ is worth $${m}x^i$ today, so $V = ${m}\sum_{i=0}^{${n - 1}} x^i = ${m}\dfrac{1 - x^{${n}}}{1 - x}$.`, r`$V \approx ${money(V)}$ dollars.`], facts: { m, p, n, V } },
      { pts: 10, q: r`Find the present value if the annuity pays forever. Why does the infinite sum converge?`,
        a: [r`$|x| < 1$, so $x^n \to 0$ and $V = \dfrac{${m}}{1 - x} = ${m}\cdot\dfrac{1 + p}{p} = ${money(Vinf)}$ dollars.`], facts: { Vinf } },
    ],
    refs: [SUM, ['14.1', 'Sums: the perturbation method']],
  };
}

// MCS 9.3–9.6. S = sum_{i=1}^n f(i), I = integral of f from 1 to n.
const BOUNDS = {
  sqrt: { inc: true, f: r`\sqrt{x}`, ns: [4, 9, 16, 25], term: i => Math.sqrt(i), I: n => (2 / 3) * (n ** 1.5 - 1), f1: 1, fn: n => Math.sqrt(n), ref: APP,
    Itex: n => r`\int_1^{${n}} x^{1/2}\,dx = \tfrac{2}{3}\left(${n}^{3/2} - 1\right)` },
  recip: { inc: false, f: r`\dfrac{1}{x}`, ns: [4, 5, 8, 10], term: i => 1 / i, I: n => Math.log(n), f1: 1, fn: n => 1 / n, ref: HAR,
    Itex: n => r`\int_1^{${n}} \dfrac{dx}{x} = \ln ${n}` },
  logn: { inc: true, f: r`\ln x`, ns: [4, 5, 6, 8], term: i => Math.log(i), I: n => n * Math.log(n) - n + 1, f1: 0, fn: n => Math.log(n), ref: PRD,
    Itex: n => r`\int_1^{${n}} \ln x\,dx = ${n}\ln ${n} - ${n} + 1` },
};

export function makeSumBounds(rnd) {
  const id = pick(Object.keys(BOUNDS), rnd), B = BOUNDS[id], n = pick(B.ns, rnd);
  let S = 0;
  for (let i = 1; i <= n; i++) S += B.term(i);
  const I = B.I(n), [a, b] = B.inc ? [B.f1, B.fn(n)] : [B.fn(n), B.f1], lo = I + a, hi = I + b, d = x => x.toFixed(3);
  const [a1, a2] = B.inc ? ['f(1)', 'f(n)'] : ['f(n)', 'f(1)'];
  const last = {
    sqrt: [r`Use the bounds to show that $\sum_{i=1}^{n}\sqrt{i} \sim \tfrac{2}{3}n^{3/2}$.`, [r`$I = \tfrac{2}{3}n^{3/2} - \tfrac{2}{3}$. The lower bound is $\tfrac{2}{3}n^{3/2} + \tfrac{1}{3}$ and the upper bound is $\tfrac{2}{3}n^{3/2} + \sqrt{n} - \tfrac{2}{3}$.`, r`Divide both by $\tfrac{2}{3}n^{3/2}$. Both ratios tend to $1$, so $S/(\tfrac{2}{3}n^{3/2}) \to 1$.`]],
    recip: [r`Use the bounds to show that $H_n = \Theta(\ln n)$ for $n \ge 3$.`, [r`$\ln n + \tfrac{1}{n} \le H_n \le \ln n + 1$.`, r`For $n \ge 3$: $\ln n \le H_n$, and $1 < \ln 3 \le \ln n$, so $H_n \le 2\ln n$. Thus $\ln n \le H_n \le 2\ln n$.`]],
    logn: [r`Turn the bounds into bounds on $n!$. Evaluate them for $n = ${n}$ and compare with $${n}!$.`, [r`$e^{\ln n!} = n!$, so $\dfrac{n^n}{e^{n-1}} \le n! \le \dfrac{n^{n+1}}{e^{n-1}}$.`, r`For $n = ${n}$: $${(Math.exp(lo)).toFixed(2)} \le ${[...Array(n).keys()].reduce((x, k) => x * (k + 1), 1)} \le ${(Math.exp(hi)).toFixed(2)}$.`]],
  }[id];
  return {
    stem: r`Let $f(x) = ${B.f}$, $S = \sum_{i=1}^{n} f(i)$ and $I = \int_1^n f(x)\,dx$. Take $n = ${n}$.`,
    parts: [
      { pts: 15, q: r`Is $f$ increasing or decreasing for $x \ge 1$? Write the two integral bounds on $S$ and compute $I$.`,
        a: [r`$f$ is ${B.inc ? 'increasing' : 'decreasing'}, so ${B.inc ? r`$I + f(1) \le S \le I + f(n)$` : r`$I + f(n) \le S \le I + f(1)$`}.`, r`$I = ${B.Itex(n)} \approx ${d(I)}$.`],
        facts: { kind: 'bounds', id, inc: B.inc, n, I } },
      { pts: 20, q: r`Compute both bounds for $n = ${n}$ and the sum $S$ to $3$ decimals. Is $S$ between them?`,
        a: [r`Lower bound $= I + ${a1} = ${d(I)} + ${d(a)} = ${d(lo)}$.`, r`Upper bound $= I + ${a2} = ${d(I)} + ${d(b)} = ${d(hi)}$.`, r`$S = ${d(S)}$, and $${d(lo)} \le ${d(S)} \le ${d(hi)}$: yes.`],
        facts: { n, id, lo, hi, S } },
      { pts: 15, q: last[0], a: last[1], facts: { n, id } },
    ],
    refs: [B.ref, APP],
  };
}

const PROOFS = [
  { id: 'walks', ref: DIG, q: r`Let $A$ be the adjacency matrix of a digraph and $P(k)$: entry $(i,j)$ of $A^k$ is the number of walks of length $k$ from $v_i$ to $v_j$. Prove by induction that $P(k)$ holds for all $k \ge 1$.`,
    a: [r`Base $k = 1$: $a_{ij} = 1$ exactly when there is an edge $v_i \to v_j$, the only walk of length $1$.`,
      r`Step: assume $P(k)$. A walk of length $k+1$ from $v_i$ to $v_j$ is an edge $v_i \to v_h$ followed by a walk of length $k$ from $v_h$ to $v_j$.`,
      r`So the number is $\sum_h a_{ih}\,(A^k)_{hj} = (A \cdot A^k)_{ij} = (A^{k+1})_{ij}$, which is $P(k+1)$.`] },
  { id: 'geometric', ref: SUM, q: r`Let $x \ne 1$ and $P(n)$: $\sum_{i=0}^{n-1} x^i = \dfrac{1 - x^n}{1 - x}$. Prove by induction that $P(n)$ holds for all $n \ge 1$.`,
    a: [r`Base $n = 1$: the left side is $1$ and the right side is $\tfrac{1 - x}{1 - x} = 1$.`,
      r`Step: assume $P(n)$. Then $\sum_{i=0}^{n} x^i = \dfrac{1 - x^n}{1 - x} + x^n = \dfrac{1 - x^n + x^n - x^{n+1}}{1 - x} = \dfrac{1 - x^{n+1}}{1 - x}$, which is $P(n+1)$.`] },
  { id: 'benes', ref: NET, q: r`Let $P(a)$: the Beneš network with $N = 2^a$ inputs routes every permutation with congestion $1$. Prove by induction that $P(a)$ holds for all $a \ge 1$.`,
    a: [r`Base $a = 1$: one $2 \times 2$ switch passes the two packets straight or crossed, one packet each way.`,
      r`Step: assume $P(a)$. Join two packets by an edge if their inputs differ by $N/2$ (same first-level switch) or their outputs differ by $N/2$ (same last-level switch).`,
      r`Each packet has at most one edge of each kind, and edges of the two kinds alternate around any cycle, so every cycle is even and the graph has a $2$-coloring.`,
      r`Send one color through the upper Beneš subnetwork and the other through the lower one. The first and last levels then carry one packet per switch side, and by $P(a)$ each subnetwork routes its packets with congestion $1$. This is $P(a+1)$.`] },
  { id: 'bounds', ref: APP, plain: true, q: r`Let $f$ be increasing and positive, $S = \sum_{i=1}^{n} f(i)$ and $I = \int_1^n f(x)\,dx$. Prove that $I + f(1) \le S \le I + f(n)$.`,
    a: [r`For an increasing $f$ and each $i$: $f(i) \le \int_i^{i+1} f(x)\,dx \le f(i+1)$.`,
      r`Add these for $i = 1, \dots, n-1$: $\sum_{i=1}^{n-1} f(i) \le I \le \sum_{i=2}^{n} f(i)$.`,
      r`Add $f(n)$ to the left sum: $S \le I + f(n)$. Add $f(1)$ to the right sum: $I + f(1) \le S$.`] },
  { id: 'bigtheta', ref: ASY, plain: true, q: r`Prove from the definitions that $6x^3 + 5x^2 = \Theta(x^3)$.`,
    a: [r`Upper bound: for $x \ge 1$, $5x^2 \le 5x^3$, so $6x^3 + 5x^2 \le 11x^3$. Take $c = 11$, $x_0 = 1$: $f = O(x^3)$.`,
      r`Lower bound: $6x^3 + 5x^2 \ge 6x^3$ for all $x \ge 0$, so $f = \Omega(x^3)$.`, r`Both hold, so $f = \Theta(x^3)$.`] },
];

export function makeProof(rnd) {
  const pr = pick(PROOFS, rnd);
  return { stem: 'Proof.', parts: [{ pts: 60, q: pr.q, a: pr.a, facts: { id: pr.id, induction: !pr.plain } }], refs: [pr.ref] };
}
