#!/usr/bin/env python3
"""Offline mix for the launch film (adapted from motion-video-kit's offline-mix.py).

1. Edits the library track to picture: the cue list below maps track time to film time on bar lines
   (the track measures 119.99 BPM, first beat at 0.128 s, so film beats fall on x.0 / x.5), with
   equal-power crossfades at splices, a 5 ms fade-in and a short tail fade.
2. Places each effect from assets/sfx/plan.json, aligned on its onset or its peak, and solves its gain so
   its 50 ms in-band peak sits TARGET dB over the music in the same window, with the ear-sensitive
   2-8 kHz lift capped (HF_CAP) and the sample peak capped over the local music peak (PKCAP).
3. Writes the film (picture copied untouched, AAC 256k), a music-only fallback, and review/mix-<name>.txt.

Usage: python3 tools/mix.py renders/picture.mp4 renders/film.mp4 [--music-lufs -18] [--no-sfx]
Needs: ffmpeg (ebur128), numpy. (Band filters are zero-phase FFT filters with a 4th-order Butterworth
magnitude response — measurement only, so phase does not matter; avoids a scipy dependency.)
"""
import json
import re
import subprocess
import sys
from pathlib import Path

import numpy as np

P = Path(__file__).resolve().parents[1]
SR = 48000
args = sys.argv[1:]
pic, out = args[0], args[1]
def opt(k, d): return args[args.index(k) + 1] if k in args else d
MUSIC_LUFS = float(opt('--music-lufs', '-15'))
HF_CAP = float(opt('--hf-cap', '4'))
PKCAP = float(opt('--pkcap', '6'))
HF_PEAK_CAP = float(opt('--hf-peak-cap', '-1'))  # dB relative to the local music's 2-8 kHz sample peak
MFLOOR = -50.0
DURATION = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', pic], capture_output=True, text=True).stdout)
N = int(round(DURATION * SR))

# Cue list: (film_start, track_start, length). Film 0 = beat 3 of bar 18 (end of the breakdown), so the
# groove returns on the bar 19 downbeat at film 1.0, exactly as the wall of chips hits; film bar lines then
# fall on odd seconds. Film 19.0 splices (on a bar line) to bar 47 so the track's own final downbeat
# (96.128 s) lands at film 21.0, as the amber pill seats in the logo.
CUES = [(0.0, 37.128, 19.0), (19.0, 94.128, DURATION - 19.0)]
INTRO_LIFT_DB = 3.0  # the last beats of the breakdown sit ~5 dB under the groove; lift them for the hook
XFADE = 0.03
TAIL_FADE = 0.35


def load(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(p), '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()


def write(p, x):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', str(p)],
                   input=np.clip(x, -1, 1).astype(np.float32).tobytes(), check=True)


