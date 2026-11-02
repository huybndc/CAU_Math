# Linear Algebra Plan

This plan follows Strang's *Linear Algebra and Its Applications* and MIT 18.06. Milestones 0–3 are complete. Milestone 4 is the next chapter. Do not start a new milestone while tests fail.

## Architecture

```text
CAU_Math_App
├── Logic Circuit
├── Linear Algebra
├── Discrete Math
└── shared math-app framework
```

The app uses three layers:

- `src/logic/` performs math, such as vector and matrix operations and Gaussian elimination. It does not access the DOM or pixels.
- `src/geometry/` maps coordinates, projects 3D points, clips shapes, and computes animation values. It does not access the DOM or perform linear algebra.
- `src/ui/` joins the math and geometry layers with the DOM and canvas.

Keep logic and geometry pure so Node tests can verify them. Use one test file per logic or geometry module. Keep paired VI and EN UI dictionaries aligned. Store lessons in `src/content/theory-chN.{vi,en}.md`.

## Completed milestones

### M0: Project base

Added Vite, the shared include plugin, file-size checks, bilingual dictionaries, two-level chapter navigation, and lesson rendering. Added base vector and matrix operations and `geometry/plane2d.js`. Tests cover these modules.

### M1: Vectors

Added vector operations and lessons. Canvas 2D shows vector addition and dot-product projection. Learners can drag vectors and adjust linear-combination coefficients. Practice generates and grades numeric questions with a tolerance.

### M2: Solving `Ax = b`

Added linear systems, matrix representation, Gaussian elimination, rank, and solution classification. Worked examples show one row operation and reason per step. Learners can choose row operations and get step checks. Practice covers 2×2 and 3×3 systems.

### M3: Vector spaces

Added subspaces, column space, null space, independence, basis, and dimension. The 3D view shows spans in R³. Learners can rotate the camera, drag vectors, and check whether a vector belongs to a span.

## 3D rendering decision

The initial plan proposed Three.js. A build comparison measured these output sizes:

| Option | `dist/index.html` |
|---|---:|
| No 3D after M2 | 160 KB |
| Minimal Three.js scene | 287 KB |
| Three.js with renderer, controls, transparent faces, and raycast | 703 KB |
| Custom Canvas 2D implementation | 200 KB |

The app uses custom Canvas 2D. Current needs include a few vectors, planes through the origin, a grid, and a rotatable camera. Canvas supports these interactions without a graphics dependency. Pure projection and clipping code remains testable in Node. The app also remains usable offline.

The painter's algorithm can draw intersecting planes in the wrong order. `geometry/polygon3d.js` clips polygons and lines against each other's planes before sorting them.

Review this choice if a later chapter needs thousands of simultaneous objects. The renderer can change in `ui/canvas3d.js` because math and geometry stay separate.

## M4: Orthogonality — next work

Topics: orthogonality, projection, least squares, and Gram–Schmidt.

Reuse `geometry/space3d.js`, `geometry/polygon3d.js`, `ui/canvas3d.js`, and `ui/drag3d.js`. `vector.js` already includes projection, perpendicularity, and orthogonality. `ui/vector-draw.js` already draws a projection with a dashed guide and right-angle marker.

Add `logic/orthogonal.js` for step-by-step Gram–Schmidt, projection onto a multi-dimensional subspace, and least-squares solutions through `AᵀAx̂ = Aᵀb`.

## Later chapters

- M5: Determinants (Strang Chapter 5).
- M6: Eigenvalues and eigenvectors (Strang Chapter 6).
- M7+: Singular value decomposition and applications. Create a detailed plan before work starts.

## Standard chapter structure

Each chapter uses `pages/chN.html`, paired `i18n/{vi,en}/chN.js` files, paired lesson files, one quiz module, and three or four UI page modules. Add tests for each new logic and geometry module.
