// ============================================================
// characters: the warhorse (side + front), the opal dragon, the paladin (cameo)
// ============================================================

// ---------- the warhorse, side view (faces +x). Root = hip joint; hooves reach y = +170 ----------
const HDEF = {
  x: 0, y: 0, s: 1, flip: 1, rot: 0, pitch: 0, neck: -0.95, head: 1.3, jaw: 0, ear: 0,
  eye: "open", look: 0, lookY: 0, brow: 0, mouth: "closed", grass: 0,
  fl: [0.04, 0, 0], fr: [-0.04, 0, 0], hl: [0.08, 0.04, 0], hr: [-0.06, 0.06, 0],
  tail: 0.35, wind: 0, t: 0, spin: 0, glint: 0, blush: 0, tongue: 0,
};
function dapples(seed, x0, y0, w, h, n) {
  return (c) => {
    for (let i = 0; i < n; i++) {
      const x = x0 + hash(seed + i) * w, y = y0 + hash(seed + i * 1.7 + 3) * h, r = 2 + hash(seed + i * 2.3) * 7;
      c.fillStyle = i % 3 ? HC.dap1 : HC.dap2; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
      if (i % 4 === 0) { c.fillStyle = HC.dap2; c.beginPath(); c.arc(x + 9, y - 4, r * 0.4, 0, TAU); c.fill(); }
    }
  };
}
function hLimb(fig, layer, a, L1, L2, r1, r2, far, seed) {
  const col = far ? HC.far : HC.coat, sh = far ? HC.farSh : HC.coatSh;
  ctx.save(); ctx.rotate(a[0]);
  fig.add(layer, P.cap(0, 0, 0, L1, r1, r2 * 1.12), col, { shade: sh, after: far ? null : dapples(seed, -r1, 0, r1 * 2, L1, 5) });
  ctx.translate(0, L1); ctx.rotate(a[1]);
  fig.add(layer, P.cap(0, 0, 0, L2, r2 * 1.05, r2 * 0.82), col, { shade: sh });
  ctx.translate(0, L2); ctx.rotate(a[2]);
  fig.add(layer, P.poly([[-r2 * 0.95, -2], [r2 * 0.95, -2], [r2 * 1.25, 22], [-r2 * 1.15, 22]]), HC.hoof, { shade: HC.hoofSh, sd: 6 });
  ctx.restore();
}
function hMane(fig, layer, p, from, to, n, len, seed) {
  // mane along a line (neck space), spikes flow back (-x) and up (-y), waving in the wind
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const k = i / n, bx = lerp(from[0], to[0], k), by = lerp(from[1], to[1], k) + 6;
    pts.push([bx, by]);
  }
  const tips = [];
  for (let i = n; i >= 0; i--) {
    const k = i / n, bx = lerp(from[0], to[0], k), by = lerp(from[1], to[1], k);
    const w = Math.sin(p.t * 7 + i * 0.9 + seed) * (6 + 14 * p.wind);
    const L = len * (0.7 + 0.5 * hash(seed + i)) * (1 + 0.5 * p.wind);
    tips.push([bx - L * (0.55 + 0.4 * p.wind) + w, by - L * 0.8 + w * 0.5]);
    if (i > 0) { const k2 = (i - 0.5) / n; tips.push([lerp(from[0], to[0], k2) - L * 0.18, lerp(from[1], to[1], k2) - L * 0.25]); }
  }
  fig.add(layer, P.smooth(pts.concat(tips)), HC.mane, { shade: HC.maneSh, sd: 9 });
}
function hEye(fig, layer, p, x, y, sc) {
  sc = sc || 1;
  const st = p.eye;
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  if (st === "closed") {
    fig.add(layer, P.poly([[-14, 0], [0, 5], [14, 0], [0, 8]]), INK, { noLine: true });
  } else if (st === "happy") {
    fig.add(layer, P.poly([[-14, 4], [0, -6], [14, 4], [0, -1]]), INK, { noLine: true });
  } else {
    const lid = st === "half" ? 0.55 : st === "glare" ? 0.38 : 0;
    const ew = 15, eh = st === "wide" ? 15 : 12;
    fig.add(layer, P.ell(0, 0, ew, eh, -0.15), "#ffffff", {
      lw: 3.5,
      after: (c) => {
        const ix = p.look * 5, iy = p.lookY * 4;
        const ir = st === "dot" ? 3 : st === "wide" ? 6 : 9;
        c.fillStyle = st === "dot" ? INK : HC.iris; c.beginPath(); c.arc(ix + 2, iy, ir, 0, TAU); c.fill();
        if (st !== "dot") {
          c.fillStyle = INK; c.beginPath(); c.arc(ix + 2, iy, ir * 0.55, 0, TAU); c.fill();
          c.fillStyle = "#fff"; c.beginPath(); c.arc(ix + 5, iy - 4, 3.2, 0, TAU); c.fill();
          c.beginPath(); c.arc(ix - 1, iy + 3, 1.6, 0, TAU); c.fill();
        }
        if (st === "sparkle") { sparkle(ix + 2, iy - 1, 8, "#fff", 0.3); }
        if (lid > 0) {
          c.fillStyle = HC.coat;
          c.beginPath(); c.moveTo(-20, -20); c.lineTo(20, -20); c.lineTo(20, -eh + eh * 2 * lid - (st === "glare" ? 6 : 0)); c.lineTo(-20, -eh + eh * 2 * lid + (st === "glare" ? 5 : 0)); c.closePath(); c.fill();
          c.strokeStyle = INK; c.lineWidth = 3.5; c.beginPath(); c.moveTo(-18, -eh + eh * 2 * lid + (st === "glare" ? 5 : 0)); c.lineTo(18, -eh + eh * 2 * lid - (st === "glare" ? 6 : 0)); c.stroke();
        }
      },
    });
  }
  // brow: thick ink dash; p.brow > 0 = angry (inner end low), < 0 = worried/smug-raised
  fig.add(layer + 0.01, (c) => { c.save(); c.translate(1, -21); c.rotate(0.15 + p.brow * 0.45); P.cap(-13, 0, 13, 0, 3.5, 3)(c); c.restore(); }, INK, { noLine: true });
  ctx.restore();
}
function hHead(fig, p) {
  // head space: skull at 0,0; muzzle extends along +x
  if (p.jaw > 0.05) fig.add(1.9, P.ell(66, 26, 44, 14 + p.jaw * 26, 0.12), HC.mouth, {
    after: p.tongue ? (c) => { c.fillStyle = "#d95d7e"; c.beginPath(); c.ellipse(64, 34 + p.jaw * 12, 26, 9, 0.1, 0, TAU); c.fill(); } : null,
  });
  // ear
  ctx.save(); ctx.translate(-8, -30); ctx.rotate(p.ear);
  fig.add(2, P.smooth([[-14, 4], [-8, -36], [0, -62], [8, -34], [12, 4]]), HC.coat, { shade: HC.coatSh, after: (c) => { c.fillStyle = "#4b3f5a"; c.beginPath(); c.ellipse(0, -22, 4, 16, 0, 0, TAU); c.fill(); } });
  ctx.restore();
  fig.add(2, P.ell(0, 0, 44, 38), HC.coat, { shade: HC.coatSh, hi: HC.coatHi, after: dapples(40, -40, -30, 70, 50, 5) });
  fig.add(2, P.smooth([[4, -34], [60, -26], [112, -12], [128, 4], [122, 22], [96, 26], [40, 30], [0, 32]]), HC.muzzle, { shade: HC.muzzleSh, hi: "#4a4758" });
  // lower jaw
  ctx.save(); ctx.translate(30, 22); ctx.rotate(p.jaw * 0.6);
  fig.add(2, P.smooth([[-6, -4], [70, 2], [88, 10], [72, 22], [8, 20]]), HC.muzzle, { shade: HC.muzzleSh });
  if (p.grass > 0) {
    for (let i = 0; i < 4; i++) {
      const a = -0.5 + i * 0.28 + Math.sin(p.t * 5 + i) * 0.08, L = 40 + 14 * hash(i + 3);
      fig.add(1.95, (c) => { c.save(); c.translate(78, 6); c.rotate(a); P.poly([[0, -3], [L, -1], [L + 6, 0], [0, 4]])(c); c.restore(); }, i % 2 ? "#7fbf4a" : "#5f9e36", { lw: 2.5 });
    }
  }
  ctx.restore();
  // nostril + mouth line
  fig.add(3, P.ell(112, 4, 7, 4.5, 0.5), "#0a090d", { noLine: true });
  if (p.mouth === "smirk") fig.add(3, (c) => { c.moveTo(70, 28); c.quadraticCurveTo(92, 32, 104, 18); c.lineTo(106, 22); c.quadraticCurveTo(92, 38, 70, 31); c.closePath(); }, INK, { noLine: true });
  else if (p.jaw < 0.05) fig.add(3, P.poly([[62, 29], [104, 26], [104, 29], [62, 32]]), INK, { noLine: true });
  // eye
  hEye(fig, 3, p, 22, -4, 1);
  if (p.glint) { const g = p.glint; fig.add(3.5, (c) => { sparkle(30, -9, 26 * g, "#fff", 0.2); }, "#fff", { noLine: true }); }
  if (p.blush) fig.add(3.2, P.ell(46, 8, 14, 6), "rgba(255,120,150,0.55)", { noLine: true });
  // forelock
  const w = Math.sin(p.t * 7) * (3 + 8 * p.wind);
  fig.add(3, P.smooth([[-24, -38], [-6, -52], [16, -48], [40 + w, -34], [30 + w, -27], [10, -34], [-10, -28]]), HC.mane, { shade: HC.maneSh, sd: 6 });
  // bridle: cheek strap, noseband, brass ring, rein
  fig.add(3.6, P.poly([[-30, -36], [44, -40], [46, -33], [-28, -29]]), HC.strap, { lw: 3.5 });
  fig.add(3.6, P.poly([[56, -30], [64, -30], [70, 30], [62, 30]]), HC.strap, { lw: 3.5 });
  fig.add(3.7, P.circ(76, 24, 7), HC.brass, { lw: 3.5, after: (c) => { c.fillStyle = HC.muzzle; c.beginPath(); c.arc(76, 24, 3, 0, TAU); c.fill(); } });
}
function drawHorse(h) {
  const p = Object.assign({}, HDEF, h);
  const fig = new Fig(p.s);
  ctx.save();
  ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.scale(p.flip * p.s, p.s);
  if (p.spin) { ctx.translate(90, -40); ctx.rotate(p.spin); ctx.translate(-90, 40); }
  // hind legs hang from the hip
  ctx.save(); ctx.translate(-6, 0); hLimb(fig, 0, p.hl, 100, 86, 30, 17, true, 1); ctx.restore();
  ctx.save(); ctx.translate(12, 0); hLimb(fig, 6, p.hr, 100, 86, 32, 18, false, 2); ctx.restore();
  ctx.save(); ctx.rotate(p.pitch);
  // tail
  {
    const pts = [];
    for (let i = 0; i <= 9; i++) {
      const k = i / 9, a = Math.PI / 2 + p.tail - p.pitch * 0.85 + Math.sin(p.t * 5 - i * 0.6) * 0.12 * (1 + p.wind) + k * 0.3;
      const prev = pts.length ? pts[pts.length - 1] : [-74, -44];
      pts.push([prev[0] + Math.cos(a) * 18, prev[1] + Math.sin(a) * 18, 14 + 18 * Math.sin(k * Math.PI * 0.9) - k * 8]);
    }
    fig.add(1, P.ribbon(pts), HC.mane, { shade: HC.maneSh, sd: 9 });
  }
  // far front leg (angles are world angles: undo torso pitch)
  ctx.save(); ctx.translate(176, 6); ctx.rotate(-p.pitch); hLimb(fig, 0, p.fl, 96, 84, 26, 16, true, 3); ctx.restore();
  // body
  fig.add(2, P.ell(-8, -22, 74, 66), HC.coat, { shade: HC.coatSh, hi: HC.coatHi, after: dapples(11, -80, -90, 150, 140, 26) });
  fig.add(2, P.ell(92, -10, 108, 56), HC.coat, { shade: HC.coatSh, hi: HC.coatHi, after: dapples(12, 0, -70, 190, 120, 30) });
  fig.add(2, P.ell(182, -24, 62, 70), HC.coat, { shade: HC.coatSh, hi: HC.coatHi, after: dapples(13, 130, -90, 110, 130, 18) });
  // neck + head
  ctx.save(); ctx.translate(196, -58); ctx.rotate(p.neck);
  fig.add(2, P.smooth([[-50, -20], [40, -36], [112, -28], [130, 4], [112, 30], [40, 42], [-40, 60]]), HC.coat, { shade: HC.coatSh, hi: HC.coatHi, after: dapples(14, -40, -30, 150, 70, 12) });
  hMane(fig, 3, p, [118, -22], [-44, -18], 9, 46, 5);
  ctx.save(); ctx.translate(116, 0); ctx.rotate(p.head); hHead(fig, p); ctx.restore();
  ctx.restore();
  // tack: blanket, saddle, girth, stirrup
  fig.add(4, P.smooth([[28, -72], [150, -74], [158, -4], [24, -6]]), HC.blanket, { shade: HC.blanketSh, after: (c) => { c.strokeStyle = HC.trim; c.lineWidth = 5; c.beginPath(); c.moveTo(24, -16); c.lineTo(158, -14); c.stroke(); } });
  fig.add(4.1, P.smooth([[46, -76], [58, -100], [78, -84], [120, -84], [140, -104], [154, -82], [142, -58], [56, -58]]), HC.saddle, { shade: HC.saddleSh, hi: "#a8703f" });
  fig.add(4.2, P.poly([[128, -58], [146, -58], [152, 52], [134, 54]]), HC.strap, { lw: 4 });
  fig.add(4.2, P.poly([[90, -60], [100, -60], [100, 22], [90, 22]]), HC.strap, { lw: 4 });
  fig.add(4.3, P.poly([[82, 22], [108, 22], [112, 44], [78, 44]]), HC.brass, { lw: 4, after: (c) => { c.fillStyle = HC.coatSh; c.fillRect(86, 28, 18, 10); } });
  // near front leg
  ctx.save(); ctx.translate(188, 6); ctx.rotate(-p.pitch); hLimb(fig, 6, p.fr, 96, 84, 28, 17, false, 4); ctx.restore();
  ctx.restore();
  fig.flush();
  ctx.restore();
}

