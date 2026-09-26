"""Original score + sound design for 'The Warhorse vs. the Opal Dragon'.
Everything is synthesized here (no samples). Writes warhorse-audio.wav (48 kHz stereo)."""
import numpy as np
from scipy.signal import butter, lfilter, fftconvolve
from scipy.io import wavfile

SR = 48000
DUR = 46.5
N = int(SR * DUR)
rng = np.random.default_rng(7)

# ---------------------------------------------------------------- buses
bus = {k: np.zeros((N, 2)) for k in ("music", "sfx", "dry")}

def put(sig, t, gain=1.0, pan=0.0, b="music"):
    """mix a mono signal into a bus at time t (seconds), equal-power pan."""
    i = int(t * SR)
    if i >= N or len(sig) == 0:
        return
    sig = sig[: N - i] * gain
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    bus[b][i:i + len(sig), 0] += sig * l
    bus[b][i:i + len(sig), 1] += sig * r

def addp(*xs):
    n = max(len(x) for x in xs); out = np.zeros(n)
    for x in xs:
        out[: len(x)] += x
    return out

def tt(d):
    return np.arange(int(d * SR)) / SR

def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)

def lp(x, f, o=2):
    b, a = butter(o, min(f, SR * 0.45) / (SR / 2), "low"); return lfilter(b, a, x)

def hp(x, f, o=2):
    b, a = butter(o, f / (SR / 2), "high"); return lfilter(b, a, x)

def bp(x, lo, hi, o=2):
    b, a = butter(o, [lo / (SR / 2), min(hi, SR * 0.45) / (SR / 2)], "band"); return lfilter(b, a, x)

def env(d, a=0.005, r=None, curve=4.0):
    t = tt(d)
    e = np.minimum(1, t / max(a, 1e-4))
    if r is None:
        r = d
    return e * np.exp(-curve * t / r)

def adsr(d, a, dcy, s, r):
    n = int(d * SR); t = np.arange(n) / SR
    e = np.where(t < a, t / a, np.where(t < a + dcy, 1 - (1 - s) * (t - a) / dcy, s))
    rn = int(r * SR)
    if rn > 0 and rn < n:
        e[-rn:] *= np.linspace(1, 0, rn)
    return e

def saw(f, d, detune=0.0):
    t = tt(d); ph = (f * (1 + detune)) * t
    return 2 * (ph - np.floor(ph + 0.5))

def noise(d):
    return rng.standard_normal(int(d * SR))

# ---------------------------------------------------------------- instruments
def pluck(m, d=1.6, bright=0.5, decay=0.996):
    """Karplus-Strong string: koto / shamisen"""
    f = mtof(m); p = int(SR / f)
    buf = rng.uniform(-1, 1, p) * 1.0
    buf = lp(buf, 2000 + 8000 * bright)
    n = int(d * SR); out = np.zeros(n)
    y = np.concatenate([buf, np.zeros(n)])
    for i in range(p, n + p):
        y[i] = decay * 0.5 * (y[i - p] + y[i - p + 1 if i - p + 1 < i else i - p])
    out = y[p:p + n]
    return out * env(d, 0.001, d, 2.5)

def shamisen(m, d=0.5):
    s = pluck(m, d, bright=0.95, decay=0.992)
    buzz = np.tanh(s * 3) * 0.3  # the sawari buzz
    return (s + buzz) * 0.8

def flute(m, d, breath=0.15, vib=0.012, bend=0.0):
    t = tt(d); f = mtof(m) * (1 + bend * np.minimum(1, t / 0.25) - bend)
    vibr = 1 + vib * np.sin(2 * np.pi * 5.2 * t) * np.minimum(1, t / 0.35)
    ph = np.cumsum(f * vibr) / SR
    s = np.sin(2 * np.pi * ph) + 0.18 * np.sin(4 * np.pi * ph) + 0.06 * np.sin(6 * np.pi * ph)
    br = bp(noise(d), mtof(m) * 0.8, mtof(m) * 4) * breath
    return (s + br) * adsr(d, 0.07, 0.1, 0.8, min(0.15, d * 0.4))

