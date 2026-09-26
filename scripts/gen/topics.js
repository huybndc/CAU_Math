/* ---------------------------------------------------------------
   CHỦ ĐỀ ĐỂ SOẠN CÂU KHÁI NIỆM — phạm vi GIỮA KỲ của 3 môn (PLAN.md).
   Chỉ ghi số mục + tên chủ đề tự diễn đạt (D05), không chép nội dung sách.
   `focus` là gợi ý chỗ sinh viên hay hiểu sai — thứ câu khái niệm nên nhắm tới.
   Thêm chương: thêm một khoá chN (khớp id chương của app).
   --------------------------------------------------------------- */

export const SUBJECT_TOPICS = {
  logic: {
    book: 'M. Morris Mano & Michael D. Ciletti, Digital Design, 6th ed.',
    notation: "Complement is written with a prime: x' (not ¬x or x̄). AND is juxtaposition (xy), OR is +. " +
      'Variable names follow Mano: 2 variables x,y; 3 variables x,y,z; 4 variables w,x,y,z. ' +
      'Minterm lists are written Σm(1, 3, 5); maxterm lists ΠM(0, 2). Numbers in a base are written (1011)2, (7A)16.',
    chapters: {
      ch1: [
        { id: '1.2', title: 'Binary numbers and positional weights', focus: 'weights of fractional digits, base notation' },
        { id: '1.3', title: 'Number-base conversions', focus: 'repeated division reads remainders bottom-up; fractions use repeated multiplication and may not terminate' },
        { id: '1.4', title: 'Octal and hexadecimal numbers', focus: 'grouping bits from the binary point outward' },
        { id: '1.5', title: "Complements: (r-1)'s and r's complement, subtraction with complements", focus: 'end-around carry vs discarding the carry; what no end carry means' },
        { id: '1.6', title: 'Signed binary numbers and overflow', focus: 'sign-magnitude vs 1s vs 2s complement ranges, two zeros, overflow detection' },
        { id: '1.7', title: 'Binary codes: BCD, excess-3, Gray code, ASCII, parity', focus: 'BCD is not binary, BCD addition +6 correction, why Gray code changes one bit, what parity can and cannot detect' },
        { id: '1.8', title: 'Binary storage and registers', focus: 'bits have no meaning until interpreted' },
      ],
      ch2: [
        { id: '2.3', title: 'Axiomatic definition of Boolean algebra (Huntington postulates)', focus: 'what differs from ordinary algebra: x + yz = (x + y)(x + z), no subtraction or division' },
        { id: '2.4', title: 'Basic theorems: duality, absorption, DeMorgan', focus: 'dual is not the complement; DeMorgan must complement every literal' },
        { id: '2.5', title: 'Boolean functions and algebraic simplification', focus: 'truth tables, literal count, consensus' },
        { id: '2.6', title: 'Canonical and standard forms: minterms, maxterms, SOP, POS', focus: 'Σm of F vs ΠM of F, converting between them, standard vs canonical' },
        { id: '2.7', title: 'The 16 functions of two variables', focus: 'XOR vs equivalence, inhibition and implication' },
        { id: '2.8', title: 'Digital logic gates, NAND/NOR as universal gates', focus: 'multi-input NAND/NOR are not associative' },
      ],
      ch3: [
        { id: '3.2', title: 'The map (K-map) method, three variables', focus: 'Gray-code ordering of rows and columns, adjacency' },
        { id: '3.3', title: 'Four-variable K-map, prime implicants, essential prime implicants', focus: 'wrap-around adjacency, groups must be powers of two, EPI definition' },
        { id: '3.4', title: 'Product-of-sums simplification', focus: 'group the 0s, then complement' },
        { id: '3.5', title: "Don't-care conditions", focus: 'use X only when it enlarges a group; never required to cover X' },
        { id: '3.6', title: 'NAND and NOR implementation', focus: 'two-level SOP maps to NAND-NAND, POS to NOR-NOR' },
        { id: '3.8', title: 'Exclusive-OR function, odd function, parity generator', focus: 'XOR of n variables is the odd function; checkerboard K-map' },
      ],
      ch4: [
        { id: '4.3', title: 'Analysis procedure of combinational circuits', focus: 'label intermediate gate outputs; inversion bubbles' },
        { id: '4.4', title: 'Design procedure, code conversion (BCD to excess-3)', focus: 'unused input combinations become don-t-cares' },
        { id: '4.5', title: 'Half/full adders, ripple-carry adder, carry lookahead, adder-subtractor, overflow', focus: 'M = 1 gives A + B complement + 1; V = Cn XOR Cn-1 vs unsigned carry' },
        { id: '4.6', title: 'Decimal (BCD) adder', focus: 'add 0110 when the binary sum exceeds 9' },
        { id: '4.8', title: 'Magnitude comparator', focus: 'xi is XNOR; the highest differing bit decides' },
        { id: '4.9', title: 'Decoders, enable input, function implementation with decoders', focus: 'each output is a minterm; OR for F, NOR with minterms of F complement' },
        { id: '4.10', title: 'Encoders and priority encoders', focus: 'highest index wins; valid output V' },
        { id: '4.11', title: 'Multiplexers, Boolean function implementation with a MUX', focus: 'last variable on data inputs: 0, 1, z, z complement' },
      ],
    },
  },
  linalg: {
    book: 'Gilbert Strang, Introduction to Linear Algebra, 4th ed.',
    notation: 'Vectors in bold words are written as v = (1, 2, 3). Matrices written row by row: [[1, 2], [3, 4]].',
    chapters: {
      ch1: [
        { id: '1.1', title: 'Vectors and linear combinations', focus: 'combinations filling a line, plane or space' },
        { id: '1.2', title: 'Lengths and dot products', focus: 'unit vectors, angle, Schwarz and triangle inequalities' },
        { id: '1.3', title: 'Matrices as combinations of columns', focus: 'Ax as combination of columns, independence and invertibility' },
      ],
      ch2: [
        { id: '2.2', title: 'The idea of elimination', focus: 'pivots, when elimination breaks down (temporary vs permanent)' },
        { id: '2.3', title: 'Elimination using matrices', focus: 'elimination matrices E, order of multiplication' },
        { id: '2.4', title: 'Rules for matrix operations', focus: 'AB ≠ BA, block multiplication, rows times columns' },
        { id: '2.5', title: 'Inverse matrices', focus: '(AB)^-1 = B^-1 A^-1, when an inverse exists' },
        { id: '2.6', title: 'Elimination = factorization: A = LU', focus: 'L holds the multipliers, no row exchanges needed' },
        { id: '2.7', title: 'Transposes and permutations', focus: '(AB)^T = B^T A^T, symmetric matrices, PA = LU' },
      ],
      ch3: [
        { id: '3.1', title: 'Spaces of vectors and subspaces', focus: 'a subspace must contain the zero vector and be closed' },
        { id: '3.2', title: 'The nullspace of A: solving Ax = 0', focus: 'pivot vs free variables, special solutions' },
        { id: '3.3', title: 'Rank and the row reduced form', focus: 'rank = number of pivots' },
        { id: '3.4', title: 'The complete solution to Ax = b', focus: 'particular plus nullspace, solvability conditions' },
        { id: '3.5', title: 'Independence, basis and dimension', focus: 'spanning vs independent vs basis' },
        { id: '3.6', title: 'Dimensions of the four subspaces', focus: 'dimensions r, r, n - r, m - r' },
      ],
    },
  },
  discrete: {
    book: 'Lehman, Leighton & Meyer, Mathematics for Computer Science (MIT 6.042J, 2017); Rosen for background',
    notation: 'Logic connectives ¬ ∧ ∨ → ↔ ⊕; quantifiers ∀ ∃; sets with ∪ ∩ and set-builder notation in words.',
    chapters: {
      ch1: [
        { id: '1.1', title: 'Propositions, truth tables, implication', focus: 'false premise makes implication true; converse vs contrapositive' },
        { id: '1.2', title: 'Logical equivalence, validity, satisfiability', focus: 'tautology vs satisfiable' },
      ],
      ch2: [
        { id: '2.1', title: 'Predicates and quantifiers', focus: 'order of mixed quantifiers, negating quantified statements' },
        { id: '2.2', title: 'Proof methods and the well ordering principle', focus: 'direct, contrapositive, contradiction, cases; common invalid proofs' },
      ],
      ch3: [
        { id: '3.1', title: 'Sets, functions and relations', focus: 'injective / surjective / bijective, power set size' },
      ],
      ch4: [
        { id: '4.1', title: 'Ordinary induction', focus: 'base case, what the inductive hypothesis may assume' },
      ],
      ch5: [
        { id: '5.1', title: 'Strong induction, invariants and state machines', focus: 'preserved invariant, partial vs total correctness' },
      ],
      ch6: [
        { id: '6.1', title: 'Divisibility, gcd, Euclid and the Pulverizer, primes', focus: 'gcd as smallest positive linear combination' },
      ],
      ch7: [
        { id: '7.1', title: 'Congruences, inverses mod n, Euler phi, RSA', focus: 'inverse exists iff gcd = 1; why RSA decryption works' },
      ],
      ch8: [
        { id: '8.1', title: 'Graphs: degree, walks, connectivity, bipartite, Euler, trees, isomorphism', focus: 'same degree sequence does not imply isomorphic; odd cycle vs bipartite' },
      ],
    },
  },
};

/** { ch1: ['1.2', …], … } — để validateItem kiểm mục hợp lệ. */
export function sectionIds(subject) {
  const t = SUBJECT_TOPICS[subject];
  return Object.fromEntries(Object.entries(t.chapters).map(([ch, list]) => [ch, list.map(s => s.id)]));
}

/** Mục của một chương theo id; không có thì undefined. */
export function findSection(subject, id) {
  for (const [chapter, list] of Object.entries(SUBJECT_TOPICS[subject].chapters)) {
    const s = list.find(x => x.id === id);
    if (s) return { chapter, ...s };
  }
  return undefined;
}