// ---------- the warhorse, front view (for the flex). Root = hips; hooves at y = +170 ----------
function drawHorseFront(o) {
  const p = Object.assign({ x: 0, y: 0, s: 1, t: 0, flex: 1, eye: "sparkle", brow: -0.6, wind: 0.6 }, o);
  const fig = new Fig(p.s);
  ctx.save(); ctx.translate(p.x, p.y); ctx.scale(p.s, p.s);
  const breathe = Math.sin(p.t * 3) * 3;
  // legs
  for (const s of [-1, 1]) {
    ctx.save(); ctx.translate(s * 46, 0);
    fig.add(0, P.cap(0, 0, s * 12, 88, 34, 22), HC.coat, { shade: HC.coatSh, after: dapples(20 + s, -30, 0, 60, 90, 6) });
    fig.add(0, P.cap(s * 12, 88, s * 16, 150, 21, 16), HC.coat, { shade: HC.coatSh });
    fig.add(0, P.poly([[s * 16 - 18, 148], [s * 16 + 18, 148], [s * 16 + 22, 172], [s * 16 - 22, 172]]), HC.hoof, { shade: HC.hoofSh });
    ctx.restore();
  }
  // torso
  fig.add(1, P.ell(0, -60 + breathe * 0.3, 88, 80), HC.coat, { shade: HC.coatSh, hi: HC.coatHi, after: dapples(22, -80, -130, 160, 150, 22) });
  fig.add(1, P.ell(0, -190 + breathe, 118, 104), HC.coat, { shade: HC.coatSh, hi: HC.coatHi, after: dapples(23, -110, -280, 220, 190, 30) });
  // pecs definition
  fig.add(1.5, (c) => { c.moveTo(-70, -150 + breathe); c.quadraticCurveTo(0, -120 + breathe, 70, -150 + breathe); c.lineTo(70, -145 + breathe); c.quadraticCurveTo(0, -112 + breathe, -70, -145 + breathe); c.closePath(); }, INK, { noLine: true });
  fig.add(1.5, P.poly([[-3, -230 + breathe], [3, -230 + breathe], [3, -128 + breathe], [-3, -128 + breathe]]), INK, { noLine: true });
  // girth strap and breastcollar
  fig.add(2, P.poly([[-86, -28], [86, -28], [84, -8], [-84, -8]]), HC.strap, { lw: 4 });
  fig.add(2, (c) => { c.moveTo(-108, -238 + breathe); c.quadraticCurveTo(0, -150 + breathe, 108, -238 + breathe); c.lineTo(104, -218 + breathe); c.quadraticCurveTo(0, -132 + breathe, -104, -218 + breathe); c.closePath(); }, HC.strap, { lw: 4 });
  fig.add(2.1, P.circ(0, -172 + breathe, 16), HC.brass, { lw: 4, after: (c) => sparkle(-4, -176 + breathe, 9, "#fff", 0.3) });
  // flexing arms
  for (const s of [-1, 1]) {
    const f = p.flex;
    ctx.save(); ctx.translate(s * 100, -250 + breathe);
    const ex = s * lerp(60, 118, f), ey = lerp(90, 4, f);
    fig.add(3, P.cap(0, 0, ex, ey, 40, 30), HC.coat, { shade: HC.coatSh, hi: HC.coatHi, after: dapples(30 + s, -40 * s, -40, 180 * s, 90, 8) });
    // bicep bulge
    fig.add(3, P.ell(ex * 0.55, ey * 0.55 - 26 * f, 38 * (0.7 + 0.3 * f), 30 * (0.7 + 0.4 * f)), HC.coat, { shade: HC.coatSh, hi: HC.coatHi });
    const hx = ex + s * lerp(0, -10, f), hy = ey - lerp(-90, 120, f);
    fig.add(3, P.cap(ex, ey, hx, hy, 28, 21), HC.coat, { shade: HC.coatSh });
    fig.add(3, (c) => { c.save(); c.translate(hx, hy); c.rotate(Math.atan2(hy - ey, hx - ex) - Math.PI / 2); P.poly([[-20, 0], [20, 0], [24, 26], [-24, 26]])(c); c.restore(); }, HC.hoof, { shade: HC.hoofSh });
    ctx.restore();
  }
  // neck
  fig.add(2.5, P.smooth([[-58, -250], [-46, -420], [46, -420], [58, -250]]), HC.coat, { shade: HC.coatSh, hi: HC.coatHi });
  // mane falling to both sides
  for (const s of [-1, 1]) {
    const w = Math.sin(p.t * 6 + s) * 10 * p.wind;
    fig.add(2.6, P.smooth([[s * 20, -470], [s * 60, -430], [s * (86 + w), -330], [s * (110 + w * 1.5), -250], [s * 60, -290], [s * 40, -360]]), HC.mane, { shade: HC.maneSh, sd: 9 });
  }
  // head (front): long face
  ctx.save(); ctx.translate(0, -500); ctx.scale(1.3, 1.3);
  for (const s of [-1, 1]) { ctx.save(); ctx.translate(s * 42, -62); ctx.rotate(s * 0.35); fig.add(3.9, P.smooth([[-14, 10], [0, -46], [14, 10]]), HC.coat, { shade: HC.coatSh, after: (c) => { c.fillStyle = "#4b3f5a"; c.beginPath(); c.ellipse(0, -10, 4, 14, 0, 0, TAU); c.fill(); } }); ctx.restore(); }
  fig.add(4, P.smooth([[-62, -66], [62, -66], [66, 10], [44, 110], [0, 124], [-44, 110], [-66, 10]]), HC.coat, { shade: HC.coatSh, hi: HC.coatHi, after: dapples(40, -60, -60, 120, 100, 8) });
  fig.add(4.1, P.smooth([[-48, 72], [48, 72], [58, 130], [30, 158], [-30, 158], [-58, 130]]), HC.muzzle, { shade: HC.muzzleSh, hi: "#4a4758" });
  for (const s of [-1, 1]) fig.add(4.2, P.ell(s * 22, 128, 9, 6, s * 0.4), "#0a090d", { noLine: true });
  // smug grin
  fig.add(4.2, (c) => { c.moveTo(-30, 146); c.quadraticCurveTo(0, 162, 34, 138); c.lineTo(36, 143); c.quadraticCurveTo(0, 170, -30, 150); c.closePath(); }, INK, { noLine: true });
  // eyes + brows
  for (const s of [-1, 1]) {
    const eyeP = { eye: p.eye, look: 0, lookY: 0, brow: p.brow * (s > 0 ? 1 : 1) };
    ctx.save(); ctx.translate(s * 40, -6); ctx.scale(s, 1); hEye(fig, 4.3, eyeP, 0, 0, 1.45); ctx.restore();
  }
  // forelock + bridle
  const w2 = Math.sin(p.t * 7) * 6 * p.wind;
  fig.add(4.4, P.smooth([[-30, -70], [30, -70], [22 + w2, -10], [4, 10], [-14 + w2, -18]]), HC.mane, { shade: HC.maneSh, sd: 6 });
  fig.add(4.5, P.poly([[-56, 84], [56, 84], [56, 96], [-56, 96]]), HC.strap, { lw: 3.5 });
  for (const s of [-1, 1]) { fig.add(4.5, P.poly([[s * 60, -40], [s * 66, -40], [s * 58, 90], [s * 52, 90]]), HC.strap, { lw: 3.5 }); fig.add(4.6, P.circ(s * 56, 104, 8), HC.brass, { lw: 3.5 }); }
  ctx.restore();
  fig.flush();
  ctx.restore();
}