def lufs(x):
    tmp = P / 'renders/_lufs.wav'
    write(tmp, x)
    e = subprocess.run(['ffmpeg', '-hide_banner', '-i', str(tmp), '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
    tmp.unlink()
    f = lambda pat: float((re.findall(pat, e) or ['nan'])[-1])
    return f(r'I:\s+(-?[\d.]+) LUFS'), f(r'Peak:\s+(-?[\d.]+) dBFS'), f(r'LRA:\s+([\d.]+) LU')


def butter(order, band, btype='band', fs=SR, output='sos'):
    return (band[0], band[1], order)


def sosfilt(spec, y):
    lo, hi, n = spec
    Y = np.fft.rfft(y)
    f = np.fft.rfftfreq(len(y), 1 / SR) + 1e-9
    H = 1 / np.sqrt(1 + (f / hi) ** (2 * n)) / np.sqrt(1 + (lo / f) ** (2 * n))
    return np.fft.irfft(Y * H, len(y))


def pk(y):
    h = int(.05 * SR)
    return max(10 * np.log10((y[i:i + h] ** 2).mean() + 1e-12) for i in range(0, max(1, len(y) - h), h // 2))


# ---- music edit ----
track = load(P / 'assets/music/better-times-are-coming.mp3')
mus = np.zeros((N, 2), np.float32)
xf = int(XFADE * SR)
for k, (f0, t0, ln) in enumerate(CUES):
    a, b = int(round(f0 * SR)), min(N, int(round((f0 + ln) * SR)))
    s0 = int(round(t0 * SR))
    # read a little past the cut so the outgoing side can cross-fade
    seg = track[s0:s0 + (b - a) + xf].copy()
    seg = np.pad(seg, ((0, (b - a) + xf - len(seg)), (0, 0)))
    w = np.ones(len(seg), np.float32)
    if k > 0:
        w[:xf] = np.sin(np.linspace(0, np.pi / 2, xf)) # equal-power in
    if k < len(CUES) - 1:
        w[b - a:] = np.cos(np.linspace(0, np.pi / 2, xf)) # equal-power out
    else:
        seg = seg[:b - a]; w = w[:b - a]
    end = min(N, a + len(seg))
    mus[a:end] += (seg * w[:, None])[:end - a]
lift = np.ones(N, np.float32)
i0, i1 = int(0.95 * SR), int(1.0 * SR)
lift[:i0] = 10 ** (INTRO_LIFT_DB / 20)
lift[i0:i1] = np.linspace(10 ** (INTRO_LIFT_DB / 20), 1, i1 - i0)
mus *= lift[:, None]
mus[:int(.005 * SR)] *= np.linspace(0, 1, int(.005 * SR))[:, None]
tf = int(TAIL_FADE * SR)
mus[-tf:] *= (np.linspace(1, 0, tf) ** 1.5)[:, None]
# A filtered build-down: from the time-zone cut (16.0 s) the bass sweeps out and the rest dips, bottoming
# out under "0 runtime dependencies" (17.5 s), then everything slams back as the camera flies through the
# zero (18.75–19.0 s). Without it the groove is a flat wall (music LRA ~1 LU).
DIP = (16.0, 17.5, 18.75, 19.0)  # sweep start, fully dipped, start of return, back to full
low = np.stack([sosfilt(butter(4, [20, 250]), mus[:, c]) for c in range(2)], 1).astype(np.float32)
high = mus - low
tt = np.arange(N) / SR
env = np.interp(tt, DIP, [1, 0, 0, 1]).astype(np.float32) ** 1.5
hg = 10 ** (-5.5 / 20)
mus = high * (hg + (1 - hg) * env)[:, None] + low * (0.12 + 0.88 * env)[:, None]
L0 = lufs(mus)[0]
mg = 10 ** ((MUSIC_LUFS - L0) / 20)
mus *= mg
mono_m = mus.mean(1)

# ---- effects ----
fx = np.zeros_like(mus)
rep = []
plan = [] if '--no-sfx' in args else json.loads((P / 'assets/sfx/plan.json').read_text())
HB = butter(4, [2000, 8000], btype='band', fs=SR, output='sos')
cache = {}
for name, t, target, align, note, *extra in plan:
    s = cache.setdefault(name, load(P / 'assets/sfx' / f'{name}.mp3'))
    m1 = s.mean(1)
    env = np.convolve(np.abs(m1), np.ones(240) / 240, 'same')
    onset = int(np.argmax(env > env.max() * 0.05))
    peak = int(np.argmax(env))
    i = int(round(t * SR)) - (peak if align == 'peak' else onset)
    i = max(0, i)
    F = np.abs(np.fft.rfft(m1 * np.hanning(len(m1)))) ** 2
    f = np.fft.rfftfreq(len(m1), 1 / SR)
    c = np.cumsum(F) / F.sum()
    lo = max(f[np.searchsorted(c, .2)], 60)
    hi = min(max(f[np.searchsorted(c, .8)], lo * 2), SR / 2 - 500)
    sos = butter(4, [lo, hi], btype='band', fs=SR, output='sos')
    W = min(len(m1), int(1.0 * SR))
    pad = SR // 2
    seg_m = np.pad(mono_m, (pad, pad + SR))[i:i + W + 2 * pad]
    mpk = max(pk(sosfilt(sos, seg_m)[pad:pad + W]), MFLOOR)
    epk = pk(sosfilt(sos, m1)[:W])
    g = 10 ** ((mpk + target - epk) / 20)

    def with_fx(g):
        a = seg_m.copy()
        k = min(W, len(m1))
        a[pad:pad + k] += g * m1[:k]
        return a

    hf0 = max(pk(sosfilt(HB, seg_m)[pad:pad + W]), MFLOOR)
    hl = pk(sosfilt(HB, with_fx(g))[pad:pad + W]) - hf0
    while hl > HF_CAP and g > 1e-4:
        g *= .85
        hl = pk(sosfilt(HB, with_fx(g))[pad:pad + W]) - hf0
    mloc = max(20 * np.log10(np.abs(seg_m[pad:pad + W]).max() + 1e-9), -20)
    while 20 * np.log10(g * np.abs(m1).max() + 1e-9) > mloc + PKCAP and g > 1e-4:
        g *= .9
    # 2-8 kHz sample-peak cap (film critic 3): a 10 ms click can sit low in a 50 ms window yet still spike
    # above everything the music does up there. The effect's band peak may not exceed the music's own
    # 2-8 kHz peak in the surrounding second.
    ehf = np.abs(sosfilt(HB, m1)).max()
    mhf = np.abs(sosfilt(HB, seg_m)).max()
    while g * ehf > mhf * 10 ** (HF_PEAK_CAP / 20) and g > 1e-4:
        g *= .9
    if extra:
        g *= 10 ** (extra[0] / 20)  # optional hand trim after solving (dB), e.g. a click that still pokes out
    j = min(N, i + len(s))
    fx[i:j] += g * s[:j - i]
    inb = pk(sosfilt(sos, with_fx(g))[pad:pad + W]) - mpk
    rep.append(f'{t:6.2f} {name:13s} {align:5s} band {int(lo):5d}-{int(hi):5d} Hz  target +{target:.1f}  in-band {inb:+5.1f} dB  2-8k {hl:+5.1f} dB  gain {g:.3f}  {note}')

mix = mus + fx
lim = 10 ** (-1.5 / 20)


def limit(x, ceil=lim, look=int(.005 * SR), release=int(.08 * SR)):
    """Look-ahead peak limiter: only short transients are turned down, never the whole mix."""
    need = np.minimum(1, ceil / (np.abs(x).max(1) + 1e-9))
    # look-ahead: each sample already sees the dip it will need within the next `look` samples
    from numpy.lib.stride_tricks import sliding_window_view
    g = sliding_window_view(np.pad(need, (0, look), constant_values=1), look + 1).min(1)
    # one-pole release back towards unity (attack is instant thanks to the look-ahead)
    a = np.exp(-1 / release)
    out = g.copy()
    cur = 1.0
    for i in range(len(g)):
        cur = g[i] if g[i] < cur else a * cur + (1 - a) * g[i]
        out[i] = cur
    return x * out[:, None]


mix = limit(mix)


def mux(audio, dst):
    wav = P / f'renders/_mix-{Path(dst).stem}.wav'
    write(wav, audio)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', pic, '-i', str(wav), '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy',
                    '-c:a', 'aac', '-b:a', '256k', '-shortest', '-movflags', '+faststart', str(dst)], check=True)
    wav.unlink()


mux(mix, out)
if plan:
    mux(limit(mus), Path(out).with_name(Path(out).stem + '-music-only.mp4'))
Lm, _, lram = lufs(mus)
Lx, tp, lra = lufs(mix)
hdr = (f'music-only {Lm:.1f} LUFS (LRA {lram}); mix {Lx:.1f} LUFS, LRA {lra}, true peak {tp} dBFS; '
       f'{len(plan)} effects; cues {CUES}')
(P / 'review').mkdir(exist_ok=True)
(P / f'review/mix-{Path(out).stem}.txt').write_text(hdr + '\n' + '\n'.join(rep) + '\n')
print(hdr)
print('\n'.join(rep))
