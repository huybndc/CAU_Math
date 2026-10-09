/* Bộ chạy nhân vật pixel — thuần, không DOM. Mỗi khung trả lưới màu (hàng × cột); giao diện tự vẽ lên canvas hoặc SVG.
   Hình: art.json (lớp thân + bộ phận có điểm xoay). Động tác bộ phận (đuôi, tai, đầu), biểu cảm mặt, hiệu ứng nguyên tố
   chạy quanh bộ phận nguyên tố — không bao giờ lên mặt. Sửa hình ở art.json (xuất từ _plans/pet-art), không sửa tay trong code. */
import ART from './pet-art.json' with { type: 'json' };

const CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
export const ART_IDS = Object.keys(ART);
export const PAD = { x: 3, top: 5, bottom: 1 };
/** Mọi nhân vật cùng một khung (lấy cỡ lớn nhất), căn giữa ngang, chân chạm đáy ⇒ đổi nhân vật không làm lệch bố cục. */
const rowsOf = k => ART[k].layers.body;
export const FRAME = { w: Math.max(...ART_IDS.map(k => rowsOf(k)[0].length)), h: Math.max(...ART_IDS.map(k => rowsOf(k).length)) };

/* Mắt vẽ bằng MẪU cố định 4×5 ô cho mọi biểu cảm, neo tại góc trên-trái mắt gốc ⇒ vị trí, cỡ, khoảng cách hai mắt
   giữ nguyên giữa các biểu cảm; mắt "mở" cũng vẽ lại từ mẫu nên hai mắt luôn giống hệt nhau.
   Ký tự: e = mắt, w = điểm sáng, '.' = giữ da. `top` = hàng bắt đầu (âm = trên mắt). Điểm sáng không lật giữa hai mắt (cùng hướng sáng). */
const EYE = {
  open: { top: 0, rows: ['.ee.', 'ewee', 'eeee', 'eewe', '.ee.'] },
  shut: { top: 3, rows: ['eeee'] },                                   // nhắm: một vạch
  low: { top: 2, rows: ['eeee', 'eewe', '.ee.'] },                    // buồn ngủ: mí sụp, còn nửa dưới
  arc: { top: 1, rows: ['.ee.', 'e..e'] },                            // cười ^^
  cup: { top: 2, rows: ['e..e', '.ee.'] },                            // nhắm mãn nguyện ‿‿
  wide: { top: -1, rows: ['.ee.', 'ewee', 'eeee', 'eeee', 'eewe', '.ee.'] },   // ngạc nhiên: cao thêm một hàng
  shine: { top: 0, rows: ['.ee.', 'ewee', 'eeee', 'ewwe', '.ee.'] },  // háo hức: thêm điểm sáng
  squeeze: { top: 1, rows: ['ee..', '..ee', 'ee..'], mirror: true },  // >< (mắt phải lật thành <)
  side: { top: 0, rows: ['.ee.', 'eeew', 'eeee', 'eeee', '.ee.'] },  // liếc phải: điểm sáng dồn sang phải, mắt không dời chỗ
};
/** Chi tiết quanh mắt (toạ độ của mắt TRÁI, mắt phải lật ngang): lông mày, giọt lệ, má đỏ. */
const AROUND = {
  sadBrow: [[0, -1, 'b'], [1, -1, 'b'], [2, -2, 'b'], [3, -2, 'b']],  // đầu trong nhướng lên
  sternBrow: [[0, -2, 'b'], [1, -2, 'b'], [2, -1, 'b'], [3, -1, 'b']],
  tear: [[0, 5, 't'], [0, 6, 't']],
  blush: [[-1, 6, 'k'], [0, 6, 'k'], [1, 6, 'k']],
};
/** Biểu cảm → [mẫu mắt, chi tiết quanh mắt…]. Mỗi biểu cảm khác "neutral" ở mắt hoặc chi tiết quanh mắt. */
const LOOK = {
  neutral: ['open'], look: ['side'], tilt: ['open'],
  blink: ['shut'], yawn: ['shut'], sleepy: ['low'], lazy: ['low', 'blush'],
  happy: ['arc'], wag: ['arc'], cheer: ['arc', 'blush'], wave: ['arc'], petted: ['arc', 'blush'],
  relieved: ['cup'], shy: ['cup', 'blush'], proud: ['cup', 'sternBrow'],
  surprised: ['wide'], eager: ['shine', 'blush'], squint: ['squeeze'],
  sad: ['open', 'sadBrow', 'tear'], hungry: ['open', 'sadBrow'], focus: ['open', 'sternBrow'], final: ['open', 'sternBrow'],
  wink: ['open'],                                                     // mắt phải thành ^ (xem face)
};
const AROUND_COLOR = { t: '#8fb4e8', k: '#f08aa6' };
/** Biểu tượng nhỏ phía trên đầu ('x' = ô vẽ), ngoài thân. */
const SYM = { heart: ['x.x', 'xxx', '.x.'], spark: ['.x.', 'xxx', '.x.'], z: ['xxx', '.x.', 'xxx'], ask: ['xx.', '.x.', '...', '.x.'] };
const DECO = { cheer: ['spark'], final: ['spark'], wave: ['heart'], petted: ['heart'], relieved: ['sweat'], sleepy: ['z'], yawn: ['z'], tilt: ['ask'] };
const SYM_COLOR = { heart: '#e85d8a', spark: '#f2c14e', z: '#6b7a99', ask: '#6b7a99', sweat: '#8fb4e8' };