// ---------- the opal dragon, side view (faces +x). Root = body centre ----------
const DDEF = {
  x: 0, y: 0, s: 1, flip: 1, rot: 0, t: 0,
  neckBase: -1.05, neckCurl: 0.12, neckWave: 1, head: 0.35, jaw: 0, eye: "angry",
  wing: 0.3, wingFold: 0, tailCurl: 0.05, tailWave: 1, tailSweep: 0, glow: 0, legs: 0, hurt: 0,
};
function iridescent(seed) {
  return (c) => {
    const cols = ["rgba(255,190,225,0.45)", "rgba(180,245,230,0.45)", "rgba(190,210,255,0.45)"];
    for (let i = 0; i < 3; i++) { c.fillStyle = cols[(i + seed) % 3]; c.beginPath(); c.ellipse(-10 + i * 14, -20 + i * 16, 90, 9, -0.5, 0, TAU); c.fill(); }
  };
}
function dragonWing(fig, layer, d, far) {
  const f = d.wing, fold = d.wingFold;
  ctx.save(); ctx.rotate(-0.25 - f * 0.9); ctx.scale(1, 1 - fold * 0.55);
  const k = 1 - fold * 0.6;
  const E1 = [-40 * k, -120 * k], WR = [-130 * k, -210 * k];
  const tips = [[-380, -250], [-420, -120], [-360, -10], [-250, 40]].map((q) => [q[0] * k, q[1] * k]);
  const sc = (a, b) => [lerp(a[0], b[0], 0.5) * 0.9 + WR[0] * 0.1, lerp(a[1], b[1], 0.5) * 0.9 + WR[1] * 0.1 + 12];
  const pts = [[10, 10], E1, WR, tips[0], sc(tips[0], tips[1]), tips[1], sc(tips[1], tips[2]), tips[2], sc(tips[2], tips[3]), tips[3], [-120 * k, 50 * k], [-30, 50]];
  fig.add(layer, P.poly(pts), far ? DC.wingSh : DC.wing, {
    shade: far ? DC.deep : DC.wingSh, sd: 18,
    after: (c) => {
      const cols = ["rgba(255,185,225,0.5)", "rgba(175,240,228,0.5)", "rgba(185,205,255,0.5)"];
      cols.forEach((col, i) => { c.fillStyle = col; c.beginPath(); c.ellipse(-230 * k, (-120 + i * 55) * k, 230 * k, 20, -0.35, 0, TAU); c.fill(); });
      c.strokeStyle = far ? DC.deep : DC.bone; c.lineCap = "round";
      c.lineWidth = 11; c.beginPath(); c.moveTo(0, 0); c.lineTo(E1[0], E1[1]); c.lineTo(WR[0], WR[1]); c.stroke();
      c.lineWidth = 6; for (const tp of tips) { c.beginPath(); c.moveTo(WR[0], WR[1]); c.lineTo(tp[0], tp[1]); c.stroke(); }
    },
  });
  fig.add(layer + 0.01, (c) => { c.save(); c.translate(WR[0], WR[1]); P.poly([[-6, 0], [2, -40], [10, 0]])(c); c.restore(); }, DC.horn, { lw: 4 });
  ctx.restore();
}
function dragonHead(fig, d) {
  const j = d.jaw;
  // horns + frill (behind skull)
  for (const [ox, oy, sc] of [[-14, -30, 1], [-4, -22, 0.7]]) {
    fig.add(2.8, (c) => { c.save(); c.translate(ox, oy); c.scale(sc, sc); P.smooth([[10, -8], [-60, -52], [-150, -64], [-190, -40], [-120, -34], [-50, -8], [6, 12]])(c); c.restore(); }, DC.horn, { shade: DC.hornSh, sd: 8 });
  }
  for (let i = 0; i < 4; i++) fig.add(2.8, (c) => { c.save(); c.translate(-40, -10 + i * 16); c.rotate(-0.4 + i * 0.35); P.poly([[0, -8], [-70 + i * 8, 0], [0, 8]])(c); c.restore(); }, DC.spike, { shade: DC.deep, sd: 6 });
  // mouth interior
  if (j > 0.05) fig.add(2.9, P.smooth([[20, 10], [160, 2], [170, 20], [150, 22 + j * 120], [30, 40 + j * 40]]), DC.mouth, {
    after: (c) => { c.fillStyle = DC.tongue; c.beginPath(); c.ellipse(90, 40 + j * 50, 50, 12 + j * 8, 0.4 + j * 0.2, 0, TAU); c.fill();
      if (d.glow > 0) { c.fillStyle = `rgba(255,255,255,${d.glow})`; c.beginPath(); c.ellipse(90, 20 + j * 40, 60 * d.glow, 30 * d.glow, 0.3, 0, TAU); c.fill(); } },
  });
  // skull + upper snout
  fig.add(3, P.ell(0, 0, 58, 46), DC.pearl, { shade: DC.pearlSh, hi: DC.pearlHi, after: iridescent(1) });
  fig.add(3, P.smooth([[6, -40], [80, -34], [150, -18], [170, 0], [158, 16], [100, 18], [20, 26]]), DC.pearl, { shade: DC.pearlSh, hi: DC.pearlHi, after: iridescent(2) });
  // upper teeth
  for (let i = 0; i < 7; i++) fig.add(3.05, P.poly([[40 + i * 17, 14], [48 + i * 17, 14], [44 + i * 17, 30 + (i % 2) * 6]]), DC.tooth, { lw: 3 });
  // lower jaw
  ctx.save(); ctx.translate(16, 20); ctx.rotate(j * 0.85);
  for (let i = 0; i < 6; i++) fig.add(3.1, P.poly([[36 + i * 18, 2], [44 + i * 18, 2], [40 + i * 18, -14 - (i % 2) * 5]]), DC.tooth, { lw: 3 });
  fig.add(3.2, P.smooth([[-8, -6], [130, -4], [150, 4], [128, 26], [10, 30]]), DC.pearl, { shade: DC.pearlSh, after: iridescent(0) });
  ctx.restore();
  // nostril + eye + brow ridge
  fig.add(3.3, P.ell(150, -6, 9, 5, -0.3), DC.deep, { noLine: true });
  const eyeX = 44, eyeY = -12;
  if (d.eye === "x") {
    fig.add(3.4, (c) => { c.save(); c.translate(eyeX, eyeY); c.rotate(0.785); c.rect(-18, -4, 36, 8); c.rect(-4, -18, 8, 36); c.restore(); }, INK, { noLine: true });
  } else {
    const wide = d.eye === "shock";
    fig.add(3.4, P.smooth([[eyeX - 22, eyeY + 4], [eyeX - 4, eyeY - (wide ? 18 : 12)], [eyeX + 22, eyeY - 2], [eyeX + 4, eyeY + (wide ? 16 : 10)]]), "#ffffff", {
      lw: 4,
      after: (c) => {
        c.fillStyle = DC.eye; c.beginPath(); c.ellipse(eyeX + 2, eyeY, wide ? 6 : 10, wide ? 6 : 11, 0, 0, TAU); c.fill();
        c.fillStyle = INK; c.beginPath(); c.ellipse(eyeX + 2, eyeY, wide ? 2 : 3, wide ? 3 : 10, 0, 0, TAU); c.fill();
        c.fillStyle = "#fff"; c.beginPath(); c.arc(eyeX + 6, eyeY - 4, 2.5, 0, TAU); c.fill();
      },
    });
  }
  const bro = d.eye === "angry" ? 0.35 : d.eye === "shock" ? -0.35 : 0;
  fig.add(3.5, (c) => { c.save(); c.translate(eyeX, eyeY - 18); c.rotate(bro); P.smooth([[-34, -2], [0, -12], [34, 2], [30, 10], [-30, 8]])(c); c.restore(); }, DC.deep, { lw: 4 });
}
function drawDragon(o) {
  const d = Object.assign({}, DDEF, o);
  const fig = new Fig(d.s);
  ctx.save(); ctx.translate(d.x, d.y); ctx.rotate(d.rot); ctx.scale(d.flip * d.s, d.s);
  // far wing
  ctx.save(); ctx.translate(10, -70); dragonWing(fig, 0, d, true); ctx.restore();
  // legs
  const lg = d.legs; // 0 standing, 1 tucked (flying)
  fig.add(1, P.cap(-140, 30, lerp(-130, -190, lg), lerp(140, 90, lg), 42, 26), DC.pearlSh, { shade: DC.deep });
  fig.add(1, P.cap(70, 40, lerp(80, 40, lg), lerp(140, 100, lg), 26, 18), DC.pearlSh, { shade: DC.deep });
  // tail chain
  const tail = []; { let a = Math.PI - 0.15 + d.tailSweep, x = -190, y = 10;
    for (let i = 0; i < 16; i++) { a += d.tailCurl + Math.sin(d.t * 3 - i * 0.45) * 0.06 * d.tailWave; x += Math.cos(a) * 38; y += Math.sin(a) * 38; tail.push([x, y, 48 * (1 - i / 17) + 7]); } }
  // neck chain
  const neck = []; { let a = d.neckBase, x = 120, y = -50;
    for (let i = 0; i < 7; i++) { a += d.neckCurl + Math.sin(d.t * 2 + i * 0.5) * 0.03 * d.neckWave; x += Math.cos(a) * 40; y += Math.sin(a) * 40; neck.push([x, y, 46 - i * 2.4]); } }
  // spikes along the back (behind the body)
  const spinePts = [...tail.slice(0, 12).reverse(), [-150, -58, 0], [-80, -66, 0], [-10, -76, 0], [60, -80, 0], ...neck];
  spinePts.forEach((q, i) => { if (i % 2) return; const r = q[2] || 60; fig.add(1.5, (c) => { c.save(); c.translate(q[0], q[1] - r * 0.8); P.poly([[-10, 6], [2, -26 - r * 0.25], [12, 6]])(c); c.restore(); }, DC.spike, { shade: DC.deep, sd: 5 }); });
  // body + tail + neck as one inked silhouette with segmented cel shading
  const body = [[-150, 0, 62], [-90, -6, 68], [-20, -10, 74], [50, -14, 76], [110, -26, 64]];
  [...tail.slice().reverse(), ...body, ...neck].forEach((q, i) => fig.add(2, P.circ(q[0], q[1], q[2]), DC.pearl, { shade: DC.pearlSh, hi: DC.pearlHi, sd: 10 + q[2] * 0.1, after: iridescent(i) }));
  // belly plates
  body.forEach((q) => fig.add(2.1, P.ell(q[0], q[1] + q[2] * 0.62, q[2] * 0.7, q[2] * 0.28), DC.belly, { noLine: true, shade: DC.bellySh, sd: 6 }));
  // tail spade
  { const q = tail[tail.length - 1], q0 = tail[tail.length - 2], a = Math.atan2(q[1] - q0[1], q[0] - q0[0]);
    fig.add(2.2, (c) => { c.save(); c.translate(q[0], q[1]); c.rotate(a); P.poly([[-6, 0], [30, -28], [70, 0], [30, 28]])(c); c.restore(); }, DC.spike, { shade: DC.deep, lw: 5 }); }
  // head
  const hq = neck[neck.length - 1];
  ctx.save(); ctx.translate(hq[0] + 10, hq[1]); ctx.rotate(d.head); dragonHead(fig, d); ctx.restore();
  // near legs
  fig.add(4, P.ell(-125, 30, 58, 70, 0.3), DC.pearl, { shade: DC.pearlSh, after: iridescent(2) });
  fig.add(4, P.cap(-120, 60, lerp(-110, -170, lg), lerp(150, 100, lg), 34, 26), DC.pearl, { shade: DC.pearlSh });
  fig.add(4, P.cap(90, 44, lerp(100, 70, lg), lerp(150, 110, lg), 28, 20), DC.pearl, { shade: DC.pearlSh });
  for (const [fx, fy] of [[lerp(-110, -170, lg), lerp(150, 100, lg)], [lerp(100, 70, lg), lerp(150, 110, lg)]]) for (let i = 0; i < 3; i++) fig.add(4.1, P.poly([[fx - 18 + i * 14, fy + 10], [fx - 10 + i * 14, fy + 10], [fx - 8 + i * 16, fy + 30]]), DC.horn, { lw: 3 });
  // near wing
  ctx.save(); ctx.translate(30, -80); dragonWing(fig, 5, d, false); ctx.restore();
  fig.flush(6);
  ctx.restore();
  return { head: hq };
}
// world position of the dragon's mouth for a given pose (approximate, for effects)
function dragonMouth(o) {
  const d = Object.assign({}, DDEF, o);
  let a = d.neckBase, x = 120, y = -50;
  for (let i = 0; i < 7; i++) { a += d.neckCurl + Math.sin(d.t * 2 + i * 0.5) * 0.03 * d.neckWave; x += Math.cos(a) * 40; y += Math.sin(a) * 40; }
  x += 10; const mx = x + Math.cos(d.head) * 160 - Math.sin(d.head) * 24, my = y + Math.sin(d.head) * 160 + Math.cos(d.head) * 24;
  const c = Math.cos(d.rot), s = Math.sin(d.rot), lx = mx * d.flip * d.s, ly = my * d.s;
  return { x: d.x + lx * c - ly * s, y: d.y + lx * s + ly * c, dir: d.flip > 0 ? d.head + d.rot : Math.PI - d.head + d.rot };
}

