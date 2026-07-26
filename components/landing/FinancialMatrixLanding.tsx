'use client';

import { useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

const MATRIX_CHARS = '0123456789.%+-×=<>$¥€£₩₿ΣΔ∂∫√∞≈±μσαβφρλπθΩΨΦBTCETHRSIGDPCPIVIXSMAΓΛΞ';

// ─────────────────────────────────────────────────────
// Types & Geometry
// ─────────────────────────────────────────────────────
type Seg = [number, number, number, number];
// gold: true = amber/gold alpha flash, false = signal green
interface Particle { x: number; y: number; r: number; intensity: number; gold?: boolean }

function dSeg(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax, dy = by - ay;
  const t = dx * dx + dy * dy;
  if (t === 0) return Math.hypot(px - ax, py - ay);
  const s = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / t));
  return Math.hypot(px - ax - s * dx, py - ay - s * dy);
}

function segsW(nx: number, ny: number, segs: Seg[]): number {
  let m = Infinity;
  for (const [ax, ay, bx, by] of segs) {
    const d = dSeg(nx, ny, ax, ay, bx, by);
    if (d < m) m = d;
  }
  if (m <= 0.0032) return 1.00;
  if (m <= 0.0070) return 0.80;
  if (m <= 0.0130) return 0.36;
  if (m <= 0.0210) return 0.10;
  if (m <= 0.0290) return 0.02;
  return 0;
}

function particleW(nx: number, ny: number, ps: Particle[]): number {
  let max = 0;
  for (const p of ps) {
    if (p.gold) continue;
    const d2 = (nx - p.x) ** 2 + (ny - p.y) ** 2;
    if (d2 < p.r * p.r * 9) {
      const w = p.intensity * Math.exp(-d2 / (p.r * p.r));
      if (w > max) max = w;
    }
  }
  return max;
}

function particleWGold(nx: number, ny: number, ps: Particle[]): number {
  let max = 0;
  for (const p of ps) {
    if (!p.gold) continue;
    const d2 = (nx - p.x) ** 2 + (ny - p.y) ** 2;
    if (d2 < p.r * p.r * 9) {
      const w = p.intensity * Math.exp(-d2 / (p.r * p.r));
      if (w > max) max = w;
    }
  }
  return max;
}

// ─────────────────────────────────────────────────────
// SHAPE 1: CANDLESTICK CHART
// ─────────────────────────────────────────────────────
const CANDLES = [
  { cx: 0.474, top: 0.440, bot: 0.760, bT: 0.570, bB: 0.495 },
  { cx: 0.518, top: 0.415, bot: 0.715, bT: 0.640, bB: 0.465 },
  { cx: 0.562, top: 0.435, bot: 0.690, bT: 0.505, bB: 0.565 }, // bear
  { cx: 0.606, top: 0.355, bot: 0.640, bT: 0.555, bB: 0.415 },
  { cx: 0.650, top: 0.315, bot: 0.595, bT: 0.505, bB: 0.365 },
  { cx: 0.694, top: 0.335, bot: 0.570, bT: 0.400, bB: 0.450 }, // bear
  { cx: 0.738, top: 0.235, bot: 0.505, bT: 0.445, bB: 0.290 },
  { cx: 0.782, top: 0.190, bot: 0.445, bT: 0.385, bB: 0.235 },
  { cx: 0.826, top: 0.205, bot: 0.415, bT: 0.248, bB: 0.322 }, // small bear
  { cx: 0.870, top: 0.170, bot: 0.395, bT: 0.318, bB: 0.208 },
];
const C_MA = CANDLES.map(c => [(c.bT + c.bB) / 2] as [number]).map((v, i) => [CANDLES[i].cx, v[0]] as [number, number]);

function buildCandleSegs(): Seg[] {
  const segs: Seg[] = [];
  const hw = 0.016;
  for (const c of CANDLES) {
    segs.push([c.cx, c.top, c.cx, c.bot]);
    segs.push([c.cx - hw, c.bT, c.cx + hw, c.bT]);
    segs.push([c.cx - hw, c.bB, c.cx + hw, c.bB]);
    segs.push([c.cx - hw, c.bT, c.cx - hw, c.bB]);
    segs.push([c.cx + hw, c.bT, c.cx + hw, c.bB]);
    // Volume bar at bottom (subtle)
    const vol = 0.04 + 0.06 * Math.abs(c.bT - c.bB) / 0.15;
    segs.push([c.cx - 0.012, 0.820, c.cx - 0.012, 0.820 - vol]);
    segs.push([c.cx + 0.012, 0.820, c.cx + 0.012, 0.820 - vol]);
    segs.push([c.cx - 0.012, 0.820 - vol, c.cx + 0.012, 0.820 - vol]);
  }
  for (let i = 0; i < C_MA.length - 1; i++)
    segs.push([C_MA[i][0], C_MA[i][1], C_MA[i+1][0], C_MA[i+1][1]]);
  return segs;
}
const CANDLE_SEGS = buildCandleSegs();

