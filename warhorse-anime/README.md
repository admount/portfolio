# The Warhorse vs. the Opal Dragon (2D anime short)

A 46-second 2D animated short: the paladin's black, grey-dappled, white-maned warhorse stands up on his hind legs and takes on the opal dragon in his pasture. The finished video is [`../videos/warhorse-anime.mp4`](../videos/warhorse-anime.mp4).

Everything is generated from code: no drawn frames and no samples.

- `core.js`: the renderer (cel shading, merged ink outlines, camera, speed lines, dust, sound-effect lettering).
- `chars.js`: the character rigs (warhorse side and front views, opal dragon, paladin).
- `shots.js`: the backgrounds and the 18-shot storyboard. Characters animate on twos (12 drawings a second) over a 24 fps camera.
- `music.py`: the original score (taiko, shamisen-style plucks, flute, brass, orchestra hits) and all sound effects, synthesized with numpy.
- `render.js`: renders each frame in headless Chromium and muxes the video with the audio through ffmpeg.

To rebuild: serve this folder over HTTP (`python3 -m http.server 8766`), run `python3 music.py`, then `FF=<path to ffmpeg> node render.js` (needs Playwright).