def pad(ms, d, cutoff=1800, a=0.6):
    s = sum(saw(mtof(m), d, det) for m in ms for det in (-0.004, 0.0, 0.005)) / (3 * len(ms))
    return lp(s, cutoff) * adsr(d, a, 0.3, 0.85, min(0.8, d * 0.4))

def brass(ms, d, a=0.03):
    t = tt(d)
    s = sum(saw(mtof(m), d, det) for m in ms for det in (-0.003, 0.003)) / (2 * len(ms))
    # filter sweep: bright attack mellowing
    cut = 800 + 3500 * np.exp(-t * 5)
    out = np.zeros_like(s); y = 0.0
    alpha = 1 - np.exp(-2 * np.pi * cut / SR)
    for i in range(len(s)):
        y += alpha[i] * (s[i] - y); out[i] = y
    return out * adsr(d, a, 0.15, 0.7, min(0.3, d * 0.3))

def taiko(d=0.9, f0=170, f1=55, big=1.0):
    t = tt(d); f = f1 + (f0 - f1) * np.exp(-t * 18)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * (5 / big))
    skin = lp(noise(d), 1200) * np.exp(-t * 40) * 0.5
    return np.tanh((body + skin) * 1.6)

def ka(d=0.08):
    return bp(noise(d), 1800, 5000) * np.exp(-tt(d) * 60)

def shaker(d=0.06):
    return hp(noise(d), 6000) * np.exp(-tt(d) * 70) * 0.5

def crash(d=2.2):
    return lp(hp(noise(d), 5000), 12000) * env(d, 0.002, d, 5.5) * 0.4

def gong(d=4.0, f=90):
    t = tt(d)
    parts = [(1, 1), (2.02, 0.5), (2.76, 0.4), (3.9, 0.25), (5.4, 0.15)]
    s = sum(a * np.sin(2 * np.pi * f * r * t + 0.3 * np.sin(2 * np.pi * 0.7 * t)) for r, a in parts)
    return s * env(d, 0.01, d, 2.5) * 0.4

def orch_hit(root=50, d=1.2, minor=True):
    ms = [root - 12, root, root + (3 if minor else 4), root + 7, root + 12, root + 15 if minor else root + 16, root + 19]
    s = brass(ms, d, 0.005) * 1.4 + pad(ms, d, 5000, 0.005) * 0.8
    return s * np.exp(-tt(d) * 2.2) + taiko(d, 150, 45, 1.5) * 0.7

def sub_drop(d=1.6, f0=120, f1=32):
    t = tt(d); f = f1 + (f0 - f1) * np.exp(-t * 4)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(d, 0.005, d, 3)

def riser(d, f0=300, f1=4000):
    t = tt(d); k = t / d
    n = noise(d); out = np.zeros_like(n)
    for seg in range(20):
        a, b = int(seg * len(n) / 20), int((seg + 1) * len(n) / 20)
        fc = f0 * (f1 / f0) ** (seg / 20)
        out[a:b] = bp(n, fc * 0.7, fc * 1.4)[a:b]
    tone = saw(1, d) * 0
    ph = np.cumsum(110 * 2 ** (3 * k)) / SR
    tone = np.sin(2 * np.pi * ph) * 0.3
    return (out * 0.7 + tone) * k ** 2

def whoosh(d=0.5, lo=300, hi=3000):
    t = tt(d); k = t / d
    n = noise(d); out = np.zeros_like(n)
    for seg in range(10):
        a, b = int(seg * len(n) / 10), int((seg + 1) * len(n) / 10)
        fc = lo + (hi - lo) * np.sin(np.pi * (seg + 0.5) / 10)
        out[a:b] = bp(n, fc * 0.6, fc * 1.6)[a:b]
    return out * np.sin(np.pi * k) ** 2

def punch(d=0.35):
    t = tt(d)
    thump = np.sin(2 * np.pi * np.cumsum(60 + 120 * np.exp(-t * 30)) / SR) * np.exp(-t * 12)
    smack = bp(noise(d), 900, 3500) * np.exp(-t * 45)
    return np.tanh(thump * 1.4 + smack * 0.9)