// Buy/sell signal positions
const C_SIGNALS = [
  { x: CANDLES[0].cx, y: CANDLES[0].bot + 0.025, buy: true },
  { x: CANDLES[2].cx, y: CANDLES[2].top - 0.025, buy: false },
  { x: CANDLES[3].cx, y: CANDLES[3].bot + 0.025, buy: true },
  { x: CANDLES[5].cx, y: CANDLES[5].top - 0.025, buy: false },
  { x: CANDLES[7].cx, y: CANDLES[7].top - 0.025, buy: true },
  { x: CANDLES[8].cx, y: CANDLES[8].top - 0.025, buy: false },
];

function getCandleParticles(t: number): Particle[] {
  const ps: Particle[] = [];
  // Scanning cursor along MA line
  const phase = (t * 0.22) % 1;
  const maSeg = phase * (C_MA.length - 1);
  const maI = Math.min(Math.floor(maSeg), C_MA.length - 2);
  const maF = maSeg - maI;
  const mx = C_MA[maI][0] + maF * (C_MA[maI + 1][0] - C_MA[maI][0]);
  const my = C_MA[maI][1] + maF * (C_MA[maI + 1][1] - C_MA[maI][1]);
  ps.push({ x: mx, y: my, r: 0.022, intensity: 1.8 });
  // Comet trail
  for (let k = 1; k <= 5; k++) {
    const tp = Math.max(0, maSeg - k * 0.6);
    const ti = Math.min(Math.floor(tp), C_MA.length - 2);
    const tf = tp - ti;
    const tx = C_MA[ti][0] + tf * (C_MA[ti + 1][0] - C_MA[ti][0]);
    const ty = C_MA[ti][1] + tf * (C_MA[ti + 1][1] - C_MA[ti][1]);
    ps.push({ x: tx, y: ty, r: 0.014 - k * 0.002, intensity: (1.1 - k * 0.18) });
  }
  // Buy/sell signals pulsing
  for (let i = 0; i < C_SIGNALS.length; i++) {
    const sig = C_SIGNALS[i];
    const pulse = Math.sin((t * 1.8 + i * 1.05) % (Math.PI * 2));
    if (pulse > 0.2) {
      ps.push({ x: sig.x, y: sig.y, r: 0.016, intensity: pulse * 1.3 });
    }
  }
  // Crosshair vertical scan line (sample point)
  const vx = 0.474 + ((t * 0.22) % 1) * (0.870 - 0.474);
  ps.push({ x: vx, y: 0.500, r: 0.008, intensity: 0.5 });
  ps.push({ x: vx, y: 0.600, r: 0.008, intensity: 0.3 });
  return ps;
}

// ─────────────────────────────────────────────────────
// SHAPE 2: BINARY TREE
// ─────────────────────────────────────────────────────
const TR = [0.672, 0.830] as [number, number];
const TL1: [number, number][] = [[0.502, 0.645], [0.842, 0.645]];
const TL2: [number, number][] = [[0.422, 0.468], [0.578, 0.468], [0.766, 0.468], [0.922, 0.468]];
const TL3: [number, number][] = [
  [0.454, 0.300], [0.498, 0.300],
  [0.548, 0.300], [0.608, 0.300],
  [0.730, 0.300], [0.794, 0.300],
  [0.854, 0.300], [0.914, 0.300],
];
const T_NODES = [TR, ...TL1, ...TL2, ...TL3];

function buildTreeSegs(): Seg[] {
  const segs: Seg[] = [];
  segs.push([TR[0], TR[1], TL1[0][0], TL1[0][1]]);
  segs.push([TR[0], TR[1], TL1[1][0], TL1[1][1]]);
  for (let i = 0; i < TL1.length; i++) {
    segs.push([TL1[i][0], TL1[i][1], TL2[i * 2][0], TL2[i * 2][1]]);
    segs.push([TL1[i][0], TL1[i][1], TL2[i * 2 + 1][0], TL2[i * 2 + 1][1]]);
  }
  for (let i = 0; i < TL2.length; i++) {
    segs.push([TL2[i][0], TL2[i][1], TL3[i * 2][0], TL3[i * 2][1]]);
    segs.push([TL2[i][0], TL2[i][1], TL3[i * 2 + 1][0], TL3[i * 2 + 1][1]]);
  }
  return segs;
}
const TREE_SEGS = buildTreeSegs();

