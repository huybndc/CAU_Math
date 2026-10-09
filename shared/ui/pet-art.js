/* Ba nhân vật SVG kiểu "chibi" (mỗi cái ≤ 3KB, viewBox 64×64): mèo cam, cú xanh, củ mầm. Màu riêng (pastel + nét nâu tím đậm) đọc tốt trên cả nền sáng lẫn tối.
   Mỗi nhân vật có mắt thường (.pe) và mắt vui (.ph, cung ^ ^) — bấm vào nhân vật thì đổi sang .ph. Không ảnh, không thư viện. */
const O = '#3d3240';                                          // màu nét + mắt
const L = `stroke:${O};stroke-width:2;stroke-linejoin:round;stroke-linecap:round`;
const eye = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${O}"/><circle cx="${x + r * .35}" cy="${y - r * .4}" r="${r * .38}" fill="#fff"/>`;
const eyes = (xs, y, r) => `<g class="pe">${xs.map(x => eye(x, y, r)).join('')}</g><g class="ph">${xs.map(x => `<path d="M${x - r - .5} ${y + 1}q${r + .5}-${r * 2} ${r * 2 + 1} 0" fill="none" stroke="${O}" stroke-width="2.2" stroke-linecap="round"/>`).join('')}</g>`;
const cheeks = (xs, y) => xs.map(x => `<ellipse cx="${x}" cy="${y}" rx="3.6" ry="2.4" fill="#ff8fa3" opacity=".55"/>`).join('');
const svg = body => `<svg viewBox="0 0 64 64" width="72" height="72" role="img" aria-label="" focusable="false">${body}</svg>`;

export const PET_ART = {
  cat: svg(`<path d="M50 50c8-2 10-12 5-17" fill="none" style="${L};stroke-width:5;stroke:#f2a65a"/>`
    + `<path d="M13 26 10 6l17 10zM51 26 54 6 37 16z" style="fill:#f2a65a;${L}"/><path d="M15 21 14 11l8 5zM49 21 50 11l-8 5z" fill="#ffc9cf"/>`
    + `<ellipse cx="32" cy="40" rx="25" ry="20" style="fill:#f7b970;${L}"/><ellipse cx="32" cy="46" rx="14" ry="10" fill="#fde6c4"/>`
    + `<path d="M28 21v5M32 20v6M36 21v5" style="fill:none;${L};stroke:#c97a3a;stroke-width:2"/>`
    + `${eyes([22, 42], 37, 3.8)}${cheeks([15, 49], 45)}<path d="M30 43h4l-2 2.4z" fill="#ff8fa3"/><path d="M32 45.4v2M28.5 48q3.5 2.6 7 0" style="fill:none;${L};stroke-width:1.6"/>`
    + `<path d="M6 38l8 2M6 44l8-1M58 38l-8 2M58 44l-8-1" style="fill:none;stroke:${O};stroke-width:1.2;opacity:.45;stroke-linecap:round"/>`),
  owl: svg(`<path d="M12 24 9 7l16 9zM52 24 55 7 39 16z" style="fill:#7fb3c8;${L}"/>`
    + `<ellipse cx="32" cy="40" rx="23" ry="21" style="fill:#8fc1d6;${L}"/><ellipse cx="32" cy="46" rx="14" ry="13" fill="#e6f3f8"/>`
    + `<path d="M24 42q2 3 4 0M30 48q2 3 4 0M36 42q2 3 4 0" style="fill:none;stroke:#8fc1d6;stroke-width:1.6;stroke-linecap:round"/>`
    + `<circle cx="22" cy="33" r="9" style="fill:#fff;${L}"/><circle cx="42" cy="33" r="9" style="fill:#fff;${L}"/>${eyes([22, 42], 34, 4.4)}`
    + `<path d="M29 40h6l-3 5z" style="fill:#f6bd4b;${L};stroke-width:1.6"/>${cheeks([13, 51], 42)}`
    + `<path d="M27 58v3M37 58v3" style="fill:none;${L};stroke:#f6bd4b;stroke-width:3"/><path d="M10 40q-4 8 3 14M54 40q4 8-3 14" fill="none" style="${L};stroke:#6ea3b9;stroke-width:3"/>`),
  plant: svg(`<path d="M32 26V16" style="fill:none;${L};stroke:#4f9a5f"/><path d="M32 18C30 8 22 5 13 8c1 10 9 14 19 10z" style="fill:#7fcf8e;${L}"/><path d="M32 16C34 6 42 3 51 6c-1 10-9 14-19 10z" style="fill:#a4e0a8;${L}"/>`
    + `<ellipse cx="32" cy="38" rx="17" ry="14" style="fill:#b8e8b0;${L}"/>${eyes([25.5, 38.5], 37, 3.2)}${cheeks([20.5, 43.5], 42.5)}<path d="M29.5 41.4q2.5 2.4 5 0" style="fill:none;${L};stroke-width:1.8"/>`
    + `<path d="M15 48h34l-4 12H19z" style="fill:#e29a78;${L}"/><path d="M13 46h38v4H13z" style="fill:#eeb08f;${L}"/>`),
};
