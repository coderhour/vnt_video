// Polish 质感工具件（Phase 0）——给 demo 做"成品感"收尾的小工具：贝塞尔缓动、
// 胶片颗粒、暗角、两层软阴影 / 发丝线 / 内高光、按速度计算的方向性运动模糊、
// 柔光渐变背景。全部是 props / frame 的纯函数，确定性渲染（无 Math.random / Date）。
// 依赖仅 remotion + react；可选共享件——copy demo 时一并带上并改 import 路径。



// ───────────────────────── 缓动 ─────────────────────────

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);

// cubic-bezier(x1,y1,x2,y2) → (t)=>number，与 CSS 同义；Newton-Raphson 求解，失败退二分。
// x1/x2 须在 [0,1]；y 可越界（做预备/过冲）。输入 t 自动钳到 [0,1]。
export const bezier = (x1: number, y1: number, x2: number, y2: number) => {
  if (x1 === y1 && x2 === y2) return (t: number) => clamp01(t);
  const ax = 1 - 3 * x2 + 3 * x1, bx = 3 * x2 - 6 * x1, cx = 3 * x1;
  const ay = 1 - 3 * y2 + 3 * y1, by = 3 * y2 - 6 * y1, cy = 3 * y1;
  const sx = (u: number) => ((ax * u + bx) * u + cx) * u;
  const sy = (u: number) => ((ay * u + by) * u + cy) * u;
  const dx = (u: number) => (3 * ax * u + 2 * bx) * u + cx;
  const solve = (x: number) => {
    let u = x;
    for (let i = 0; i < 8; i++) {
      const err = sx(u) - x;
      if (Math.abs(err) < 1e-7) return u;
      const d = dx(u);
      if (Math.abs(d) < 1e-6) break;
      u -= err / d;
    }
    let lo = 0, hi = 1;
    u = x;
    for (let i = 0; i < 40; i++) {
      const v = sx(u);
      if (Math.abs(v - x) < 1e-7) break;
      if (v < x) lo = u; else hi = u;
      u = (lo + hi) / 2;
    }
    return u;
  };
  return (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : sy(solve(t)));
};

// 命名缓动预设（入场 snappy / 换位 smooth / 出场 exit / 预备 anticip / 过冲 overshoot）
export const EASE = {
  snappy: bezier(0.16, 1, 0.3, 1), // 强 ease-out（≈ expo-out）：入场、急推落定
  out: bezier(0.22, 1, 0.36, 1), // 柔一点的 ease-out（≈ quint-out）：次要元素入场、跟随
  smooth: bezier(0.65, 0, 0.35, 1), // 对称 in-out：换位、相机平移
  swift: bezier(0.4, 0, 0.2, 1), // 不对称 in-out（起步稍快、落点很软）：通用位移
  exit: bezier(0.7, 0, 0.84, 0), // 强 ease-in（≈ quart-in）：出场、甩出画外
  anticip: bezier(0.5, -0.32, 0.25, 1), // 先反向回拉 ~5% 再冲出：大动作前的预备
  overshoot: bezier(0.34, 1.45, 0.64, 1), // 冲过头 ~8% 再回落：弹出、落座
  linear: (t: number) => clamp01(t),
};

// 分段进度：frame 在 [start, start+dur] 内归一化 → 缓动，越界钳位（所有动效的时间轴原语）
export const ramp = (frame: number, start: number, dur: number, ease: (t: number) => number = EASE.snappy) =>
  ease(clamp01((frame - start) / Math.max(1e-6, dur)));

// 线性混合 a→b（t 不钳位，配合 overshoot/anticip 的越界值使用）
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

// 数值速度（每帧位移）：中心差分 f(frame+0.5) - f(frame-0.5)。给 SpeedBlur 喂速度用
export const velocity = (f: (frame: number) => number, frame: number) => f(frame + 0.5) - f(frame - 0.5);


// 按字号给字距（em）：大标题收紧、正文微收、小字放开；caps=true（全大写）整体放松一档
export const tracking = (size: number, caps = false) => {
  const base = size >= 96 ? -0.04 : size >= 56 ? -0.03 : size >= 28 ? -0.02 : size >= 16 ? -0.008 : 0.01;
  return `${(base + (caps ? 0.03 : 0)).toFixed(3)}em`;
};

// ───────────────────────── 表面材质 ─────────────────────────

const rgb = (hex: string) => {
  const h = hex.replace('#', '');
  const f = h.length === 3 ? h.split('').map((c) => c + c).join('') : h.slice(0, 6);
  const n = parseInt(f, 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
};
const r1 = (x: number) => Math.round(x * 10) / 10;

// 两层软阴影：近地接触影（小而实，随抬高变淡）+ 远地环境影（大而虚，随抬高变大变深）。
// elevation ≈ 物体离地像素（0 贴地 / 4 卡片静置 / 16 悬浮 / 48+ 飞起）；color 用带色相的深色。
export const softShadow = (elevation: number, opts: { color?: string; strength?: number } = {}) => {
  const e = Math.max(0, elevation);
  const c = rgb(opts.color ?? '#10121a');
  const s = opts.strength ?? 1;
  const contactA = (0.12 * s) / (1 + e / 24);
  const ambientA = (0.08 + (Math.min(e, 64) / 64) * 0.22) * s;
  return `0 ${r1(0.5 + e * 0.06)}px ${r1(1 + e * 0.18)}px rgba(${c},${contactA.toFixed(3)}), ` +
    `0 ${r1(e * 0.55)}px ${r1(e * 1.3)}px ${r1(-e * 0.22)}px rgba(${c},${ambientA.toFixed(3)})`;
};

// 1px 发丝线 border 值（用法：border: hairline()）；深色场景 tone='dark' 用白色低透明度
export const hairline = (alpha = 0.08, tone: 'light' | 'dark' = 'light') =>
  `1px solid ${tone === 'light' ? `rgba(20,22,28,${alpha})` : `rgba(255,255,255,${alpha})`}`;

// 顶部 1px 内高光（box-shadow 片段，和 softShadow 用逗号拼接）：让面板有"受光的上沿"
export const innerHighlight = (alpha = 0.8) => `inset 0 1px 0 rgba(255,255,255,${alpha})`;

