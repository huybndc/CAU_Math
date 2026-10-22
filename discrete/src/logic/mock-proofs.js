/* ---------------------------------------------------------------
   KHO NỘI DUNG của "Đề như thật" Discrete (thuần, chữ Anh, LaTeX $…$): định nghĩa, bổ đề, Fermat, RSA, quy nạp trên cây.
   Mỗi mục: { id, name, ref: [mục MCS, tên], q, a[] } — a là lời giải mẫu từng bước. Số mục theo MCS (MIT 6.042J, 2017) như các
   chương khác của app; riêng "cây" ghi theo chương Simple Graphs vì chưa kiểm số mục.
   --------------------------------------------------------------- */
const r = String.raw;

export const DEFINITIONS = [
  { id: 'divides', ref: ['9.1', 'Divisibility'], name: 'divisibility', q: r`Define what it means for an integer $a$ to divide an integer $b$.`,
    a: [r`$a \mid b$ (read "$a$ divides $b$") means there is an integer $k$ such that $b = ka$.`] },
  { id: 'prime', ref: ['9.1–9.4', 'Divisibility, gcd and primes'], name: 'prime', q: r`Define a prime number.`,
    a: [r`An integer $p > 1$ is prime if its only positive divisors are $1$ and $p$.`] },
  { id: 'gcd', ref: ['9.2', 'The greatest common divisor'], name: 'gcd', q: r`Define the greatest common divisor $\gcd(a,b)$ of two integers $a, b$ (not both $0$).`,
    a: [r`$\gcd(a,b)$ is the largest integer that divides both $a$ and $b$.`] },
  { id: 'coprime', ref: ['9.2', 'The greatest common divisor'], name: 'relatively prime', q: r`Define when two integers $a$ and $b$ are relatively prime.`,
    a: [r`$a$ and $b$ are relatively prime if $\gcd(a,b) = 1$, i.e. their only common positive divisor is $1$.`] },
  { id: 'congruence', ref: ['9.6', 'Modular arithmetic'], name: 'congruence', q: r`Define congruence modulo $n$: what does $a \equiv b \pmod n$ mean?`,
    a: [r`$a \equiv b \pmod n$ means $n \mid (a - b)$; equivalently $a$ and $b$ have the same remainder when divided by $n$.`] },
  { id: 'inverse', ref: ['9.9', 'Multiplicative inverses and cancelling'], name: 'multiplicative inverse', q: r`Define the multiplicative inverse of $k$ modulo $n$, and say when it exists.`,
    a: [r`A multiplicative inverse of $k$ modulo $n$ is an integer $k^{-1}$ with $k \cdot k^{-1} \equiv 1 \pmod n$.`, r`It exists exactly when $\gcd(k, n) = 1$.`] },
  { id: 'totient', ref: ['9.10', "Euler's theorem"], name: 'Euler totient', q: r`Define Euler's totient function $\phi(n)$.`,
    a: [r`$\phi(n)$ is the number of integers $k$ with $0 \le k < n$ such that $\gcd(k, n) = 1$.`] },
  { id: 'simple', ref: ['12.1–12.9', 'Simple graphs'], name: 'simple graph', q: r`Define a simple graph.`,
    a: [r`A simple graph $G = (V, E)$ has a nonempty set $V$ of vertices and a set $E$ of edges, each edge a $2$-element subset of $V$ (no loops, no repeated edges).`] },
  { id: 'degree', ref: ['12.1–12.9', 'Simple graphs'], name: 'degree', q: r`Define the degree of a vertex in a simple graph.`,
    a: [r`The degree of a vertex $v$ is the number of edges incident to $v$ (the number of neighbors of $v$).`] },
  { id: 'path', ref: ['12.1–12.9', 'Simple graphs'], name: 'path', q: r`Define a walk and a path in a simple graph.`,
    a: [r`A walk is a sequence of vertices $v_0, v_1, \dots, v_k$ with $v_{i-1}v_i$ an edge for every $i$.`, r`A path is a walk in which no vertex repeats.`] },
  { id: 'connected', ref: ['12.1–12.9', 'Simple graphs'], name: 'connected graph', q: r`Define a connected graph.`,
    a: [r`A graph is connected if every pair of vertices is joined by a path.`] },
  { id: 'cycle', ref: ['12.1–12.9', 'Simple graphs'], name: 'cycle', q: r`Define a cycle in a simple graph.`,
    a: [r`A cycle is a walk $v_0, v_1, \dots, v_k = v_0$ with $k \ge 3$ in which the vertices $v_0, \dots, v_{k-1}$ are all different.`] },
  { id: 'tree', ref: ['12', 'Simple graphs (forests and trees)'], name: 'tree', q: r`Define a tree.`,
    a: [r`A tree is a connected simple graph with no cycles.`] },
  { id: 'leaf', ref: ['12', 'Simple graphs (forests and trees)'], name: 'leaf', q: r`Define a leaf of a tree.`,
    a: [r`A leaf is a vertex of degree $1$.`] },
  { id: 'induction', ref: ['5.1', 'Ordinary induction'], name: 'induction principle', q: r`State the principle of ordinary induction for a predicate $P(n)$.`,
    a: [r`If $P(0)$ is true, and $P(n)$ implies $P(n+1)$ for every $n \ge 0$, then $P(n)$ is true for all $n \ge 0$.`] },
];