// ---------- the orc paladin, small side-view cameo (faces +x). Root = hips, feet at +70 ----------
function drawPaladin(o) {
  const p = Object.assign({ x: 0, y: 0, s: 1, t: 0, run: 1, flip: 1, look: 0, sword: 1 }, o);
  const fig = new Fig(p.s);
  const steel = "#9aa6ba", steelSh = "#6f7a90", dark = "#4a4f5c", skin = "#7c9444", skinSh = "#5d7231";
  ctx.save(); ctx.translate(p.x, p.y); ctx.scale(p.flip * p.s, p.s);
  const ph = p.t * 11 * p.run, sw = Math.sin(ph) * 0.8 * p.run, bob = Math.abs(Math.sin(ph)) * 6 * p.run;
  ctx.translate(0, -bob);
  for (const [s, L] of [[1, 0], [-1, 6]]) {
    ctx.save(); ctx.rotate(s * sw);
    fig.add(L, P.cap(0, 0, 0, 36, 10, 8), steel, { shade: steelSh });
    ctx.translate(0, 36); ctx.rotate(Math.max(0, -s * sw) * 1.2);
    fig.add(L, P.cap(0, 0, 0, 30, 8, 8), steel, { shade: steelSh });
    fig.add(L, P.poly([[-8, 26], [16, 26], [16, 38], [-8, 38]]), dark, {});
    ctx.restore();
  }
  ctx.rotate(0.18 * p.run);
  fig.add(2, P.smooth([[-22, -66], [22, -66], [18, 0], [-18, 0]]), steel, { shade: steelSh, hi: "#c9d2e0" });
  fig.add(2.1, P.poly([[-20, -14], [20, -14], [20, -6], [-20, -6]]), "#7b4a26", { lw: 3 });
  fig.add(2.2, P.poly([[-3, -16], [5, -16], [5, -4], [-3, -4]]), "#e0b34a", { lw: 2 });
  fig.add(2.3, P.poly([[-20, -60], [-12, -64], [20, -10], [12, -6]]), "#7b4a26", { lw: 3 });
  fig.add(2.4, P.circ(-4, -60, 16), "#c9d2e0", { shade: steelSh });
  // head
  ctx.save(); ctx.translate(2, -84);
  fig.add(3, P.circ(0, 0, 16), skin, { shade: skinSh });
  fig.add(3.1, P.smooth([[-6, 2], [18, 0], [16, 16], [2, 20], [-8, 12]]), "#111", {});
  fig.add(3.1, P.smooth([[-16, -4], [-14, -16], [0, -20], [14, -14], [16, -6], [0, -12]]), "#111", { noLine: true });
  fig.add(3.2, P.poly([[-10, -6], [-32, -18], [-12, 2]]), skin, { lw: 3 });
  fig.add(3.3, P.poly([[12, 4], [15, -6], [17, 4]]), "#f2ead6", { lw: 2 });
  fig.add(3.3, P.ell(10 + p.look * 2, -4, 3.5, 2.2), "#ffd257", { noLine: true });
  ctx.restore();
  // arm + shadow sword
  ctx.save(); ctx.translate(6, -58); ctx.rotate(-0.9 - sw * 0.4);
  fig.add(4, P.cap(0, 0, 0, 44, 9, 8), steel, { shade: steelSh });
  ctx.translate(0, 46); ctx.rotate(1.9);
  if (p.sword) fig.add(3.9, P.poly([[-4, 0], [4, 0], [3, -120], [0, -132], [-3, -120]]), "#150a22", { lw: 3, after: (c) => { c.strokeStyle = "#b893ff"; c.lineWidth = 2; c.beginPath(); c.moveTo(0, -6); c.lineTo(0, -118); c.stroke(); } });
  fig.add(4.1, P.poly([[-14, -6], [14, -6], [14, 0], [-14, 0]]), dark, { lw: 3 });
  ctx.restore();
  fig.flush(4);
  ctx.restore();
}