// 8 root-to-leaf paths
const TREE_PATHS: [number, number][][] = TL3.map((leaf, i) => {
  const l2 = TL2[Math.floor(i / 2)];
  const l1 = TL1[Math.floor(i / 4)];
  return [TR, l1, l2, leaf];
});

function getTreeParticles(t: number): Particle[] {
  const ps: Particle[] = [];
  // 8 concurrent signals flowing root → leaf
  for (let i = 0; i < 8; i++) {
    const phase = (t * 0.38 + i * 0.125) % 1;
    const path = TREE_PATHS[i];
    const prog = phase * (path.length - 1);
    const si = Math.min(Math.floor(prog), path.length - 2);
    const sf = prog - si;
    const x = path[si][0] + sf * (path[si + 1][0] - path[si][0]);
    const y = path[si][1] + sf * (path[si + 1][1] - path[si][1]);
    const intensity = 0.8 + 0.7 * Math.abs(Math.sin(t * 3.5 + i * 0.8));
    ps.push({ x, y, r: 0.016, intensity });
    // short trail
    const tp = Math.max(0, prog - 0.5);
    const ti = Math.min(Math.floor(tp), path.length - 2);
    const tf = tp - ti;
    const tx = path[ti][0] + tf * (path[ti + 1][0] - path[ti][0]);
    const ty2 = path[ti][1] + tf * (path[ti + 1][1] - path[ti][1]);
    ps.push({ x: tx, y: ty2, r: 0.010, intensity: intensity * 0.5 });
  }
  // Nodes pulse (cascading wave from root)
  for (let i = 0; i < T_NODES.length; i++) {
    const wave = Math.sin(t * 1.6 - i * 0.45);
    if (wave > 0.55) {
      ps.push({ x: T_NODES[i][0], y: T_NODES[i][1], r: 0.014, intensity: (wave - 0.55) * 2.2 });
    }
  }
  return ps;
}

function getBinaryTreeW(nx: number, ny: number): number {
  let m = Infinity;
  for (const [ax, ay, bx, by] of TREE_SEGS) m = Math.min(m, dSeg(nx, ny, ax, ay, bx, by));
  for (const [nx2, ny2] of T_NODES) m = Math.min(m, Math.max(0, Math.hypot(nx - nx2, ny - ny2) - 0.008));
  if (m <= 0.0032) return 1.00;
  if (m <= 0.0070) return 0.80;
  if (m <= 0.0130) return 0.36;
  if (m <= 0.0210) return 0.10;
  if (m <= 0.0290) return 0.02;
  return 0;
}

// ─────────────────────────────────────────────────────
// SHAPE 3: NOISY DISTRIBUTION (Real-world histogram)
// ─────────────────────────────────────────────────────
const H_X0 = 0.462, H_X1 = 0.878, H_BASE = 0.778, H_PEAK = 0.235;
const H_N = 20;
const H_CX = (H_X0 + H_X1) / 2;
const H_SIG = (H_X1 - H_X0) / 5.8;

// Slightly bimodal + right-skewed base distribution
function histBase(x: number): number {
  const z1 = (x - (H_CX - 0.018)) / (H_SIG * 0.88);
  const z2 = (x - (H_CX + 0.055)) / (H_SIG * 0.60);
  return 0.72 * Math.exp(-0.5 * z1 * z1) + 0.28 * Math.exp(-0.5 * z2 * z2);
}

function histBarH(i: number, t: number): number {
  const x = H_X0 + (i + 0.5) * (H_X1 - H_X0) / H_N;
  const base = histBase(x);
  const noiseAmp = 0.12 + 0.22 * (1 - base);
  const noise =
    noiseAmp * 0.55 * Math.sin(i * 3.71 + t * 0.28) +
    noiseAmp * 0.35 * Math.sin(i * 7.13 - t * 0.19) +
    noiseAmp * 0.22 * Math.cos(i * 2.29 + t * 0.11) +
    noiseAmp * 0.12 * Math.sin(i * 11.1 + t * 0.34);
  return Math.max(0.04, Math.min(1.0, base + noise));
}

function buildHistSegs(t: number): Seg[] {
  const segs: Seg[] = [];
  const bw = (H_X1 - H_X0) / H_N;
  const range = H_BASE - H_PEAK;
  const gap = 0.0025;
  const tops: [number, number][] = [];
  for (let i = 0; i < H_N; i++) {
    const x0 = H_X0 + i * bw + gap;
    const x1 = x0 + bw - gap * 2;
    const h = histBarH(i, t);
    const topY = H_BASE - h * range;
    tops.push([(x0 + x1) / 2, topY]);
    segs.push([x0, topY, x1, topY]);
    segs.push([x0, topY, x0, H_BASE]);
    segs.push([x1, topY, x1, H_BASE]);
  }
  segs.push([H_X0, H_BASE, H_X1, H_BASE]);
  // Rough envelope through bar tops
  for (let i = 0; i < tops.length - 1; i++)
    segs.push([tops[i][0], tops[i][1], tops[i + 1][0], tops[i + 1][1]]);
  // ±1σ markers
  for (const s of [-1, 1]) {
    const x = H_CX + s * H_SIG;
    segs.push([x, H_BASE, x, H_BASE - 0.04]);
  }
  return segs;
}

