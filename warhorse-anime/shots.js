// ============================================================
// backgrounds + the shot list
// ============================================================
const HG = 208;     // horse hip -> hoof bottom
const GY = 880;     // pasture ground line (world)
const SKY = ["#1b1742", "#2a2058", "#41306e", "#633a7e", "#934683", "#c95f8a", "#ec8e8e", "#ffbd98", "#ffd8a8"];

function withLayer(f, cam, fn) {
  camera(960 + (cam.x - 960) * f, 540 + (cam.y - 540) * f, 1 + (cam.z - 1) * f, (cam.rot || 0) * f, (cam.shake || 0) * f, cam.t || 0);
  fn();
}
function skyBands(cam) {
  screen();
  const off = -(cam.y - 540) * 0.08 - (cam.z - 1) * 60, bh = 86;
  ctx.fillStyle = SKY[0]; ctx.fillRect(0, 0, W, H);
  SKY.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(0, 40 + i * bh + off, W, bh + 2); });
  ctx.fillStyle = SKY[SKY.length - 1]; ctx.fillRect(0, 40 + SKY.length * bh + off, W, H);
  for (let i = 0; i < 90; i++) {
    const x = hash(i * 3.7) * W, y = hash(i * 9.1) * 320 + off * 0.5, tw = 0.5 + 0.5 * Math.sin((cam.t || 0) * 3 + i);
    ctx.fillStyle = `rgba(255,255,255,${0.35 + 0.5 * tw})`; ctx.fillRect(x, y, i % 9 ? 2 : 3, i % 9 ? 2 : 3);
  }
  // crescent moon
  ctx.fillStyle = "#fff4dc"; ctx.beginPath(); ctx.arc(330, 170 + off * 0.3, 46, 0, TAU); ctx.fill();
  ctx.fillStyle = SKY[1]; ctx.beginPath(); ctx.arc(352, 158 + off * 0.3, 42, 0, TAU); ctx.fill();
  // setting sun with cloud stripes
  const sx = 1380 - (cam.x - 960) * 0.05, sy = 700 + off * 1.4;
  ctx.fillStyle = "rgba(255,214,170,0.25)"; ctx.beginPath(); ctx.arc(sx, sy, 300, 0, TAU); ctx.fill();
  ctx.fillStyle = "#fff0c8"; ctx.beginPath(); ctx.arc(sx, sy, 220, 0, TAU); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(sx, sy, 222, 0, TAU); ctx.clip();
  [[-60, 16, "#ffcf9e"], [-10, 12, "#ffc093"], [40, 22, "#f7a58f"], [95, 18, "#ec8e8e"]].forEach(([dy, h, c]) => { ctx.fillStyle = c; ctx.fillRect(sx - 240, sy + dy, 480, h); });
  ctx.restore();
  // long thin clouds
  const cl = (x, y, w, c) => { ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(x, y, w, 14, 0, 0, TAU); ctx.ellipse(x - w * 0.3, y - 12, w * 0.4, 16, 0, 0, TAU); ctx.fill(); };
  const drift = (cam.t || 0) * 6;
  cl(420 + drift - (cam.x - 960) * 0.04, 420 + off, 260, "#a24f86"); cl(1500 + drift - (cam.x - 960) * 0.04, 380 + off, 200, "#b35690"); cl(900 + drift * 0.7, 560 + off, 330, "#e77f8f");
}
function mountains() {
  ctx.fillStyle = "#6f4b87"; ctx.beginPath(); ctx.moveTo(-800, 900);
  for (let x = -800; x <= 2800; x += 70) ctx.lineTo(x, 640 - Math.abs(Math.sin(x * 0.004)) * 120 - hash(x) * 40);
  ctx.lineTo(2800, 900); ctx.fill();
  ctx.fillStyle = "#5b3f78"; ctx.beginPath(); ctx.moveTo(-800, 900);
  for (let x = -800; x <= 2800; x += 50) ctx.lineTo(x, 700 - Math.abs(Math.sin(x * 0.006 + 1)) * 70 - hash(x + 3) * 20);
  ctx.lineTo(2800, 900); ctx.fill();
}
function hillsVillage(t) {
  ctx.fillStyle = "#47356c"; ctx.beginPath(); ctx.moveTo(-600, 1000);
  for (let x = -600; x <= 2600; x += 20) ctx.lineTo(x, 745 - Math.sin(x * 0.003) * 30 - Math.sin(x * 0.011) * 8);
  ctx.lineTo(2600, 1000); ctx.fill();
  for (let i = 0; i < 12; i++) {
    const x = -300 + i * 230 + hash(i) * 60, y = 748 - Math.sin(x * 0.003) * 30, w = 60 + hash(i + 1) * 30, h = 34 + hash(i + 2) * 16;
    ctx.fillStyle = "#33264f"; ctx.fillRect(x, y - h, w, h + 10);
    ctx.beginPath(); ctx.moveTo(x - 8, y - h); ctx.lineTo(x + w / 2, y - h - 28); ctx.lineTo(x + w + 8, y - h); ctx.fill();
    ctx.fillRect(x + w * 0.7, y - h - 30, 10, 20);
    const lit = 0.75 + 0.25 * Math.sin(t * 2 + i);
    ctx.fillStyle = `rgba(255,200,110,${lit})`; ctx.fillRect(x + 10, y - h + 10, 9, 9); ctx.fillRect(x + w - 20, y - h + 10, 9, 9);
  }
}
function treeLine(t) {
  for (let i = 0; i < 60; i++) {
    const x = -500 + i * 55 + hash(i * 2.2) * 30, h = 90 + hash(i * 5.5) * 90, y = 830, sw = Math.sin(t * 1.5 + i) * 3;
    ctx.fillStyle = i % 3 ? "#2c2244" : "#352a52";
    ctx.beginPath(); ctx.moveTo(x - h * 0.28, y); ctx.lineTo(x + sw, y - h); ctx.lineTo(x + h * 0.28, y); ctx.fill();
  }
}
function ground(t, scorch) {
  ctx.fillStyle = "#5e8f45"; ctx.fillRect(-2000, GY - 60, 6000, 1400);
  ctx.fillStyle = "#6fa04f"; ctx.fillRect(-2000, GY - 60, 6000, 18);
  ctx.fillStyle = "#4f7d3a"; ctx.fillRect(-2000, GY + 70, 6000, 900);
  // fence (behind the action)
  ctx.fillStyle = "#6b4a2e";
  for (let x = -1400; x < 3400; x += 150) ctx.fillRect(x, GY - 150, 16, 110);
  ctx.fillRect(-1400, GY - 136, 4800, 12); ctx.fillRect(-1400, GY - 96, 4800, 12);
  ctx.fillStyle = "#8a6440"; for (let x = -1400; x < 3400; x += 150) ctx.fillRect(x, GY - 150, 5, 110);
  // tufts + flowers
  for (let i = 0; i < 120; i++) {
    const x = -1400 + hash(i * 1.3) * 4800, y = GY - 40 + hash(i * 2.9) * 200, s = 0.6 + hash(i * 4.1) * 0.8;
    ctx.fillStyle = i % 2 ? "#467433" : "#79b057";
    ctx.beginPath(); ctx.moveTo(x - 12 * s, y); ctx.lineTo(x - 4 * s, y - 22 * s); ctx.lineTo(x, y); ctx.lineTo(x + 5 * s, y - 28 * s); ctx.lineTo(x + 12 * s, y); ctx.fill();
    if (i % 5 === 0) { ctx.fillStyle = i % 10 ? "#fff6dc" : "#ffd35a"; ctx.beginPath(); ctx.arc(x + 14, y - 6, 4, 0, TAU); ctx.fill(); }
  }
  if (scorch) {
    // a rainbow-singed patch where the breath hit
    const cols = ["#ffb7d5", "#bff3e6", "#c9d6ff", "#fff0b5"];
    for (let i = 0; i < 18; i++) { ctx.fillStyle = cols[i % 4]; ctx.globalAlpha = 0.6 * scorch; ctx.beginPath(); ctx.ellipse(scorch.x + (hash(i) - 0.5) * 260, GY + 10 + hash(i + 4) * 30, 30, 8, 0, 0, TAU); ctx.fill(); }
    ctx.globalAlpha = 1;
  }
}
function fgGrass(t) {
  for (let i = 0; i < 40; i++) {
    const x = -1000 + i * 110 + hash(i * 7.7) * 60, h = 70 + hash(i) * 90, y = 1100, sw = Math.sin(t * 2 + i * 0.7) * 8;
    ctx.fillStyle = i % 2 ? "#243d1f" : "#2f4d27";
    ctx.beginPath(); ctx.moveTo(x - 22, y); ctx.quadraticCurveTo(x + sw, y - h * 0.6, x + sw * 2 + 6, y - h); ctx.quadraticCurveTo(x + 8, y - h * 0.5, x + 22, y); ctx.fill();
  }
}
function pasture(cam, t, opts) {
  opts = opts || {};
  skyBands(cam);
  withLayer(0.15, cam, mountains);
  withLayer(0.35, cam, () => hillsVillage(t));
  withLayer(0.6, cam, () => treeLine(t));
  withLayer(1, cam, () => ground(t, opts.scorch));
}
function worldCam(cam) { camera(cam.x, cam.y, cam.z, cam.rot || 0, cam.shake || 0, cam.t || 0); }