/** Động tác riêng của từng nhân vật (giây). Động tác thân (nảy, lắc…) do CSS pet-* lo. */
export const SIGNATURE = {
  cao: { wag: 1.6, flare: 1.4 }, cu: { flap: 1.2, shoot: 1.4 }, tho: { ears: 1.1, rain: 2.2 },
  gau: { bloom: 2, shake: 1 }, rua: { hide: 2, glow: 1.6 }, meo: { bubble: 1.8, wag: 1.4 },
};

const rnd = (a, b, c) => { let h = (a * 374761393 + b * 668265263 + c * 2147483647) | 0; h = (h ^ (h >> 13)) * 1274126177 | 0; return ((h ^ (h >> 16)) >>> 0) / 4294967295; };
const decode = (rows, cols) => rows.map(r => [...r].map(ch => (ch === '.' ? null : cols[CHARS.indexOf(ch)])));
const wave = (p, len) => Math.sin(Math.min(1, Math.max(0, p / len)) * Math.PI);
const fade = (p, len) => Math.max(0, 1 - p / len);

function rotate(g, ang, px, py) {
  const H = g.length, W = g[0].length, ca = Math.cos(-ang), sa = Math.sin(-ang);
  const o = g.map(r => r.map(() => null));
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const dx = x + .5 - px, dy = y + .5 - py, ix = Math.floor(px + dx * ca - dy * sa), iy = Math.floor(py + dx * sa + dy * ca);
    if (iy >= 0 && iy < H && ix >= 0 && ix < W) o[y][x] = g[iy][ix];
  }
  return o;
}

/** Tìm các mắt: cụm ô liền màu mắt (≥4 ô); hộp rộng thêm 1 ô mỗi bên để chứa điểm sáng. */
function eyesOf(g, eyeCol) {
  const H = g.length, W = g[0].length, seen = new Set(), out = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (g[y][x] !== eyeCol || seen.has(y * W + x)) continue;
    const st = [[x, y]], pts = []; seen.add(y * W + x);
    while (st.length) {
      const [a, b] = st.pop(); pts.push([a, b]);
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = a + dx, ny = b + dy;
        if (nx >= 0 && ny >= 0 && nx < W && ny < H && g[ny][nx] === eyeCol && !seen.has(ny * W + nx)) { seen.add(ny * W + nx); st.push([nx, ny]); }
      }
    }
    if (pts.length >= 4) { const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]); out.push({ x0: Math.min(...xs) - 1, x1: Math.max(...xs) + 1, y0: Math.min(...ys), y1: Math.max(...ys) }); }
  }
  return out.sort((a, b) => a.x0 - b.x0);
}

/** Màu da quanh mắt: màu phổ biến nhất ở vòng ngoài hộp mắt (không phải mắt/viền/trống). */
function skinOf(g, e, P) {
  const n = {};
  for (let y = e.y0 - 1; y <= e.y1 + 1; y++) for (let x = e.x0 - 1; x <= e.x1 + 1; x++) {
    const c = g[y]?.[x];
    if (c && c !== P.e && c !== P.w && c !== P.O && (y < e.y0 || y > e.y1 || x < e.x0 || x > e.x1)) n[c] = (n[c] ?? 0) + 1;
  }
  return Object.entries(n).sort((a, b) => b[1] - a[1])[0]?.[0] ?? P.c?.[0] ?? '#cccccc';
}