function getBellParticles(t: number, _histSegs: Seg[]): Particle[] {
  const ps: Particle[] = [];
  const bw = (H_X1 - H_X0) / H_N;
  const range = H_BASE - H_PEAK;
  // Scanning point across histogram top
  const phase = (t * 0.18) % 1;
  const scanBar = phase * (H_N - 1);
  const si = Math.min(Math.floor(scanBar), H_N - 2);
  const sf = scanBar - si;
  const h0 = histBarH(si, t), h1 = histBarH(si + 1, t);
  const scanY = H_BASE - (h0 + sf * (h1 - h0)) * range;
  const scanX = H_X0 + (scanBar + 0.5) * bw;
  ps.push({ x: scanX, y: scanY, r: 0.024, intensity: 1.7 });
  ps.push({ x: scanX, y: scanY + 0.04, r: 0.012, intensity: 0.4 });
  // Sampled data points appearing within bars
  for (let i = 0; i < 10; i++) {
    const sPhase = (t * 0.7 + i * 0.1) % 1;
    const life = Math.sin(sPhase * Math.PI);
    if (life < 0.08) continue;
    // Gaussian sample (deterministic pseudo-random)
    const u = Math.sin(i * 7.31 + Math.floor(t * 2) * 3.17);
    const v = Math.cos(i * 4.13 + Math.floor(t * 2) * 2.41);
    const z = Math.sqrt(Math.max(0.001, -2 * Math.log(0.5 + 0.499 * u))) * Math.cos(2 * Math.PI * (0.5 + 0.499 * v));
    const sampleX = H_CX + z * H_SIG * 0.95;
    if (sampleX < H_X0 || sampleX > H_X1) continue;
    const barI = Math.max(0, Math.min(H_N - 1, Math.floor((sampleX - H_X0) / bw)));
    const barH = histBarH(barI, t);
    const barTopY = H_BASE - barH * range;
    const sampleY = barTopY + (H_BASE - barTopY) * (0.05 + 0.9 * Math.max(0, 0.5 + 0.499 * Math.sin(i * 3.7 + t * 0.6)));
    ps.push({ x: sampleX, y: sampleY, r: 0.009, intensity: life * 0.95 });
  }
  return ps;
}

// ─────────────────────────────────────────────────────
// SHAPE 4: FIBONACCI SPIRAL
// ─────────────────────────────────────────────────────
const SP_CX = 0.672, SP_CY = 0.490, SP_A = 0.014, SP_B = 0.228;

function buildSpiralSegs(rot = 0): Seg[] {
  const segs: Seg[] = [];
  const N = 160, t0 = -0.6 * Math.PI + rot, t1 = 3.2 * Math.PI + rot;
  let px = SP_CX + SP_A * Math.exp(SP_B * t0) * Math.cos(t0);
  let py = SP_CY + SP_A * Math.exp(SP_B * t0) * Math.sin(t0);
  for (let i = 1; i <= N; i++) {
    const th = t0 + (t1 - t0) * i / N;
    const r = SP_A * Math.exp(SP_B * th);
    const x = SP_CX + r * Math.cos(th);
    const y = SP_CY + r * Math.sin(th);
    segs.push([px, py, x, y]);
    px = x; py = y;
  }
  // Golden cross at center
  segs.push([SP_CX - 0.012, SP_CY, SP_CX + 0.012, SP_CY]);
  segs.push([SP_CX, SP_CY - 0.012, SP_CX, SP_CY + 0.012]);
  return segs;
}