// abstract anime backgrounds (screen space)
function radialBG(cx, cy, c1, c2, t, n, spin) {
  screen(); ctx.fillStyle = c1; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = c2; n = n || 28;
  for (let i = 0; i < n; i++) { const a0 = (i / n) * TAU + (spin || 0) * t, a1 = a0 + TAU / n * 0.5; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a0) * 3000, cy + Math.sin(a0) * 3000); ctx.lineTo(cx + Math.cos(a1) * 3000, cy + Math.sin(a1) * 3000); ctx.fill(); }
}
function sparkleBG(t) {
  screen();
  const g = ctx.createRadialGradient(960, 480, 50, 960, 540, 1100); g.addColorStop(0, "#fff0f7"); g.addColorStop(0.5, "#ffc3dd"); g.addColorStop(1, "#c79bf0");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 26; i++) {
    const x = hash(i * 3.1) * W, y = ((hash(i * 5.3) * H - t * (40 + hash(i) * 60)) % H + H) % H, r = 20 + hash(i * 7) * 60;
    ctx.strokeStyle = "rgba(255,255,255,0.8)"; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.25)"; ctx.fill();
  }
  for (let i = 0; i < 30; i++) { const x = hash(i * 1.9 + 4) * W, y = hash(i * 2.7 + 1) * H, s = (0.5 + 0.5 * Math.sin(t * 5 + i)) * (14 + hash(i) * 26); sparkle(x, y, s, "#ffffff", 0.2); }
  // rose petals
  for (let i = 0; i < 14; i++) { const x = ((hash(i * 4.4) * W + t * 120) % W), y = ((hash(i * 6.6) * H + t * 90) % H); ctx.save(); ctx.translate(x, y); ctx.rotate(t * 2 + i); ctx.fillStyle = i % 2 ? "#ff7fa8" : "#ff9fbf"; ctx.beginPath(); ctx.ellipse(0, 0, 14, 8, 0, 0, TAU); ctx.fill(); ctx.restore(); }
}
function windSwirlBG(t) {
  // Demon-Slayer-ish ukiyo-e wind/wave swirls
  screen();
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#0d1a4a"); g.addColorStop(1, "#1f4f8f");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  for (let k = 0; k < 7; k++) {
    const yb = 150 + k * 140, ph = t * (1.5 + k * 0.2) + k;
    const pts = [];
    for (let i = 0; i <= 40; i++) { const x = -100 + i * 55; pts.push([x, yb + Math.sin(i * 0.35 + ph) * 60 + Math.sin(i * 0.9 - ph * 1.3) * 18, 10 + 26 * Math.abs(Math.sin(i * 0.2 + k))]); }
    ctx.globalAlpha = 0.9;
    brushArc(pts, ["#0a1233", k % 2 ? "#3f86d8" : "#5fb0f0", "#e8f6ff"]);
    ctx.globalAlpha = 1;
    // curls
    for (let i = 0; i < 4; i++) {
      const cx = ((hash(k * 10 + i) * W + t * 200 * (k % 2 ? 1 : -1)) % (W + 300) + W + 300) % (W + 300) - 150, cy = yb + Math.sin(i + ph) * 40;
      const cp = []; for (let j = 0; j < 30; j++) { const a = j * 0.33 + ph, r = 70 - j * 2.2; cp.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r, Math.max(1, 14 - j * 0.45)]); }
      brushArc(cp, ["#0a1233", "#8fd0ff", "#ffffff"]);
    }
  }
}
function letterbox(k) {
  screen(); const h = 130 * k; ctx.fillStyle = "#050308"; ctx.fillRect(0, 0, W, h); ctx.fillRect(0, H - h, W, h);
}
function bubble(txt, x, y, t, t0, dur, size) {
  const a = t - t0; if (a < 0 || a > dur) return;
  const s = a < 0.15 ? E.back(a / 0.15) : 1;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = "#fff"; ctx.strokeStyle = INK; ctx.lineWidth = 6;
  const w = (size || 90) * 1.6, h = (size || 90);
  ctx.beginPath(); ctx.ellipse(0, 0, w, h * 0.72, 0, 0, TAU); ctx.moveTo(-w * 0.3, h * 0.5); ctx.lineTo(-w * 0.55, h * 1.1); ctx.lineTo(-w * 0.05, h * 0.62);
  ctx.stroke(); ctx.fill();
  outlinedText(txt, 0, 4, `${(size || 90) * 0.9}px 'Dela Gothic One'`, INK, { lw: 0.1, stroke: INK });
  ctx.restore();
}