/** Vẽ lại mắt theo biểu cảm: xoá mắt gốc (phủ màu da) rồi vẽ mẫu tại đúng neo cũ, cùng mẫu cho hai mắt. */
function face(g, eyes, expr, P) {
  if (!eyes.length) return g;
  const [shape, ...extra] = LOOK[expr] ?? LOOK.neutral;
  const o = g.map(r => r.slice());
  eyes.forEach((e, i) => {
    const ax = e.x0 + 1, ay = e.y0, right = eyes.length > 1 && i === eyes.length - 1, skin = skinOf(g, e, P);
    for (let y = e.y0; y <= e.y1; y++) for (let x = e.x0; x <= e.x1; x++) if (g[y][x] && g[y][x] !== P.O) o[y][x] = skin;   // xoá sạch hộp mắt (mắt + điểm lẻ/bóng) để hai mắt giống hệt nhau
    const dot = (x, y, c) => { if (o[y]?.[x] && o[y][x] !== P.O) o[y][x] = c; };   // chỉ vẽ trên da, không đè viền
    const t = EYE[expr === 'wink' && right ? 'arc' : shape];
    t.rows.forEach((r, j) => [...r].forEach((ch, c) => {
      if (ch === '.') return;
      const cx = t.mirror && right ? 3 - c : c;
      dot(ax + cx, ay + t.top + j, ch === 'w' ? P.w : P.e);
    }));
    for (const name of extra) for (const [x, y, ch] of AROUND[name]) dot(ax + (right ? 3 - x : x), ay + y, ch === 'b' ? P.O : AROUND_COLOR[ch]);
  });
  return o;
}

const hex = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
const blend = (a, b, t) => { const x = hex(a), y = hex(b); return `#${x.map((v, i) => Math.round(v * (1 - t) + y[i] * t).toString(16).padStart(2, '0')).join('')}`; };

const loaded = new Map();
function load(kind) {
  if (loaded.has(kind)) return loaded.get(kind);
  const a = ART[kind], cols = a.colors, P = a.pal;
  const layers = Object.fromEntries(Object.entries(a.layers).map(([n, r]) => [n, decode(r, cols)]));
  const body = layers.body;
  const parts = a.parts.map(p => ({ ...p, grid: layers[p.name], eyes: eyesOf(layers[p.name], P.e), cache: new Map() }));
  const L = { kind, a, P, body, parts, W: body[0].length, H: body.length, eyes: eyesOf(body, P.e), faces: new Map() };
  loaded.set(kind, L);
  return L;
}

/** Màu thật của nhân vật (để kiểm tra không đỏ chủ đạo, xuất cho app khác). */
export const colorsOf = kind => ART[kind].colors;
export const nameOf = kind => ART[kind].name;
/** Hộp các mắt trên thân (trái → phải): test dùng để bảo đảm hai mắt cân nhau. */
export const eyeBoxes = kind => load(kind).eyes;

/** Góc xoay từng bộ phận (rad) theo nhân vật/động tác; `lull` 0..1 = buồn ngủ (đuôi cuộn, hiệu ứng dịu). */
function angleOf(kind, part, act, p, t, lull) {
  const sin = Math.sin;
  if (kind === 'cao') {
    const k = part === 'back' ? 1.35 : 1;
    let a = sin(t * 2 + (part === 'back' ? 1 : 0)) * .05 + .3 * lull;
    if (act === 'wag') a += sin(p * 15) * .2 * fade(p, 1.6);
    if (act === 'flare') a -= .08 * wave(p, 1.4);
    return a * k;
  }
  if (kind === 'cu') {                       // vỗ cánh
    const s = part === 'wl' ? 1 : -1;
    return (sin(t * 1.4) * .03 + (act === 'flap' ? Math.abs(sin(p * 13)) * .42 * fade(p, 1.2) : 0) - .1 * lull) * s;
  }
  if (kind === 'tho') {                      // vẫy tai, ngủ thì cụp tai
    const s = part === 'el' ? -1 : 1;
    return (sin(t * 1.7 + (s > 0 ? .8 : 0)) * .03 + (act === 'ears' ? sin(p * 20 + (s > 0 ? 1.2 : 0)) * .22 * fade(p, 1.1) : 0) + .7 * lull) * s;
  }
  if (kind === 'gau') return sin(t * 2) * .1 + (act === 'shake' ? sin(p * 40) * .25 * fade(p, 1) : 0) + (act === 'bloom' ? sin(p * 6) * .15 : 0);   // chồi non đung đưa
  if (kind === 'meo') {
    if (part === 'tail') { let a = sin(t * 1.8) * .06 + .4 * lull; if (act === 'wag') a += sin(p * 9) * .2 * fade(p, 1.4); if (act === 'bubble') a += sin(p * 5) * .08; return a; }
    const s = part === 'el' ? -1 : 1;
    return ((act === 'bubble' ? sin(p * 18) * .06 : 0) + .18 * lull) * s;
  }
  return 0;
}