function getSpiralParticles(t: number, spiralSegs: Seg[]): Particle[] {
  const ps: Particle[] = [];
  // 3 particles traveling at different speeds
  const configs = [
    { speed: 0.13, phase: 0.0, r: 0.022, intensity: 1.8 },
    { speed: 0.08, phase: 0.33, r: 0.016, intensity: 1.3 },
    { speed: 0.05, phase: 0.67, r: 0.013, intensity: 1.0 },
  ];
  const N = spiralSegs.length;
  for (const cfg of configs) {
    const progress = (t * cfg.speed + cfg.phase) % 1;
    const si = Math.min(Math.floor(progress * N), N - 1);
    const sf = (progress * N) - si;
    const [ax, ay, bx, by] = spiralSegs[si];
    const x = ax + sf * (bx - ax);
    const y = ay + sf * (by - ay);
    ps.push({ x, y, r: cfg.r, intensity: cfg.intensity });
    // Comet trail (6 steps behind)
    for (let k = 1; k <= 6; k++) {
      const tp = Math.max(0, progress - k * 0.013) % 1;
      const ti = Math.min(Math.floor(tp * N), N - 1);
      const tf = (tp * N) - ti;
      const [tax, tay, tbx, tby] = spiralSegs[ti];
      ps.push({
        x: tax + tf * (tbx - tax),
        y: tay + tf * (tby - tay),
        r: cfg.r * (1 - k / 8),
        intensity: cfg.intensity * (1 - k / 7) * 0.65,
      });
    }
  }
  // Center pulsing
  const cp = 0.5 + 0.5 * Math.sin(t * 2.2);
  ps.push({ x: SP_CX, y: SP_CY, r: 0.011, intensity: cp });
  return ps;
}

// ─────────────────────────────────────────────────────
// SHAPE 5: NETWORK GRAPH
// ─────────────────────────────────────────────────────
const NN: [number, number][] = [
  [0.482, 0.228], [0.628, 0.185], [0.774, 0.238],
  [0.878, 0.372], [0.858, 0.548], [0.758, 0.660],
  [0.608, 0.700], [0.482, 0.608], [0.452, 0.428],
  [0.548, 0.312], [0.698, 0.378], [0.782, 0.495],
  [0.638, 0.528], [0.562, 0.455],
];
const NE: [number, number][] = [
  [0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],
  [9,10],[10,11],[11,4],[0,9],[1,10],[2,11],
  [9,13],[13,12],[12,10],[12,5],[13,7],[6,12],[8,13],[3,11],
];
const NN_SEGS: Seg[] = NE.map(([a, b]) => [NN[a][0], NN[a][1], NN[b][0], NN[b][1]]);
const NN_NODE_R = 0.012;

function getNetworkW(nx: number, ny: number): number {
  let m = Infinity;
  for (const [ax, ay, bx, by] of NN_SEGS) m = Math.min(m, dSeg(nx, ny, ax, ay, bx, by));
  for (const [nx2, ny2] of NN) m = Math.min(m, Math.max(0, Math.hypot(nx - nx2, ny - ny2) - NN_NODE_R));
  if (m <= 0.0032) return 1.00;
  if (m <= 0.0070) return 0.80;
  if (m <= 0.0130) return 0.36;
  if (m <= 0.0210) return 0.10;
  if (m <= 0.0290) return 0.02;
  return 0;
}

function getNetworkParticles(t: number): Particle[] {
  const ps: Particle[] = [];
  const SIG_DUR = 0.42;
  // Pulse signal on every edge, staggered
  for (let i = 0; i < NE.length; i++) {
    const [a, b] = NE[i];
    const phase = (t * 0.45 + i * (1 / NE.length)) % 1;
    if (phase < SIG_DUR) {
      const prog = phase / SIG_DUR;
      const alpha = Math.sin(prog * Math.PI);
      const x = NN[a][0] + prog * (NN[b][0] - NN[a][0]);
      const y = NN[a][1] + prog * (NN[b][1] - NN[a][1]);
      ps.push({ x, y, r: 0.016, intensity: alpha * 1.5 });
      // Trail
      if (prog > 0.12) {
        const tp = (prog - 0.12);
        ps.push({
          x: NN[a][0] + tp * (NN[b][0] - NN[a][0]),
          y: NN[a][1] + tp * (NN[b][1] - NN[a][1]),
          r: 0.010, intensity: alpha * 0.55,
        });
      }
    }
  }
  // Nodes flare when receiving
  for (let i = 0; i < NN.length; i++) {
    const pulse = Math.sin(t * 1.9 + i * 0.71);
    if (pulse > 0.70) {
      ps.push({ x: NN[i][0], y: NN[i][1], r: 0.020, intensity: (pulse - 0.70) * 3.2 });
    }
  }
  return ps;
}

// ─────────────────────────────────────────────────────
// Blend: shape + particle combined weight
// ─────────────────────────────────────────────────────
const NUM_SHAPES = 5;
const DISPLAY_DUR = 5.0;
const FADE_DUR = 1.4;
const CYCLE_DUR = DISPLAY_DUR + FADE_DUR;

// Discovery flash: a gold "alpha extraction" event at key signal points
interface Flash { x: number; y: number; startT: number; dur: number }