// ---------- geometry helpers for placing effects on the rigs ----------
const M = {
  of: (x, y, rot, sx, sy) => new DOMMatrix().translateSelf(x, y).rotateSelf(rot * 180 / Math.PI).scaleSelf(sx, sy),
  rot: (m, r) => m.rotateSelf(r * 180 / Math.PI),
  pt: (m, x, y) => { const q = m.transformPoint({ x, y }); return [q.x, q.y]; },
};
// world-space point in the horse's head frame (default: muzzle centre)
function horseHead(h, hx, hy) {
  const p = Object.assign({}, HDEF, h);
  const m = M.of(p.x, p.y, p.rot, p.flip * p.s, p.s);
  if (p.spin) { m.translateSelf(90, -40); M.rot(m, p.spin); m.translateSelf(-90, 40); }
  M.rot(m, p.pitch); m.translateSelf(196, -58); M.rot(m, p.neck); m.translateSelf(116, 0); M.rot(m, p.head);
  return M.pt(m, hx == null ? 60 : hx, hy == null ? 0 : hy);
}
// world-space point on a horse limb end (hoof). which: 'fr','fl','hr','hl'
function horseHoof(h, which) {
  const p = Object.assign({}, HDEF, h);
  const m = M.of(p.x, p.y, p.rot, p.flip * p.s, p.s);
  if (p.spin) { m.translateSelf(90, -40); M.rot(m, p.spin); m.translateSelf(-90, 40); }
  const a = p[which];
  let L1 = 100, L2 = 86;
  if (which[0] === "f") { M.rot(m, p.pitch); m.translateSelf(which === "fr" ? 188 : 176, 6); M.rot(m, -p.pitch); L1 = 96; L2 = 84; }
  else m.translateSelf(which === "hr" ? 12 : -6, 0);
  M.rot(m, a[0]); m.translateSelf(0, L1); M.rot(m, a[1]); m.translateSelf(0, L2); M.rot(m, a[2]);
  return M.pt(m, 0, 12);
}
function dragonHeadPt(o, hx, hy) {
  const d = Object.assign({}, DDEF, o);
  let a = d.neckBase, x = 120, y = -50;
  for (let i = 0; i < 7; i++) { a += d.neckCurl + Math.sin(d.t * 2 + i * 0.5) * 0.03 * d.neckWave; x += Math.cos(a) * 40; y += Math.sin(a) * 40; }
  const m = M.of(d.x, d.y, d.rot, d.flip * d.s, d.s); m.translateSelf(x + 10, y); M.rot(m, d.head);
  return M.pt(m, hx == null ? 60 : hx, hy == null ? 0 : hy);
}