// horse pose library
const HP = {
  graze: { neck: 0.38, head: 1.5, eye: "half", tail: 0.3 },
  alert: { neck: -0.95, head: 1.3, eye: "open" },
  stand: { pitch: -1.35, neck: 0.32, head: 1.72, fl: [0.15, -0.25, 0], fr: [0.05, -0.35, 0], hl: [0.2, -0.05, 0], hr: [-0.25, 0.2, 0], tail: 0.3 },
  guard: { pitch: -1.28, neck: 0.28, head: 1.72, fl: [-0.55, -2.25, 0], fr: [-0.35, -2.35, 0], hl: [0.35, -0.15, 0], hr: [-0.35, 0.3, 0], tail: 0.4, eye: "glare", brow: 1 },
  jabL: { pitch: -1.2, neck: 0.25, head: 1.68, fl: [-1.5, -0.1, 0], fr: [-0.35, -2.35, 0], hl: [0.45, -0.15, 0], hr: [-0.45, 0.3, 0], eye: "glare", brow: 1 },
  jabR: { pitch: -1.2, neck: 0.25, head: 1.68, fl: [-0.55, -2.25, 0], fr: [-1.55, -0.1, 0], hl: [0.45, -0.15, 0], hr: [-0.45, 0.3, 0], eye: "glare", brow: 1 },
  crouch: { pitch: -1.0, neck: 0.1, head: 1.6, fl: [-0.55, -2.2, 0], fr: [0.4, -1.6, 0], hl: [-0.5, 1.1, -0.4], hr: [-0.9, 1.3, -0.3], eye: "glare", brow: 1, dy: 55 },
  upper: { pitch: -1.5, neck: 0.1, head: 1.55, fl: [-0.55, -2.25, 0], fr: [-2.8, -0.4, 0], hl: [0.1, 0, 0], hr: [0.4, 0.2, 0], eye: "glare", brow: 1, dy: -40 },
  limbo: { pitch: -2.75, neck: 0.55, head: 1.2, fl: [-2.2, 0.3, 0], fr: [-0.6, 0.5, 0], hl: [-1.0, 1.9, -0.6], hr: [-0.8, 1.7, -0.6], eye: "dot", tail: 0.8, dy: 70 },
  dust: { pitch: -1.35, neck: 0.3, head: 1.72, fl: [-0.2, -2.6, 0], fr: [0.1, -0.4, 0], hl: [0.2, -0.05, 0], hr: [-0.25, 0.2, 0], eye: "half", mouth: "smirk" },
  tuck: { pitch: -0.9, neck: 0.3, head: 1.6, fl: [-1.9, -0.8, 0], fr: [-2.1, -0.6, 0], hl: [-1.3, 2.2, 0], hr: [-1.1, 2.3, 0], tail: 0.9 },
  hero: { pitch: -0.65, neck: -0.1, head: 1.4, fl: [-0.25, 0.05, 0], fr: [0.9, -0.8, 0], hl: [-1.2, 2.2, -0.9], hr: [0.9, 0.9, 0.2], tail: 0.6, eye: "glare", brow: 1, dy: 60 },
  coil: { pitch: 0.35, neck: -1.6, head: 1.2, fl: [0.25, 0, 0], fr: [0.05, 0, 0], hl: [-0.5, 1.2, -0.3], hr: [-0.3, 1.3, -0.3], tail: 0.9, eye: "glare", brow: 1, look: 1, dy: 30 },
  buck: { pitch: 0.55, neck: -1.2, head: 1.3, fl: [0.35, 0, 0], fr: [0.2, 0, 0], hl: [-1.75, 0.1, 0], hr: [-1.65, 0.05, 0], tail: 1.4, eye: "glare", brow: 1, dy: -10 },
  gallopA: { neck: -0.7, head: 1.35, fl: [-0.9, 0.2, 0], fr: [-0.5, 1.1, 0], hl: [0.7, 0.1, 0], hr: [0.3, 0.9, 0], tail: 0.9 },
  gallopB: { neck: -0.8, head: 1.35, fl: [0.6, 0.8, 0], fr: [0.9, 0.3, 0], hl: [-0.5, 1.2, 0], hr: [-0.8, 0.5, 0], tail: 1.1 },
};
// blend two horse poses (numbers + [a,b,c] arrays; strings snap at 0.5)
function mixPose(a, b, k) {
  const out = {}; const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const key of keys) {
    const va = a[key] !== undefined ? a[key] : HDEF[key] !== undefined ? HDEF[key] : 0;
    const vb = b[key] !== undefined ? b[key] : HDEF[key] !== undefined ? HDEF[key] : 0;
    if (Array.isArray(va)) out[key] = va.map((v, i) => lerp(v, vb[i], k));
    else if (typeof va === "number") out[key] = lerp(va, vb, k);
    else out[key] = k < 0.5 ? va : vb;
  }
  return out;
}
// place a horse on the ground: p.dy lowers/raises the hip from standing height
function horseAt(x, pose, s, extra) {
  const p = Object.assign({}, pose, extra || {});
  const dy = (p.dy || 0) * s;
  drawHorse(Object.assign(p, { x, y: GY - HG * s + dy, s }));
  return Object.assign(p, { x, y: GY - HG * s + dy, s });
}

// ------------------------------------------------------------
// the shots. Each: [start, end, fn(lt, t, a)] where a = lt on twos
// ------------------------------------------------------------
const BUTTERFLY = (x, y, t, s) => {
  ctx.save(); ctx.translate(x, y); ctx.scale(s || 1, s || 1);
  const f = Math.abs(Math.sin(t * 22));
  ctx.lineWidth = 3; ctx.strokeStyle = INK;
  for (const sd of [-1, 1]) { ctx.save(); ctx.scale(sd * (0.3 + 0.7 * f), 1); ctx.fillStyle = "#ffb3d9"; ctx.beginPath(); ctx.ellipse(10, -8, 12, 9, -0.4, 0, TAU); ctx.fill(); ctx.stroke(); ctx.fillStyle = "#b9e8ff"; ctx.beginPath(); ctx.ellipse(8, 6, 8, 6, 0.4, 0, TAU); ctx.fill(); ctx.stroke(); ctx.restore(); }
  ctx.fillStyle = INK; ctx.fillRect(-2, -10, 4, 20);
  ctx.restore();
};