interface ShapeState {
  spiralSegs: Seg[];
  histSegs: Seg[];
  particles: Particle[];
  shapeIdx: number;
  nextIdx: number;
  fadeProg: number;
  flashes: Flash[];
  lastFlashT: number;
}

// Key "alpha signal" positions per shape (points of highest analytical value)
const ALPHA_POINTS: [number, number][][] = [
  // Shape 0: Candlestick — reversal & continuation points
  CANDLES.filter((_, i) => [0, 3, 5, 7, 9].includes(i)).map(c => [c.cx, c.bT] as [number, number]),
  // Shape 1: Binary tree — leaf nodes (final decisions)
  TL3,
  // Shape 2: Bell curve — peak and sigma crossing points
  [[H_CX, H_PEAK + 0.03], [H_CX - H_SIG, H_BASE - 0.12], [H_CX + H_SIG, H_BASE - 0.12]],
  // Shape 3: Spiral — outer arm key points
  [[SP_CX + 0.14, SP_CY + 0.04], [SP_CX - 0.10, SP_CY - 0.12], [SP_CX + 0.06, SP_CY - 0.16]],
  // Shape 4: Network — high-degree hub nodes
  [[NN[1][0], NN[1][1]], [NN[10][0], NN[10][1]], [NN[12][0], NN[12][1]]],
];

function baseW(idx: number, nx: number, ny: number, st: ShapeState): number {
  switch (idx % NUM_SHAPES) {
    case 0: return segsW(nx, ny, CANDLE_SEGS);
    case 1: return getBinaryTreeW(nx, ny);
    case 2: return segsW(nx, ny, st.histSegs);
    case 3: return segsW(nx, ny, st.spiralSegs);
    case 4: return getNetworkW(nx, ny);
    default: return 0;
  }
}

function getParticles(idx: number, t: number, st: ShapeState): Particle[] {
  switch (idx % NUM_SHAPES) {
    case 0: return getCandleParticles(t);
    case 1: return getTreeParticles(t);
    case 2: return getBellParticles(t, st.histSegs);
    case 3: return getSpiralParticles(t, st.spiralSegs);
    case 4: return getNetworkParticles(t);
    default: return [];
  }
}

