"use client";

import { useEffect, useRef } from "react";

/*
  The commitment orb: a 3D point cloud drawn with Canvas 2D and a hand-rolled
  perspective projection — no WebGL, no three.js.

  A Fibonacci sphere stands for the sealed commitment, two tilted orbit rings
  for the proof moving around it. The orb follows the pointer, spins up and
  scrambles while a proof is being generated, and settles green on a pass or
  amber on a failure. Colours are the same cool/warm pair as the particle field.
*/

export type OrbState = "idle" | "working" | "pass" | "fail";

const COOL: RGB = [118, 178, 255];
const WARM: RGB = [255, 183, 104];
const PASS: RGB = [58, 223, 118];
const FAIL: RGB = [217, 164, 65];

type RGB = [number, number, number];
type Point = { x: number; y: number; z: number; seed: number; ring: 0 | 1 | 2 };

const TAU = Math.PI * 2;

function hash(n: number): number {
  const s = Math.sin(n * 127.1) * 43758.5453;
  return s - Math.floor(s);
}

function buildPoints(count: number): Point[] {
  const points: Point[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));

  // Shell.
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    points.push({ x: Math.cos(theta) * r, y, z: Math.sin(theta) * r, seed: hash(i + 1), ring: 0 });
  }

  // Two orbit rings, stored flat and tilted at draw time.
  const ringCount = Math.round(count * 0.28);
  for (const ring of [1, 2] as const) {
    for (let i = 0; i < ringCount; i++) {
      const a = (i / ringCount) * TAU;
      const radius = (ring === 1 ? 1.45 : 1.72) + (hash(i * 3.7 + ring) - 0.5) * 0.06;
      points.push({ x: Math.cos(a) * radius, y: (hash(i * 9.1 + ring) - 0.5) * 0.04, z: Math.sin(a) * radius, seed: hash(i * 5.3 + ring * 11), ring });
    }
  }

  return points;
}

const mix = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