/** Đầu rùa trượt vào mai (0..1). */
function slideOf(act, p, lull) {
  if (act === 'hide') return Math.min(1, wave(p, 2) * 1.6);
  return Math.min(1, lull * 1.8);
}

/** Tạo bộ chạy cho một nhân vật. `rng` chỉ dùng cho tia lửa/bong bóng (đưa vào để test xác định). */
export function createPet(kind, rng = Math.random) {
  const L = load(kind), { P, body, parts, W, H } = L;
  const w = FRAME.w + PAD.x * 2, h = FRAME.h + PAD.top + PAD.bottom, offX = PAD.x + ((FRAME.w - W) >> 1), offY = PAD.top + FRAME.h - H;
  const sparks = [];

  const facedGrid = (grid, eyes, expr, key) => { if (!eyes.length) return grid; const k = `${key}|${expr}`; if (!L.faces.has(k)) L.faces.set(k, face(grid, eyes, expr, P)); return L.faces.get(k); };
  const partGrid = (pt, expr, ang) => {
    const key = Math.round(ang / .04), ck = `${pt.eyes.length ? expr : ''}|${key}`;
    if (!pt.cache.has(ck)) { const g = facedGrid(pt.grid, pt.eyes, expr, pt.name); pt.cache.set(ck, key === 0 ? g : rotate(g, key * .04, ...pt.pivot)); }
    return pt.cache.get(ck);
  };

  /** Một khung. t: giây; act: động tác riêng đang chạy (hoặc null) với p giây đã trôi; fx=false thì không hiệu ứng/động tác (hình tĩnh). */
  function render({ t = 0, expr = 'neutral', act = null, p = 0, lull = 0, fx = true } = {}) {
    const px = Array.from({ length: h }, () => Array(w).fill(null));
    const set = (x, y, c, alpha = 1) => {
      x += offX; y += offY;
      if (x < 0 || y < 0 || x >= w || y >= h) return;
      if (alpha >= 1) px[y][x] = c;
      else if (!px[y][x]) px[y][x] = `rgba(${hex(c).join(',')},${alpha.toFixed(2)})`;
      else if (px[y][x][0] === '#') px[y][x] = blend(px[y][x], c, alpha);
    };
    const blit = g => g.forEach((row, y) => row.forEach((c, x) => { if (c) set(x, y, c); }));
    const frame = Math.floor(t * 10);
    const power = !fx ? 0 : act === 'flare' ? 1 + wave(p, 1.4) * 1.4 : lull > 0 ? .35 : (expr === 'happy' || expr === 'cheer') ? 1.4 : 1;
    const ang = pt => (fx ? angleOf(kind, pt.name, act, p, t, lull) : 0);
    const grids = new Map();
    const draw = pt => {
      let g;
      // rụt đầu: nhắm tịt ><; chỉ lùi tới mép mai (art: slide) để mép mai không lơ lửng
      if (pt.slide) { const u = fx ? slideOf(act, p, lull) : 0, g0 = partGrid(pt, u > 0.3 && act === 'hide' ? 'squint' : expr, 0), dx = Math.round(pt.slide[0] * u), dy = Math.round(pt.slide[1] * u); g = g0; g0.forEach((row, y) => row.forEach((c, x) => { if (c) set(x + dx, y + dy, c); }));
        if (dx > 0) for (let x = 0; x < W; x++) {          // khoảng trống dưới mép mai khi đầu lùi vào: tô bóng tối như miệng mai
          const top = g0.findIndex(r => r[x]);
          if (top < 0 || body[top - 1]?.[x] == null) continue;
          for (let y = top; y < top + 3 && !g0[y]?.[x - dx]; y++) set(x, y, y === top + 2 ? P.O : P.f[3]);
        } }
      else { g = partGrid(pt, expr, ang(pt)); blit(g); }
      grids.set(pt.name, g);
      return g;
    };
    const behind = parts.filter(pt => pt.z < 0).sort((a, b) => a.z - b.z), front = parts.filter(pt => pt.z > 0);
    const backGrids = behind.map(draw);

    // --- lửa nhấp nháy ở các đuôi (chỉ quanh đuôi)
    if (kind === 'cao' && fx) {
      for (const g of backGrids) {
        const top = {};
        g.forEach((row, y) => row.forEach((c, x) => {
          const i = P.F.indexOf(c); if (i < 0) return;
          const j = Math.max(0, Math.min(3, i + (rnd(x, y, frame) < .35 ? -1 : rnd(x, y, frame + 7) < .25 ? 1 : 0)));
          set(x, y, P.F[j]); if (top[x] === undefined) top[x] = y;
        }));
        for (const [xs, y] of Object.entries(top)) {
          const x = +xs, n = Math.floor(rnd(x, 1, frame) * 3 * power);
          for (let k = 1; k <= n; k++) { if (g[y - k]?.[x]) break; set(x, y - k, P.F[Math.min(3, k - 1 + (rnd(x, k, frame) < .5 ? 0 : 1))]); }
        }
      }
      if (act === 'flare' || rng() < .25 * power) sparks.push({ x: 28 + rng() * 14, y: 8 + rng() * 8, vx: 0, vy: -.5 - rng() * .5, life: 0, max: 8 + rng() * 6, c: P.F[(rng() * 3) | 0] });
    }

    // thân + mặt (mắt theo biểu cảm); biểu tượng/má đỏ vẽ sau
    const bodyG = facedGrid(body, L.eyes, expr, 'body');
    blit(bodyG);
    const frontGrids = front.map(draw);
    decorate(set, expr, L, bodyG, grids);

    // --- tinh thể trên mai rùa: vệt sáng lia qua, phát sáng khi vui
    if (kind === 'rua' && fx) {
      const glow = act === 'glow', sweep = (frame % 24) - 4;
      if (lull === 0) for (const [x, y] of L.a.crystals) if (Math.abs(x + y * .5 - sweep - 18) < 1.2 || (glow && rnd(x, y, frame) < .45)) set(x, y, P.X[0]);
      if (glow && frame % 2 === 0) sparks.push({ x: 16 + rng() * 18, y: 1 + rng() * 10, vx: 0, vy: -.15, life: 0, max: 8, c: '#ffffff' });
    }
    // --- bong bóng bay lên từ chùm bong bóng ở chóp đuôi mèo
    if (kind === 'meo' && fx) {
      const [ox, oy] = L.a.orb, rate = act === 'bubble' ? .5 : lull > 0 ? .03 : .08;
      if (rng() < rate) sparks.push({ x: ox - 2 + rng() * 4, y: oy - 4, vx: (rng() - .5) * .3, vy: -.25 - rng() * .2, life: 0, max: act === 'bubble' ? 18 : 12, c: P.Z[(rng() * 4) | 0] });
      if (lull === 0 && frame % 16 < 2) set(ox - 2, oy - 2, '#ffffff');
    }
    // --- sao nhấp nháy trên cánh cú, trăng trên trán loé sáng; sao băng khi vui
    if (kind === 'cu' && fx) {
      let i = 0;
      for (const g of [body, ...frontGrids]) g.forEach((row, y) => row.forEach((c, x) => {
        if (c !== P.s) return;
        if (y < 10) { if (frame % 30 < 3) set(x, y, '#fffbe0'); return; }
        const ph = (frame + i++ * 3) % 10; set(x, y, ph < 2 ? '#ffffff' : ph < 6 ? P.s : '#b9a64a');
      }));
      if (act === 'shoot' || rng() < .04 * (1 - lull)) sparks.push(act === 'shoot' ? { x: -2, y: 4 + rng() * 6, vx: 1.4, vy: .5, life: 0, max: 26, c: P.s, trail: true } : { x: W * rng(), y: 12 + rng() * 10, vx: 0, vy: 0, life: 0, max: 10, c: P.s });
    }
    // --- mưa phùn rơi từ đuôi mây của thỏ
    if (kind === 'tho' && fx) {
      const n = act === 'rain' ? 7 : lull > 0 ? 1 : 3, cl = L.a.cloud;
      for (let i = 0; i < n; i++) { const ph = (frame + i * 4) % 10, [cx, cy] = cl[i % cl.length]; if (ph < 7) { const c = i % 2 ? P.b[1] : P.b[0]; set(cx - 2 + (i * 2) % 5, cy + 4 + ph, c); set(cx - 2 + (i * 2) % 5, cy + 5 + ph, c); } }
      if (frame % 14 < 9) { set(cl[1][0] + 4 + (frame % 14 >> 1), cl[1][1] - 4, '#ffffff'); set(cl[1][0] + 5 + (frame % 14 >> 1), cl[1][1] - 4, '#ffffff'); }
    }
    // --- hoa trên áo rêu của gấu: nở khi vui, khép khi ngủ; lá nhỏ rơi quanh lưng
    if (kind === 'gau' && fx) {
      const bloom = act === 'bloom' ? wave(p, 2) : 0;
      for (const [x, y] of L.a.flowers) {
        if (lull > 0) { for (const [dx, dy] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) set(x + dx, y + dy, P.m[1]); set(x, y, P.h); }
        else if (bloom > .3) { for (const [dx, dy] of [[1, 1], [-1, -1], [1, -1], [-1, 1]]) set(x + dx, y + dy, P.h); set(x, y, '#ffe680'); }
      }
      if ((act === 'shake' && frame % 2 === 0) || rng() < .06 * (1 - lull)) sparks.push({ x: 26 + rng() * 10, y: 8 + rng() * 14, vx: (rng() - .5) * .4, vy: .35 + rng() * .3, life: 0, max: 16, c: rng() < .5 ? P.m[0] : P.m[1] });
    }
    for (let i = sparks.length - 1; i >= 0; i--) { if (++sparks[i].life >= sparks[i].max) sparks.splice(i, 1); }
    if (fx) for (const s of sparks) { s.x += s.vx; s.y += s.vy; const a = 1 - s.life / s.max; set(Math.round(s.x), Math.round(s.y), s.c, a); if (s.trail) set(Math.round(s.x - 1), Math.round(s.y), s.c, a / 2); }
    else sparks.length = 0;
    return px;
  }

  return { kind, w, h, off: [offX, offY], render, name: ART[kind].name };
}