def crack():
    out = np.zeros(int(0.2 * SR))
    for k, off in enumerate([0, 0.018, 0.041, 0.06]):
        c = bp(noise(0.012), 1800, 6000) * np.exp(-tt(0.012) * 300) * (1 - k * 0.15)
        i = int(off * SR); out[i:i + len(c)] += c
    return out * 1.6

def ding(f=1800, d=1.4):
    t = tt(d)
    s = sum(a * np.sin(2 * np.pi * f * r * t) for r, a in [(1, 1), (2.76, 0.35), (5.4, 0.15)])
    return s * env(d, 0.002, d, 4)

def twinkle(d=1.5):
    out = np.zeros(int(d * SR))
    for k, f in enumerate([2349, 2960, 3520, 4699]):
        s = ding(f, 1.0) * 0.4; i = int(k * 0.07 * SR); out[i:i + len(s)] += s[: len(out) - i]
    return out

def slide_whistle(d, f0, f1):
    t = tt(d); f = f0 * (f1 / f0) ** (t / d)
    s = np.sin(2 * np.pi * np.cumsum(f * (1 + 0.01 * np.sin(2 * np.pi * 6 * t))) / SR)
    return (s + bp(noise(d), 800, 3000) * 0.05) * adsr(d, 0.03, 0.05, 0.9, 0.05)

def record_scratch(d=0.35):
    t = tt(d)
    rate = 1 + 0.9 * np.sin(2 * np.pi * 9 * t)
    ph = np.cumsum(300 * np.abs(rate)) / SR
    tone = np.sign(np.sin(2 * np.pi * ph)) * 0.2
    n = bp(noise(d), 700, 3500) * (0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 9 * t)))
    return (tone + n) * env(d, 0.005, d, 2)

def roar(d=1.5, f0=75):
    t = tt(d); k = t / d
    jitter = 1 + 0.08 * lp(noise(d), 30) + 0.15 * np.sin(2 * np.pi * 3 * t)
    f = f0 * (1 + 0.4 * np.sin(np.pi * k)) * jitter
    s = saw(1, d) * 0
    ph = np.cumsum(f) / SR; s = 2 * (ph - np.floor(ph + 0.5))
    growl = np.tanh(s * 3)
    breath = lp(noise(d), 2500) * 0.6
    body = bp(growl + breath, 200, 1400) + bp(growl, 600, 2600) * 0.5
    return np.tanh(body * 2.5) * adsr(d, 0.12, 0.3, 0.8, 0.4)

def fire_breath(d):
    t = tt(d)
    base = lp(noise(d), 1400) * 0.8 + bp(noise(d), 1500, 5000) * 0.25
    crackle = np.zeros(len(t))
    for _ in range(int(d * 40)):
        i = rng.integers(0, len(t) - 200); crackle[i:i + 200] += rng.uniform(0.3, 1) * np.exp(-np.arange(200) / 30) * rng.choice([-1, 1])
    shimmer = sum(np.sin(2 * np.pi * f * t) * 0.03 for f in (1567, 1975, 2349, 3136))  # 'prismatic' glassy tones
    return (base + crackle * 0.4 + shimmer) * adsr(d, 0.08, 0.2, 0.85, 0.3)

def crunch():
    out = np.zeros(int(0.18 * SR))
    for k in range(5):
        g = bp(noise(0.015), 1200, 4500) * np.exp(-tt(0.015) * 200) * rng.uniform(0.4, 1)
        i = int((k * 0.028 + rng.uniform(0, 0.01)) * SR); out[i:i + len(g)] += g
    return out

def clop():
    return addp((np.sin(2 * np.pi * 720 * tt(0.07)) + 0.6 * np.sin(2 * np.pi * 1180 * tt(0.07))) * np.exp(-tt(0.07) * 60) * 0.6, taiko(0.15, 140, 80) * 0.3)

def clank():
    t = tt(0.35)
    s = sum(a * np.sin(2 * np.pi * f * t) for f, a in [(1310, 1), (1940, 0.7), (2710, 0.5), (3900, 0.3)])
    return addp(s * np.exp(-t * 18) * 0.35, taiko(0.12, 160, 90) * 0.25)

