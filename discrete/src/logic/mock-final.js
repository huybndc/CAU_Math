/* ---------------------------------------------------------------
   PRACTICE FINAL EXAM (Discrete Math), pure. Scope = class after the midterm (D75): communication networks (Beneš),
   Euler tours, directed graphs and walk counting, relations, sums (annuities, geometric series).
   Form follows the midterm: definitions, short answers, short proofs. English text, LaTeX $…$; facts = raw data for tests.
   Section numbers follow MCS (MIT 6.042J, 2017); "11" and "10" are chapter-level where the section is not checked.
   --------------------------------------------------------------- */
const r = String.raw;
const int = (lo, hi, rnd) => lo + Math.floor(rnd() * (hi - lo + 1));
const pick = (arr, rnd) => arr[Math.floor(rnd() * arr.length)];
const shuffled = (arr, rnd) => arr.map(x => [rnd(), x]).sort((a, b) => a[0] - b[0]).map(p => p[1]);
const mat = M => `\\begin{bmatrix}${M.map(row => row.join(' & ')).join(' \\\\ ')}\\end{bmatrix}`;
const money = x => x.toFixed(2);

const NET = ['11', 'Communication networks'], DIG = ['10', 'Directed graphs and partial orders'], SUM = ['14.1', 'The value of an annuity'];
const EUL = ['12', 'Simple graphs (Euler tours)'], REL = ['10', 'Directed graphs: relations'];

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

export function makeDefinitions(rnd) {
  const defs = shuffled(DEFS, rnd).slice(0, 4), seen = new Set();
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
  return {
    stem: r`Short answers. Give the value and one line of reason.`,
    parts: [
      { pts: 10, q: r`Let $N = ${N}$. ${net[0]}`, a: [r`$${net[2]} = ${netVal}$ for $N = ${N}$ ($\log N = ${lg}$).`], facts: { N, lg, id: NETS.indexOf(net), value: netVal } },
      { pts: 10, q: r`In a Beneš network with $N = ${N}$ inputs, which input shares a first-level switch with input $${port}$? Can their packets use the same subnetwork?`,
        a: [r`Input $${partner}$ ($= ${port} + N/2$). No: the two packets of one first-level switch must go to different subnetworks.`], facts: { N, port, partner } },
      { pts: 10, q: r`A connected graph has vertices $v_1, \dots, v_5$ and edges $${edges.map(([a, b]) => `${vx(a)}${vx(b)}`).join(', ')}$. Does it have an Euler tour, an Euler walk that is not a tour, or neither?`,
        a: [r`Degrees: $${deg.join(', ')}$; ${odd} odd. ${eul === 'tour' ? 'All even, so it has an Euler tour.' : eul === 'walk' ? r`Exactly $2$ odd, so it has an Euler walk (from one odd vertex to the other) but no tour.` : r`More than $2$ odd, so neither.`}`],
        facts: { edges, eul } },
      { pts: 10, q: r`A digraph on $v_1, \dots, v_4$ has adjacency matrix $A = ${mat(A)}$. How many walks of length $3$ go from $${vx(wi)}$ to $${vx(wj)}$?`,
        a: [r`It is entry $(${wi + 1},${wj + 1})$ of $A^3$. $A^2 = ${mat(A2)}$, $A^3 = ${mat(A3)}$, so the answer is $${walks}$.`], facts: { A, wi, wj, walks } },
      { pts: 10, q: r`The relation $R = \{${pairs.map(([a, b]) => `(${a},${b})`).join(', ') || r`\,`}\}$ is on $\{1, 2, 3\}$. Is $R$ reflexive? Symmetric? Transitive?`,
        a: [r`Reflexive: ${yn(refl)}. Symmetric: ${yn(sym)}. Transitive: ${yn(trans)}.`], facts: { pairs, refl, sym, trans } },
    ],
    refs: [NET, EUL, DIG, REL],
  };
}

export function makeAnnuity(rnd) {
  const m = pick([100, 500, 1000, 2000], rnd), pc = pick([4, 5, 8, 10], rnd), n = pick([3, 4, 5, 10], rnd), p = pc / 100, x = 1 / (1 + p);
  const V = m * (1 - x ** n) / (1 - x), Vinf = m * (1 + p) / p;
  return {
    stem: r`An annuity pays $${m}$ dollars at the start of each year. The yearly interest rate is $p = ${pc}\%$. Let $x = 1/(1+p)$.`,
    parts: [
      { pts: 20, q: r`Prove that $\sum_{i=0}^{n-1} x^i = \dfrac{1 - x^n}{1 - x}$ for $x \ne 1$ by the perturbation method.`,
        a: [r`Let $S = 1 + x + \dots + x^{n-1}$. Then $xS = x + x^2 + \dots + x^n$.`, r`Subtract: $S - xS = 1 - x^n$, so $S = \dfrac{1 - x^n}{1 - x}$ ($x \ne 1$).`], facts: {} },
      { pts: 20, q: r`Find the present value of the annuity if it pays $${n}$ times. Give the formula and the value to $2$ decimals.`,
        a: [r`The payment at the start of year $i+1$ is worth $${m}x^i$ today, so $V = ${m}\sum_{i=0}^{${n - 1}} x^i = ${m}\dfrac{1 - x^{${n}}}{1 - x}$.`, r`$V \approx ${money(V)}$ dollars.`], facts: { m, p, n, V } },
      { pts: 10, q: r`Find the present value if the annuity pays forever. Why does the infinite sum converge?`,
        a: [r`$|x| < 1$, so $x^n \to 0$ and $V = \dfrac{${m}}{1 - x} = ${m}\cdot\dfrac{1 + p}{p} = ${money(Vinf)}$ dollars.`], facts: { Vinf } },
    ],
    refs: [SUM, ['14.1', 'Sums: the perturbation method']],
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
];

export function makeProof(rnd) {
  const pr = pick(PROOFS, rnd);
  return { stem: 'Proof.', parts: [{ pts: 60, q: pr.q, a: pr.a, facts: { id: pr.id } }], refs: [pr.ref] };
}