/** Biểu tượng trên đầu (tim, sao, z, ?) + giọt mồ hôi. Neo theo mắt (ở thân, hoặc ở đầu như rùa), nằm ngoài mặt. */
function decorate(set, expr, L, bodyG, grids) {
  const list = DECO[expr];
  const src = L.eyes.length ? { eyes: L.eyes, grid: bodyG } : (() => { const pt = L.parts.find(q => q.eyes.length); return pt && { eyes: pt.eyes, grid: grids.get(pt.name) ?? pt.grid }; })();
  if (!list || !src) return;
  const { eyes, grid } = src;
  const cx = Math.round(eyes.reduce((s, e) => s + (e.x0 + e.x1) / 2, 0) / eyes.length);
  let top = L.H;
  for (let y = 0; y < L.H && top === L.H; y++) for (let x = cx - 7; x <= cx + 7; x++) if (grid[y]?.[x]) { top = y; break; }
  for (const d of list) {
    if (d === 'sweat') { const e = eyes.at(-1); set(e.x1 + 2, e.y0, SYM_COLOR.sweat); set(e.x1 + 2, e.y0 + 1, SYM_COLOR.sweat); continue; }
    const rows = SYM[d], x0 = d === 'z' ? cx + 5 : cx - 1;
    rows.forEach((r, j) => [...r].forEach((ch, i) => { if (ch === 'x') set(x0 + i, top - 5 + j, SYM_COLOR[d]); }));
  }
}

/** Bảng màu thật của khung hình tĩnh → SVG (gộp ô cùng màu liền hàng). */
export function frameSvg(kind, expr = 'neutral', cls = 'pet-art') {
  const pet = createPet(kind), g = pet.render({ expr, fx: false });
  let rc = '';
  g.forEach((row, y) => { let x = 0; while (x < row.length) { const c = row[x]; if (!c) { x++; continue; } let n = 1; while (row[x + n] === c) n++; rc += `<rect x="${x}" y="${y}" width="${n}" height="1" fill="${c}"/>`; x += n; } });
  return `<svg class="${cls}" viewBox="0 0 ${pet.w} ${pet.h}" shape-rendering="crispEdges" aria-hidden="true">${rc}</svg>`;
}
