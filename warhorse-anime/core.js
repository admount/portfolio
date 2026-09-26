// ============================================================
// core: math, easing, camera, cel-shaded "Fig" renderer, paths
// ============================================================
const W = 1920, H = 1080;
const cv = document.getElementById("c");
const ctx = cv.getContext("2d");
const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ss = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const E = {
  lin: (t) => t,
  out: (t) => 1 - Math.pow(1 - t, 3),
  in: (t) => t * t * t,
  io: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  back: (t) => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  elastic: (t) => (t <= 0 ? 0 : t >= 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * TAU / 3) + 1),
};
// eased progress of t through [a,b]
const seg = (t, a, b, e) => (e || E.io)(clamp((t - a) / (b - a), 0, 1));
const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const on2 = (t) => Math.floor(t * 12 + 1e-6) / 12; // animate on twos
const pulse = (t, a, dur) => (t >= a && t < a + dur ? 1 - (t - a) / dur : 0);

// ---------------- palette ----------------
const INK = "#1a1026";
const HC = {
  coat: "#23222c", coatSh: "#111017", coatHi: "#4b4862", far: "#18171f", farSh: "#0b0a10",
  dap1: "rgba(128,126,146,0.55)", dap2: "rgba(178,176,194,0.55)",
  mane: "#f8f5ef", maneSh: "#cbc3db", hoof: "#34302c", hoofSh: "#1a1614",
  muzzle: "#302e3a", muzzleSh: "#1b1a22",
  blanket: "#7a2233", blanketSh: "#541522", trim: "#e7bc52",
  saddle: "#80502b", saddleSh: "#58341b", strap: "#6c3d1f", brass: "#ecc35a",
  iris: "#a0703a", mouth: "#4a1c2e",
};
const DC = {
  pearl: "#f4effc", pearlSh: "#c3b3e8", pearlHi: "#ffffff", deep: "#9c88d2",
  belly: "#fff6ea", bellySh: "#e2cfe6",
  wing: "#ddd0f6", wingSh: "#b5a3e2", bone: "#8f7cc7",
  horn: "#f5ead0", hornSh: "#cfbf9c", spike: "#b7a4e8",
  eye: "#62f0ff", mouth: "#4d1f45", tongue: "#e8759b", tooth: "#ffffff",
};

// ---------------- camera ----------------
let CAMZ = 1;
function camera(x, y, z, rot, shake, t) {
  let sx = 0, sy = 0;
  if (shake) { const k = Math.floor(t * 24); sx = (hash(k) - 0.5) * 2 * shake; sy = (hash(k + 77) - 0.5) * 2 * shake; }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.translate(W / 2 + sx, H / 2 + sy);
  if (rot) ctx.rotate(rot);
  ctx.scale(z, z);
  ctx.translate(-x, -y);
  CAMZ = z;
}
function screen() { ctx.setTransform(1, 0, 0, 1, 0, 0); CAMZ = 1; }

// ---------------- path builders (never call beginPath) ----------------
const P = {
  ell: (x, y, rx, ry, r) => (c) => { r = r || 0; c.moveTo(x + rx * Math.cos(r), y + rx * Math.sin(r)); c.ellipse(x, y, rx, ry, r, 0, TAU); },
  circ: (x, y, r) => (c) => { c.moveTo(x + r, y); c.arc(x, y, r, 0, TAU); },
  poly: (pts) => (c) => { pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.closePath(); },
  smooth: (pts) => (c) => {
    const n = pts.length, mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const m0 = mid(pts[n - 1], pts[0]); c.moveTo(m0[0], m0[1]);
    for (let i = 0; i < n; i++) { const p = pts[i], m = mid(p, pts[(i + 1) % n]); c.quadraticCurveTo(p[0], p[1], m[0], m[1]); }
    c.closePath();
  },
  cap: (x1, y1, x2, y2, r1, r2) => (c) => {
    const a = Math.atan2(y2 - y1, x2 - x1), h = Math.PI / 2;
    c.moveTo(x1 + Math.cos(a + h) * r1, y1 + Math.sin(a + h) * r1);
    c.arc(x1, y1, r1, a + h, a - h);
    c.arc(x2, y2, r2, a - h, a + h);
    c.closePath();
  },
  // a ribbon along a polyline with per-point width, closed
  ribbon: (pts) => (c) => {
    const L = [], R = [];
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i], q = pts[Math.min(pts.length - 1, i + 1)], o = pts[Math.max(0, i - 1)];
      let nx = -(q[1] - o[1]), ny = q[0] - o[0]; const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
      L.push([p[0] + nx * p[2], p[1] + ny * p[2]]); R.push([p[0] - nx * p[2], p[1] - ny * p[2]]);
    }
    const all = L.concat(R.reverse());
    P.smooth(all)(c);
  },
};