const SHOTS = [
  // 1. the pasture at dusk
  [0, 3.0, (lt, t, a) => {
    const cam = { x: 900 + lt * 30, y: 540, z: 1, t };
    pasture(cam, t);
    worldCam(cam);
    const chew = 0.08 + 0.08 * Math.sin(a * 14);
    horseAt(880, HP.graze, 0.85, { t: a, jaw: chew, tail: 0.3 + 0.25 * Math.sin(a * 2.2), ear: lt > 1.4 && lt < 1.7 ? -0.35 : 0, grass: 1 });
    // birds
    for (let i = 0; i < 5; i++) { const bx = 1500 - lt * 160 + i * 40, by = 300 + i * 18 + Math.sin(t * 6 + i) * 6; ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(bx - 12, by - 6 * Math.abs(Math.sin(t * 9 + i))); ctx.lineTo(bx, by); ctx.lineTo(bx + 12, by - 6 * Math.abs(Math.sin(t * 9 + i))); ctx.stroke(); }
    BUTTERFLY(1500 - lt * 150, 640 + Math.sin(t * 4) * 30, t, 1);
    withLayer(1.25, cam, () => fgGrass(t));
    screen();
    ctx.globalAlpha = seg(lt, 0.3, 0.8) * (1 - seg(lt, 2.4, 2.9));
    outlinedText("Meanwhile, in the pasture...", 90, 980, "italic 600 58px 'Alegreya Sans'", "#fff6e8", { align: "left", lw: 8 });
    ctx.globalAlpha = 1;
  }],
  // 2. close-up: munching, butterfly, then a shadow falls
  [3.0, 4.4, (lt, t, a) => {
    const cam = { x: 960, y: 540, z: 1, t };
    pasture({ x: 1100, y: 420, z: 1.6, t }, t);
    worldCam(cam);
    const alarmed = lt > 1.05;
    const pose = Object.assign({}, HP.graze, { t: a, jaw: alarmed ? 0.06 : 0.08 + 0.1 * Math.sin(a * 14), grass: 1, eye: alarmed ? "wide" : "half", lookY: alarmed ? -1 : 0, look: alarmed ? 0.6 : 0, ear: alarmed ? -0.45 : 0 });
    drawHorse(Object.assign(pose, { x: -190, y: 815, s: 2.6 }));
    const nose = horseHead(Object.assign(pose, { x: -190, y: 815, s: 2.6 }), 110, -30);
    const bf = lt < 0.95 ? [nose[0] + 6, nose[1] - 30] : [nose[0] + (lt - 0.95) * 900, nose[1] - 30 - (lt - 0.95) * 700];
    BUTTERFLY(bf[0], bf[1], lt < 0.95 ? t * 0.3 : t, 2.2);
    // the shadow sweeps in
    screen();
    const k = seg(lt, 0.85, 1.25, E.out);
    if (k > 0) { ctx.fillStyle = "rgba(20,8,40,0.55)"; ctx.beginPath(); ctx.moveTo(W, 0); ctx.lineTo(W - W * 1.3 * k, 0); ctx.lineTo(W - W * 1.3 * k - 300, H); ctx.lineTo(W, H); ctx.fill(); }
    if (alarmed) sfx("!", nose[0] - 120, nose[1] - 360, 150, -0.1, t, 4.05, 0.4, "#ffffff");
  }],
  // 3. the dragon lands
  [4.4, 6.2, (lt, t, a) => {
    const landT = 0.5;
    const shake = lt > landT ? 36 * Math.exp(-(lt - landT) * 5) : 0;
    const cam = { x: 1000, y: 470, z: 0.82, t, shake };
    pasture(cam, t);
    worldCam(cam);
    const fall = seg(lt, 0, landT, E.in);
    const dy = lerp(-700, GY - 175 * 0.95, fall);
    const squash = lt > landT ? 1 - 0.12 * Math.exp(-(lt - landT) * 8) * Math.cos((lt - landT) * 30) : 1;
    const flap = lt < landT ? Math.sin(t * 14) * 0.5 + 0.5 : 0.35 + 0.05 * Math.sin(t * 3);
    ctx.save(); ctx.translate(1500, dy + 175 * 0.95); ctx.scale(1, squash); ctx.translate(-1500, -(dy + 175 * 0.95));
    drawDragon({ x: 1500, y: dy, s: 0.95, flip: -1, t: a, wing: flap, legs: lt < landT ? 1 - seg(lt, 0.25, landT) : 0, jaw: lt > landT + 0.2 ? 0.25 : 0, eye: "angry", head: 0.45 });
    ctx.restore();
    dust(1500, GY + 10, t, 4.4 + landT, 16, 520, 1.1, 5, "#e3cfbb");
    horseAt(430, HP.alert, 0.8, { t: a, eye: lt > landT ? "wide" : "open", grass: 1, look: 1 });
    withLayer(1.25, cam, () => fgGrass(t));
    screen();
    if (lt > landT) sfx("ドォン", 1320, 260, 190, -0.12, t, 4.4 + landT, 1.2, "#ffe14a", "'Dela Gothic One'");
  }],
  // 4. the deadpan stare
  [6.2, 8.0, (lt, t, a) => {
    pasture({ x: 700, y: 360, z: 1.7, t }, t);
    screen();
    const push = 1 + lt * 0.05;
    camera(960, 540, push, 0, 0, t);
    const chewing = lt < 1.2;
    const pose = Object.assign({}, HP.alert, { t: a, grass: 1, eye: lt > 1.45 && lt < 1.55 ? "closed" : "half", jaw: chewing ? 0.05 + 0.07 * Math.sin(a * 10) : 0.03, look: 1 });
    drawHorse(Object.assign(pose, { x: 60, y: 950, s: 2.7 }));
    screen();
    [0.35, 0.65, 0.95].forEach((d, i) => { if (lt > d) { ctx.fillStyle = "#fff"; ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(1240 + i * 70, 250, 16, 0, TAU); ctx.stroke(); ctx.fill(); } });
  }],
  // 5. the roar
  [8.0, 10.0, (lt, t, a) => {
    const open = seg(lt, 0.15, 0.4, E.back) * (1 - seg(lt, 1.6, 1.85));
    const shake = open > 0.3 ? 16 : 0;
    radialBG(700, 560, "#3a1753", "#5a2a7a", t, 30, 0.4);
    focusLines(700, 560, t, 380, "rgba(255,255,255,0.7)", 160, 3);
    camera(960, 540, 1, -0.05, shake, t);
    const d = { x: 1500, y: 700, s: 2.1, flip: -1, t: a, jaw: open, head: 0.15 - open * 0.25, neckBase: -0.8, eye: "angry", wing: 0.9, glow: 0 };
    drawDragon(d);
    screen();
    // spit
    for (let i = 0; i < 18; i++) { const k = ((lt * 2 + hash(i)) % 1); if (open < 0.5) break; ctx.fillStyle = "#e6f7ff"; ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(760 - k * 900 + hash(i * 3) * 80, 560 + (hash(i * 5) - 0.5) * 400 * k, 6 + 10 * hash(i), 0, TAU); ctx.fill(); ctx.stroke(); }
    sfx("GRAAAAHH!!", 520, 200, 170, -0.1, t, 8.3, 1.5, "#ff6fa8");
  }],
  // 6. spit out the grass, stand up
  [10.0, 12.0, (lt, t, a) => {
    const up = seg(lt, 0.35, 1.25, E.back);
    const cam = { x: 900, y: lerp(560, 420, seg(lt, 0.3, 1.3)), z: lerp(1.35, 1.25, up), t };
    pasture(cam, t);
    // heroic rays behind
    if (lt > 1.1) { screen(); ctx.globalAlpha = seg(lt, 1.1, 1.5) * 0.5; radialBG(900, 300, "rgba(0,0,0,0)", "#ffe7a6", t, 22, 0.15); ctx.globalAlpha = 1; }
    worldCam(cam);
    const pose = mixPose(HP.alert, HP.stand, up);
    const spit = lt > 0.05 && lt < 0.3;
    const hp = horseAt(640, pose, 1.0, { t: a, jaw: spit ? 0.6 : 0, grass: lt < 0.1 ? 1 : 0, eye: lt > 1.3 ? "glare" : "half", brow: lt > 1.3 ? 1 : 0, mouth: lt > 1.4 ? "smirk" : "closed", wind: up * 0.6 });
    if (lt > 0.1) { const m = horseHead(hp, 120, 20); for (let i = 0; i < 4; i++) { const k = lt - 0.1; const gx = m[0] + k * (700 + i * 120), gy = m[1] - k * 200 + k * k * 600 + i * 10; ctx.save(); ctx.translate(gx, gy); ctx.rotate(k * 10 + i); ctx.fillStyle = "#6fb043"; ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-20, -3); ctx.lineTo(24, 0); ctx.lineTo(-20, 4); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); } }
    dust(640 + 20, GY, t, 10.45, 10, 260, 0.8, 21);
    withLayer(1.25, cam, () => fgGrass(t));
    screen();
    sfx("PTOO", 1100, 380, 110, 0.15, t, 10.05, 0.6, "#b8f08a");
  }],
  // 7. neck crack, guard up, title slam
  [12.0, 14.0, (lt, t, a) => {
    if (lt < 1.2) {
      radialBG(760, 420, "#22143a", "#2f1d4d", t, 24, 0.1);
      camera(960, 540, 1, 0, pulse(lt, 0.35, 0.15) * 14 + pulse(lt, 0.75, 0.15) * 14, t);
      const neckJ = lt < 0.3 ? 0 : lt < 0.45 ? -0.35 : lt < 0.7 ? 0 : lt < 0.85 ? 0.3 : 0;
      const g = seg(lt, 0.9, 1.1, E.back);
      const pose = mixPose(HP.stand, HP.guard, g);
      drawHorse(Object.assign(pose, { x: 560, y: 1080, s: 2.1, t: a, neck: pose.neck + neckJ, eye: "glare", brow: 1, mouth: "smirk", wind: 0.5 }));
      screen();
      sfx("CRACK", 1300, 280, 120, -0.2, t, 12.35, 0.35, "#ffffff");
      sfx("CRACK", 1360, 560, 120, 0.15, t, 12.75, 0.35, "#ffffff");
    } else {
      // title slam
      const k = seg(lt, 1.2, 1.4, E.back);
      screen(); ctx.fillStyle = "#0b0714"; ctx.fillRect(0, 0, W, H);
      ctx.save(); ctx.translate(960, 540); ctx.scale(1 + (lt - 1.2) * 0.05, 1 + (lt - 1.2) * 0.05); ctx.translate(-960, -540);
      ctx.fillStyle = "#c2263f"; ctx.beginPath(); ctx.moveTo(0, 620); ctx.lineTo(W, 380); ctx.lineTo(W, 560); ctx.lineTo(0, 800); ctx.fill();
      ctx.globalAlpha = k;
      outlinedText("戦馬", 960, 390, `${Math.round(330 * (2 - k))}px 'Yuji Boku'`, "#ffffff", { lw: 18 });
      outlinedText("THE WARHORSE", 960, 640, "128px 'Dela Gothic One'", "#ffe14a", { lw: 20, outer: "#c2263f", outerW: 36 });
      outlinedText("OFF DUTY  ·  UNBOTHERED  ·  UNDEFEATED", 960, 790, "600 38px 'Alegreya Sans'", "#ffffff", { lw: 8, spacing: "6px" });
      ctx.globalAlpha = 1;
      ctx.restore();
      if (lt < 1.26) { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, W, H); }
    }
  }],
  // 8. VS card
  [14.0, 16.0, (lt, t, a) => {
    screen();
    const inL = seg(lt, 0, 0.25, E.back), inR = seg(lt, 0.05, 0.3, E.back);
    ctx.fillStyle = "#16295e"; ctx.fillRect(0, 0, W, H);
    speedStreaks(t, 1600, "rgba(120,170,255,0.35)", 50);
    ctx.save(); ctx.beginPath(); ctx.moveTo(1120, 0); ctx.lineTo(W, 0); ctx.lineTo(W, H); ctx.lineTo(800, H); ctx.clip();
    ctx.fillStyle = "#5a1648"; ctx.fillRect(0, 0, W, H); focusLines(1500, 520, t, 300, "rgba(255,150,210,0.35)", 90, 7);
    camera(960, 540, 1, 0, 0, t);
    drawDragon({ x: lerp(2600, 1560, inR), y: 640, s: 1.05, flip: -1, t: a, jaw: 0.55 + 0.1 * Math.sin(t * 20), head: 0.1, neckBase: -0.85, eye: "angry", wing: 0.7 });
    ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(1120, 0); ctx.lineTo(800, H); ctx.lineTo(0, H); ctx.clip();
    camera(960, 540, 1, 0, 0, t);
    drawHorse(Object.assign({}, HP.guard, { x: lerp(-700, 430, inL), y: 740, s: 1.45, t: a, mouth: "smirk", wind: 0.7 }));
    ctx.restore();
    screen();
    // lightning seam
    ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = 26; ctx.lineJoin = "miter";
    const zz = []; for (let i = 0; i <= 12; i++) { const k = i / 12; zz.push([lerp(1120, 800, k) + (i % 2 ? 28 : -28) * (0.6 + 0.4 * hash(i + Math.floor(t * 12))), k * H]); }
    ctx.beginPath(); zz.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke();
    ctx.strokeStyle = "#fff6c0"; ctx.lineWidth = 10; ctx.stroke(); ctx.restore();
    const vs = seg(lt, 0.3, 0.45, E.back);
    ctx.save(); ctx.translate(960, 520); ctx.scale(vs, vs); ctx.rotate(-0.08);
    outlinedText("VS", 0, 0, "300px 'Bangers'", "#ffe14a", { lw: 30, outer: "#ffffff", outerW: 56 });
    ctx.restore();
    ctx.globalAlpha = seg(lt, 0.4, 0.6);
    outlinedText("THE WARHORSE", 70, 960, "72px 'Dela Gothic One'", "#ffffff", { align: "left", lw: 12 });
    outlinedText("Hooves: 4  (2 for punching)", 74, 1030, "600 34px 'Alegreya Sans'", "#aecbff", { align: "left", lw: 7 });
    outlinedText("THE OPAL DRAGON", 1850, 120, "72px 'Dela Gothic One'", "#ffffff", { align: "right", lw: 12 });
    outlinedText("Breath: prismatic.  Ego: fragile.", 1846, 190, "600 34px 'Alegreya Sans'", "#ffc2e4", { align: "right", lw: 7 });
    ctx.globalAlpha = 1;
  }],
  // 9. prismatic breath, the lean-back
  [16.0, 20.0, (lt, t, a) => {
    const z = lerp(1, 1.22, seg(lt, 0.8, 2.8)) - 0.22 * seg(lt, 3.1, 3.6);
    const cam = { x: lerp(960, 820, seg(lt, 0.8, 2.8)), y: 560, z, t };
    pasture(cam, t, { scorch: lt > 1.2 ? Object.assign(new Number(seg(lt, 1.2, 2)), { x: 250 }) : 0 });
    worldCam(cam);
    const inhale = seg(lt, 0, 0.75), breathing = lt > 0.8 && lt < 3.0;
    const dpose = { x: 1450, y: GY - 175 * 0.9, s: 0.9, flip: -1, t: a, head: breathing ? 0.05 : lerp(0.3, -0.35, inhale), neckBase: -0.95, jaw: breathing ? 0.85 : inhale * 0.2, glow: breathing ? 0.6 : 0, eye: "angry", wing: 0.4 + 0.1 * Math.sin(t * 3) };
    drawDragon(dpose);
    // horse
    const lean = seg(lt, 0.8, 1.0, E.out) * (1 - seg(lt, 3.1, 3.45, E.back));
    const brush = lt > 3.55;
    let pose = mixPose(HP.guard, HP.limbo, lean);
    if (brush) pose = mixPose(HP.guard, HP.dust, seg(lt, 3.55, 3.7));
    const lookCam = lt > 1.9 && lt < 3.0;
    horseAt(560, pose, 1.0, { t: a, wind: breathing ? 1 : 0.3, eye: lean > 0.5 ? (lookCam ? "dot" : "half") : brush ? "half" : "glare", brow: lean > 0.5 ? -0.3 : 1, look: lookCam ? -0.3 : 0.4, mouth: brush ? "smirk" : "closed" });
    // the breath: a rainbow stream of inked flame blobs
    if (breathing || (lt > 3.0 && lt < 3.4)) {
      const m = dragonMouth(dpose);
      const blobs = [];
      for (let i = 0; i < 70; i++) {
        const age = ((lt - 0.8) * 1.0 + i / 70) % 1, born = lt - 0.8 - age;
        if (born < 0 || (lt > 3.0 && born > 2.2)) continue;
        const d = age * 1350, wob = Math.sin(i * 1.7 + t * 9) * 26 * age;
        const x = m.x - d, y = m.y + 10 + wob - age * 30 + Math.sin(age * 5) * 18;
        const r = 26 + age * 70 + 12 * Math.sin(t * 20 + i);
        blobs.push([x, y, r, i]);
      }
      const hues = ["#ffb3d6", "#b8f3e7", "#c6d3ff", "#fff1b0", "#e3c2ff"];
      ctx.lineWidth = 7; ctx.strokeStyle = INK;
      blobs.forEach((b) => { ctx.beginPath(); ctx.arc(b[0], b[1], b[2], 0, TAU); ctx.stroke(); });
      blobs.forEach((b) => { ctx.fillStyle = hues[b[3] % 5]; ctx.beginPath(); ctx.arc(b[0], b[1], b[2], 0, TAU); ctx.fill(); });
      blobs.forEach((b) => { ctx.fillStyle = "rgba(255,255,255,0.85)"; ctx.beginPath(); ctx.arc(b[0] + 6, b[1] - 4, b[2] * 0.45, 0, TAU); ctx.fill(); });
    }
    withLayer(1.25, cam, () => fgGrass(t));
    screen();
    if (lt > 0.1 && lt < 0.8) sfx("ヒュウウ…", 1500, 250, 90, 0.05, t, 16.1, 0.7, "#e7dcff", "'Dela Gothic One'");
    if (lt > 3.6) { const hp = [560, GY - 330]; sparkle(640, 520, 26 * pulse(lt, 3.65, 0.35), "#fff"); }
  }],
  // 10. the charge
  [20.0, 22.0, (lt, t, a) => {
    screen();
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#2b1f63"); g.addColorStop(1, "#7a3e8f"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    speedStreaks(t, 3200, "rgba(255,255,255,0.55)", 70);
    ctx.fillStyle = "#3d6b33"; ctx.fillRect(0, 860, W, 220);
    speedStreaks(t, 4200, "rgba(20,40,20,0.5)", 0);
    for (let i = 0; i < 20; i++) { const x = ((i * 140 - t * 2600) % (W + 200) + W + 200) % (W + 200) - 100; ctx.fillStyle = "#2c4f26"; ctx.fillRect(x, 900 + (i % 3) * 40, 90, 10); }
    camera(960, 540, 1, 0, 6, t);
    const rise = seg(lt, 1.45, 1.75, E.back);
    const ph = Math.floor(a * 12) % 2;
    const gal = ph ? HP.gallopA : HP.gallopB;
    const pose = mixPose(gal, HP.guard, rise);
    const bob = rise < 0.5 ? (ph ? -18 : 6) : 0;
    horseAt(820, pose, 1.2, { t: a, wind: 1, eye: "glare", brow: 1, dy: bob / 1.2 + (pose.dy || 0), mouth: rise > 0.5 ? "smirk" : "closed" });
    for (let k = 0; k < 4; k++) dust(820 - 180 - k * 60, GY + 6, t, 20 + k * 0.33 + Math.floor(lt * 3) * 0.33 - k * 0.33, 6, 160, 0.5, 30 + k);
    screen();
    sfx("ダダダダッ", 1400, 250, 120, -0.1, t, 20.15, 1.3, "#ffffff", "'Dela Gothic One'");
  }],
  // 11. jab, jab, uppercut
  [22.0, 25.0, (lt, t, a) => {
    const hitA = 0.5, hitB = 1.0, hitC = 2.0;
    const shake = pulse(lt, hitA, 0.15) * 12 + pulse(lt, hitB, 0.15) * 12 + pulse(lt, hitC, 0.4) * 40;
    const cam = { x: 1080, y: 560, z: 1.25, t, shake };
    pasture(cam, t);
    worldCam(cam);
    const knock = pulse(lt, hitA, 0.25) * 0.25 + pulse(lt, hitB, 0.25) * 0.3;
    const up = seg(lt, hitC, hitC + 0.15, E.out) * (1 - seg(lt, 2.7, 3.0));
    drawDragon({ x: 1560, y: GY - 175 * 0.95, s: 0.95, flip: -1, t: a, neckBase: -0.55 - up * 0.5, neckCurl: 0.2 - up * 0.2, head: 0.55 - knock - up * 1.4, jaw: up * 0.6, eye: up > 0.2 ? "x" : knock > 0.05 ? "shock" : "angry", wing: 0.3 + up * 0.5 });
    let pose;
    if (lt < 0.35) pose = HP.guard;
    else if (lt < 0.7) pose = mixPose(HP.guard, HP.jabL, seg(lt, 0.35, 0.45, E.out));
    else if (lt < 0.85) pose = mixPose(HP.jabL, HP.guard, seg(lt, 0.7, 0.85));
    else if (lt < 1.2) pose = mixPose(HP.guard, HP.jabR, seg(lt, 0.85, 0.95, E.out));
    else if (lt < 1.85) pose = mixPose(HP.jabR, HP.crouch, seg(lt, 1.2, 1.6));
    else if (lt < 2.6) pose = mixPose(HP.crouch, HP.upper, seg(lt, 1.85, 2.0, E.out));
    else pose = mixPose(HP.upper, HP.guard, seg(lt, 2.6, 2.9));
    horseAt(1050, pose, 1.0, { t: a, wind: 0.5, mouth: "smirk" });
    const snout = dragonHeadPt({ x: 1560, y: GY - 175 * 0.95, s: 0.95, flip: -1, t: a, neckBase: -0.55, neckCurl: 0.2, head: 0.55 }, 130, 0);
    if (lt > hitA && lt < hitA + 0.18) starburst(snout[0] + 20, snout[1], 90, 10, "#fff6c8", t);
    if (lt > hitB && lt < hitB + 0.18) starburst(snout[0] + 30, snout[1] + 10, 100, 11, "#fff6c8", t + 1);
    if (lt > hitC && lt < hitC + 0.25) starburst(snout[0], snout[1] - 60, 200, 14, "#ffe14a", 0.2);
    // tooth flying off
    if (lt > hitC) { const k = lt - hitC; const tx = snout[0] + k * 500, ty = snout[1] - 120 - k * 900 + k * k * 900; ctx.save(); ctx.translate(tx, ty); ctx.rotate(k * 14); ctx.fillStyle = "#fff"; ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-10, -14); ctx.lineTo(10, -14); ctx.lineTo(0, 18); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); sparkle(tx + 20, ty - 20, 20 * (0.5 + 0.5 * Math.sin(t * 30)), "#fff"); }
    withLayer(1.25, cam, () => fgGrass(t));
    screen();
    sfx("BAM!", 1250, 250, 120, -0.2, t, 22.5, 0.4, "#ffffff");
    sfx("BAM!", 1450, 380, 130, 0.15, t, 23.0, 0.4, "#ffffff");
    sfx("KA-POW!!", 1300, 200, 220, -0.12, t, 24.0, 0.95, "#ffe14a");
  }],
  // 12. tail sweep, backflip, superhero landing
  [25.0, 28.0, (lt, t, a) => {
    const land = 1.6;
    const shake = pulse(lt, land, 0.5) * 34;
    const z = lerp(0.95, 1.3, seg(lt, land, land + 0.25, E.out));
    const cam = { x: lerp(1000, 760, seg(lt, land, land + 0.25, E.out)), y: lerp(520, 600, seg(lt, land, land + 0.25)), z, t, shake };
    pasture(cam, t);
    worldCam(cam);
    // dragon turns around (anime squash-turn), sweeps its tail, turns back
    const turn1 = seg(lt, 0.2, 0.4), turn2 = seg(lt, 2.0, 2.2);
    const fl = turn2 > 0 ? lerp(1, -1, turn2) : lerp(-1, 1, turn1);
    const sweep = seg(lt, 0.45, 1.15, E.io);
    drawDragon({ x: 1500, y: GY - 175 * 0.95, s: 0.95, flip: Math.abs(fl) < 0.15 ? 0.15 * Math.sign(fl || 1) : fl, t: a, tailSweep: fl > 0 ? lerp(-0.9, 0.65, sweep) - (sweep >= 1 ? 0 : 0) : 0, tailCurl: fl > 0 ? -0.02 : 0.05, eye: "angry", head: 0.4 });
    // smear arc of the tail
    if (lt > 0.55 && lt < 1.2) { ctx.globalAlpha = 0.6 * (1 - seg(lt, 0.9, 1.2)); const pts = []; for (let i = 0; i <= 30; i++) { const k = i / 30, ang = Math.PI + lerp(-0.9, 0.6, k * sweep); pts.push([1500 + Math.cos(ang) * 560, GY - 170 + Math.sin(ang) * -160 + 60, 6 + 30 * Math.sin(k * Math.PI)]); } brushArc(pts, ["#b8a6e8", "#e8ddff", "#ffffff"]); ctx.globalAlpha = 1; }
    // horse: jump + backflip + landing
    const jump = lt > 0.6 && lt < land ? (lt - 0.6) / (land - 0.6) : -1;
    let pose, extra = { t: a, wind: 0.6 };
    if (jump < 0 && lt < land) pose = mixPose(HP.guard, HP.crouch, seg(lt, 0.3, 0.6));
    else if (jump >= 0) { pose = HP.tuck; extra.spin = -TAU * E.io(jump); extra.dy = -Math.sin(jump * Math.PI) * 360 - 60; extra.eye = "closed"; }
    else { pose = HP.hero; extra.eye = lt > 2.4 ? "glare" : "closed"; extra.mouth = lt > 2.4 ? "smirk" : "closed"; extra.glint = lt > 2.45 ? pulse(lt, 2.45, 0.5) : 0; }
    const hx = jump >= 0 ? lerp(700, 640, jump) : lt < land ? 700 : 640;
    horseAt(hx, pose, 1.0, extra);
    if (lt > land) {
      // ground cracks
      ctx.strokeStyle = INK; ctx.lineWidth = 6; const cx = 700;
      for (let i = 0; i < 7; i++) { const ang = Math.PI * (0.05 + i * 0.15); ctx.beginPath(); ctx.moveTo(cx, GY + 4); let x = cx, y = GY + 4; for (let j = 0; j < 4; j++) { x += Math.cos(ang) * 40 * (1 + hash(i + j)); y += Math.abs(Math.sin(ang)) * 12; ctx.lineTo(x + (hash(i * 3 + j) - 0.5) * 20, y); } ctx.stroke(); }
    }
    dust(690, GY + 4, t, 25 + land, 18, 420, 1.0, 44);
    withLayer(1.25, cam, () => fgGrass(t));
    screen();
    sfx("WHOOSH", 1000, 300, 110, -0.1, t, 25.6, 0.6, "#dff4ff");
    sfx("ズン", 560, 250, 170, -0.1, t, 25 + land, 0.8, "#ffe14a", "'Dela Gothic One'");
  }],
  // 13. dragon rage, menacing
  [28.0, 30.0, (lt, t, a) => {
    radialBG(1100, 700, "#2a0b24", "#4a1238", t, 26, -0.2);
    const cam = { x: 1000, y: 560, z: lerp(1.15, 0.95, seg(lt, 0, 2)), t, shake: 5 };
    worldCam(cam);
    ctx.fillStyle = "#1a0717"; ctx.fillRect(-500, 960, 3000, 600);
    drawDragon({ x: 1080, y: 760, s: 1.25, flip: -1, rot: 0.32, t: a, wing: 0.85 + 0.15 * Math.sin(t * 5), jaw: 0.35 + 0.1 * Math.sin(t * 14), head: 0.35, neckBase: -1.3, eye: "angry", glow: 0.4 });
    screen();
    for (let i = 0; i < 10; i++) {
      const side = i % 2 ? 1 : -1, x = side > 0 ? 1580 + (i % 3) * 70 : 200 + (i % 3) * 70, y = 180 + i * 80 + Math.sin(t * 4 + i) * 16;
      const s = 90 + 30 * Math.sin(t * 6 + i);
      ctx.globalAlpha = seg(lt, i * 0.08, i * 0.08 + 0.2);
      outlinedText("ゴ", x, y, `${s}px 'Dela Gothic One'`, "#b04dff", { lw: 12, outer: "#ffffff", outerW: 20 });
    }
    ctx.globalAlpha = 1;
  }],
  // 14. turn around, Hoof Breathing, First Form
  [30.0, 34.0, (lt, t, a) => {
    if (lt < 1.0) {
      const cam = { x: 1000, y: 560, z: 1.0, t };
      pasture(cam, t);
      worldCam(cam);
      drawDragon({ x: 1520, y: GY - 175 * 0.95, s: 0.95, flip: -1, t: a, eye: "angry", jaw: 0.2, head: 0.4 });
      const turn = seg(lt, 0.15, 0.35);
      const fl = lerp(1, -1, turn);
      const pose = mixPose(HP.guard, HP.coil, seg(lt, 0.3, 0.6));
      horseAt(1080, pose, 1.0, { t: a, flip: Math.abs(fl) < 0.15 ? 0.15 * Math.sign(fl || 1) : fl, glint: pulse(lt, 0.75, 0.3) * 1.3, look: 1, wind: 0.6 });
      withLayer(1.25, cam, () => fgGrass(t));
      screen();
      sfx("キラッ", 1180, 330, 80, 0.1, t, 30.75, 0.4, "#ffffff", "'Dela Gothic One'");
    } else if (lt < 3.4) {
      windSwirlBG(t);
      camera(960, 540, 1 + (lt - 1) * 0.04, 0, 0, t);
      horseAt(900, HP.coil, 1.75, { t: a, flip: -1, wind: 1, glint: 0.4 + 0.3 * Math.sin(t * 10), look: 1 });
      // Moving wind ribbons in front
      screen();
      ctx.globalAlpha = 0.7; for (let k = 0; k < 3; k++) { const pts = []; for (let i = 0; i <= 30; i++) { const ang = i * 0.22 + t * 3 + k * 2.1; pts.push([900 + Math.cos(ang) * (420 - i * 4), 800 + Math.sin(ang) * (90 - i), Math.max(2, 22 - i * 0.7)]); } brushArc(pts, ["#0a1233", "#6fc0ff", "#ffffff"]); } ctx.globalAlpha = 1;
      letterbox(seg(lt, 1.0, 1.2));
      ctx.globalAlpha = seg(lt, 1.05, 1.3);
      const kan = "蹄の呼吸"; let y = 250;
      for (const ch of kan) { outlinedText(ch, 1740, y, "150px 'Yuji Boku'", "#ffffff", { lw: 16 }); y += 160; }
      y = 330; for (const ch of "壱ノ型") { outlinedText(ch, 1560, y, "90px 'Yuji Boku'", "#9fd8ff", { lw: 12 }); y += 100; }
      outlinedText("HOOF BREATHING", 110, 830, "600 46px 'Alegreya Sans'", "#9fd8ff", { align: "left", lw: 9, spacing: "10px" });
      ctx.globalAlpha = 1;
      const slam = seg(lt, 2.2, 2.35, E.back);
      if (lt > 2.2) { ctx.save(); ctx.translate(110, 915); ctx.scale(slam, slam); outlinedText("FIRST FORM: DOUBLE BUCK", 0, 0, "92px 'Dela Gothic One'", "#ffffff", { align: "left", lw: 16, outer: "#1f6fd0", outerW: 30 }); ctx.restore(); }
      if (lt > 2.2 && lt < 2.26) { screen(); ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, W, H); }
    } else {
      // extreme close-up on the eye
      windSwirlBG(t * 2);
      const pose = Object.assign({}, HP.coil, { flip: -1, t: a, glint: 0.35 + 0.15 * Math.sin(t * 12), look: 1, wind: 1 });
      const hp = { x: 900, y: GY - HG * 1.75 + 30 * 1.75, s: 1.75 };
      const eye = horseHead(Object.assign({}, pose, hp), 26, -4);
      camera(eye[0], eye[1], lerp(2.4, 4.2, seg(lt, 3.4, 4.0, E.in)), 0, 8, t);
      drawHorse(Object.assign({}, pose, hp));
      focusLines(960, 540, t, 420, "rgba(255,255,255,0.85)", 170, 9);
      letterbox(1);
    }
  }],
  // 15. the kick, and the dragon is launched into orbit
  [34.0, 36.0, (lt, t, a) => {
    const impact = lt < 0.26;
    const cam = impact ? { x: 1180, y: 560, z: 1.25, t, shake: 30 } : { x: 1150, y: 480, z: 0.85, t, shake: pulse(lt, 0.26, 0.6) * 30 };
    pasture(cam, t);
    worldCam(cam);
    const fly = seg(lt, 0.26, 1.5, (k) => 1 - Math.pow(1 - k, 1.6));
    const dx = lerp(1480, 2150, fly), dy = lerp(GY - 170, -250, fly) + Math.sin(fly * Math.PI) * -150;
    if (lt < 1.55) drawDragon({ x: dx, y: dy, s: lerp(0.95, 0.06, fly), flip: -1, rot: lt > 0.26 ? (lt - 0.26) * 14 : 0, t: a, eye: "x", jaw: 0.8, legs: 1, wing: 0.9, head: -0.3 });
    horseAt(1160, HP.buck, 1.0, { t: a, flip: -1, wind: 1, eye: "glare", brow: 1 });
    const hoof = horseHoof(Object.assign({}, HP.buck, { x: 1160, y: GY - HG + (HP.buck.dy || 0), s: 1, flip: -1 }), "hr");
    if (lt > 0.26 && lt < 1.1) { const k = seg(lt, 0.26, 1.1, E.out); ctx.lineWidth = 16 * (1 - k); ctx.strokeStyle = "#fff6c8"; ctx.beginPath(); ctx.ellipse(hoof[0] + 40, hoof[1], 60 + k * 700, 40 + k * 500, 0, 0, TAU); ctx.stroke(); ctx.lineWidth = 8 * (1 - k); ctx.strokeStyle = "#b9a4ff"; ctx.beginPath(); ctx.ellipse(hoof[0] + 40, hoof[1], 30 + k * 450, 20 + k * 320, 0, 0, TAU); ctx.stroke(); }
    if (impact) starburst(hoof[0] + 60, hoof[1], 260, 16, "#fff2b0", 0.1);
    dust(1250, GY, t, 34.26, 18, 600, 1.2, 55);
    // motion trail to the sky
    if (lt > 0.3 && lt < 1.6) { ctx.globalAlpha = 0.5 * (1 - seg(lt, 1.2, 1.6)); const pts = []; for (let i = 0; i <= 20; i++) { const k = (i / 20) * fly; pts.push([lerp(1480, 2150, k), lerp(GY - 170, -250, k) + Math.sin(k * Math.PI) * -150, 4 + 30 * (i / 20)]); } brushArc(pts, ["#ffffff", "#ffe6f4", "#ffffff"]); ctx.globalAlpha = 1; }
    screen();
    if (lt > 0.3) sfx("ドカーーン!!", 960, 230, 200, -0.08, t, 34.3, 1.1, "#ffe14a", "'Dela Gothic One'");
    // twinkle
    if (lt > 1.55) { const k = lt - 1.55; sparkle(1690, 110, 60 * Math.max(0, Math.sin(Math.min(1, k * 2.2) * Math.PI)) + 8, "#ffffff", k * 3); }
  }],
  // 16. the flex
  [36.0, 39.0, (lt, t, a) => {
    sparkleBG(t);
    const pump = 0.8 + 0.2 * Math.abs(Math.sin(a * 5)) * (lt > 1.2 ? 1 : 0);
    camera(960, 540, lerp(1.25, 1.05, seg(lt, 0, 0.4, E.out)), 0, 0, t);
    drawHorseFront({ x: 960, y: 1010, s: 1.2, t: a, flex: seg(lt, 0, 0.3, E.back) * pump, eye: "sparkle", brow: -0.6 + 0.5 * Math.sin(Math.max(0, lt - 1.8) * 16) * (lt > 1.8 && lt < 2.4 ? 1 : 0) });
    screen();
    for (let i = 0; i < 6; i++) sparkle(960 + Math.cos(i + t * 2) * 520, 480 + Math.sin(i * 1.7 + t * 2) * 380, 30 * (0.5 + 0.5 * Math.sin(t * 7 + i)), "#fff", t);
    sfx("キラキラ", 1540, 200, 90, 0.12, t, 36.4, 2.4, "#ff7fb0", "'Dela Gothic One'");
  }],
  // 17. back to grazing (the butterfly returns)
  [39.0, 42.0, (lt, t, a) => {
    const cam = { x: 900, y: 540, z: 1, t };
    pasture(cam, t, { scorch: Object.assign(new Number(1), { x: 250 }) });
    worldCam(cam);
    const down = seg(lt, 0.2, 0.6, E.back);
    const graze = seg(lt, 0.8, 1.2);
    let pose = mixPose(HP.stand, HP.alert, down);
    pose = mixPose(pose, HP.graze, graze);
    const hp = horseAt(880, pose, 0.85, { t: a, jaw: graze > 0.5 ? 0.08 + 0.08 * Math.sin(a * 14) : 0, grass: graze > 0.5 ? 1 : 0, eye: "half", tail: 0.3 + 0.25 * Math.sin(a * 2.2) });
    dust(900, GY, t, 39.5, 8, 200, 0.6, 71);
    const nose = horseHead(hp, 110, -30);
    const bk = seg(lt, 1.2, 2.3, E.out);
    BUTTERFLY(lerp(1700, nose[0] + 6, bk), lerp(420, nose[1] - 20, bk) + Math.sin(t * 5) * 20 * (1 - bk), bk >= 1 ? t * 0.3 : t, 1);
    ctx.save(); screen(); sparkle(1690, 110, 10 + 6 * Math.sin(t * 6), "#fff", t); ctx.restore();
    withLayer(1.25, cam, () => fgGrass(t));
  }],
  // 18. the paladin arrives, too late. end card.
  [42.0, 46.5, (lt, t, a) => {
    const cam = { x: 900, y: 540, z: 1, t };
    pasture(cam, t, { scorch: Object.assign(new Number(1), { x: 250 }) });
    worldCam(cam);
    const run = seg(lt, 0, 1.3, E.lin);
    const px = lerp(-150, 520, E.out(run));
    const running = lt < 1.25;
    const hp = horseAt(880, HP.graze, 0.85, { t: a, jaw: 0.08 + 0.08 * Math.sin(a * 14), grass: 1, eye: "half", look: lt > 1.6 ? -1 : 0, tail: 0.3 + 0.25 * Math.sin(a * 2.2) });
    const nose = horseHead(hp, 110, -30);
    BUTTERFLY(nose[0] + 6, nose[1] - 20, t * 0.3, 1);
    drawPaladin({ x: px, y: GY - 70 * 2.3, s: 2.3, t: a, run: running ? 1 : 0, look: lt > 1.4 ? 1 : 0 });
    if (running) dust(px - 60, GY, t, 42 + Math.floor(lt * 4) / 4, 4, 90, 0.4, 90 + Math.floor(lt * 4));
    bubble("?", px + 90, GY - 420, t, 43.4, 3, 70);
    withLayer(1.25, cam, () => fgGrass(t));
    screen();
    if (lt > 0.1 && lt < 1.3) sfx("clank clank clank", px + 200, 560, 50, -0.05, t, 42.1, 1.2, "#e0e6f0", "'Bangers'");
    // end card
    const e = seg(lt, 2.2, 2.6, E.out);
    if (e > 0) {
      letterbox(e);
      ctx.globalAlpha = e;
      outlinedText("THE WARHORSE", 960, 470, "120px 'Dela Gothic One'", "#ffe14a", { lw: 18, outer: "#c2263f", outerW: 32 });
      outlinedText("vs.", 960, 580, "70px 'Bangers'", "#ffffff", { lw: 10 });
      outlinedText("THE OPAL DRAGON", 960, 690, "92px 'Dela Gothic One'", "#f4e8ff", { lw: 16, outer: "#7a4cc8", outerW: 28 });
      ctx.save(); ctx.translate(1590, 280); ctx.rotate(-0.08); ctx.fillStyle = "#c2263f"; ctx.fillRect(-70, -70, 140, 140); outlinedText("戦馬", 0, 4, "84px 'Yuji Boku'", "#fff", { lw: 0.1, stroke: "#c2263f" }); ctx.restore();
      ctx.globalAlpha = 1;
    }
    const fade = seg(lt, 4.0, 4.5);
    if (fade > 0) { screen(); ctx.fillStyle = `rgba(0,0,0,${fade})`; ctx.fillRect(0, 0, W, H); }
  }],
];
const DURATION = 46.5;
// impact frames: [start, end, mode]
const IMPACTS = [[24.0, 24.09, "invert"], [24.09, 24.17, "mono"], [34.0, 34.13, "invert"], [34.13, 34.26, "mono"]];

// ------------------------------------------------------------
const buf = document.createElement("canvas"); buf.width = W; buf.height = H; const bctx = buf.getContext("2d");
function render(t) {
  screen(); ctx.clearRect(0, 0, W, H);
  const shot = SHOTS.find((s) => t >= s[0] && t < s[1]) || SHOTS[SHOTS.length - 1];
  const lt = t - shot[0];
  ctx.save(); shot[2](lt, t, on2(lt)); ctx.restore();
  screen();
  const imp = IMPACTS.find((i) => t >= i[0] && t < i[1]);
  if (imp) {
    bctx.clearRect(0, 0, W, H); bctx.drawImage(cv, 0, 0);
    ctx.filter = imp[2] === "invert" ? "invert(1) grayscale(1) contrast(2.2)" : "grayscale(1) contrast(6) brightness(1.3)";
    ctx.drawImage(buf, 0, 0); ctx.filter = "none";
    if (imp[2] === "mono") { ctx.globalCompositeOperation = "multiply"; ctx.fillStyle = "#ff3355"; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = "source-over"; }
  }
  // gentle vignette
  const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, H * 1.05);
  v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(10,0,20,0.35)");
  ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
}
window.__render = render;
window.__duration = DURATION;