export const LEMMAS = [
  { id: 'cancel', q: r`Prove the cancellation lemma: let $n > 1$ and $\gcd(k, n) = 1$. If $ak \equiv bk \pmod n$, then $a \equiv b \pmod n$.`,
    a: [r`$ak \equiv bk \pmod n$ means $n \mid (a-b)k$.`,
      r`Since $\gcd(k, n) = 1$, Bézout's identity gives integers $s, t$ with $sn + tk = 1$.`,
      r`Multiply by $(a - b)$: $s\,n(a-b) + t\,k(a-b) = a - b$.`,
      r`$n$ divides the first term, and divides the second because $n \mid k(a-b)$. So $n \mid a - b$, i.e. $a \equiv b \pmod n$. $\blacksquare$`] },
  { id: 'euclid', q: r`Prove Euclid's lemma: if $p$ is prime and $p \mid ab$, then $p \mid a$ or $p \mid b$.`,
    a: [r`Suppose $p \nmid a$. The only positive divisors of $p$ are $1$ and $p$, so $\gcd(p, a) = 1$.`,
      r`Bézout's identity gives integers $s, t$ with $sp + ta = 1$.`,
      r`Multiply by $b$: $spb + tab = b$.`,
      r`$p$ divides $spb$, and $p$ divides $tab$ because $p \mid ab$. So $p \mid b$. $\blacksquare$`] },
  { id: 'inverse', q: r`Prove: if $\gcd(a, n) = 1$, then $a$ has a multiplicative inverse modulo $n$.`,
    a: [r`Bézout's identity gives integers $s, t$ with $sa + tn = 1$.`,
      r`Then $sa = 1 - tn \equiv 1 \pmod n$, because $n \mid tn$.`,
      r`So $s$ (reduced mod $n$) is a multiplicative inverse of $a$ modulo $n$. $\blacksquare$`] },
];

export const FERMAT = {
  q: r`Prove Fermat's little theorem: if $p$ is prime and $p \nmid a$, then $a^{p-1} \equiv 1 \pmod p$.`,
  a: [r`Consider the $p - 1$ numbers $a, 2a, \dots, (p-1)a$ and their remainders mod $p$.`,
    r`None is $\equiv 0$: $p \nmid a$ and $p \nmid i$ for $1 \le i \le p-1$, so $p \nmid ia$ by Euclid's lemma.`,
    r`They are pairwise different mod $p$: if $ia \equiv ja \pmod p$ with $1 \le i, j \le p-1$, then $\gcd(a, p) = 1$ and the cancellation lemma give $i \equiv j$, so $i = j$.`,
    r`So the remainders are $1, 2, \dots, p-1$ in some order. Multiplying all of them: $a^{p-1}(p-1)! \equiv (p-1)! \pmod p$.`,
    r`$\gcd((p-1)!, p) = 1$, since $p$ is prime and divides none of the factors. Cancel $(p-1)!$: $a^{p-1} \equiv 1 \pmod p$. $\blacksquare$`],
};