// ---------------- cel-shaded figure renderer ----------------
// Items are recorded with their transform. Each layer draws all outlines first, then all fills,
// so parts in one layer merge into a single inked silhouette; separate layers get their own lines.
const scaleOf = (m) => Math.hypot(m.a, m.b);
class Fig {
  constructor(s) { this.items = []; this.s = s || 1; }
  add(layer, path, fill, o) { this.items.push({ layer, path, fill, o: o || {}, m: ctx.getTransform() }); }
  flush(lw) {
    lw = lw || 6;
    const layers = [...new Set(this.items.map((i) => i.layer))].sort((a, b) => a - b);
    ctx.save();
    for (const L of layers) {
      const its = this.items.filter((i) => i.layer === L);
      ctx.lineJoin = "round"; ctx.lineCap = "round"; ctx.strokeStyle = INK;
      for (const it of its) {
        if (it.o.noLine) continue;
        ctx.setTransform(it.m); ctx.beginPath(); it.path(ctx);
        ctx.lineWidth = (it.o.lw || lw) * CAMZ * this.s / scaleOf(it.m) * 2;
        ctx.stroke();
      }
      for (const it of its) {
        ctx.setTransform(it.m); ctx.beginPath(); it.path(ctx);
        ctx.fillStyle = it.fill; ctx.globalAlpha = it.o.alpha == null ? 1 : it.o.alpha; ctx.fill(); ctx.globalAlpha = 1;
        if (it.o.shade || it.o.hi || it.o.after) this.cel(it);
      }
    }
    ctx.restore();
    this.items = [];
  }
  cel(it) {
    const m = it.m, o = it.o;
    const inv = m.inverse();
    const toLocal = (vx, vy) => { const a = inv.transformPoint({ x: 0, y: 0 }), b = inv.transformPoint({ x: vx, y: vy }); return [b.x - a.x, b.y - a.y]; };
    ctx.save();
    ctx.beginPath(); it.path(ctx); ctx.clip();
    if (o.shade) {
      const d = (o.sd || 13) * CAMZ * this.s;
      const [dx, dy] = toLocal(-d * 0.75, -d * 0.66);
      ctx.fillStyle = o.shade; ctx.fillRect(-1e5, -1e5, 2e5, 2e5);
      ctx.translate(dx, dy); ctx.beginPath(); it.path(ctx); ctx.fillStyle = it.fill; ctx.fill(); ctx.translate(-dx, -dy);
    }
    if (o.hi) {
      const d = (o.hd || 7) * CAMZ * this.s;
      const [hx, hy] = toLocal(d * 0.75, d * 0.7);
      ctx.save();
      ctx.beginPath(); ctx.rect(-1e5, -1e5, 2e5, 2e5); ctx.translate(hx, hy); it.path(ctx); ctx.translate(-hx, -hy);
      ctx.clip("evenodd");
      ctx.fillStyle = o.hi; ctx.fillRect(-1e5, -1e5, 2e5, 2e5);
      ctx.restore();
    }
    if (o.after) o.after(ctx);
    ctx.restore();
  }
}

// ---------------- text helpers ----------------
function outlinedText(txt, x, y, font, fill, opts) {
  opts = opts || {};
  ctx.save();
  ctx.font = font; ctx.textAlign = opts.align || "center"; ctx.textBaseline = opts.base || "middle";
  ctx.lineJoin = "round";
  if (opts.spacing) ctx.letterSpacing = opts.spacing;
  if (opts.outer) { ctx.lineWidth = opts.outerW || 22; ctx.strokeStyle = opts.outer; ctx.strokeText(txt, x, y); }
  ctx.lineWidth = opts.lw || 12; ctx.strokeStyle = opts.stroke || INK; ctx.strokeText(txt, x, y);
  ctx.fillStyle = fill; ctx.fillText(txt, x, y);
  ctx.restore();
}
// comic onomatopoeia that pops in, jitters, and fades
function sfx(txt, x, y, size, rot, t, t0, dur, fill, font, opts) {
  const a = t - t0;
  if (a < 0 || a > dur) return;
  const pop = a < 0.14 ? E.back(a / 0.14) : 1;
  const fade = a > dur - 0.15 ? (dur - a) / 0.15 : 1;
  const j = Math.floor(t * 12);
  ctx.save();
  ctx.translate(x + (hash(j) - 0.5) * 6, y + (hash(j + 5) - 0.5) * 6);
  ctx.rotate(rot); ctx.scale(pop, pop); ctx.globalAlpha = clamp(fade, 0, 1);
  outlinedText(txt, 0, 0, `${size}px ${font || "'Bangers'"}`, fill || "#ffe14a", Object.assign({ lw: size * 0.16, outer: "#ffffff", outerW: size * 0.3 }, opts || {}));
  ctx.restore();
}

