# Product: CAU Math

## Shared learner needs

- The learner is a first-year student who studies in Vietnamese.
- Design for desktop use. Support mobile and tablet only when asked.
- Fit each screen in about 1280 × 720 pixels. Let long lists scroll inside their own cards. Use layout and disclosure controls to reduce page scrolling. Keep all useful information.
- Put the main point first. Use short text, tables, and arrows. Keep technical terms in their standard form.
- Use free resources, such as system fonts and open-source icons. Do not add paid services.
- Keep the current Study_Hub design tokens for color, type, radius, and spacing. Change the visual style only when asked.

## Product purpose

CAU Math provides study apps for Logic Circuit, Linear Algebra, and Discrete Math. Learners study with cards, use worked solvers, practice question types, and take mock exams.

The main user is a learner who studies for a midterm on a laptop, in class or at home. The learner needs to answer short questions and see whether the answer is right and why.

The main screen tasks are to answer a question, open the correct tool, and find the next chapter to practice.

## Technical constraints

- Use Vite and plain JavaScript.
- Serve all three apps from one development server.
- Keep reusable app code in `shared/`.
- Use system light and dark themes.
- Keep Vietnamese and English UI support.
- Study_Hub is a separate repository. It does not build a math mirror.

## Intentional design details

Keep the colored left border on the main callout cards. It marks the most important card on a screen. Keep the list disclosure chevrons. Some border edges form these chevrons and can look like a side border during a scan.