export const RSA = {
  q: r`Prove that RSA decryption is correct: let $p \ne q$ be primes, $n = pq$, and $e, d$ positive integers with $ed \equiv 1 \pmod{(p-1)(q-1)}$. Show that $(m^e)^d \equiv m \pmod n$ for every integer $m$.`,
  a: [r`Write $ed = 1 + k(p-1)(q-1)$ with an integer $k \ge 0$. Then $(m^e)^d = m^{ed}$.`,
    r`Modulo $p$: if $p \mid m$, both $m^{ed}$ and $m$ are $\equiv 0$. Otherwise Fermat gives $m^{p-1} \equiv 1$, so $m^{ed} = m\,\bigl(m^{p-1}\bigr)^{k(q-1)} \equiv m \pmod p$.`,
    r`The same argument with $q$ gives $m^{ed} \equiv m \pmod q$.`,
    r`So $p \mid m^{ed} - m =: x$, say $x = pj$. Since $q \mid pj$ and $q \nmid p$, Euclid's lemma gives $q \mid j$, so $pq \mid x$.`,
    r`Hence $m^{ed} \equiv m \pmod{n}$. $\blacksquare$`],
};

const LEAF = [r`A tree with at least $2$ vertices has a leaf. It is connected, so it has an edge; take a longest path. Its endpoint $v$ has degree $1$: another neighbour would either extend the path (impossible, it is longest) or lie on the path and close a cycle (impossible in a tree).`,
  r`Removing a leaf $v$ keeps the graph connected (a path between two other vertices never passes through a vertex of degree $1$) and acyclic, so $T - v$ is a tree with one fewer vertex.`];

export const TREE_CLAIMS = [
  { id: 'leaves', q: r`Let $P(n)$ be: every tree with $n$ vertices has at least $2$ leaves. Prove by induction that $P(n)$ holds for all $n \ge 2$.`,
    a: [r`Base case $n = 2$: a tree on $2$ vertices is a single edge, and both vertices have degree $1$. So there are $2$ leaves.`,
      r`Inductive step: assume $P(n)$ for some $n \ge 2$, and let $T$ be a tree with $n + 1$ vertices.`, ...LEAF,
      r`Let $v$ be a leaf of $T$ and $u$ its neighbour. By $P(n)$, the tree $T - v$ has at least $2$ leaves.`,
      r`Adding $v$ back changes only the degrees of $v$ (it is $1$) and of $u$ (it goes up by $1$). So $v$ is a leaf of $T$, and at most one leaf of $T - v$ (namely $u$) stops being a leaf.`,
      r`Hence $T$ has at least $(2 - 1) + 1 = 2$ leaves, which proves $P(n+1)$. By induction, $P(n)$ holds for all $n \ge 2$. $\blacksquare$`] },
  { id: 'edges', q: r`Let $P(n)$ be: every tree with $n$ vertices has exactly $n - 1$ edges. Prove by induction that $P(n)$ holds for all $n \ge 1$.`,
    a: [r`Base case $n = 1$: a tree with one vertex has $0 = 1 - 1$ edges.`,
      r`Inductive step: assume $P(n)$ for some $n \ge 1$, and let $T$ be a tree with $n + 1 \ge 2$ vertices.`, ...LEAF,
      r`Let $v$ be a leaf of $T$. By $P(n)$, the tree $T - v$ has $n - 1$ edges. $T$ has exactly one more edge (the one at $v$), so $n = (n + 1) - 1$ edges.`,
      r`This proves $P(n+1)$. By induction, $P(n)$ holds for all $n \ge 1$. $\blacksquare$`] },
  { id: 'bipartite', q: r`Let $P(n)$ be: the vertices of every tree with $n$ vertices can be colored black or white so that every edge joins two different colors. Prove by induction that $P(n)$ holds for all $n \ge 1$.`,
    a: [r`Base case $n = 1$: one vertex and no edges, so any color works.`,
      r`Inductive step: assume $P(n)$ for some $n \ge 1$, and let $T$ be a tree with $n + 1 \ge 2$ vertices.`, ...LEAF,
      r`Let $v$ be a leaf with neighbour $u$. By $P(n)$, color $T - v$ properly.`,
      r`Give $v$ the color opposite to $u$. Every edge of $T - v$ is fine, and the only new edge $uv$ joins different colors. This proves $P(n+1)$. $\blacksquare$`] },
];
