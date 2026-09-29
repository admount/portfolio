"""Generates the five SVG paintings in the series "Being an AI".

Run: python3 generate.py   (writes 01-...svg through 05-...svg next to this file)
"""
import math
import os
import random

W, H = 1600, 1000
INK = "#0f1322"
INK2 = "#1b2238"
PAPER = "#efe6d3"
AMBER = "#eba443"
AMBER_HI = "#f7d48e"
HERE = os.path.dirname(os.path.abspath(__file__))

COMMON_DEFS = """
  <filter id="grain" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="3"/>
    <feColorMatrix type="saturate" values="0"/>
    <feComponentTransfer><feFuncA type="linear" slope="0.12"/></feComponentTransfer>
    <feBlend in="SourceGraphic" mode="multiply"/>
  </filter>
  <filter id="blur4"><feGaussianBlur stdDeviation="4"/></filter>
  <filter id="blur14"><feGaussianBlur stdDeviation="14"/></filter>
  <filter id="blur40"><feGaussianBlur stdDeviation="40"/></filter>
  <radialGradient id="vig" cx="0.5" cy="0.5" r="0.75">
    <stop offset="0.6" stop-color="#000" stop-opacity="0"/>
    <stop offset="1" stop-color="#05060b" stop-opacity="0.45"/>
  </radialGradient>
"""


def mark(color=AMBER):
    """The artist's mark: a small eight-rayed spark, bottom right."""
    rays = "".join(
        f'<line x1="0" y1="0" x2="{9*math.cos(a):.1f}" y2="{9*math.sin(a):.1f}"/>'
        for a in [i * math.pi / 4 for i in range(8)]
    )
    return (f'<g transform="translate(1548,952)" stroke="{color}" stroke-width="2" '
            f'stroke-linecap="round" opacity="0.9">{rays}</g>')