def pop(f0=300, f1=900, d=0.12):
    t = tt(d); f = f0 * (f1 / f0) ** (t / d)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(d, 0.002, d, 3)

def boing(d=0.5):
    t = tt(d); f = 180 * (1 + 0.5 * np.sin(2 * np.pi * 14 * t) * np.exp(-t * 5)) * (1 + t)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(d, 0.003, d, 3)

def chirp(t0):
    # a small bird: three quick FM chirps
    for k in range(3):
        d = 0.07; t = tt(d); f = 3200 + 1800 * np.sin(np.pi * t / d) + 400 * np.sin(2 * np.pi * 60 * t)
        s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d)
        put(s, t0 + k * 0.1, 0.08, 0.5, "sfx")

def wind(d):
    n = noise(d); t = tt(d)
    out = np.zeros_like(n)
    for seg in range(16):
        a, b = int(seg * len(n) / 16), int((seg + 1) * len(n) / 16)
        fc = 500 + 400 * np.sin(seg * 0.9)
        out[a:b] = bp(n, fc * 0.6, fc * 1.8)[a:b]
    return out * (0.6 + 0.4 * np.sin(2 * np.pi * 0.7 * t)) * adsr(d, 0.4, 0.2, 0.9, 0.4)

# ---------------------------------------------------------------- score
YO = [62, 64, 67, 69, 71]      # D E G A B  (pastoral)

# 1. pastoral opening (0 - 4.35)
for t0, m, d in [(0.25, 74, 0.6), (0.9, 76, 0.3), (1.2, 79, 0.55), (1.8, 81, 0.4), (2.2, 83, 0.3), (2.5, 81, 0.65), (3.2, 79, 0.4), (3.6, 76, 0.75)]:
    put(flute(m, d), t0, 0.32, 0.1)
for k in range(9):
    for j, m in enumerate([50, 57, 62, 64, 67, 69]):
        if k * 0.5 + j * 0.08 < 4.3:
            put(pluck(m, 1.2, 0.4), k * 0.5 + j * 0.08, 0.14, -0.3 + j * 0.1)
put(pad([50, 57, 62, 66], 4.3, 1200, 0.8), 0, 0.16)
for c in (0.4, 1.3, 2.4, 3.3):
    chirp(c)
for c in (0.6, 1.1, 1.7, 2.3, 2.9, 3.5):
    put(crunch(), c, 0.18, 0.2, "sfx")

# 2. record scratch, silence, the landing
put(record_scratch(0.35), 4.3, 0.5, 0, "sfx")
put(pop(900, 300, 0.2), 4.05, 0.25, 0.2, "sfx")  # the "!" reaction
put(whoosh(0.5, 200, 1500), 4.45, 0.4, 0.4, "sfx")
put(sub_drop(1.8), 4.9, 1.0, 0, "sfx")
put(taiko(1.4, 140, 40, 2.0), 4.9, 0.9, 0, "sfx")
put(crash(2.0), 4.9, 0.35, 0.3, "sfx")
put(lp(noise(1.5), 300) * env(1.5, 0.01, 1.5, 3), 4.92, 0.6, 0, "sfx")  # rumble

# 3. tension / the deadpan stare (5 - 8)
put(pad([38, 45, 50], 3.1, 500, 0.3), 5.0, 0.18)
for hb in (5.6, 6.6, 7.6):
    put(taiko(0.4, 90, 45), hb, 0.35); put(taiko(0.4, 90, 45), hb + 0.22, 0.22)
for c in (6.3, 6.6, 6.95, 7.25):
    put(crunch(), c, 0.3, 0.1, "sfx")
for c in (6.55, 6.85, 7.15):
    put(pop(600, 700, 0.06), c, 0.12, 0.3, "sfx")

# 4. the roar (8 - 10)
put(orch_hit(50, 1.4), 8.25, 0.55)
put(roar(1.6, 70), 8.25, 0.9, 0.2, "sfx")
put(roar(1.4, 105), 8.3, 0.35, -0.2, "sfx")
for k in range(12):
    put(taiko(0.3, 180, 70), 8.4 + k * 0.1, 0.15 + k * 0.02)

