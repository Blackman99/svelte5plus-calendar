#!/usr/bin/env python3
"""Measure every planned effect on the decoded render against the music-only render, in the ear-sensitive
2-8 kHz band: 50 ms peak lift, 0.5 s RMS lift and the band's sample peak (critic 3's method). Flags
anything over +4 dB, or a band sample peak above the music's own loudest 2-8 kHz sample peak.
Usage: tools/fx-check.py renders/film.mp4 renders/film-music-only.mp4"""
import json, subprocess, sys
from pathlib import Path
import numpy as np

SR = 48000
def load(f):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.float32)
def band(y, lo=2000, hi=8000, n=4):
    Y = np.fft.rfft(y); f = np.fft.rfftfreq(len(y), 1 / SR) + 1e-9
    return np.fft.irfft(Y / np.sqrt(1 + (f / hi) ** (2 * n)) / np.sqrt(1 + (lo / f) ** (2 * n)), len(y))
mix, mus = band(load(sys.argv[1])), band(load(sys.argv[2]))
def pk50(y, a, b):
    s = y[max(0, int(a * SR)):int(b * SR)]; h = int(.05 * SR)
    return max(10 * np.log10((s[i:i + h] ** 2).mean() + 1e-12) for i in range(0, len(s) - h, h // 4))
def rms(y, a, b):
    s = y[max(0, int(a * SR)):int(b * SR)]
    return 10 * np.log10((s ** 2).mean() + 1e-12)
music_top = 20 * np.log10(np.abs(mus).max())
plan = json.loads((Path(__file__).resolve().parents[1] / 'assets/sfx/plan.json').read_text())
bad = 0
for name, t, *_ in plan:
    a, b = t - 0.1, t + 0.4
    p = pk50(mix, a, b) - pk50(mus, a, b)
    r = rms(mix, t - 0.05, t + 0.45) - rms(mus, t - 0.05, t + 0.45)
    sp = 20 * np.log10(np.abs(mix[int(a * SR):int(b * SR)]).max())
    flag = p > 4 or r > 4 or sp > music_top
    bad += flag
    print(f'{t:6.2f} {name:13s} 50ms {p:+5.1f} dB  0.5s rms {r:+5.1f} dB  band peak {sp:6.1f} dBFS {"  <-- HOT" if flag else ""}')
print(f'music loudest 2-8 kHz sample peak {music_top:.1f} dBFS; {bad} effect(s) over the limit')