// ─────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────
export function FinancialMatrixLanding() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  const startAnimation = useCallback((canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const FS = 11; // font render size (px)
    // Measure actual character advance width → use as cell step for square cells
    ctx.font = `${FS}px "Geist Mono", monospace`;
    const CS = Math.round(ctx.measureText('0').width); // ~5–6 px
    let W = canvas.width, H = canvas.height;
    let COLS = Math.floor(W / CS), ROWS = Math.floor(H / CS);

    interface Col { drops: { y: number; speed: number }[]; chars: string[] }
    let cols: Col[] = [];
    let trail: Float32Array;

    const init = () => {
      W = canvas.width; H = canvas.height;
      COLS = Math.floor(W / CS); ROWS = Math.floor(H / CS);
      trail = new Float32Array(COLS * ROWS);
      cols = Array.from({ length: COLS }, (_, ci) => ({
        drops: Array.from(
          { length: (ci * CS / W) < 0.42 ? 1 : 1 + Math.floor(Math.random() * 2) },
          () => ({ y: Math.random() * -ROWS, speed: 0.22 + Math.random() * 0.52 })
        ),
        chars: Array.from({ length: ROWS }, () => MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)]),
      }));
    };
    init();

    const startTime = Date.now();
    let frame = 0;

    // Cached time-dependent shape state
    let lastSpiralRot = -99;
    let lastHistT = -99;
    const st: ShapeState = {
      spiralSegs: buildSpiralSegs(0),
      histSegs: buildHistSegs(0),
      particles: [],
      shapeIdx: 0, nextIdx: 1, fadeProg: 0,
      flashes: [],
      lastFlashT: 0,
    };

    const animate = () => {
      frame++;
      const elapsed = (Date.now() - startTime) / 1000;

      // Shape timing
      const cyclePos = elapsed / CYCLE_DUR;
      st.shapeIdx = Math.floor(cyclePos) % NUM_SHAPES;
      const phase = cyclePos - Math.floor(cyclePos);
      const fadeStart = DISPLAY_DUR / CYCLE_DUR;
      st.fadeProg = phase >= fadeStart ? Math.min(1, (phase - fadeStart) / (1 - fadeStart)) : 0;
      const t2 = st.fadeProg * st.fadeProg * (3 - 2 * st.fadeProg); // smooth-step
      st.fadeProg = t2;
      st.nextIdx = (st.shapeIdx + 1) % NUM_SHAPES;

      // Discovery flash: gold alpha-extraction event every 6–10s
      const nextFlashInterval = 6.5 + 3.5 * Math.sin(st.lastFlashT * 0.7 + 1.3) ** 2;
      if (elapsed - st.lastFlashT > nextFlashInterval) {
        const pts = ALPHA_POINTS[st.shapeIdx];
        if (pts && pts.length > 0) {
          const pick = pts[Math.floor(Math.random() * pts.length)];
          st.flashes.push({ x: pick[0], y: pick[1], startT: elapsed, dur: 1.4 });
        }
        st.lastFlashT = elapsed;
      }
      // Prune expired flashes
      st.flashes = st.flashes.filter(f => elapsed - f.startT < f.dur);

      // Rebuild time-dependent segs ~4fps
      if (Math.abs(elapsed * 0.04 - lastSpiralRot) > 0.01) {
        st.spiralSegs = buildSpiralSegs(elapsed * 0.04);
        lastSpiralRot = elapsed * 0.04;
      }
      if (Math.abs(elapsed - lastHistT) > 0.12) {
        st.histSegs = buildHistSegs(elapsed);
        lastHistT = elapsed;
      }

      // Precompute particles for current (and next during fade)
      const curParticles = getParticles(st.shapeIdx, elapsed, st);
      const nxtParticles = st.fadeProg > 0 ? getParticles(st.nextIdx, elapsed, st) : [];

      // Inject gold flash particles (alpha extraction moments)
      for (const flash of st.flashes) {
        const age = elapsed - flash.startT;
        const life = age / flash.dur;
        const intensity = Math.sin(life * Math.PI) * 2.6;
        // Core burst at the alpha point
        curParticles.push({ x: flash.x, y: flash.y, r: 0.030, intensity, gold: true });
        // Expanding ring effect
        const ringR = 0.010 + life * 0.072;
        curParticles.push({ x: flash.x, y: flash.y, r: ringR, intensity: intensity * 0.38, gold: true });
        // Faint outer halo
        curParticles.push({ x: flash.x, y: flash.y, r: ringR * 1.8, intensity: intensity * 0.12, gold: true });
      }

      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, W, H);

      // Decay trail
      for (let i = 0; i < trail.length; i++) trail[i] *= 0.878;

      // Drop heads
      for (let ci = 0; ci < cols.length; ci++) {
        const col = cols[ci];
        if (frame % 5 === ci % 5) col.chars[Math.floor(Math.random() * ROWS)] = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
        for (const drop of col.drops) {
          const hr = Math.floor(drop.y);
          const tLen = (ci * CS / W) < 0.42
            ? Math.round(7 * FS / CS)
            : Math.round(22 * FS / CS);
          for (let k = 0; k < tLen; k++) {
            const ri = hr - k;
            if (ri < 0 || ri >= ROWS) continue;
            const b = k === 0 ? 1.0 : Math.max(0, 1 - k / tLen) * 0.70;
            const idx = ci * ROWS + ri;
            if (b > trail[idx]) trail[idx] = b;
          }
          drop.y += drop.speed;
          if (drop.y > ROWS + 8) { drop.y = Math.random() * -20; drop.speed = 0.22 + Math.random() * 0.52; }
        }
      }

      // Render
      for (let ci = 0; ci < cols.length; ci++) {
        const nx = (ci * CS + CS / 2) / W;
        const isLeft = nx < 0.42;
        const col = cols[ci];

        for (let ri = 0; ri < ROWS; ri++) {
          const tv = trail[ci * ROWS + ri];
          if (tv < 0.008 && isLeft) continue;

          const ny = (ri * CS + CS / 2) / H;

          let hw = 0, pw = 0, gpw = 0;
          if (!isLeft) {
            // Base shape weight (blended)
            const cw = baseW(st.shapeIdx, nx, ny, st);
            hw = st.fadeProg > 0 ? cw * (1 - st.fadeProg) + baseW(st.nextIdx, nx, ny, st) * st.fadeProg : cw;
            // Particle weight (blended, green only)
            const cpw = particleW(nx, ny, curParticles);
            const npw = st.fadeProg > 0 ? particleW(nx, ny, nxtParticles) : 0;
            pw = st.fadeProg > 0 ? cpw * (1 - st.fadeProg) + npw * st.fadeProg : cpw;
            // Gold flash weight (always from current frame, no blend)
            gpw = particleWGold(nx, ny, curParticles);
          }

          const total = hw + pw * 0.85;

          let alpha: number;
          let rr = 16, gg = 185, bb = 129;
          let bold = false;

          // Gold alpha-extraction flash (highest priority)
          if (gpw > 0.45) {
            alpha = Math.min(1.0, gpw * 0.92 + hw * 0.12 + tv * 0.10);
            rr = 255; gg = Math.floor(158 + gpw * 38); bb = Math.floor(20 + gpw * 18);
            bold = true;
          } else if (gpw > 0.12) {
            // Halo edge — warm amber tint blending with green
            alpha = gpw * 0.55 + total * 0.25 + tv * 0.10;
            rr = Math.floor(74 + gpw * 180); gg = Math.floor(200 + gpw * 30); bb = Math.floor(80 - gpw * 50);
            bold = gpw > 0.28;
          } else if (total >= 1.6) {
            alpha = 0.90 + tv * 0.10;
            rr = 230; gg = 255; bb = 240; bold = true;
          } else if (total >= 1.2) {
            alpha = 0.75 + pw * 0.20;
            rr = 140; gg = 255; bb = 210; bold = true;
          } else if (total >= 0.85) {
            alpha = 0.60 + tv * 0.35;
            rr = 74; gg = 222; bb = 128; bold = true;
          } else if (total >= 0.55) {
            alpha = 0.45 + tv * 0.30;
            rr = 52; gg = 211; bb = 153;
          } else if (total >= 0.25) {
            alpha = total * 0.42 + tv * 0.22;
          } else if (total >= 0.08) {
            alpha = total * 0.28 + tv * 0.14;
          } else {
            alpha = isLeft ? tv * 0.055 : tv * 0.17;
          }

          if (alpha < 0.010) continue;

          ctx.font = bold ? `bold ${FS}px "Geist Mono", monospace` : `${FS}px "Geist Mono", monospace`;
          ctx.fillStyle = `rgba(${rr},${gg},${bb},${Math.min(1, alpha)})`;
          ctx.fillText(col.chars[ri], ci * CS, ri * CS + CS);
        }
      }

      animRef.current = requestAnimationFrame(animate);
    };

    const onResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; init(); };
    window.addEventListener('resize', onResize);
    animRef.current = requestAnimationFrame(animate);
    return () => { window.removeEventListener('resize', onResize); cancelAnimationFrame(animRef.current); };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    return startAnimation(canvas);
  }, [startAnimation]);

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: '#030712' }}>
      <style>{`
        .fml-grad { background: linear-gradient(130deg,#4ade80 0%,#22d3ee 55%,#818cf8 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .fml-cta { background:linear-gradient(135deg,#22c55e,#16a34a); color:#fff; box-shadow:0 0 28px rgba(34,197,94,.30); transition:box-shadow .2s,transform .2s; }
        .fml-cta:hover { box-shadow:0 0 44px rgba(34,197,94,.54); transform:translateY(-1px); }
        .fml-obtn { border:1px solid rgba(226,232,240,.14); color:rgba(226,232,240,.72); background:rgba(226,232,240,.04); transition:all .2s; }
        .fml-obtn:hover { background:rgba(226,232,240,.09); border-color:rgba(226,232,240,.28); color:#e2e8f0; }
      `}</style>

      <canvas ref={canvasRef} className="absolute inset-0 z-0" aria-hidden />

      <div className="absolute inset-0 z-[1] pointer-events-none" style={{
        background: 'linear-gradient(to right,#030712 35%,rgba(3,7,18,.92) 52%,rgba(3,7,18,.4) 72%,transparent 100%)',
      }} />
      {/* Extra mobile overlay for readability */}
      <div className="absolute inset-0 z-[1] pointer-events-none md:hidden" style={{
        background: 'rgba(3,7,18,0.55)',
      }} />

      <div className="relative z-10 flex min-h-[calc(100vh-68px)] items-center">
        <div className="px-5 sm:px-8 md:px-16 w-full max-w-[560px]">
          <div className="label-mono inline-flex items-center gap-2 px-3 py-1 rounded-full mb-8"
            style={{ border: '1px solid rgba(74,222,128,.28)', background: 'rgba(74,222,128,.07)', color: '#4ade80' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#4ade80', boxShadow: '0 0 6px #4ade80' }} />
            Quantitative Research &amp; Trading
          </div>

          <h1 className="home-display mb-6"
            style={{ color: '#f1f5f9' }}>
            Systematic Intelligence.<br />
            <span className="fml-grad">Compounded.</span>
          </h1>

          <p className="text-base leading-relaxed mb-10" style={{ color: 'rgba(148,163,184,.78)', maxWidth: '440px' }}>
            We design and deploy AI-driven trading systems built for robustness, not prediction.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link href="/what-we-do" className="fml-cta flex items-center gap-2 px-6 py-3 rounded-md text-sm font-semibold">
              Research Philosophy
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 7h12M7 1l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <Link href="#infrastructure" className="fml-obtn flex items-center gap-2 px-6 py-3 rounded-md text-sm font-semibold">
              Infrastructure Overview
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-20 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to top,#030712,transparent)' }} />
    </div>
  );
}