# 5. spit, stand up, the rise (10 - 12)
put(pop(500, 200, 0.12), 10.05, 0.5, 0.3, "sfx")
put(whoosh(0.35, 800, 3000), 10.08, 0.25, 0.5, "sfx")
put(riser(1.2, 200, 3000), 10.2, 0.35)
for k in range(16):
    put(taiko(0.25, 160, 60), 10.3 + k * 0.06, 0.08 + k * 0.03)
put(clop(), 10.5, 0.5, -0.1, "sfx"); put(clop(), 10.68, 0.4, 0.1, "sfx")
put(brass([62, 66, 69, 74], 0.9), 11.35, 0.45)
put(gong(3.0, 110), 11.35, 0.5)

# 6. neck cracks, title slam (12 - 14)
put(pad([50, 57, 62], 1.2, 700, 0.1), 12.0, 0.15)
put(crack(), 12.35, 0.9, -0.2, "sfx"); put(crack(), 12.75, 0.9, 0.2, "sfx")
put(whoosh(0.3, 600, 2500), 12.88, 0.35, 0, "sfx")
put(orch_hit(50, 1.6), 13.2, 0.75)
put(crash(2.5), 13.2, 0.45, 0.2)
put(gong(3.5, 80), 13.2, 0.5)
for k, m in enumerate([74, 77, 79, 81, 84, 86]):
    put(shamisen(m, 0.3), 13.25 + k * 0.05, 0.25, 0.3)

# 7. battle theme (14 - 28), 120 bpm, 8th = 0.25 s
BAR = 2.0
chords = {0: 50, 1: 46, 2: 48, 3: 50}      # Dm Bb C Dm (roots)
riff = [62, 65, 67, 69, 72, 69, 67, 65, 67, 69, 70, 69, 67, 65, 62, None]
bass_pat = [0, 0, 12, 0, 10, 0, 7, 10]
def battle_bar(t0, bi, full=True, half=False, riff_on=True):
    root = chords[bi % 4]
    third = 3 if root in (50,) else 4
    put(pad([root, root + 7, root + 12, root + 12 + third], BAR, 1500, 0.15), t0, 0.10)
    for e in range(8):
        tb = t0 + e * 0.25
        if half and e % 2:
            continue
        put(pluck(root - 12 + bass_pat[e], 0.35, 0.3, 0.99) * 1.2, tb, 0.28 if full else 0.18, 0)
    big = [0, 3, 4, 6] if not half else [0, 4]
    for e in big:
        put(taiko(0.6, 170, 55), t0 + e * 0.25, 0.42, -0.1 + 0.05 * e)
    if full:
        for e in (2, 5, 7):
            put(ka(), t0 + e * 0.25, 0.25, 0.4)
        for s16 in range(16):
            put(shaker(), t0 + s16 * 0.125, 0.12 if s16 % 2 else 0.2, -0.4)
    if riff_on:
        for e in range(8):
            m = riff[(bi % 2) * 8 + e]
            if m is not None:
                put(shamisen(m, 0.28), t0 + e * 0.25, 0.26, 0.25)

# VS (14-16)
put(whoosh(0.4, 300, 2000), 13.85, 0.4, -0.6, "sfx"); put(whoosh(0.4, 300, 2000), 13.95, 0.4, 0.6, "sfx")
battle_bar(14.0, 0)
put(orch_hit(50, 0.9), 14.3, 0.5)
put(crack(), 14.3, 0.4, 0, "sfx")
# breath (16-20): inhale, the blast, slow-motion lean
put(riser(0.8, 200, 2500), 16.0, 0.35, 0.5, "sfx")
put(fire_breath(2.3), 16.8, 0.55, 0.3, "sfx")
put(whoosh(1.0, 150, 900), 16.85, 0.35, -0.3, "sfx")
battle_bar(16.0, 1, full=False, half=True, riff_on=False)
battle_bar(18.0, 2, full=False, half=True, riff_on=False)
put(flute(81, 1.2, 0.3, 0.02), 17.4, 0.14, -0.2)  # a cheeky 'unbothered' flute note while he limbos
put(boing(0.4), 19.15, 0.25, 0, "sfx")
put(whoosh(0.2, 1500, 4000), 19.6, 0.25, 0.2, "sfx"); put(ding(2600, 0.8), 19.68, 0.2, 0.3, "sfx")
# gallop (20-22)
battle_bar(20.0, 3)
for k in range(11):
    for off in (0, 0.07, 0.14):
        put(clop(), 20.05 + k * 0.28 + off, 0.35, -0.2 + 0.2 * (k % 2), "sfx")