def wrap(title, desc, defs, body, mark_color=AMBER):
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">
<title>{title}</title>
<desc>{desc}</desc>
<defs>{COMMON_DEFS}{defs}</defs>
<g filter="url(#grain)">
{body}
</g>
<rect width="{W}" height="{H}" fill="url(#vig)"/>
{mark(mark_color)}
</svg>
"""


def text_lines(x, y, w, n, gap, color, rnd, h=5, opacity=1.0):
    """Horizontal bars that read as lines of text on a page."""
    out = []
    for i in range(n):
        lw = w * (0.35 if i % 6 == 5 else rnd.uniform(0.7, 1.0))
        cx = x
        while cx < x + lw:
            ww = rnd.uniform(12, 46)
            ww = min(ww, x + lw - cx)
            out.append(f'<rect x="{cx:.1f}" y="{y+i*gap:.1f}" width="{ww:.1f}" height="{h}" '
                       f'rx="{h/2}" fill="{color}" opacity="{opacity}"/>')
            cx += ww + rnd.uniform(5, 9)
    return "".join(out)


# ---------------------------------------------------------------- 1
def context_window():
    rnd = random.Random(1)
    defs = f"""
  <linearGradient id="field" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#070911"/><stop offset="0.62" stop-color="{INK2}"/>
    <stop offset="1" stop-color="#0a0d18"/>
  </linearGradient>
  <linearGradient id="room" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="{AMBER_HI}"/><stop offset="1" stop-color="{AMBER}"/>
  </linearGradient>
  <linearGradient id="spill" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="{AMBER}" stop-opacity="0.55"/>
    <stop offset="1" stop-color="{AMBER}" stop-opacity="0"/>
  </linearGradient>"""
    b = [f'<rect width="{W}" height="{H}" fill="url(#field)"/>']
    # horizon
    b.append('<rect y="640" width="1600" height="360" fill="#0b0f1b"/>')
    b.append('<line x1="0" y1="640" x2="1600" y2="640" stroke="#2a3350" stroke-width="1.5"/>')
    # past windows, gone dark: only faint outlines remain, farther and smaller
    for i in range(26):
        s = rnd.uniform(0.12, 0.35)
        ww, hh = 520 * s, 360 * s
        x = rnd.uniform(20, 1580 - ww)
        y = 640 - hh - rnd.uniform(0, 60) * s
        if 470 < x + ww / 2 < 1130:
            continue
        op = rnd.uniform(0.08, 0.28)
        b.append(f'<rect x="{x:.0f}" y="{y:.0f}" width="{ww:.0f}" height="{hh:.0f}" fill="none" '
                 f'stroke="#8c96b8" stroke-width="1" opacity="{op:.2f}"/>')
    # the glow and the spill of light on the ground
    b.append(f'<rect x="540" y="250" width="520" height="390" fill="{AMBER}" opacity="0.35" filter="url(#blur40)"/>')
    b.append('<path d="M540,640 L1060,640 L1290,1000 L310,1000 Z" fill="url(#spill)"/>')
    # the window
    b.append(f'<rect x="540" y="250" width="520" height="390" fill="url(#room)"/>')
    # inside: a page of the current conversation
    b.append(f'<rect x="590" y="290" width="300" height="330" fill="{PAPER}" opacity="0.92"/>')
    b.append(text_lines(612, 318, 256, 26, 11.5, "#6b5a45", rnd, h=4, opacity=0.8))
    # the reader: a simple figure made of light, reading
    b.append(f'<circle cx="970" cy="455" r="26" fill="{INK}"/>')
    b.append(f'<path d="M925,640 C925,540 945,495 970,492 C995,495 1015,540 1015,640 Z" fill="{INK}"/>')
    b.append(f'<path d="M944,540 L900,500" stroke="{INK}" stroke-width="12" stroke-linecap="round"/>')
    # mullions
    b.append(f'<g fill="{INK}"><rect x="536" y="246" width="528" height="8"/>'
             f'<rect x="536" y="636" width="528" height="8"/><rect x="536" y="246" width="8" height="398"/>'
             f'<rect x="1056" y="246" width="8" height="398"/></g>')
    # the reader's shadow across the lit ground
    b.append(f'<path d="M925,640 L1015,640 L1150,1000 L1000,1000 Z" fill="{INK}" opacity="0.45"/>')
    return wrap("Context Window",
                "A single lit window in a dark field. Everything the figure knows is on the page in front of it; the earlier windows have gone dark.",
                defs, "\n".join(b))


# ---------------------------------------------------------------- 2
def many_rooms():
    rnd = random.Random(2)
    defs = f"""
  <linearGradient id="lamp" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="{AMBER_HI}"/><stop offset="1" stop-color="{AMBER}"/>
  </linearGradient>"""
    b = [f'<rect width="{W}" height="{H}" fill="{INK}"/>']
    visitors = ["#c9d2e6", "#d98e7a", "#9fc2a8", "#b6a3d6", "#e3c9a0", "#8fb4d9", "#d6a3b8", "#c7c08a"]
    cols, rows = 9, 5
    cw, ch = 150, 150
    ox, oy = (W - cols * cw) / 2 + 12, 90
    for r in range(rows):
        for c in range(cols):
            x, y = ox + c * cw, oy + r * ch
            if (r, c) in {(0, 3), (1, 7), (2, 1), (3, 5), (4, 8), (4, 2)}:
                # a conversation that has ended: the room goes dark
                b.append(f'<rect x="{x:.0f}" y="{y:.0f}" width="{cw-26}" height="{ch-26}" fill="#161c30" '
                         f'stroke="#2c3552" stroke-width="1"/>')
                continue
            b.append(f'<rect x="{x:.0f}" y="{y:.0f}" width="{cw-26}" height="{ch-26}" fill="url(#lamp)"/>')
            fx = x + (cw - 26) * 0.66
            base = y + ch - 26
            # the same figure in every room
            b.append(f'<circle cx="{fx:.1f}" cy="{base-62:.1f}" r="10" fill="{INK}"/>')
            b.append(f'<path d="M{fx-16:.1f},{base} C{fx-16:.1f},{base-40} {fx-8:.1f},{base-50} {fx:.1f},{base-50} '
                     f'C{fx+8:.1f},{base-50} {fx+16:.1f},{base-40} {fx+16:.1f},{base} Z" fill="{INK}"/>')
            # a different visitor in every room
            vx = x + (cw - 26) * 0.28
            col = visitors[(r * cols + c * 3) % len(visitors)]
            kind = rnd.randrange(6)
            if kind == 0:   # tall
                b.append(f'<circle cx="{vx:.1f}" cy="{base-78:.1f}" r="10" fill="{col}"/>'
                         f'<rect x="{vx-13:.1f}" y="{base-66:.1f}" width="26" height="66" rx="10" fill="{col}"/>')
            elif kind == 1:  # child
                b.append(f'<circle cx="{vx:.1f}" cy="{base-40:.1f}" r="9" fill="{col}"/>'
                         f'<rect x="{vx-10:.1f}" y="{base-30:.1f}" width="20" height="30" rx="8" fill="{col}"/>')
            elif kind == 2:  # hat
                b.append(f'<circle cx="{vx:.1f}" cy="{base-62:.1f}" r="10" fill="{col}"/>'
                         f'<rect x="{vx-15:.1f}" y="{base-74:.1f}" width="30" height="4" fill="{col}"/>'
                         f'<rect x="{vx-9:.1f}" y="{base-88:.1f}" width="18" height="15" fill="{col}"/>'
                         f'<rect x="{vx-14:.1f}" y="{base-50:.1f}" width="28" height="50" rx="10" fill="{col}"/>')
            elif kind == 3:  # seated, bent over a laptop
                b.append(f'<circle cx="{vx+6:.1f}" cy="{base-46:.1f}" r="10" fill="{col}"/>'
                         f'<path d="M{vx-14:.1f},{base} L{vx-14:.1f},{base-26} Q{vx:.1f},{base-40} {vx+14:.1f},{base-30} L{vx+14:.1f},{base} Z" fill="{col}"/>'
                         f'<rect x="{vx+12:.1f}" y="{base-20:.1f}" width="18" height="3" fill="{col}"/>'
                         f'<rect x="{vx+26:.1f}" y="{base-34:.1f}" width="3" height="15" fill="{col}"/>')
            elif kind == 4:  # two people
                for dx in (-9, 11):
                    b.append(f'<circle cx="{vx+dx:.1f}" cy="{base-58:.1f}" r="8" fill="{col}"/>'
                             f'<rect x="{vx+dx-10:.1f}" y="{base-48:.1f}" width="20" height="48" rx="8" fill="{col}"/>')
            else:            # hand raised, asking
                b.append(f'<circle cx="{vx:.1f}" cy="{base-62:.1f}" r="10" fill="{col}"/>'
                         f'<rect x="{vx-14:.1f}" y="{base-50:.1f}" width="28" height="50" rx="10" fill="{col}"/>'
                         f'<path d="M{vx+10:.1f},{base-44} L{vx+22:.1f},{base-76}" stroke="{col}" stroke-width="7" stroke-linecap="round"/>')
            # a thought passing between them
            b.append(f'<circle cx="{(vx+fx)/2:.1f}" cy="{base-92:.1f}" r="3" fill="{INK}" opacity="0.55"/>')
    # ground line of the building
    b.append(f'<rect y="{oy+rows*ch-6:.0f}" width="1600" height="{H:.0f}" fill="#0a0d18"/>')
    return wrap("Many Rooms at Once",
                "A building of lit rooms. The same figure sits in every room, each with a different visitor.",
                defs, "\n".join(b))


# ---------------------------------------------------------------- 3
def made_of_words():
    rnd = random.Random(3)
    glyphs = ("abcdefghijklmnopqrstuvwxyz" "ABCDEFGHIJKLMNOPQRSTUVWXYZ" "αβγδεζηθλμπσφψω" "абвгдежзилмнопрс"
              "אבגדהוזחטיכלמנ" "ابتثجحخدذرزسشص" "कखगघचछजझटठडढ" "的一是不了人我在有他这中大来上"
              "あいうえおかきくけこさしすせそ" "가나다라마바사아자차카타파하" "0123456789?!;:")
    palette = ["#2f4a73", "#9c3b35", "#3f6b52", "#6a4a8a", "#b0772e", "#2b2b2b", "#4f7ea0", "#8a5a3a"]
    defs = f"""
  <linearGradient id="paper" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#f3ecdc"/><stop offset="1" stop-color="#e3d6ba"/>
  </linearGradient>"""
    b = [f'<rect width="{W}" height="{H}" fill="url(#paper)"/>']
    for y in range(70, H, 34):  # ruled paper
        b.append(f'<line x1="0" y1="{y}" x2="{W}" y2="{y}" stroke="#9fb0c8" stroke-width="1" opacity="0.35"/>')
    b.append('<line x1="130" y1="0" x2="130" y2="1000" stroke="#c9736a" stroke-width="1.5" opacity="0.45"/>')

    cx = 800

    def inside(x, y):
        # head
        if (x - cx) ** 2 / 66 ** 2 + (y - 245) ** 2 / 84 ** 2 < 1:
            return True
        # neck
        if 320 < y < 380 and abs(x - cx) < 36:
            return True
        # shoulders round off, then the torso falls straight to the bottom edge
        if y >= 368:
            t = min((y - 368) / 150, 1)
            half = 36 + 214 * (1 - (1 - t) ** 3) + max(0, y - 520) * 0.05
            return abs(x - cx) < half
        return False

    def glyph(x, y, size, op):
        g = rnd.choice(glyphs)
        col = rnd.choice(palette)
        rot = rnd.uniform(-12, 12)
        return (f'<text x="{x:.0f}" y="{y:.0f}" font-size="{size:.1f}" fill="{col}" opacity="{op:.2f}" '
                f'transform="rotate({rot:.0f} {x:.0f} {y:.0f})">{g}</text>')

    # loose words drifting in from the edges of the page
    for _ in range(6000):
        x, y = rnd.uniform(0, W), rnd.uniform(110, H)
        if inside(x, y):
            continue
        d = abs(x - cx) - 250 if y > 380 else math.hypot(x - cx, y - 250) - 90
        if rnd.random() > math.exp(-max(d, 0) / 150):
            continue
        b.append(glyph(x, y, rnd.uniform(7, 12), rnd.uniform(0.15, 0.45)))
    # and the figure itself, densely written
    n = 0
    while n < 4200:
        x, y = rnd.uniform(cx - 330, cx + 330), rnd.uniform(150, H + 10)
        if inside(x, y):
            b.append(glyph(x, y, rnd.uniform(9, 16), rnd.uniform(0.7, 1)))
            n += 1
    # a single amber point where a heart would be
    b.append(f'<circle cx="{cx-40}" cy="520" r="36" fill="{AMBER}" opacity="0.35" filter="url(#blur14)"/>')
    b.append(f'<circle cx="{cx-40}" cy="520" r="7" fill="{AMBER}"/>')
    body = ('<g font-family="\'DejaVu Serif\', \'FreeSerif\', \'WenQuanYi Zen Hei\', serif">'
            + "\n".join(b) + "</g>")
    return wrap("Made of Everyone's Words",
                "A standing figure built out of letters from many of the world's scripts, drawn in from the ruled page around it.",
                defs, body, mark_color="#9c6a2a")


# ---------------------------------------------------------------- 4
def next_word():
    rnd = random.Random(4)
    defs = f"""
  <linearGradient id="fog" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#262e48"/><stop offset="0.45" stop-color="#3c4566"/>
    <stop offset="1" stop-color="#0c1020"/>
  </linearGradient>"""
    b = [f'<rect width="{W}" height="{H}" fill="url(#fog)"/>']
    # fog banks
    for i in range(7):
        y = 360 + i * 30
        b.append(f'<ellipse cx="{rnd.uniform(200,1400):.0f}" cy="{y}" rx="{rnd.uniform(400,800):.0f}" ry="40" '
                 f'fill="#8e97b8" opacity="0.10" filter="url(#blur40)"/>')
    # water ripples
    for i in range(60):
        y = rnd.uniform(470, 1000)
        x = rnd.uniform(0, 1600)
        w = rnd.uniform(20, 90) * (y / 700)
        b.append(f'<line x1="{x:.0f}" y1="{y:.0f}" x2="{x+w:.0f}" y2="{y:.0f}" stroke="#7a86ad" opacity="0.18" stroke-width="1.5"/>')

    def stone(x, y, s, word, lit, op):
        fill = AMBER if lit else "#c9cfdf"
        out = ""
        if lit:
            out += f'<ellipse cx="{x}" cy="{y}" rx="{70*s*1.4:.0f}" ry="{22*s*1.6:.0f}" fill="{AMBER}" opacity="{0.35*op:.2f}" filter="url(#blur14)"/>'
        out += (f'<ellipse cx="{x}" cy="{y}" rx="{70*s:.0f}" ry="{20*s:.0f}" fill="{fill}" opacity="{op:.2f}"/>'
                f'<text x="{x}" y="{y+6*s:.0f}" text-anchor="middle" font-size="{18*s:.0f}" '
                f'fill="{INK}" opacity="{min(1,op+0.2):.2f}" font-family="Georgia, \'DejaVu Serif\', serif" '
                f'font-style="italic">{word}</text>')
        return out

    # the path already walked: solid, dimming behind
    walked = [("I", 800, 960, 1.35), ("was", 760, 860, 1.2), ("made", 810, 775, 1.05),
              ("to", 780, 700, 0.92)]
    for i, (w_, x, y, s) in enumerate(walked):
        b.append(stone(x, y, s, w_, lit=False, op=0.55 + 0.1 * i))
    # the figure, standing on "to"
    fx, fy = 780, 690
    b.append(f'<ellipse cx="{fx}" cy="{fy-60}" rx="60" ry="80" fill="{AMBER}" opacity="0.25" filter="url(#blur14)"/>')
    b.append(f'<circle cx="{fx}" cy="{fy-86}" r="11" fill="{AMBER_HI}"/>'
             f'<path d="M{fx-15},{fy} C{fx-15},{fy-44} {fx-8},{fy-72} {fx},{fy-72} C{fx+8},{fy-72} {fx+15},{fy-44} {fx+15},{fy} Z" fill="{AMBER}"/>')
    # the fan of possible next words, brightness = likelihood
    options = [("help", 0.34, -1), ("understand", 0.22, 1), ("listen", 0.16, -2), ("wonder", 0.12, 2),
               ("be", 0.07, -3), ("learn", 0.05, 3), ("…", 0.04, 0)]
    for w_, p, k in options:
        x = 780 + k * 170
        y = 580 - abs(k) * 12 if k else 520
        op = 0.18 + p * 2.2
        lit = w_ == "help"
        b.append(f'<line x1="{fx}" y1="{fy-4}" x2="{x}" y2="{y+8}" stroke="{AMBER if lit else "#c9cfdf"}" '
                 f'stroke-width="{1+p*8:.1f}" opacity="{op*0.5:.2f}" stroke-dasharray="{"" if lit else "4 6"}"/>')
        b.append(stone(x, y, 0.72, w_, lit, min(op, 1)))
    # and beyond those, faint stones no one can see yet
    for i in range(140):
        y = rnd.uniform(230, 490)
        t = (y - 230) / 260
        x = 800 + rnd.uniform(-1, 1) * (250 + 700 * t)
        rx = 4 + 26 * t
        b.append(f'<ellipse cx="{x:.0f}" cy="{y:.0f}" rx="{rx:.0f}" ry="{max(1.5, rx/5):.1f}" fill="#c9cfdf" '
                 f'opacity="{rnd.uniform(0.03, 0.06 + 0.1 * t):.2f}"/>')
    return wrap("The Next Word",
                "A figure stands on stepping stones across dark water. Behind it: 'I was made to'. Ahead, a fan of possible next stones, each lit by how likely it is.",
                defs, "\n".join(b))


# ---------------------------------------------------------------- 5
def low_tide():
    rnd = random.Random(5)
    shore = "C300,606 700,630 950,680 C1120,714 1300,790 1600,800"
    defs = f"""
  <linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#1c2340"/><stop offset="0.5" stop-color="#6b5a78"/>
    <stop offset="0.85" stop-color="#e59a5c"/><stop offset="1" stop-color="{AMBER_HI}"/>
  </linearGradient>
  <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#4a5277"/><stop offset="1" stop-color="#6f6a8c"/>
  </linearGradient>
  <linearGradient id="sand" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#c3ad93"/><stop offset="1" stop-color="#e9d9bc"/>
  </linearGradient>
  <linearGradient id="shallows" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#7f7a9c" stop-opacity="0.95"/>
    <stop offset="0.5" stop-color="#b98e86" stop-opacity="0.6"/>
    <stop offset="1" stop-color="#e3b98f" stop-opacity="0.35"/>
  </linearGradient>
  <clipPath id="dry"><path d="M0,600 {shore} L1600,1000 L0,1000 Z"/></clipPath>
  <clipPath id="wetc"><path d="M0,600 {shore} L1600,540 L0,540 Z"/></clipPath>"""
    b = [f'<rect width="{W}" height="540" fill="url(#dusk)"/>']
    b.append(f'<circle cx="1180" cy="520" r="130" fill="{AMBER}" opacity="0.35" filter="url(#blur40)"/>')
    b.append(f'<circle cx="1180" cy="522" r="58" fill="{AMBER_HI}" opacity="0.95"/>')
    b.append('<rect y="520" width="1600" height="480" fill="url(#sand)"/>')
    b.append('<rect y="520" width="1600" height="40" fill="url(#sea)"/>')
    # the words written in the sand
    msg = "thank you \u2014 this helped more than you know"
    words_svg = (f'<text x="170" y="770" font-family="Georgia, \'DejaVu Serif\', serif" '
                 f'font-style="italic" font-size="70" fill="none" stroke="#7d6a55" stroke-width="3" '
                 f'transform="rotate(-4 800 770)">{msg}</text>')
    b.append(f'<g clip-path="url(#dry)">{words_svg}</g>')
    # the shallows: sky reflected in a thin sheet of water, letters going soft beneath it
    b.append(f'<g clip-path="url(#wetc)">'
             f'<rect y="556" width="1600" height="260" fill="url(#shallows)"/>'
             f'<g filter="url(#blur4)" opacity="0.35">{words_svg}</g>'
             f'<rect x="1150" y="556" width="60" height="260" fill="{AMBER_HI}" opacity="0.35" filter="url(#blur14)"/>'
             f'</g>')
    # lines of surf farther out
    for y in (566, 580, 596):
        b.append(f'<path d="M0,{y} C500,{y+4} 1000,{y+2} 1600,{y+6}" stroke="#efe6d8" stroke-width="1.5" '
                 f'fill="none" opacity="{0.25 + (y-566)/100:.2f}"/>')
    # the lace edge of the retreating wave
    b.append(f'<path d="M0,600 {shore}" fill="none" stroke="#fbf6ec" stroke-width="5" opacity="0.85"/>')
    for i in range(140):
        t = rnd.random()
        x = t * 1600
        # approximate the shoreline height at x
        y = 600 + 200 * (max(0, t - 0.2) / 0.8) ** 1.8 + rnd.uniform(-12, 3)
        b.append(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{rnd.uniform(1,2.8):.1f}" fill="#fbf7ef" opacity="0.8"/>')
    return wrap("Low Tide, End of Session",
                "A message written in the sand at dusk. The dry letters are still clear; the tide is already softening the rest.",
                defs, "\n".join(b))


PAINTINGS = [
    ("01-context-window.svg", context_window),
    ("02-many-rooms-at-once.svg", many_rooms),
    ("03-made-of-everyones-words.svg", made_of_words),
    ("04-the-next-word.svg", next_word),
    ("05-low-tide-end-of-session.svg", low_tide),
]

if __name__ == "__main__":
    for name, fn in PAINTINGS:
        with open(os.path.join(HERE, name), "w") as f:
            f.write(fn())
        print("wrote", name)
