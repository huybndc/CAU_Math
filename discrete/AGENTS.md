# Discrete Math

This app follows MCS (MIT 6.042J, 2017). Rosen provides supporting material.

## Course structure

Chapter numbers follow the syllabus: D1 propositions; D2 quantifiers and proof; D3 sets and functions; D4 induction; D5 invariants and strong induction; D6 divisibility and gcd; D7 congruence and RSA; D8 graphs after the midterm.

Use concept questions for proof-method skills such as choosing a proof method and finding a proof error. See D27. To add a chapter, add its page, include, `main.js` entry, and `SUBJECTS.discrete` entry in `shared/logic/syllabus.js`.

## Pure logic modules

- `logic/prop-logic.js` parses proposition symbols, builds truth tables, checks equivalence, and prints expressions with textbook parentheses. Row zero means all variables are false.
- `logic/number-theory.js` implements Euclid, Pulverizer, modular inverse, modular exponentiation, φ, and RSA. Return intermediate steps for explanations.
- `logic/quant.js` evaluates finite domains and pushes negation inward. `sameOnSamples` checks that two formulas differ on random interpretations.
- `logic/graph.js` implements simple graphs, BFS, components, two-coloring, odd-cycle detection, Euler paths, Havel–Hakimi, and brute-force isomorphism checks.
- `logic/chN-quiz.js` computes answers. Do not copy answer values from labels. Grade answers such as Bézout identities by checking their properties, not their strings.
- Test each question type with 200 seeds in `tests/quiz.test.js`.

## Tools

`ui/tools.js` provides the truth table (D1), Euclid and Pulverizer (D6), modular exponentiation, and RSA (D7). Keep the markup in each chapter's interactive pane and text in `i18n/{vi,en}/tools.js`. Call the pure `logic/` modules; do not duplicate their calculations in the UI.

Preserve learner content, source text, and UI strings in their original language.
