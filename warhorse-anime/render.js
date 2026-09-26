const { chromium } = require('playwright');
const { spawn } = require('child_process');
(async () => {
  const out = process.argv[2] || 'warhorse-anime.mp4';
  const FPS = 24;
  const ff = spawn(process.env.FF, ['-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-i', 'warhorse-audio.wav', '-c:v', 'libx264', '-preset', 'slow', '-crf', '19', '-pix_fmt', 'yuv420p', '-tune', 'animation',
    '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const b = await chromium.launch({ args: ['--ignore-certificate-errors'] });
  const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 }, ignoreHTTPSErrors: true });
  const p = await ctx.newPage();
  p.on('pageerror', e => console.log('PAGEERR', e.message));
  await p.goto('http://localhost:8766/anime.html');
  await p.waitForFunction(() => window.__render);
  await p.evaluate(async () => { await document.fonts.ready; for (const f of ["80px Bangers", "80px 'Dela Gothic One'", "80px 'Yuji Boku'", "italic 600 40px 'Alegreya Sans'", "600 40px 'Alegreya Sans'"]) await document.fonts.load(f, "ドォンゴ戦馬蹄の呼吸壱ノ型キラッダズヒュウカーABCabc"); });
  const dur = await p.evaluate(() => window.__duration);
  const n = Math.round(dur * FPS);
  for (let i = 0; i < n; i++) {
    await p.evaluate((t) => window.__render(t), i / FPS);
    const buf = await p.screenshot({ type: 'jpeg', quality: 93 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 240 === 0) console.log('frame', i, '/', n);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await b.close();
  console.log('DONE', out, n);
})().catch(e => { console.log('FAILED', e.message); process.exit(1); });