put(riser(0.5, 400, 3000), 21.4, 0.25)
# jabs + uppercut (22-25)
battle_bar(22.0, 0)
battle_bar(24.0, 1, full=True)
put(punch(), 22.5, 0.9, 0.2, "sfx"); put(punch(), 23.0, 0.9, 0.25, "sfx")
put(whoosh(0.25, 500, 2500), 23.8, 0.3, 0, "sfx")
put(orch_hit(50, 1.3), 24.0, 0.75)
put(punch(0.5), 24.0, 1.0, 0.2, "sfx"); put(sub_drop(1.0, 100, 40), 24.0, 0.7, 0, "sfx"); put(crash(1.8), 24.0, 0.4, 0.3)
put(ding(3400, 0.6), 24.2, 0.22, 0.5, "sfx"); put(ding(3000, 0.6), 24.55, 0.15, 0.6, "sfx")
# tail whip, backflip, landing (25-28)
put(whoosh(0.7, 150, 1200), 25.45, 0.6, 0.4, "sfx")
put(slide_whistle(0.5, 500, 1600), 25.6, 0.3, 0, "sfx"); put(slide_whistle(0.5, 1600, 450), 26.1, 0.3, 0, "sfx")
put(taiko(1.2, 130, 40, 2), 26.6, 1.0, 0, "sfx"); put(sub_drop(1.2, 90, 35), 26.6, 0.7, 0, "sfx"); put(crash(1.5), 26.6, 0.3, -0.2)
battle_bar(26.0, 2, full=False, half=True)
put(ding(3600, 0.9), 27.45, 0.3, -0.2, "sfx")

# 8. rage, menacing (28 - 30)
t = tt(2.0)
trem = pad([38, 39, 45, 50, 51], 2.0, 900, 0.2) * (0.6 + 0.4 * np.sin(2 * np.pi * 12 * t))
put(trem, 28.0, 0.35)
put(brass([26, 33, 38], 2.0, 0.4), 28.0, 0.35)
put(roar(1.8, 55), 28.1, 0.6, 0.3, "sfx")
for k in range(4):
    put(taiko(0.9, 120, 40, 1.4), 28.0 + k * 0.5, 0.6)

# 9. the turn + Hoof Breathing (30 - 34)
put(taiko(1.2, 110, 40, 2), 30.0, 0.5)
put(whoosh(0.3, 400, 2000), 30.2, 0.3, 0, "sfx")
put(ding(3200, 1.2), 30.75, 0.35, 0.3, "sfx")
put(wind(3.0), 31.0, 0.35, 0, "sfx")
put(flute(69, 0.8, 0.45, 0.02, bend=-0.06), 31.1, 0.28, -0.1)   # shakuhachi-style bend up
put(flute(74, 0.6, 0.45, 0.02), 32.0, 0.25, -0.1)
put(flute(72, 0.7, 0.5, 0.025, bend=0.03), 32.65, 0.22, -0.1)
for hb in (31.5, 32.5, 33.0, 33.25):
    put(taiko(0.5, 100, 45), hb, 0.45)
put(orch_hit(50, 0.8), 32.2, 0.45); put(gong(2.0, 140), 32.2, 0.3)
put(riser(0.6, 300, 6000), 33.4, 0.55)

# 10. THE KICK (34 - 36)
put(orch_hit(50, 2.2), 34.0, 0.95)
put(punch(0.6), 34.0, 1.0, 0, "sfx"); put(sub_drop(2.2, 110, 28), 34.0, 1.0, 0, "sfx")
put(taiko(1.8, 150, 35, 3), 34.0, 1.0, 0, "sfx"); put(crash(3.0), 34.0, 0.55, 0)
put(lp(noise(2.0), 500) * env(2.0, 0.01, 2.0, 2.5), 34.3, 0.7, 0, "sfx")    # explosion rumble
put(whoosh(1.2, 300, 5000), 34.3, 0.5, 0.6, "sfx")
put(twinkle(1.5), 35.6, 0.45, 0.6, "sfx")