export function ProofOrb({ state = "idle", className }: { state?: OrbState; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<OrbState>(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let points: Point[] = [];
    let raf = 0;
    let running = false;
    let disposed = false;

    // Animated parameters, eased toward their targets each frame.
    let angle = 0;
    let speed = 0.12;
    let scramble = 0;
    let tint = 0;
    let tintColor: RGB = PASS;
    let tiltX = -0.35;
    let tiltY = 0;
    let targetTiltX = -0.35;
    let targetTiltY = 0;
    let t = 0;

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) return;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = Math.round(rect.width * dpr);
      h = Math.round(rect.height * dpr);
      canvas!.width = w;
      canvas!.height = h;
      const area = rect.width * rect.height;
      points = buildPoints(Math.round(Math.min(1400, Math.max(420, area / 90))));
      draw();
    }

    function draw() {
      const s = stateRef.current;
      const working = s === "working";

      // Ease toward the state's targets.
      speed += ((working ? 1.4 : 0.12) - speed) * 0.04;
      scramble += ((working ? 1 : 0) - scramble) * 0.05;
      const wantTint = s === "pass" || s === "fail" ? 1 : 0;
      if (s === "pass") tintColor = PASS;
      if (s === "fail") tintColor = FAIL;
      tint += (wantTint - tint) * 0.04;
      tiltX += (targetTiltX - tiltX) * 0.05;
      tiltY += (targetTiltY - tiltY) * 0.05;

      ctx!.clearRect(0, 0, w, h);
      ctx!.globalCompositeOperation = "lighter";

      const cx = w / 2;
      const cy = h / 2;
      const R = Math.min(w, h) * 0.2;
      const focal = 3.2;

      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      const cosX = Math.cos(tiltX);
      const sinX = Math.sin(tiltX);
      const cosY = Math.cos(tiltY);
      const sinY = Math.sin(tiltY);

      // Core glow.
      const glowColor = mix(mix(COOL, WARM, 0.35), tintColor, tint);
      const glow = ctx!.createRadialGradient(cx, cy, 0, cx, cy, R * 1.25);
      glow.addColorStop(0, `rgba(${glowColor[0] | 0},${glowColor[1] | 0},${glowColor[2] | 0},${0.1 + tint * 0.1 + scramble * 0.06})`);
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx!.fillStyle = glow;
      ctx!.fillRect(0, 0, w, h);

      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        let x = p.x;
        let y = p.y;
        let z = p.z;

        if (p.ring === 0) {
          // Scramble: points breathe off the shell while a proof is running.
          const wobble = 1 + scramble * 0.22 * Math.sin(t * 6 + p.seed * 40);
          x *= wobble;
          y *= wobble;
          z *= wobble;
          // Spin the shell.
          const rx = x * cosA - z * sinA;
          z = x * sinA + z * cosA;
          x = rx;
        } else {
          // Rings orbit on their own tilted planes, faster than the shell.
          const ra = angle * (p.ring === 1 ? 2.2 : -1.6);
          const c = Math.cos(ra);
          const sn = Math.sin(ra);
          const rx = x * c - z * sn;
          z = x * sn + z * c;
          x = rx;
          const tilt = p.ring === 1 ? 1.1 : -0.55;
          const ct = Math.cos(tilt);
          const st = Math.sin(tilt);
          const ry = y * ct - z * st;
          z = y * st + z * ct;
          y = ry;
        }

        // Pointer tilt.
        const ry = y * cosX - z * sinX;
        let rz = y * sinX + z * cosX;
        const rx2 = x * cosY + rz * sinY;
        rz = -x * sinY + rz * cosY;
        y = ry;
        x = rx2;
        z = rz;

        const persp = focal / (focal - z);
        const sx = cx + x * R * persp;
        const sy = cy + y * R * persp;
        const depth = (z + 1.8) / 3.6; // 0 back .. 1 front

        let color: RGB = p.ring === 0 ? mix(COOL, WARM, (p.y + 1) / 2 * 0.8) : p.ring === 1 ? mix(COOL, WARM, 0.1) : mix(COOL, WARM, 0.85);
        color = mix(color, tintColor, tint * (p.ring === 0 ? 0.85 : 0.5));
        const burn = Math.max(0, depth - 0.72) * 2.2 * (0.5 + p.seed * 0.5);
        color = mix(color, [255, 255, 255], Math.min(0.7, burn));

        const alpha = (p.ring === 0 ? 0.22 : 0.3) + depth * 0.7 * (0.55 + p.seed * 0.45);
        const size = (p.ring === 0 ? 1.2 : 1) * dpr * persp * (0.7 + depth * 0.9);

        ctx!.fillStyle = `rgba(${color[0] | 0},${color[1] | 0},${color[2] | 0},${Math.min(1, alpha)})`;
        ctx!.fillRect(sx - size / 2, sy - size / 2, size, size);
      }

      ctx!.globalCompositeOperation = "source-over";
    }

    function loop() {
      if (disposed) return;
      t += 0.016;
      angle += 0.016 * speed;
      draw();
      raf = requestAnimationFrame(loop);
    }

    function start() {
      if (running || disposed) return;
      running = true;
      raf = requestAnimationFrame(loop);
    }

    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    function onPointer(event: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      const nx = (event.clientX - (rect.left + rect.width / 2)) / window.innerWidth;
      const ny = (event.clientY - (rect.top + rect.height / 2)) / window.innerHeight;
      targetTiltY = Math.max(-0.6, Math.min(0.6, nx * 1.4));
      targetTiltX = -0.35 + Math.max(-0.5, Math.min(0.5, ny * 1.2));
    }

    resize();

    const ro = new ResizeObserver(() => resize());
    ro.observe(canvas);

    // Reduced motion: a still frame that still redraws when the state changes.
    let stillTimer: ReturnType<typeof setInterval> | undefined;
    const io = new IntersectionObserver((entries) => {
      if (reduced) return;
      if (entries[0].isIntersecting) start();
      else stop();
    });
    if (reduced) {
      stillTimer = setInterval(draw, 400);
    } else {
      io.observe(canvas);
      window.addEventListener("pointermove", onPointer, { passive: true });
    }

    const onVisibility = () => (document.visibilityState === "visible" && !reduced ? start() : stop());
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      disposed = true;
      stop();
      clearInterval(stillTimer);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div className={className} aria-hidden="true">
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