// ---------------- stateless particle helpers ----------------
// cel-shaded dust puffs bursting from (x,y)
function dust(x, y, t, t0, n, spread, life, seed, color, up) {
  const a = t - t0; if (a < 0 || a > life) return;
  const k = a / life;
  ctx.save();
  ctx.lineWidth = 5 * CAMZ; ctx.strokeStyle = INK;
  for (let i = 0; i < n; i++) {
    const h1 = hash(seed + i), h2 = hash(seed + i * 3.1), h3 = hash(seed + i * 7.7);
    const ang = Math.PI + h1 * Math.PI * (up ? 1 : 1); // upper half-plane
    const dist = spread * (0.35 + 0.65 * h2) * E.out(k);
    const px = x + Math.cos(ang) * dist, py = y + Math.sin(ang) * dist * 0.45 - k * 30 * h3;
    const r = (16 + 30 * h3) * (0.5 + E.out(k)) * (1 - k * 0.6);
    ctx.globalAlpha = 1 - ss(0.55, 1, k);
    ctx.beginPath(); ctx.arc(px, py, r, 0, TAU); ctx.stroke();
  }
  for (let i = 0; i < n; i++) {
    const h1 = hash(seed + i), h2 = hash(seed + i * 3.1), h3 = hash(seed + i * 7.7);
    const ang = Math.PI + h1 * Math.PI;
    const dist = spread * (0.35 + 0.65 * h2) * E.out(k);
    const px = x + Math.cos(ang) * dist, py = y + Math.sin(ang) * dist * 0.45 - k * 30 * h3;
    const r = (16 + 30 * h3) * (0.5 + E.out(k)) * (1 - k * 0.6);
    ctx.globalAlpha = 1 - ss(0.55, 1, k);
    ctx.fillStyle = color || "#d9c7b2"; ctx.beginPath(); ctx.arc(px, py, r, 0, TAU); ctx.fill();
    ctx.fillStyle = "rgba(120,90,110,0.35)"; ctx.beginPath(); ctx.arc(px + r * 0.25, py + r * 0.25, r * 0.75, 0, TAU); ctx.fill();
  }
  ctx.restore();
}
function starburst(x, y, r, spikes, fill, rot) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot || 0);
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) { const a = i * Math.PI / spikes, rr = i % 2 ? r * 0.42 : r * (0.8 + 0.2 * hash(i)); ctx[i ? "lineTo" : "moveTo"](Math.cos(a) * rr, Math.sin(a) * rr); }
  ctx.closePath(); ctx.lineJoin = "round"; ctx.lineWidth = 7 * CAMZ; ctx.strokeStyle = INK; ctx.stroke(); ctx.fillStyle = fill; ctx.fill();
  ctx.restore();
}
function sparkle(x, y, r, color, rot) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot || 0); ctx.fillStyle = color || "#fff";
  ctx.beginPath(); ctx.moveTo(0, -r); ctx.quadraticCurveTo(0, 0, r, 0); ctx.quadraticCurveTo(0, 0, 0, r); ctx.quadraticCurveTo(0, 0, -r, 0); ctx.quadraticCurveTo(0, 0, 0, -r); ctx.fill();
  ctx.restore();
}
// radial speed/focus lines toward (cx,cy), drawn in screen space
function focusLines(cx, cy, t, inner, color, n, seed) {
  ctx.save(); screen();
  const k = Math.floor(t * 12);
  ctx.fillStyle = color || "rgba(255,255,255,0.8)";
  for (let i = 0; i < (n || 140); i++) {
    const h = hash(i * 13.3 + k * 0.71 + (seed || 0));
    const a = hash(i * 7.1 + (seed || 0)) * TAU + h * 0.02;
    const r0 = inner * (0.8 + 0.6 * h), r1 = 2400, w = 0.003 + 0.01 * hash(i * 3.3 + k);
    ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
    ctx.lineTo(cx + Math.cos(a - w) * r1, cy + Math.sin(a - w) * r1); ctx.lineTo(cx + Math.cos(a + w) * r1, cy + Math.sin(a + w) * r1); ctx.fill();
  }
  ctx.restore();
}
// horizontal speed streaks (screen space)
function speedStreaks(t, speed, color, n) {
  ctx.save(); screen(); ctx.fillStyle = color;
  for (let i = 0; i < (n || 60); i++) {
    const y = hash(i * 5.3) * H, len = 200 + hash(i * 2.1) * 700, th = 2 + hash(i * 9.7) * 7;
    const x = ((hash(i * 1.7) * (W + len) - t * speed * (0.6 + hash(i) * 0.8)) % (W + len) + (W + len)) % (W + len) - len;
    ctx.fillRect(x, y, len, th);
  }
  ctx.restore();
}
// ink brush arc (Demon-Slayer-ish) from a list of [x,y,width] points
function brushArc(pts, colors) {
  const [a, b, c] = colors || ["#12061f", "#6b3fd6", "#efe6ff"];
  const scale = (k) => pts.map((p) => [p[0], p[1], p[2] * k]);
  ctx.beginPath(); P.ribbon(scale(1))(ctx); ctx.fillStyle = a; ctx.fill();
  ctx.beginPath(); P.ribbon(scale(0.55))(ctx); ctx.fillStyle = b; ctx.fill();
  ctx.beginPath(); P.ribbon(scale(0.18))(ctx); ctx.fillStyle = c; ctx.fill();
}