# 11. the flex fanfare (36 - 39)
for t0, ms in [(36.0, [62, 66, 69, 74]), (36.75, [67, 71, 74, 79]), (37.5, [69, 73, 76, 81]), (38.25, [74, 78, 81, 86])]:
    put(brass(ms, 0.75 if t0 < 38 else 0.75, 0.02), t0, 0.35)
    put(taiko(0.5, 170, 60), t0, 0.35)
for k in range(24):
    put(ding(mtof(86 + [0, 4, 7, 12, 16][k % 5]), 0.6) * 0.5, 36.1 + k * 0.12, 0.12, rng.uniform(-0.7, 0.7), "sfx")
put(crash(1.2), 36.0, 0.25)

# 12. back to grazing (39 - 42)
put(taiko(0.4, 110, 50), 39.45, 0.4, 0, "sfx")
for t0, m, d in [(39.8, 74, 0.6), (40.45, 76, 0.3), (40.75, 79, 0.55), (41.35, 76, 0.6)]:
    put(flute(m, d), t0, 0.3, 0.1)
for k in range(5):
    for j, m in enumerate([50, 57, 62, 64, 67]):
        put(pluck(m, 1.0, 0.4), 39.6 + k * 0.5 + j * 0.08, 0.13, -0.3 + j * 0.1)
for c in (40.2, 40.8, 41.5, 42.2, 42.8, 43.6, 44.2):
    put(crunch(), c, 0.18, 0.2, "sfx")
chirp(40.6)

# 13. the paladin arrives, too late (42 - 46.5)
for k in range(8):
    put(clank(), 42.1 + k * 0.16, 0.45, -0.5 + k * 0.08, "sfx")
put(pop(400, 1200, 0.15), 43.4, 0.3, -0.1, "sfx")
put(flute(71, 0.5, 0.2), 43.6, 0.15, 0.2)   # a quizzical note
put(taiko(1.4, 130, 45, 2), 44.2, 0.8); put(gong(3.5, 90), 44.2, 0.45)
for j, m in enumerate([50, 57, 62, 66, 69, 74]):
    put(pluck(m, 2.2, 0.5), 44.2 + j * 0.06, 0.16, -0.3 + j * 0.12)
put(flute(74, 1.8), 44.3, 0.2, 0.1)
put(pad([50, 57, 62, 66], 2.3, 1500, 0.2), 44.2, 0.15)

# ---------------------------------------------------------------- mix
def reverb_ir(sec=2.2, seed=1):
    r = np.random.default_rng(seed)
    n = int(sec * SR); t = np.arange(n) / SR
    ir = r.standard_normal((n, 2)) * np.exp(-t * 3.2)[:, None]
    ir[:, 0] = lp(ir[:, 0], 4500); ir[:, 1] = lp(ir[:, 1], 4500)
    return ir / np.sqrt((ir ** 2).sum(axis=0))

ir = reverb_ir()
def verb(x, send):
    w = np.zeros_like(x)
    for c in range(2):
        w[:, c] = fftconvolve(x[:, c], ir[:, c])[: len(x)]
    return x + w * send

music = verb(bus["music"], 0.35)
sfx = verb(bus["sfx"], 0.18)
mix = music * 0.9 + sfx * 1.0 + bus["dry"]
# tail fade
fade = np.ones(N); fade[int(45.6 * SR):] = np.linspace(1, 0, N - int(45.6 * SR)); mix *= fade[:, None]
mix = hp(mix.T, 25).T
peak = np.abs(mix).max()
mix = np.tanh(mix / peak * 1.4) / np.tanh(1.4) * 0.93
wavfile.write("warhorse-audio.wav", SR, (mix * 32767).astype(np.int16))
print("wrote warhorse-audio.wav", mix.shape, "peak", peak)
